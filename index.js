import { neon } from '@neondatabase/serverless';
import { engine } from 'express-handlebars';
import express from 'express';
import path from "path";
import { fileURLToPath } from "url";
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import authRouter from '/home/kukititi/ayudaporfi/routes/auth.js';
import productsRouter from '/home/kukititi/ayudaporfi/routes/products.js';
import cartRouter from '/home/kukititi/ayudaporfi/routes/cart.js';
import profileRouter from '/home/kukititi/ayudaporfi/routes/profile.js';
import { isatty } from 'tty';
import adminRouter from '/home/kukititi/ayudaporfi/routes/admin.js';




const SPW = 'Amimegustalapepsi';
const galletita = 'galletita';
const sql = neon('postgresql://piscolita_owner:qg0uBlwk4vLc@ep-withered-silence-a5uth5dy.us-east-2.aws.neon.tech/piscolita?sslmode=require');

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const checkAuthentication = (req) => {
  const token = req.cookies[galletita];
  try {
    jwt.verify(token, SPW);
    return true;
  } catch (e) {
    return false;
  }
};
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
      return next(); // El usuario es administrador, continúa
  }
  return res.status(403).send('Acceso denegado'); // No es administrador
};
const authMiddleware = (req, res, next) => {
  const token = req.cookies[galletita];
  try {
    req.user = jwt.verify(token, SPW);
    next();
  } catch (e) {
    return res.render('unauthorised');
  }
};


app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.engine('handlebars', engine({
    helpers: {
        multiply: (a, b) => a * b,
        totalPrice: (cart) => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
        eq: (a, b) => a === b // Helper para comparar igualdad
      }
}));

app.set('view engine', 'handlebars');
app.set('views', './views');

app.get("/", async (req, res) => {
  const isAuthenticated = checkAuthentication(req);
  const products = await sql('SELECT * FROM products WHERE destacado = true');
  const users = await sql('SELECT * FROM users WHERE id = 1');
  const user = users[0];
  res.render("home", {
    products,
    user,
    title: "Home",
    isAuthenticated,
  });
});
app.get('/homea', async (req, res) => {
  const isAuthenticated = checkAuthentication(req);
  const products = await sql('SELECT * FROM products');
  const users = await sql('SELECT * FROM users WHERE id = 1');
  const user = users[0];
  res.render("homea", {
    products,
    user,
    title: "Home Admin",
    isAuthenticated,
  });
});

app.get('/Accesorios', async (req, res) => {
  const isAuthenticated = checkAuthentication(req);
  const lista = await sql('SELECT * FROM products WHERE categ = \'ACCESORIOS\'');
  res.render('accs', { lista, isAuthenticated });
});

app.get('/Equipo', async (req, res) => {
  const isAuthenticated = checkAuthentication(req);
  const lista = await sql('SELECT * FROM products WHERE categ = \'EQUIPO\'');
  res.render('equi', { lista, isAuthenticated });
});

app.get('/Repuestos', async (req, res) =>{
  const isAuthenticated = checkAuthentication(req);
  const lista = await sql('SELECT * FROM products WHERE categ = \'REPUESTO\'');
  res.render('repu', { lista, isAuthenticated });
});

app.get('/Replicas', async (req, res) => {
  const isAuthenticated = checkAuthentication(req);
  const lista = await sql('SELECT * FROM products WHERE categ = \'REPLICAS\'');
  res.render('repli', { lista, isAuthenticated });
});

app.get('/Login', (req, res) => {
  const error = req.query.error;
  const isAuthenticated = checkAuthentication(req);

  res.render('login', {
    error,
    isAuthenticated, 
});
});

app.get('/Registro', async (req, res) => {
  const isAuthenticated = checkAuthentication(req);
  const lista = await sql('SELECT * FROM users');
  res.render('regist', { lista, isAuthenticated });
});

app.get('/LogAdmin', (req, res) => {
  const error = req.query.error;
  res.render('LogAdmin', { error });
});

app.get('/products', async (req, res) => {
  const lista = await sql('SELECT * FROM products');
  const isAuthenticated = checkAuthentication(req);
  res.render('products', { lista, isAuthenticated });
});

app.post('/LogAdmin', async (req, res) => {
  const email = req.body.email;
  const rut = req.body.rut;
  const password = req.body.contra; 

  if (!email || !rut || !password) {
      res.redirect(302, 'login?error=missing_fields');
      return;
  }

  try {
      const query = 'SELECT id, password FROM users WHERE rut = $1'; // Asegúrate de que 'password' sea el nombre correcto de la columna
      const results = await sql(query, [rut]);

      if (results.length === 0) {
          res.redirect(302, 'login?error=unauthorised');
          return;
      }

      const id = results[0].id;
      const hash = results[0].password; // Cambia 'passw' a 'password'

      // Aquí se debe usar una función para comparar el hash
      const match = await bcrypt.compare(password, hash); // Usa bcrypt para comparar contraseñas

      if (match) { 
          const FMFN = Math.floor(Date.now() / 1000) + 5 * 60; // 5 minutos de expiración
          const token = jwt.sign(
              { id, role: 'admin', exp: FMFN },
              SPW
          );

          res.cookie('galletita', token, { maxAge: 60 * 5 * 1000 });
          res.redirect(302, '/homea'); 
      } else {
          res.redirect(302, 'login?error=unauthorised');
      }
  } catch (error) {
      console.error('Error during admin login:', error);
      res.status(500).send('Error al procesar la solicitud');
  }
});


