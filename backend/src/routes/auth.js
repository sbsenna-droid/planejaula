import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Gerar JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Registrar novo usuário
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, school } = req.body;

    // Verificar se usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'Email já cadastrado' 
      });
    }

    // Criar usuário
    const user = await User.create({
      name,
      email,
      password,
      school
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        school: user.school
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erro ao criar usuário',
      error: error.message 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar se usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Email ou senha incorretos' 
      });
    }

    // Verificar senha
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ 
        success: false,
        message: 'Email ou senha incorretos' 
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        school: user.school
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erro ao fazer login',
      error: error.message 
    });
  }
});

// Obter perfil do usuário
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar perfil',
      error: error.message 
    });
  }
});

export default router;