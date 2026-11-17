const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/user');

const router = express.Router();

// Limite les tentatives pour ralentir le bruteforce
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives, réessayez dans quelques minutes' },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Inscription
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { nom, email, password } = req.body;

    if (!nom || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res
        .status(400)
        .json({ message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Adresse email invalide' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ nom, email, password: hash });

    res.status(201).json({ id: user._id, nom: user.nom, email: user.email });
  } catch (error) {
    console.error('register error:', error.message);
    res.status(500).json({ message: "Impossible de créer le compte" });
  }
});

// Connexion
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET manquant dans les variables d\'environnement');
      return res.status(500).json({ message: 'Configuration serveur invalide' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      user: { id: user._id, nom: user.nom, email: user.email },
    });
  } catch (error) {
    console.error('login error:', error.message);
    res.status(500).json({ message: 'Connexion impossible' });
  }
});

module.exports = router;
