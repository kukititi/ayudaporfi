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
  res.render('home', { lista });
});

app.get('/add/product', (req, res) => {
  res.render('addProduct');
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

app.post('/products', async (req, res) => {
  const name = req.body.name;
  const price = req.body.price;

  const query = `INSERT INTO products (name, price) VALUES ($1, $2)`;
  await sql(query, [name, price]);

  res.redirect('/');
});

app.listen(3000, () => console.log('tuki'));
