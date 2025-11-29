// controllers/playerController.js
import Player from '../models/Player.js';
import cloudinary from '../config/cloudinary.js';
import multer from 'multer';

// Configure multer for file uploads
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

export const createPlayer = async (req, res) => {
  try {
    upload.single('profilePicture')(req, res, async function(err) {
      if (err) {
        return res.status(400).json({ 
          status: 'error',
          message: 'File upload error' 
        });
      }

      const playerData = { ...req.body };
      
      // Upload image to Cloudinary if provided
      if (req.file) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'cricket-tournament/players'
          });
          playerData.profilePicture = result.secure_url;
        } catch (uploadError) {
          return res.status(400).json({ 
            status: 'error',
            message: 'Image upload failed' 
          });
        }
      }

      // Convert basePoints to number
      if (playerData.basePoints) {
        playerData.basePoints = parseInt(playerData.basePoints);
      }

      const player = await Player.create(playerData);
      
      res.status(201).json({
        status: 'success',
        player
      });
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

export const getPlayers = async (req, res) => {
  try {
    const { isSold, playerType, team, search, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    
    if (isSold) filter.isSold = isSold === 'true';
    if (playerType) filter.playerType = playerType;
    if (team) filter.team = team;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nativePlace: { $regex: search, $options: 'i' } }
      ];
    }

    const players = await Player.find(filter)
      .populate('team')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Player.countDocuments(filter);
    
    res.json({
      status: 'success',
      results: players.length,
      total,
      players
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

export const getPlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id).populate('team');
    
    if (!player) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Player not found' 
      });
    }
    
    res.json({
      status: 'success',
      player
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

export const updatePlayer = async (req, res) => {
  try {
    const player = await Player.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('team');
    
    if (!player) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Player not found' 
      });
    }
    
    res.json({
      status: 'success',
      player
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

export const deletePlayer = async (req, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    
    if (!player) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Player not found' 
      });
    }
    
    res.json({
      status: 'success',
      message: 'Player deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

export const addToPlayerList = async (req, res) => {
  try {
    const { listName } = req.body;
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Player not found' 
      });
    }
    
    if (!player.playerLists.includes(listName)) {
      player.playerLists.push(listName);
      await player.save();
    }
    
    res.json({
      status: 'success',
      player
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};