const express = require("express");
const app = express();
const path = require("path");
const session = require('express-session');

// test: GitLeaks
const AWS_KEY = "AKIAIOSFODNN7EXAMPLE";

// imports 
const { getRandomQuestionFromDB, seedQuestionsDB, getAllQuestions } = require("./data/questions.js");
const { register, login, updateUserStats } = require("./data/users.js");

const PORT = 3000;
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(session({
  name: 'AuthenticationState',
  secret: 'some secret string!!',
  resave: false,   
  saveUninitialized: false,
  cookie: { maxAge: 60000 * 60 } // expires in 1 hour
}));

app.use(express.static(__dirname));

app.get("/api/questions", async (req, res) => {
  try {
    let mode = req.query.mode;
    let dbQuestions = null;
  
    if (mode == 'clash') {
      dbQuestions = await getRandomQuestionFromDB();
    }
    else {
      dbQuestions = await getAllQuestions();
    }

    const formattedQuestions = dbQuestions.map((item) => ({
      q: item.question,
      a: item.correctAnswer,
    }));

    res.json(formattedQuestions);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to load questions" });
  }
});

app.post("/api/stats", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in!" });
  }
  
  const { mode, win } = req.body;
  
  try {
    let updateStats = await updateUserStats(req.session.user.userId, mode, win);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await register(username, password);
    res.status(200).json({ success: true, message: "Registration successful! You can now log in." });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await login(username, password);

    req.session.user = {
      userId: user.userId,
      username: user.username
    };

    res.status(200).json({ success: true, message: "Logged in successfully!", user: user });
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy(); // destory cookie
  res.status(200).json({ success: true, message: "Logged out" });
});

// check if logged in
app.get("/loggedIn", (req, res) => {
  if (req.session.user) {
    res.status(200).json({ isLoggedIn: true, user: req.session.user });
  } else {
    res.status(200).json({ isLoggedIn: false });
  }
});

const startTime = Date.now();
let restartCount = 0;

app.get("/status", (req, res) => {
  res.json({
    status: "ok",
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
    restarts: restartCount,
    timestamp: new Date().toISOString(),
  });
});

app.get("/stress", (req, res) => {
  const end = Date.now() + 3000;
  while (Date.now() < end) {}
  res.json({ status: "stress test complete" });
});

if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`FlashClash running on port ${PORT}`);

    // seed database when server starts
    try {
      await seedQuestionsDB();
    } catch (e) {
      console.log("Issue seeding database:", e.message);
    }
  });
}

module.exports = app;
