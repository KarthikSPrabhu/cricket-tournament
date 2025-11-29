// backend/controllers/auctionController.js
import Auction from '../models/Auction.js';
import Player from '../models/Player.js';
import Team from '../models/Team.js';

export const startAuction = async (req, res) => {
  try {
    const { playerId, basePrice } = req.body;
    
    const auction = await Auction.create({
      player: playerId,
      basePrice,
      status: 'active',
      timerActive: true
    });

    // Emit socket event for real-time updates
    req.io.emit('auction-started', auction);
    
    res.json({
      status: 'success',
      auction
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const placeBid = async (req, res) => {
  try {
    const { auctionId, teamId, amount } = req.body;
    
    const auction = await Auction.findById(auctionId);
    const team = await Team.findById(teamId);
    
    if (!auction || auction.status !== 'active') {
      return res.status(400).json({ message: 'Auction not active' });
    }
    
    if (team.purse < amount) {
      return res.status(400).json({ message: 'Insufficient purse' });
    }
    
    if (amount <= auction.currentBid) {
      return res.status(400).json({ message: 'Bid must be higher than current bid' });
    }

    // Calculate bid increment
    const bidIncrement = amount < 1000 ? 100 : 150;
    if ((amount - auction.currentBid) < bidIncrement) {
      return res.status(400).json({ 
        message: `Bid must increase by ${bidIncrement} points` 
      });
    }

    auction.currentBid = amount;
    auction.currentBidder = teamId;
    auction.bids.push({
      team: teamId,
      amount,
      timestamp: new Date()
    });
    
    // Reset timer on new bid
    auction.timer = 30;
    
    await auction.save();

    // Emit real-time update
    req.io.emit('new-bid', {
      auctionId,
      team: teamId,
      teamName: team.name,
      amount,
      timestamp: new Date()
    });
    
    res.json({
      status: 'success',
      auction
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};