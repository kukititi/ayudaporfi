import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

const productsRouter = express.Router();
const sql = neon('postgresql://piscolita_owner:qg0uBlwk4vLc@ep-withered-silence-a5uth5dy.us-east-2.aws.neon.tech/piscolita?sslmode=require');

productsRouter.get('/', async (req, res) => {
  try {
    const products = await sql('SELECT * FROM products');
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

productsRouter.post('/add', async (req, res) => {
  const { name, price, image, categ, db, descr } = req.body;
  const query = 'INSERT INTO products (name, price, image, categ, db, descr) VALUES ($1, $2, $3, $4, $5, $6)';
  
  try {
    await sql(query, [name, price, image, categ, db, descr]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(500).json({ error: 'Error al agregar producto' });
  }
});

export default productsRouter;
