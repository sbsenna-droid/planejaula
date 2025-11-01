import express from 'express';
import {
  createLesson,
  getLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
  getStats
} from '../controllers/lessonController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(protect);

router.route('/')
  .get(getLessons)
  .post(createLesson);

router.get('/stats', getStats);

router.route('/:id')
  .get(getLessonById)
  .put(updateLesson)
  .delete(deleteLesson);

export default router;