// backend/controllers/playerController.js
import Player from '../models/Player.js';
import cloudinary from '../config/cloudinary.js';

export const createPlayer = async (req, res) => {
  try {
    const playerData = { ...req.body };
    
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      playerData.profilePicture = result.secure_url;
    }

    const player = await Player.create(playerData);
    
    res.status(201).json({
      status: 'success',
      player
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPlayers = async (req, res) => {
  try {
    const { isSold, playerType, team } = req.query;
    let filter = {};
    
    if (isSold) filter.isSold = isSold === 'true';
    if (playerType) filter.playerType = playerType;
    if (team) filter.team = team;

    const players = await Player.find(filter).populate('team');
    
    res.json({
      status: 'success',
      results: players.length,
      players
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};