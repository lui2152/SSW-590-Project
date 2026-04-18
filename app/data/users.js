const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const { users } = require('../config/mongoCollection.js');
const { validateUsername, validateObjectId, validatePassword } = require('../helpers.js');

// Function: Take a username and password as an input and register based on that, return boolean
const register = async (username, password) => {
    // validate username, return lowercase version to add to database
    username = validateUsername(username,"Username").toLowerCase();
    password = validatePassword(password);
    
    // check if user already exists
    const usersCollection = await users();
    const existingDuplicateUsername = await usersCollection.findOne({ username: `${username}` });

    if (existingDuplicateUsername) {
        throw new Error("There already exists a user with that username!");
    }

     // hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password,saltRounds);

    // set up new user
    let newUser = {
        username: username,
        password: hashedPassword,
        stats: {
            studySessionCompleted: 0,
            clashMatchesPlayed: 0,
            clashMatchesWon: 0
        },        
        security: {
            failedLoginAttempts: 0,
            accountLockedUntil: null,
            lastLoginAt: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
    }

    // insert into database
    const insertNewUser = await usersCollection.insertOne(newUser);
    if (!insertNewUser.acknowledged || !insertNewUser.insertedId) {
        throw new Error("Error: Failed to add new user!");
    }

    return {registrationCompleted: true};
}

// Function: Take a username as an input to check if exists in database, return the user
const getUserByUsername = async (username) => {
    // validate username
    username = validateUsername(username,"Username").toLowerCase();

    // check if user exists
    const usersCollection = await users();
    const targetUser = await usersCollection.findOne({ username: `${username}` });

    // if username is not found 
    if (!targetUser) {
        throw new Error("Error: Username not found!");
    }

    // return targeted user info
    let returnUser = {
        userId: targetUser._id.toString(),
        username: targetUser.username,
        stats: {
            studySessionCompleted: targetUser.studySessionCompleted,
            clashMatchesPlayed: targetUser.clashMatchesPlayed,
            clashMatchesWon: targetUser.clashMatchesWon
        },        
        security: {
            failedLoginAttempts: targetUser.failedLoginAttempts,
            accountLockedUntil: targetUser.accountLockedUntil,
            lastLoginAt: targetUser.lastLoginAt
        },
        createdAt: targetUser.createdAt,
        updatedAt: targetUser.updatedAt
    }
    

    return returnUser;
}

const login = async (username, password) => {
  // validation
  username = validateUsername(username, "Username").toLowerCase();
  password = validatePassword(password);

  // search for user by username
  const usersCollection = await users();
  const targetUser = await usersCollection.findOne({username: `${username}`});

  // if username is not found 
  if (!targetUser) {
    throw new Error("Either the username or password is invalid"); 
  }

  if (targetUser.security.accountLockedUntil && targetUser.security.accountLockedUntil > new Date()) {
    throw new Error("Account is temporarily locked due to too many failed login attempts. Please try again later.");
  }

  // compare passwords
  let compare = false;
  
  try {
    compare = await bcrypt.compare(password,targetUser.password);
  } catch (e) {
    throw new Error("Error in verifying passwords");
  }

  // check if passwords match, if they do, update/add updatedAt field 
  if (compare) {
    const updateUpdatedAt = await usersCollection.updateOne(
      { username: username },
      {
        $set: {
          "security.failedLoginAttempts": 0,
          "security.accountLockedUntil": null,
          "security.lastLoginAt": new Date(),
          updatedAt: new Date()
        }
      }
    );

    if (updateUpdatedAt.matchedCount === 0) {
      throw new Error(`updatedAt could not be updated`);
    }

    return {
        userId: targetUser._id.toString(),
        username: targetUser.username,
        stats: targetUser.stats
    }
  }
  else {
    let failedAttempts = targetUser.security.failedLoginAttempts + 1;
    let lockedUntil = null;

    // if users fail 3 times, lock account for 3 minutes 
    if (failedAttempts >= 3) {
        lockedUntil = new Date(Date.now() + 3 * 60000);
    }

    // update security fields
    const updateUpdatedAt = await usersCollection.updateOne(
      { username: username },
      {
        $set: {
          "security.failedLoginAttempts": failedAttempts,
          "security.accountLockedUntil": lockedUntil,
          updatedAt: new Date()
        }
      }
    );

    throw new Error("Either the username or password is invalid");
  }
};



// Function: Take a userId as an input to check if exists in database, return the user
const getUserById = async (userId) => {
    // validate userid
    userId = validateObjectId(userId,"User ID");

    // verify that user exists with that id
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
        throw new Error(`Error: No user with id: ${userId}!`);
    }

    // get user's info
    let userInfo = {
        userId: user._id.toString(),
        username: user.username,
        stats: {
            studySessionCompleted: user.studySessionCompleted,
            clashMatchesPlayed: user.clashMatchesPlayed,
            clashMatchesWon: user.clashMatchesWon
        },        
        security: {
            failedLoginAttempts: user.failedLoginAttempts,
            accountLockedUntil: user.accountLockedUntil,
            lastLoginAt: user.lastLoginAt
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    }
    return userInfo; 
}

// Function: Return all users in the database
const getAllUsers = async () => {
    // get all users in database into a userList
    const userCollection = await users();
    const userList = await userCollection.find({}).toArray();

    // return all info of each individual user
    return userList.map((elem) => ({
        _id: elem._id.toString(),
        username: elem.username,
        stats: {
            studySessionCompleted: elem.studySessionCompleted,
            clashMatchesPlayed: elem.clashMatchesPlayed,
            clashMatchesWon: elem.clashMatchesWon
        },        
        security: {
            failedLoginAttempts: elem.failedLoginAttempts,
            accountLockedUntil: elem.accountLockedUntil,
            lastLoginAt: elem.lastLoginAt
        },
        createdAt: elem.createdAt,
        updatedAt: elem.updatedAt
    }));
}

// Function: Updates the user stats after clash game or study session
const updateUserStats = async (userId, mode, win = false) => {
    const userCollection = await users();
    let updateStats = {};

    // conditional updates based on game mode
    if (mode === 'study') {
        updateStats = {
            $inc: { "stats.studySessionCompleted": 1 }
        };
    }
    else {
        // mode = clash
        updateStats = {
            $inc: { 
                "stats.clashMatchesPlayed": 1,
                "stats.clashMatchesWon": win ? 1 : 0 
            }
        };
    }

    const updateInfo = await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        updateStats
    );

    if (updateInfo.modifiedCount === 0) {
        throw new Error("Could not update user stats");
    }
    return true;
}

module.exports = {
    register,
    getUserByUsername,
    login,
    getUserById,
    getAllUsers,
    updateUserStats
};

