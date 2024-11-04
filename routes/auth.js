import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

const app = express();
const sql = neon('postgresql://piscolita_owner:qg0uBlwk4vLc@ep-withered-silence-a5uth5dy.us-east-2.aws.neon.tech/piscolita?sslmode=require');
const authRouter = express.Router();

authRouter.post('/login', async (req, res) => {
  const { email, contra } = req.body;
  const query = 'SELECT id, password FROM users WHERE email = $1';
  const results = await sql(query, [email]);

  if (results.length === 0) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const user = results[0];
  if (bcrypt.compareSync(contra, user.password)) {
    const token = jwt.sign({ id: user.id }, SPW, { expiresIn: '5m' });
    res.cookie(galletita, token, { maxAge: 5 * 60 * 1000 });
    return res.json({ success: true });
  }

  res.status(401).json({ error: 'Credenciales incorrectas' });
});

authRouter.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hash = bcrypt.hashSync(password, 5);

  const query = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id';
  const results = await sql(query, [name, email, hash]);
  
  const user = results[0];
  const token = jwt.sign({ id: user.id }, SPW, { expiresIn: '5m' });
  res.cookie(galletita, token, { maxAge: 5 * 60 * 1000 });

  res.json({ success: true });
});

authRouter.get('/test', (req, res) => {
  res.json({ message: 'Ruta de prueba de Auth funcionando' });
});



export default authRouter;
