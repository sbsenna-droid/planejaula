import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Placeholder para rotas de IA futuras
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'AI routes disponíveis' });
});

export default router;