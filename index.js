import express from "express";
import bodyParser from "body-parser";
import  pg  from "pg"; 

const app = express();
const port = 3000;

let quiz = [];
let totalCorrect = 0;
let currentQuestion = {};

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connexion à la base de données PostgreSQL
const client = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "1234",
  port: 5432,
});

// Fonction pour récupérer les données du quiz depuis la base de données
async function fetchQuizData() {
  try {
    await client.connect(); // Connexion à la base de données
    const query = "SELECT * FROM capitals";
    const res = await client.query(query);
    quiz = res.rows.map(row => ({ country: row.country, capital: row.capital }));
    console.log('Données récupérées depuis la base de données :', quiz);
  } catch (err) {
    console.error("Erreur lors de la récupération des données depuis la base de données :", err);
  } finally {
    await client.end(); // Fermeture de la connexion à la base de données
  }
}

// Route pour la page d'accueil
app.get("/", async (req, res) => {
  totalCorrect = 0;
  await fetchQuizData(); // Récupérer les données du quiz depuis la base de données
  await nextQuestion();
  console.log(currentQuestion);
  res.render("index.ejs", { question: currentQuestion });
});

// Route pour soumettre une réponse
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
  }

  nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

// Fonction pour obtenir la prochaine question
async function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  currentQuestion = randomCountry;
}

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Le serveur écoute sur http://localhost:${port}`);
});
