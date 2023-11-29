const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');


dotenv.config();

const app = express();

const port = 3000;
const secretKey = process.env.SECRET_KEY || 'defaultSecretKey';

app.use(express.static('javascript'));//----------------------------------------BOH
app.use(express.static('views'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(cors());

const users = [];

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Token non fornito' });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token non valido' });
    req.user = user;
    next();
  });
};

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username e password richiesti' });
  }

  const user = { username, password };
  users.push(user);
  res.status(201).json({ message: 'Utente registrato con successo' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Credenziali non valide' });
  }

  const token = jwt.sign({ username: user.username }, secretKey);
  res.json({ token });
});

app.get('/protected', authenticateToken, (req, res) => {
  res.render('protected', { user: req.user });
});

app.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
});
