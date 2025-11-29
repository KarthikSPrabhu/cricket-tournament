// routes/tournament.js
import express from 'express';
import { getLeaderboard, getPointTable, getTournamentStats } from '../controllers/tournamentController.js';

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.get('/point-table', getPointTable);
router.get('/stats', getTournamentStats);

export default router;