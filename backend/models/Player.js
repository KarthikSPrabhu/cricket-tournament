// backend/models/Player.js
import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  nativePlace: {
    type: String,
    required: true
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
    default: 100
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
  stats: {
    matches: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    bestBowling: { type: String, default: '0/0' },
    economy: { type: Number, default: 0 },
    average: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

export default mongoose.model('Player', playerSchema);
