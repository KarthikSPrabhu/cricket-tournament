// models/Team.js
import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    unique: true,
    trim: true
  },
  shortName: {
    type: String,
    required: true,
    uppercase: true,
    maxlength: 3
  },
  logo: {
    type: String,
    default: ''
  },
  primaryColor: {
    type: String,
    default: '#000000'
  },
  secondaryColor: {
    type: String,
    default: '#FFFFFF'
  },
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  purse: {
    type: Number,
    default: 10000,
    min: 0
  },
  initialPurse: {
    type: Number,
    default: 10000
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  points: {
    type: Number,
    default: 0
  },
  matchesPlayed: {
    type: Number,
    default: 0
  },
  matchesWon: {
    type: Number,
    default: 0
  },
  matchesLost: {
    type: Number,
    default: 0
  },
  matchesTied: {
    type: Number,
    default: 0
  },
  netRunRate: {
    type: Number,
    default: 0
  },
  runsScored: {
    type: Number,
    default: 0
  },
  oversFaced: {
    type: Number,
    default: 0
  },
  runsConceded: {
    type: Number,
    default: 0
  },
  oversBowled: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for remaining purse
teamSchema.virtual('remainingPurse').get(function() {
  return this.purse;
});

// Virtual for win percentage
teamSchema.virtual('winPercentage').get(function() {
  if (this.matchesPlayed === 0) return 0;
  return ((this.matchesWon / this.matchesPlayed) * 100).toFixed(2);
});

teamSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Team', teamSchema);