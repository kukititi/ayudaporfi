import { neon } from '@neondatabase/serverless';
import { engine } from 'express-handlebars';
import express from 'express';
import path from "path";
import { fileURLToPath } from "url";

const sql = neon('postgresql://piscolita_owner:qg0uBlwk4vLc@ep-withered-silence-a5uth5dy.us-east-2.aws.neon.tech/piscolita?sslmode=require'
);

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

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

app.get('/Replicas', (req, res) => {
  res.render('repli');
});

app.get('/Login', (req, res) => {
  res.render('login');
});

app.get('/Registro', (req, res) => {
  res.render('regist');
});

app.get('/LogAdmin', (req, res) => {
  res.render('LogAdmin');
});

app.get('/products', (req, res) => {
  res.render('products');
});

app.post('/login', async (req, res) => {
  const name = req.body.name;
  const password = req.body.contra;
});

app.post('/regist', async (req, res) => {
  const name = req.body.email;
  const password = req.body.password;
});

app.post('/products', async (req, res) => {
  const name = req.body.name;
  const price = req.body.price;
  const img = req-body.img;
  const categ = req.body.categ;
  const db = req.body.db;
  const descr = req.body.descr;

  const query = 'INSERT INTO products (name, price, img, categ, db, descr) VALUES ($1, $2, $3, $4, $5, $6)';
  await sql(querry, [name, price, img, categ, db, descr]);

  res.redirect('/products');
});

app.listen(3000, () => console.log('tuki'));
