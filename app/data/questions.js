const { questions } = require('../config/mongoCollection.js');
const { ObjectId } = require('mongodb');

// Function: Seed database with all our questions
const seedQuestionsDB = async () => {
    const questionsCollection = await questions();

    // check if database has been seeded
    let anyQuestion = await questionsCollection.findOne({});
    if (anyQuestion) {
        console.log("Database has already been seeded!");
        return;
    }
    
    // our questions
    let questionData = [
        {   
            id: new ObjectId(),
            question: "What is the only U.S. state that can be typed in using only one row of a standard 'QWERTY' keyboard?",
            correctAnswer: "Alaska"
        },
        {
            id: new ObjectId(),
            question: "What do you call the visible part of the rivet commonly found on the pockets of jeans?",
            correctAnswer: "The burr"
        },
        {
            id: new ObjectId(),
            question: "In human anatomy, what does the 'hallux' refer to?",
            correctAnswer: "The big toe"
        },
        {
            id: new ObjectId(),
            question: "How many cards are in a standard deck of playing cards?",
            correctAnswer: "52"
        },
        {
            id: new ObjectId(),
            question: "What is the name for the plastic or metal tube found on the ends of shoelaces?",
            correctAnswer: "An aglet"
        },
        {
            id: new ObjectId(),
            question: "What is the only planet in our solar system to rotate clockwise on its axis?",
            correctAnswer: "Venus"
        },
        {
            id: new ObjectId(),
            question: "Which freezes faster: hot or cold water?",
            correctAnswer: "Hot water"
        },
        {
            id: new ObjectId(),
            question: "What is James Bond's code name?",
            correctAnswer: "007"
        },
        {
            id: new ObjectId(),
            question: "Jim Henson is the creator of what beloved cast of characters?",
            correctAnswer: "The Muppets"
        },
        {
            id: new ObjectId(),
            question: "Weighing around eight pounds, this is the human body's largest organ?",
            correctAnswer: "The skin"
        },
        {
            id: new ObjectId(),
            question: "Leonardo da Vinci's 'Mona Lisa' hangs in what museum?",
            correctAnswer: "The Louvre Museum"
        },
        {
            id: new ObjectId(),
            question: "How many states does the Appalachian Trail cross?",
            correctAnswer: "14"
        },
        {
            id: new ObjectId(),
            question: "What is the name of John Travolta's character in the 1977 film 'Saturday Night Fever'?",
            correctAnswer: "Tony Manero"
        },
        {
            id: new ObjectId(),
            question: "What do you call a group of flamingos?",
            correctAnswer: "A flamboyance"
        },
        {
            id: new ObjectId(),
            question: "Relative to the internet, what does 'URL' stand for?",
            correctAnswer: "Uniform resource locator"
        },
        {
            id: new ObjectId(),
            question: "What occasion corresponds with the longest day of the year?",
            correctAnswer: "The summer solstice"
        },
        {
            id: new ObjectId(),
            question: "What is the distance from earth to the sun?",
            correctAnswer: "93 million miles"
        },
        {
            id: new ObjectId(),
            question: "What sport was featured on the first curved U.S. coin in 2014?",
            correctAnswer: "Baseball"
        },
        {
            id: new ObjectId(),
            question: "Which country is the largest in the world by land area?",
            correctAnswer: "Russia"
        },
        {
            id: new ObjectId(),
            question: "M&M’S Fruit Chews would eventually become what popular candy?",
            correctAnswer: "Starburst"
        },
        {
            id: new ObjectId(),
            question: "According to Guinness World Records, what's the best-selling book of all time?",
            correctAnswer: "The Bible"
        },
        {
            id: new ObjectId(),
            question: "What U.S. state is home to Acadia National Park?",
            correctAnswer: "Maine"
        },
        {
            id: new ObjectId(),
            question: "What is the only food that can never go bad?",
            correctAnswer: "Honey"
        },
        {
            id: new ObjectId(),
            question: "What was the first animal to ever be cloned?",
            correctAnswer: "A sheep"
        },
        {
            id: new ObjectId(),
            question: "What is the name of the pet dinosaur on the TV cartoon 'The Flintstones'?",
            correctAnswer: "Dino"
        },
        {
            id: new ObjectId(),
            question: "What identity document is required to travel to different countries around the world?",
            correctAnswer: "A passport"
        },
        {
            id: new ObjectId(),
            question: "Who is considered the 'Father of Relativity?'",
            correctAnswer: "Albert Einstein"
        },
        {
            id: new ObjectId(),
            question: "Edie Falco and James Gandolfini star in what series about a New Jersey mob boss?",
            correctAnswer: "The Sopranos"
        }
    ];


    // insert into database
    const seedDB = await questionsCollection.insertMany(questionData);
    if (!seedDB.acknowledged) {
        throw new Error("Error: Failed to seed questions!");
    }

    console.log('Questions seeded successfully!');
}

// Function: Return all questions in the database
const getAllQuestions = async () => {
    // get all questions in database into a questionList
    const questionsCollection = await questions();
    const questionsList = await questionsCollection.find({}).toArray();
    return questionsList;
}

// Function: Return (10) random questions from question database to be used in the game
const getRandomQuestionFromDB = async() => {
    const questionsCollection = await questions();
    
    // get 10 random questions (can be changed)
    let randomQuestions = await questionsCollection.aggregate([{ $sample: { size: 10} }]).toArray();

    return randomQuestions
}

module.exports = {
    seedQuestionsDB,
    getAllQuestions,
    getRandomQuestionFromDB
};