app.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.contra;

  const query = 'SELECT id, password FROM users WHERE email = $1';
  const results = await sql(query, [email]);

  if (results.length === 0) {
    res.redirect(302, 'Login?error=unauthorised');
    return;
  }

  const id = results[0].id;
  const hash = results[0].password;

  if (bcrypt.compareSync(password, hash)) {
    const FMFN = Math.floor(Date.now() / 1000) + 5 * 60;
    const token = jwt.sign(
      { id, exp: FMFN }, SPW
    );

    res.cookie(galletita, token, { maxAge: 60 * 5 * 1000 });
    res.cookie('userId', id); 
    res.redirect(302, '/profile');
    return;
  }

  res.redirect(302, 'Login?error=unauthorised');
});

app.post('/registrar', async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !rut || !password) {
    res.redirect(302, 'login?error=missing_fields');
    return;
}

  const hash = bcrypt.hashSync(password, 5);
  
  const query = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id';
  
  const results = await sql(query, [name, email, hash]);
  const id = results[0].id;
  
  const que = Math.floor(Date.now() / 1000) + 5 * 60;
  const token = jwt.sign({ id, exp: que }, SPW);

  res.cookie(galletita, token, { maxAge: 60 * 5 * 1000 });
  res.cookie('userId', id);  

  res.redirect(302, '/profile');
});

app.get('/profile', authMiddleware, async (req, res) => {
  const isAuthenticated = checkAuthentication(req);
  try {
    const userId = req.user.id;
    const query = 'SELECT name, email, wallet FROM users WHERE id = $1';
    const results = await sql(query, [userId]);
    if (results.length === 0) {
      return res.status(404).send('Usuario no encontrado');
    }
    const user = results[0];
    res.render('profile', { user, isAuthenticated });
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    res.status(500).send('Error interno del servidor');
  }
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

// Rutas para manejar el carrito
app.get('/Carrito', async (req, res) => {
  const isAuthenticated = true;
  const userId = req.cookies.userId;
  console.log('User ID:', userId);

  if (!userId) {
    res.status(400).send('User ID is missing');
    return;
  }

  const query = `
      SELECT c.id, p.name, p.price, c.quantiti as quantity
      FROM cart c
      JOIN products p ON c.prod_id = p.id
      WHERE c.us_id = $1
  `;

  try {
    const cart = await sql(query, [userId.toString()]);
    res.render('cart', { cart, isAuthenticated });
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).send('Error al obtener el carrito');
  }
});

app.post('/carrito/add', async (req, res) => {
  const prod_id = parseInt(req.body.prod_id, 10); // Asegúrate de que sea un número
  const userId = req.cookies.userId;
  const quantiti = parseInt(req.body.quantiti, 10); // Asegúrate de que sea un número

  console.log('User ID:', userId);
  console.log('Product ID:', prod_id);
  console.log('Quantity:', quantiti);

  if (!userId) {
    res.status(400).send('Necesitas logearte para agregar cosas a un carrito :P');
    return;
  }

  try {
    const querySelect = 'SELECT * FROM cart WHERE us_id = $1 AND prod_id = $2';
    const results = await sql(querySelect, [userId, prod_id]);

    if (results.length > 0) {
      const queryUpdate = 'UPDATE cart SET quantiti = quantiti + $1 WHERE us_id = $2 AND prod_id = $3';
      await sql(queryUpdate, [quantiti, userId, prod_id]);
    } else {
      const queryInsert = 'INSERT INTO cart (quantiti, us_id, prod_id) VALUES ($1, $2, $3)';
      await sql(queryInsert, [quantiti, userId, prod_id]);
    }
    res.redirect('/Carrito');
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    res.status(500).send('Error al procesar la solicitud');
  }
});

app.post('/carrito/remove', async (req, res) => {
  const { id } = req.body;
  const query = 'DELETE FROM cart WHERE id = $1';

  try {
    await sql(query, [id]);
    res.redirect('/Carrito');
  } catch (error) {
    console.error('Error al eliminar el producto del carrito:', error);
    res.status(500).send('Error al eliminar el producto del carrito');
  }
});

app.post('/pagar', async (req, res) => {

});
app.post('/recargar-saldo', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
      return res.json({ success: false, message: 'Monto inválido' });
  }

  try {
      // Actualizar el saldo del usuario en la base de datos
      const updateQuery = 'UPDATE users SET wallet = wallet + $1 WHERE id = $2 RETURNING wallet';
      const results = await sql(updateQuery, [amount, userId]);

      if (results.length > 0) {
          const newBalance = results[0].wallet;
          res.json({ success: true, newBalance });
      } else {
          res.json({ success: false, message: 'Usuario no encontrado' });
      }
  } catch (error) {
      console.error('Error al recargar saldo:', error);
      res.status(500).json({ success: false, message: 'Error al recargar saldo' });
  }
});


app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/profile', profileRouter);
app.use('/api/admin', adminRouter);


app.listen(3000, () => console.log('tuki'));

