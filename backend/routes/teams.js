// routes/teams.js
import express from 'express';
import { 
  createTeam, 
  getTeams, 
  getTeam, 
  updateTeam, 
  setTeamCaptain,
  getTeamSquad 
} from '../controllers/teamController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getTeams)
  .post(protect, authorize('admin'), createTeam);

router.route('/:id')
  .get(getTeam)
  .put(protect, authorize('admin'), updateTeam);

router.get('/:id/squad', getTeamSquad);
router.post('/:id/captain', protect, authorize('admin'), setTeamCaptain);

export default router;