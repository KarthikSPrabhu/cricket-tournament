// models/Auction.js
import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  teamName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const auctionSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  currentBid: {
    type: Number,
    default: 0
  },
  currentBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  currentBidderName: {
    type: String
  },
  bids: [bidSchema],
  status: {
    type: String,
    enum: ['pending', 'active', 'sold', 'unsold'],
    default: 'pending'
  },
  soldTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  soldPrice: {
    type: Number,
    default: 0
  },
  timer: {
    type: Number,
    default: 30
  },
  timerActive: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
auctionSchema.index({ status: 1 });
auctionSchema.index({ player: 1 });

export default mongoose.model('Auction', auctionSchema);