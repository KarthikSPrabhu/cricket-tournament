// models/Match.js
import mongoose from 'mongoose';

const ballSchema = new mongoose.Schema({
  over: {
    type: Number,
    required: true
  },
  ballNumber: {
    type: Number,
    required: true
  },
  bowler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  batsman: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  runs: {
    type: Number,
    default: 0
  },
  isWicket: {
    type: Boolean,
    default: false
  },
  wicketType: {
    type: String,
    enum: ['bowled', 'caught', 'lbw', 'run-out', 'stumped', 'hit-wicket', 'retired']
  },
  isExtra: {
    type: Boolean,
    default: false
  },
  extraType: {
    type: String,
    enum: ['wide', 'noball', 'bye', 'legbye']
  },
  extraRuns: {
    type: Number,
    default: 0
  },
  shotLocation: {
    type: String,
    enum: ['cover', 'midwicket', 'square', 'fine', 'straight', 'point', 'thirdman', 'longon', 'longoff']
  },
  commentary: {
    type: String
  }
});

const playerInningsSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  runs: {
    type: Number,
    default: 0
  },
  balls: {
    type: Number,
    default: 0
  },
  fours: {
    type: Number,
    default: 0
  },
  sixes: {
    type: Number,
    default: 0
  },
  isOut: {
    type: Boolean,
    default: false
  },
  strikeRate: {
    type: Number,
    default: 0
  },
  howOut: {
    type: String
  },
  bowler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }
});

const bowlerStatsSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  overs: {
    type: Number,
    default: 0
  },
  maidens: {
    type: Number,
    default: 0
  },
  runs: {
    type: Number,
    default: 0
  },
  wickets: {
    type: Number,
    default: 0
  },
  economy: {
    type: Number,
    default: 0
  },
  dots: {
    type: Number,
    default: 0
  },
  wides: {
    type: Number,
    default: 0
  },
  noBalls: {
    type: Number,
    default: 0
  }
});

const inningsSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
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
  batsmen: [playerInningsSchema],
  bowlers: [bowlerStatsSchema],
  extras: {
    wides: { type: Number, default: 0 },
    noBalls: { type: Number, default: 0 },
    byes: { type: Number, default: 0 },
    legByes: { type: Number, default: 0 }
  }
});

const matchSchema = new mongoose.Schema({
  matchNumber: {
    type: String,
    required: true
  },
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
  venue: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  matchType: {
    type: String,
    enum: ['league', 'qualifier', 'eliminator', 'final'],
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
    enum: ['scheduled', 'live', 'completed', 'abandoned'],
    default: 'scheduled'
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
  winMargin: {
    runs: Number,
    wickets: Number
  },
  manOfTheMatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  playingXI: {
    team1: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    }],
    team2: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    }]
  }
}, {
  timestamps: true
});

// Indexes for better performance
matchSchema.index({ date: 1 });
matchSchema.index({ status: 1 });
matchSchema.index({ team1: 1, team2: 1 });

export default mongoose.model('Match', matchSchema);