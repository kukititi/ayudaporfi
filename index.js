import path from "path";
import { fileURLToPath } from "url";
import { neon } from '@neondatabase/serverless';
import express from 'express';
import { engine } from 'express-handlebars';



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

app.get('/', (req, res) => {
  res.render('home');
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

app.get('/prod', (req, res) => {
  res.render('prod');
});

app.post('/products', async (req, res) => {
  const name = req.body.name;
  const price = req.body.price;
  const db = req.body.db;
  const descr = req.body.descr;
  const categ = req.body.categ;
  const suply = req.body.suply;
  const image = req.body.image;

  const query = 'INSERT INTO products (name, price, db, descr, categ, suply, image) VALUES ($1, $2, $3, $4, $5, $6, $7)';
  await sql(query, [name, price, db, descr, categ, suply, image]);

  res.redirect('/');
});

app.post('/patata', async (req, res) => {
  const name = req.body.name;
  const password = req.body.password;

  const query = 'INSERT INTO users (name, password) VALUES ($1, $2)';
});

app.listen(3000, () => console.log('tuki'));