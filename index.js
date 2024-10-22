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

const users = await sql('SELECT * FROM users WHERE id = $1', [userId]);
if (users.length === 0){
  console.log("Usuario no encontrado");
  return res.status(404).json({ message: "Usuario no encontrado" });
}
const user = users[0];

const products = await sql('SELECT * FROM products WHERE id = $1', [productId]);
if (products.length === 0){
  console.log("Producto no encontrado");
  return res.status(404).json({ message: "Producto no encontrado" });
}
const product = products[0];

if (Number(quantity) > Number(product.suply)){
  console.log("No hay stock suficiente");
  return res.status(400).json({ message: "No hay stock suficiente" });
}



app.listen(3000, () => console.log('tuki'));
