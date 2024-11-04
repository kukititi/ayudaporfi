import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

const app = express();
const cartRouter = express.Router();
const sql = neon('postgresql://piscolita_owner:qg0uBlwk4vLc@ep-withered-silence-a5uth5dy.us-east-2.aws.neon.tech/piscolita?sslmode=require');

// Ruta para obtener el carrito de un usuario específico
cartRouter.get('/', async (req, res) => {
  const userId = req.cookies.userId;
  if (!userId) {
    res.status(400).send('Por como esta creado el carrito, necesito que se logee y luego pregunte por la api "/api/cart" :(');
    return;
  }

  const query = `
    SELECT cart.id, products.name, products.price, cart.quantiti AS quantity
    FROM cart
    JOIN products ON cart.prod_id = products.id
    WHERE cart.us_id = $1
  `;

  try {
    const cart = await sql(query, [userId]);
    res.json({ cart });
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).json({ message: 'Error al obtener el carrito' });
  }
});

// Ruta para agregar un producto al carrito
cartRouter.post('/add', async (req, res) => {
  const prodId = parseInt(req.body.prod_id, 10);
  const userId = req.cookies.userId;
  const quantity = parseInt(req.body.quantiti, 10);

  if (!userId) {
    res.status(400).json({ message: 'Necesitas logearte para agregar productos al carrito' });
    return;
  }

  try {
    // Verificar si el producto ya está en el carrito
    const querySelect = 'SELECT * FROM cart WHERE us_id = $1 AND prod_id = $2';
    const results = await sql(querySelect, [userId, prodId]);

    if (results.length > 0) {
      // Actualizar cantidad si el producto ya existe en el carrito
      const queryUpdate = 'UPDATE cart SET quantiti = quantiti + $1 WHERE us_id = $2 AND prod_id = $3';
      await sql(queryUpdate, [quantity, userId, prodId]);
    } else {
      // Insertar nuevo producto en el carrito
      const queryInsert = 'INSERT INTO cart (quantiti, us_id, prod_id) VALUES ($1, $2, $3)';
      await sql(queryInsert, [quantity, userId, prodId]);
    }
    res.json({ message: 'Producto agregado al carrito' });
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    res.status(500).json({ message: 'Error al agregar al carrito' });
  }
});

// Ruta para eliminar un producto del carrito
cartRouter.post('/remove', async (req, res) => {
  const { id } = req.body;
  const query = 'DELETE FROM cart WHERE id = $1';

  try {
    await sql(query, [id]);
    res.json({ message: 'Producto eliminado del carrito' });
  } catch (error) {
    console.error('Error al eliminar el producto del carrito:', error);
    res.status(500).json({ message: 'Error al eliminar el producto del carrito' });
  }
});

// Ruta para actualizar la cantidad de un producto en el carrito
cartRouter.post('/update', async (req, res) => {
  const { id, quantity } = req.body;
  
  if (quantity <= 0) {
    res.status(400).json({ message: 'Cantidad no válida' });
    return;
  }

  const query = 'UPDATE cart SET quantiti = $1 WHERE id = $2';

  try {
    await sql(query, [quantity, id]);
    res.json({ message: 'Cantidad actualizada' });
  } catch (error) {
    console.error('Error al actualizar la cantidad:', error);
    res.status(500).json({ message: 'Error al actualizar la cantidad' });
  }
});

export default cartRouter;
