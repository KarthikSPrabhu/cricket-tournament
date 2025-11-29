// backend/models/Match.js
import mongoose from 'mongoose';

const ballSchema = new mongoose.Schema({
  over: Number,
  ballNumber: Number,
  bowler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  batsman: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  runs: Number,
  isWicket: Boolean,
  wicketType: String,
  isExtra: Boolean,
  extraType: String,
  extraRuns: Number,
  shotLocation: String,
  commentary: String
});

const inningsSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  totalRuns: {
    type: Number,
    default: 0
  },
  wickets: {
    type: Number,
    default: 0
  },
  overs: {
    type: Number,
    default: 0
  },
  balls: [ballSchema],
  batsmen: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    },
    runs: Number,
    balls: Number,
    fours: Number,
    sixes: Number,
    isOut: Boolean,
    strikeRate: Number
  }],
  bowlers: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    },
    overs: Number,
    maidens: Number,
    runs: Number,
    wickets: Number,
    economy: Number
  }]
});

const matchSchema = new mongoose.Schema({
  team1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  team2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  venue: String,
  date: Date,
  matchType: {
    type: String,
    enum: ['league', 'playoff', 'final'],
    default: 'league'
  },
  overs: {
    type: Number,
    default: 20
  },
  toss: {
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    decision: {
      type: String,
      enum: ['bat', 'bowl']
    }
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed', 'abandoned'],
    default: 'upcoming'
  },
  currentInnings: {
    type: Number,
    default: 1
  },
  innings: [inningsSchema],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  manOfTheMatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }
}, {
  timestamps: true
});

export default mongoose.model('Match', matchSchema);