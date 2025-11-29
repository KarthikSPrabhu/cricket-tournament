// routes/matches.js
import express from 'express';
import { 
  createMatch, 
  getMatches, 
  getMatch, 
  updateToss, 
  updateBallByBall,
  endInnings 
} from '../controllers/matchController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getMatches)
  .post(protect, authorize('admin'), createMatch);

router.route('/:id')
  .get(getMatch);

router.post('/:id/toss', protect, authorize('admin'), updateToss);
router.post('/:id/ball', protect, authorize('admin'), updateBallByBall);
router.post('/:id/end-innings', protect, authorize('admin'), endInnings);

export default router;