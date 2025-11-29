// routes/players.js
import express from 'express';
import { 
  createPlayer, 
  getPlayers, 
  getPlayer, 
  updatePlayer, 
  deletePlayer,
  addToPlayerList 
} from '../controllers/playerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getPlayers)
  .post(protect, authorize('admin'), createPlayer);

router.route('/:id')
  .get(getPlayer)
  .put(protect, authorize('admin'), updatePlayer)
  .delete(protect, authorize('admin'), deletePlayer);

router.post('/:id/lists', protect, authorize('admin'), addToPlayerList);

export default router;