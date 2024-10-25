import { neon } from '@neondatabase/serverless';
import { engine } from 'express-handlebars';
import express from 'express';
import path from 'path';
import exphbs from 'express-handlebars';
import { fileURLToPath } from "url";
import { create } from 'express-handlebars';

const hbs = create();

const sql = neon('postgresql://piscolita_owner:qg0uBlwk4vLc@ep-withered-silence-a5uth5dy.us-east-2.aws.neon.tech/piscolita?sslmode=require'
);

const app = express();

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const expressHandlebars = require('express-handlebars');

const hbs = expressHandlebars.create();
app.engine('handlebars', hbs.engine);

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.static('images'));

app.get("/static", (req, res) => {
  res.render("static");
});

app.get("/dynamic", (req, res) => {
  imageList = [];
  imageList.push({ src: "icons/flask.png", name: "flask" });
  imageList.push({ src: "icons/javascript.png", name: "javascript" });
  imageList.push({ src: "icons/react.png", name: "react" });
  res.render("dynamic", { imageList: imageList });
});

app.get("/", async (req, res) => {
  const products = await sql('SELECT * FROM products');
  const users = await sql('SELECT * FROM users WHERE id = 1');
  const user = users[0];
  res.render("home", {
    products,
    user,
    title: "Home",
  });
});

app.get('/Accesorios', (req, res) => {
res.render('accs');
});

app.get('/Equipo', (req, res) => {
  res.render('equi');
});

app.get('/Repuestos', (req, res) =>{
  res.render('repu');
});

app.get('/Replicas', async (req, res) => {
  const lista = await sql('SELECT * FROM products');
  res.render('repli', { lista });
});

app.get('/Login', (req, res) => {
  res.render('login');
});

app.get('/Registro', async (req, res) => {
  const lista = await sql('SELECT * FROM users');
  res.render('regist', { lista });
});

app.get('/LogAdmin', (req, res) => {
  res.render('LogAdmin');
});

app.get('/products', async (req, res) => {
  const lista = await sql('SELECT * FROM products');
  res.render('products', { lista });
});

app.post('/login', async (req, res) => {
  const name = req.body.name;
  const password = req.body.contra;
});

app.post('/registrar', async (req, res) => {
  const name = req. body.name;
  const email = req.body.email;
  const password = req.body.password;

  const query = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)';
  await sql(query, [name, email, password]);
  res.redirect('/login');
});

app.post('/producti', async (req, res) => {
  const name = req.body.name;
  const price = req.body.price;
  const image = req.body.image;
  const categ = req.body.categ;
  const db = req.body.db;
  const descr = req.body.descr;

  const query = 'INSERT INTO products (name, price, image, categ, db, descr) VALUES ($1, $2, $3, $4, $5, $6)';
  await sql(query, [name, price, image, categ, db, descr]);

  res.redirect('/products');
});

app.listen(3000, () => console.log('tuki'));
