// backend/controllers/matchController.js
export const updateBallByBall = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { over, ballNumber, bowler, batsman, runs, isWicket, wicketType, isExtra, extraType, shotLocation } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const currentInnings = match.innings[match.currentInnings - 1];
    
    // Create ball data
    const ballData = {
      over,
      ballNumber,
      bowler,
      batsman,
      runs: runs || 0,
      isWicket: isWicket || false,
      wicketType: wicketType || null,
      isExtra: isExtra || false,
      extraType: extraType || null,
      extraRuns: (isExtra && extraType === 'wide') ? 1 : 0,
      shotLocation,
      commentary: generateCommentary(runs, isWicket, extraType, shotLocation)
    };

    // Update innings totals
    currentInnings.totalRuns += ballData.runs + (ballData.extraRuns || 0);
    if (ballData.isWicket) {
      currentInnings.wickets += 1;
    }

    // Update batsman stats
    const batsmanIndex = currentInnings.batsmen.findIndex(b => b.player.toString() === batsman);
    if (batsmanIndex !== -1) {
      currentInnings.batsmen[batsmanIndex].runs += ballData.runs;
      currentInnings.batsmen[batsmanIndex].balls += 1;
      if (ballData.runs === 4) currentInnings.batsmen[batsmanIndex].fours += 1;
      if (ballData.runs === 6) currentInnings.batsmen[batsmanIndex].sixes += 1;
      if (ballData.isWicket) currentInnings.batsmen[batsmanIndex].isOut = true;
      currentInnings.batsmen[batsmanIndex].strikeRate = 
        (currentInnings.batsmen[batsmanIndex].runs / currentInnings.batsmen[batsmanIndex].balls) * 100;
    }

    // Update bowler stats
    const bowlerIndex = currentInnings.bowlers.findIndex(b => b.player.toString() === bowler);
    if (bowlerIndex !== -1) {
      currentInnings.bowlers[bowlerIndex].runs += ballData.runs + (ballData.extraRuns || 0);
      if (!ballData.isExtra) {
        const ballsBowled = currentInnings.bowlers[bowlerIndex].overs * 6 + (ballNumber || 0);
        currentInnings.bowlers[bowlerIndex].overs = Math.floor(ballsBowled / 6);
      }
      if (ballData.isWicket) currentInnings.bowlers[bowlerIndex].wickets += 1;
      currentInnings.bowlers[bowlerIndex].economy = 
        currentInnings.bowlers[bowlerIndex].runs / (currentInnings.bowlers[bowlerIndex].overs || 1);
    }

    currentInnings.balls.push(ballData);
    
    await match.save();

    // Emit real-time update
    req.io.emit('match-update', {
      matchId,
      ball: ballData,
      innings: currentInnings
    });

    res.json({
      status: 'success',
      ball: ballData,
      innings: currentInnings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function generateCommentary(runs, isWicket, extraType, shotLocation) {
  const shotDescriptions = {
    'cover': 'beautiful cover drive',
    'midwicket': 'powerful shot to midwicket',
    'square': 'cracked through square',
    'fine': 'delicate fine leg glance',
    'straight': 'straight down the ground'
  };

  if (isWicket) {
    return 'OUT! What a breakthrough!';
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

  return `${runs} run${runs > 1 ? 's' : ''} taken`;
}