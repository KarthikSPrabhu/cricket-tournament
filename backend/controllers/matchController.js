// controllers/matchController.js
import Match from '../models/Match.js';
import Team from '../models/Team.js';
import Player from '../models/Player.js';

export const createMatch = async (req, res) => {
  try {
    const { 
      team1, team2, venue, date, matchType, overs, 
      playingXI 
    } = req.body;

    // Generate match number
    const matchCount = await Match.countDocuments();
    const matchNumber = `MATCH${String(matchCount + 1).padStart(3, '0')}`;

    const match = await Match.create({
      matchNumber,
      team1,
      team2,
      venue,
      date: new Date(date),
      matchType,
      overs,
      playingXI
    });

    await match.populate('team1 team2');

    res.status(201).json({
      status: 'success',
      match
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

export const getMatches = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (type) filter.matchType = type;

    const matches = await Match.find(filter)
      .populate('team1 team2 winner toss.winner manOfTheMatch')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: 1 });

    const total = await Match.countDocuments(filter);
    
    res.json({
      status: 'success',
      results: matches.length,
      total,
      matches
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

export const getMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('team1 team2 winner toss.winner manOfTheMatch')
      .populate('innings.team')
      .populate('innings.batsmen.player')
      .populate('innings.bowlers.player')
      .populate('playingXI.team1 playingXI.team2');

    if (!match) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Match not found' 
      });
    }
    
    res.json({
      status: 'success',
      match
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

export const updateToss = async (req, res) => {
  try {
    const { winner, decision } = req.body;
    
    const match = await Match.findByIdAndUpdate(
      req.params.id,
      { 
        toss: { winner, decision },
        status: 'live'
      },
      { new: true }
    ).populate('team1 team2 toss.winner');

    if (!match) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Match not found' 
      });
    }

    // Emit real-time update
    req.io.emit('toss-updated', { matchId: req.params.id, toss: match.toss });
    
    res.json({
      status: 'success',
      match
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

export const updateBallByBall = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { 
      over, ballNumber, bowler, batsman, runs, 
      isWicket, wicketType, isExtra, extraType, shotLocation 
    } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Match not found' 
      });
    }

    if (match.status !== 'live') {
      return res.status(400).json({ 
        status: 'error',
        message: 'Match is not live' 
      });
    }

    const currentInnings = match.innings[match.currentInnings - 1];
    if (!currentInnings) {
      return res.status(400).json({ 
        status: 'error',
        message: 'No innings started' 
      });
    }

    // Create ball data
    const ballData = {
      over: parseFloat(over),
      ballNumber,
      bowler,
      batsman,
      runs: runs || 0,
      isWicket: isWicket || false,
      wicketType: wicketType || null,
      isExtra: isExtra || false,
      extraType: extraType || null,
      extraRuns: (isExtra && (extraType === 'wide' || extraType === 'noball')) ? 1 : 0,
      shotLocation,
      commentary: generateCommentary(runs, isWicket, extraType, shotLocation)
    };

    // Update innings totals
    currentInnings.totalRuns += ballData.runs + (ballData.extraRuns || 0);
    
    if (ballData.isWicket) {
      currentInnings.wickets += 1;
    }

    // Update batsman stats
    let batsmanIndex = currentInnings.batsmen.findIndex(
      b => b.player.toString() === batsman && !b.isOut
    );
    
    if (batsmanIndex === -1) {
      // New batsman
      currentInnings.batsmen.push({
        player: batsman,
        runs: ballData.runs,
        balls: 1,
        fours: ballData.runs === 4 ? 1 : 0,
        sixes: ballData.runs === 6 ? 1 : 0,
        isOut: ballData.isWicket,
        strikeRate: ballData.runs * 100,
        howOut: ballData.isWicket ? ballData.wicketType : null,
        bowler: ballData.isWicket ? ballData.bowler : null
      });
    } else {
      // Existing batsman
      const batsmanStats = currentInnings.batsmen[batsmanIndex];
      batsmanStats.runs += ballData.runs;
      batsmanStats.balls += 1;
      if (ballData.runs === 4) batsmanStats.fours += 1;
      if (ballData.runs === 6) batsmanStats.sixes += 1;
      if (ballData.isWicket) {
        batsmanStats.isOut = true;
        batsmanStats.howOut = ballData.wicketType;
        batsmanStats.bowler = ballData.bowler;
      }
      batsmanStats.strikeRate = (batsmanStats.runs / batsmanStats.balls) * 100;
    }

    // Update bowler stats if not an extra
    if (!ballData.isExtra || ballData.extraType === 'noball') {
      let bowlerIndex = currentInnings.bowlers.findIndex(
        b => b.player.toString() === bowler
      );
      
      if (bowlerIndex === -1) {
        // New bowler
        currentInnings.bowlers.push({
          player: bowler,
          overs: 0,
          maidens: 0,
          runs: ballData.runs + (ballData.extraRuns || 0),
          wickets: ballData.isWicket ? 1 : 0,
          economy: 0,
          dots: ballData.runs === 0 ? 1 : 0,
          wides: ballData.extraType === 'wide' ? 1 : 0,
          noBalls: ballData.extraType === 'noball' ? 1 : 0
        });
      } else {
        // Existing bowler
        const bowlerStats = currentInnings.bowlers[bowlerIndex];
        bowlerStats.runs += ballData.runs + (ballData.extraRuns || 0);
        
        // Update overs (complex logic for proper over calculation)
        const currentBalls = Math.floor((bowlerStats.overs - Math.floor(bowlerStats.overs)) * 10) || 0;
        const newBalls = (currentBalls + 1) % 6;
        bowlerStats.overs = Math.floor(bowlerStats.overs) + (newBalls === 0 ? 1 : 0) + (newBalls / 10);
        
        if (ballData.isWicket) bowlerStats.wickets += 1;
        if (ballData.runs === 0) bowlerStats.dots += 1;
        if (ballData.extraType === 'wide') bowlerStats.wides += 1;
        if (ballData.extraType === 'noball') bowlerStats.noBalls += 1;
        
        bowlerStats.economy = bowlerStats.runs / (bowlerStats.overs || 1);
      }
    }

    // Update extras
    if (ballData.isExtra) {
      switch (ballData.extraType) {
        case 'wide':
          currentInnings.extras.wides += 1;
          break;
        case 'noball':
          currentInnings.extras.noBalls += 1;
          break;
        case 'bye':
          currentInnings.extras.byes += ballData.runs;
          break;
        case 'legbye':
          currentInnings.extras.legByes += ballData.runs;
          break;
      }
    }

    currentInnings.balls.push(ballData);
    
    // Update overs count
    if (!ballData.isExtra || ballData.extraType === 'noball') {
      const totalBalls = currentInnings.balls.filter(
        ball => !ball.isExtra || ball.extraType === 'noball'
      ).length;
      currentInnings.overs = Math.floor(totalBalls / 6) + (totalBalls % 6) / 10;
    }

    await match.save();

    // Populate for response
    await match.populate('innings.batsmen.player innings.bowlers.player');

    // Emit real-time update
    req.io.emit('ball-updated', {
      matchId,
      ball: ballData,
      innings: currentInnings,
      match: match
    });

    res.json({
      status: 'success',
      ball: ballData,
      innings: currentInnings,
      match
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

function generateCommentary(runs, isWicket, extraType, shotLocation) {
  const shotDescriptions = {
    'cover': 'beautiful cover drive',
    'midwicket': 'powerful shot to midwicket',
    'square': 'cracked through square',
    'fine': 'delicate fine leg glance',
    'straight': 'straight down the ground',
    'point': 'cut away to point',
    'thirdman': 'guided to third man',
    'longon': 'hoisted to long on',
    'longoff': 'driven to long off'
  };

  if (isWicket) {
    const wicketComments = [
      'OUT! What a breakthrough!',
      'WICKET! Brilliant bowling!',
      'GONE! That\'s a big wicket!',
      'DISMISSED! Excellent work!'
    ];
    return wicketComments[Math.floor(Math.random() * wicketComments.length)];
  }
  
  if (extraType === 'wide') {
    return 'Wide ball, extra run given';
  }
  
  if (extraType === 'noball') {
    return 'No ball! Free hit coming up';
  }

  if (runs === 4) {
    return `FOUR! ${shotDescriptions[shotLocation] || 'excellent shot'} to the boundary`;
  }
  
  if (runs === 6) {
    return `SIX! Massive hit ${shotDescriptions[shotLocation] ? 'with a ' + shotDescriptions[shotLocation] : ''}`;
  }

  if (runs === 0) {
    return 'Dot ball, good bowling';
  }

  return `${runs} run${runs > 1 ? 's' : ''} taken`;
}

export const endInnings = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Match not found' 
      });
    }

    if (match.currentInnings >= 2) {
      // Match completed
      match.status = 'completed';
      
      // Determine winner
      const innings1 = match.innings[0];
      const innings2 = match.innings[1];
      
      if (innings1.totalRuns > innings2.totalRuns) {
        match.winner = match.innings[0].team;
        match.winMargin = { runs: innings1.totalRuns - innings2.totalRuns };
      } else if (innings2.totalRuns > innings1.totalRuns) {
        match.winner = match.innings[1].team;
        match.winMargin = { 
          wickets: 10 - innings2.wickets 
        };
      } else {
        // Tie - handle super over or tie
        match.winMargin = { tied: true };
      }

      // Update team stats
      await updateTeamStats(match);
    } else {
      // Move to next innings
      match.currentInnings += 1;
    }

    await match.save();
    await match.populate('team1 team2 winner');

    // Emit real-time update
    req.io.emit('innings-ended', { matchId: req.params.id, match });

    res.json({
      status: 'success',
      match
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

async function updateTeamStats(match) {
  const team1 = await Team.findById(match.team1);
  const team2 = await Team.findById(match.team2);

  team1.matchesPlayed += 1;
  team2.matchesPlayed += 1;

  if (match.winner) {
    if (match.winner.toString() === team1._id.toString()) {
      team1.matchesWon += 1;
      team1.points += 2;
      team2.matchesLost += 1;
    } else {
      team2.matchesWon += 1;
      team2.points += 2;
      team1.matchesLost += 1;
    }
  } else {
    team1.matchesTied += 1;
    team2.matchesTied += 1;
    team1.points += 1;
    team2.points += 1;
  }

  // Update NRR (simplified calculation)
  // This would need more complex logic for actual NRR calculation
  const innings1 = match.innings[0];
  const innings2 = match.innings[1];

  team1.runsScored += innings1.totalRuns;
  team1.oversFaced += innings1.overs;
  team1.runsConceded += innings2.totalRuns;
  team1.oversBowled += innings2.overs;

  team2.runsScored += innings2.totalRuns;
  team2.oversFaced += innings2.overs;
  team2.runsConceded += innings1.totalRuns;
  team2.oversBowled += innings1.overs;

  team1.netRunRate = calculateNRR(team1);
  team2.netRunRate = calculateNRR(team2);

  await team1.save();
  await team2.save();
}

function calculateNRR(team) {
  if (team.oversFaced === 0 || team.oversBowled === 0) return 0;
  
  const runRateFor = team.runsScored / team.oversFaced;
  const runRateAgainst = team.runsConceded / team.oversBowled;
  
  return runRateFor - runRateAgainst;
}