// controllers/teamController.js
import Team from '../models/Team.js';
import Player from '../models/Player.js';

export const createTeam = async (req, res) => {
  try {
    const { name, shortName, primaryColor, secondaryColor } = req.body;
    
    const teamExists = await Team.findOne({ 
      $or: [{ name }, { shortName }] 
    });
    
    if (teamExists) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Team with this name or short name already exists' 
      });
    }

    const team = await Team.create({
      name,
      shortName,
      primaryColor,
      secondaryColor
    });
    
    res.status(201).json({
      status: 'success',
      team
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('players')
      .populate('captain')
      .sort({ points: -1, netRunRate: -1 });
    
    res.json({
      status: 'success',
      results: teams.length,
      teams
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

export const getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('players')
      .populate('captain');
    
    if (!team) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Team not found' 
      });
    }
    
    res.json({
      status: 'success',
      team
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('players')
      .populate('captain');
    
    if (!team) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Team not found' 
      });
    }
    
    res.json({
      status: 'success',
      team
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

export const setTeamCaptain = async (req, res) => {
  try {
    const { playerId } = req.body;
    
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Player not found' 
      });
    }
    
    if (player.team.toString() !== req.params.id) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Player does not belong to this team' 
      });
    }

    // Remove captain from any other player in the team
    await Player.updateMany(
      { team: req.params.id, isCaptain: true },
      { isCaptain: false }
    );

    // Set new captain
    player.isCaptain = true;
    await player.save();

    // Update team captain
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { captain: playerId },
      { new: true }
    ).populate('players').populate('captain');
    
    res.json({
      status: 'success',
      team
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

export const getTeamSquad = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate({
        path: 'players',
        select: 'name playerType playerStyle profilePicture isCaptain stats'
      });
    
    if (!team) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Team not found' 
      });
    }
    
    // Group players by type
    const squadByType = {
      batsmen: team.players.filter(p => p.playerType === 'batsman'),
      bowlers: team.players.filter(p => p.playerType === 'bowler'),
      allRounders: team.players.filter(p => p.playerType === 'all-rounder'),
      wicketKeepers: team.players.filter(p => p.playerType === 'wicket-keeper')
    };
    
    res.json({
      status: 'success',
      team: {
        ...team.toObject(),
        squadByType
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};