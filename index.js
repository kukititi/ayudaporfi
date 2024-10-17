import { neon } from '@neondatabase/serverless';
import { engine } from 'express-handlebars';
import express from 'express';

const sql = neon('postgresql://piscolita_owner:qg0uBlwk4vLc@ep-withered-silence-a5uth5dy.us-east-2.aws.neon.tech/piscolita?sslmode=require'
);

const app = express();

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

app.get('/NP', (req, res) => {
  res.render('NP');
});

app.post('/products', async(req, res) => {
  const id = req.body.id;
  const name = req.body.name;
  const price = req.body.price;
  const db = req.body.db;
  const descr = req.body.descr;
  const categ = req.body.categ;

  const query = 'INSERT INTO products (id, name, price, db, decr, categ) VALUES ($1, $2, $3, $4, $5, $6)';
  await sql(query, [id, name, price, db, descr, categ]);

  res.redirect('/');
});

app.listen(3000, () => console.log('tuki'));