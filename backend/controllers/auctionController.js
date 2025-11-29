// controllers/auctionController.js
import Auction from '../models/Auction.js';
import Player from '../models/Player.js';
import Team from '../models/Team.js';

export const startAuction = async (req, res) => {
  try {
    const { playerId, basePrice } = req.body;
    
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Player not found' 
      });
    }

    // Check if player is already in auction
    const existingAuction = await Auction.findOne({ 
      player: playerId, 
      status: { $in: ['pending', 'active'] } 
    });
    
    if (existingAuction) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Player is already in auction' 
      });
    }

    const auction = await Auction.create({
      player: playerId,
      basePrice: basePrice || player.basePoints,
      status: 'active',
      timerActive: true,
      startTime: new Date()
    });

    // Populate player details
    await auction.populate('player');

    // Emit socket event for real-time updates
    req.io.emit('auction-started', auction);
    
    res.json({
      status: 'success',
      auction
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

export const placeBid = async (req, res) => {
  try {
    const { auctionId, teamId, amount } = req.body;
    
    const auction = await Auction.findById(auctionId).populate('player');
    const team = await Team.findById(teamId);
    
    if (!auction || auction.status !== 'active') {
      return res.status(400).json({ 
        status: 'error',
        message: 'Auction not active' 
      });
    }
    
    if (!team) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Team not found' 
      });
    }
    
    if (team.purse < amount) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Insufficient purse points' 
      });
    }
    
    if (amount <= auction.currentBid) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Bid must be higher than current bid' 
      });
    }

    // Calculate bid increment
    const bidIncrement = amount < 1000 ? 100 : 150;
    const minBid = auction.currentBid > 0 ? auction.currentBid + bidIncrement : auction.basePrice;
    
    if (amount < minBid) {
      return res.status(400).json({ 
        status: 'error',
        message: `Bid must be at least ${minBid} points` 
      });
    }

    // Update auction
    auction.currentBid = amount;
    auction.currentBidder = teamId;
    auction.currentBidderName = team.name;
    
    auction.bids.push({
      team: teamId,
      teamName: team.name,
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
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

export const sellPlayer = async (req, res) => {
  try {
    const { auctionId } = req.params;
    
    const auction = await Auction.findById(auctionId).populate('player');
    
    if (!auction || auction.status !== 'active') {
      return res.status(400).json({ 
        status: 'error',
        message: 'Auction not active' 
      });
    }
    
    if (!auction.currentBidder) {
      // Mark as unsold if no bids
      auction.status = 'unsold';
      auction.endTime = new Date();
      await auction.save();
      
      req.io.emit('player-unsold', { auctionId, player: auction.player });
      
      return res.json({
        status: 'success',
        message: 'Player unsold - no bids received',
        auction
      });
    }

    // Update team purse and add player to team
    const team = await Team.findById(auction.currentBidder);
    team.purse -= auction.currentBid;
    team.players.push(auction.player._id);
    await team.save();

    // Update player status
    const player = await Player.findById(auction.player._id);
    player.isSold = true;
    player.soldPrice = auction.currentBid;
    player.team = auction.currentBidder;
    await player.save();

    // Update auction
    auction.status = 'sold';
    auction.soldTo = auction.currentBidder;
    auction.soldPrice = auction.currentBid;
    auction.endTime = new Date();
    await auction.save();

    // Emit real-time update
    req.io.emit('player-sold', {
      auctionId,
      player: auction.player,
      team: auction.currentBidder,
      teamName: team.name,
      soldPrice: auction.currentBid
    });
    
    res.json({
      status: 'success',
      message: `Player sold to ${team.name} for ${auction.currentBid} points`,
      auction
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

export const getCurrentAuction = async (req, res) => {
  try {
    const auction = await Auction.findOne({ status: 'active' })
      .populate('player')
      .populate('currentBidder');
    
    res.json({
      status: 'success',
      auction
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

export const getAuctionHistory = async (req, res) => {
  try {
    const auctions = await Auction.find({ 
      status: { $in: ['sold', 'unsold'] } 
    })
      .populate('player')
      .populate('soldTo')
      .sort({ endTime: -1 });
    
    res.json({
      status: 'success',
      results: auctions.length,
      auctions
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};