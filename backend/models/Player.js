// models/Player.js
import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Player name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  nativePlace: {
    type: String,
    required: [true, 'Native place is required']
  },
  playerType: {
    type: String,
    enum: ['batsman', 'bowler', 'all-rounder', 'wicket-keeper'],
    required: true
  },
  playerStyle: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  basePoints: {
    type: Number,
    default: 100,
    min: 0
  },
  playerLists: [{
    type: String
  }],
  isSold: {
    type: Boolean,
    default: false
  },
  soldPrice: {
    type: Number,
    default: 0
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  isCaptain: {
    type: Boolean,
    default: false
  },
  isIconPlayer: {
    type: Boolean,
    default: false
  },
  stats: {
    matches: { type: Number, default: 0 },
    innings: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    bestBowling: { type: String, default: '0/0' },
    economy: { type: Number, default: 0 },
    average: { type: Number, default: 0 },
    strikeRate: { type: Number, default: 0 },
    fifties: { type: Number, default: 0 },
    centuries: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index for better query performance
playerSchema.index({ playerType: 1, isSold: 1 });
playerSchema.index({ team: 1 });

export default mongoose.model('Player', playerSchema);