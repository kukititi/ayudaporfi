import express from 'express';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const router = express.Router();
const sql = neon('postgresql://piscolita_owner:qg0uBlwk4vLc@ep-withered-silence-a5uth5dy.us-east-2.aws.neon.tech/piscolita?sslmode=require');
const SPW = 'Amimegustalapepsi';

// Middleware para verificar si el usuario es admin
const adminMiddleware = (req, res, next) => {
  const token = req.cookies['galletita']; // Asegúrate de que el token esté en las cookies
  if (!token) return res.status(403).send('Acceso denegado');

  try {
    const user = jwt.verify(token, SPW);
    if (user.role === 'admin') {
      req.user = user; // Agregar el usuario al objeto de solicitud
      next();
    } else {
      res.status(403).send('Acceso denegado');
    }
  } catch (err) {
    res.status(403).send('Acceso denegado');
  }
};

// Ruta de prueba para verificar que el router funciona
router.get('/', (req, res) => {
  res.send('Admin API está funcionando');
});

// Ruta para agregar un producto
router.post('/products', adminMiddleware, async (req, res) => {
  const { name, price, image, categ, db, descr } = req.body;

  if (!name || !price || !image || !categ || !db || !descr) {
    return res.status(400).send('Todos los campos son requeridos');
  }

  const query = 'INSERT INTO products (name, price, image, categ, db, descr) VALUES ($1, $2, $3, $4, $5, $6)';
  try {
    await sql(query, [name, price, image, categ, db, descr]);
    res.status(201).send('Producto agregado exitosamente');
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(500).send('Error al agregar el producto');
  }
});

export default router;
