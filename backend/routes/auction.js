// routes/auction.js
import express from 'express';
import { 
  startAuction, 
  placeBid, 
  sellPlayer, 
  getCurrentAuction, 
  getAuctionHistory 
} from '../controllers/auctionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/current', getCurrentAuction);
router.get('/history', getAuctionHistory);

router.post('/start', protect, authorize('admin'), startAuction);
router.post('/bid', protect, authorize('team_captain'), placeBid);
router.post('/:auctionId/sell', protect, authorize('admin'), sellPlayer);

export default router;