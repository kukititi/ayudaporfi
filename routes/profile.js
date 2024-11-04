import express from 'express';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const router = express.Router();
const SPW = 'Amimegustalapepsi'; // Tu clave secreta para JWT
const sql = neon('postgresql://piscolita_owner:qg0uBlwk4vLc@ep-withered-silence-a5uth5dy.us-east-2.aws.neon.tech/piscolita?sslmode=require');

// Middleware para verificar el token JWT
const authMiddleware = (req, res, next) => {
    const token = req.cookies['galletita'];
    if (!token) {
        return res.status(401).json({ message: 'No autorizado, necesitas logearte pues, si no tienes un perfil bro :P' });
    }
    
    jwt.verify(token, SPW, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido' });
        }
        req.user = user; // Agregar el usuario a la solicitud
        next();
    });
};

// Obtener el perfil del usuario
router.get('/', authMiddleware, async (req, res) => {
    console.log('Solicitud a /api/profile recibida');
    const userId = req.user.id;

    try {
        const query = 'SELECT name, email, wallet FROM users WHERE id = $1';
        const results = await sql(query, [userId]);
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        res.json(results[0]); // Enviar los datos del perfil
    } catch (error) {
        console.error('Error al obtener el perfil:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Actualizar el perfil del usuario
router.put('/', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { name, email, wallet } = req.body;

    try {
        const query = `
            UPDATE users 
            SET name = $1, email = $2, wallet = $3 
            WHERE id = $4
        `;
        await sql(query, [name, email, wallet, userId]);
        res.status(200).json({ message: 'Perfil actualizado con éxito' });
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Ruta de prueba para verificar que el router está funcionando
router.get('/test', async (req, res) => {
    res.json({ message: 'El router de perfil está funcionando' });
});

export default router;
console.log('Router de perfil cargado');
