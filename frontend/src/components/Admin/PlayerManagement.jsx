// frontend/src/components/Admin/PlayerManagement.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const PlayerManagement = () => {
  const { register, handleSubmit, reset } = useForm();
  const [players, setPlayers] = useState([]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'profilePicture' && data[key][0]) {
          formData.append('profilePicture', data[key][0]);
        } else {
          formData.append(key, data[key]);
        }
      });

      const response = await axios.post('/api/players', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setPlayers(prev => [...prev, response.data.player]);
      reset();
    } catch (error) {
      console.error('Error creating player:', error);
    }
  };

  return (
    <div className="player-management">
      <h2>Player Management</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="player-form">
        <input {...register('name')} placeholder="Name" required />
        <input {...register('email')} type="email" placeholder="Email" required />
        <input {...register('phone')} placeholder="Phone" required />
        <input {...register('nativePlace')} placeholder="Native Place" required />
        
        <select {...register('playerType')} required>
          <option value="">Select Player Type</option>
          <option value="batsman">Batsman</option>
          <option value="bowler">Bowler</option>
          <option value="all-rounder">All Rounder</option>
          <option value="wicket-keeper">Wicket Keeper</option>
        </select>
        
        <input {...register('playerStyle')} placeholder="Player Style" required />
        <input {...register('basePoints')} type="number" placeholder="Base Points" required />
        
        <input {...register('profilePicture')} type="file" accept="image/*" />
        
        <button type="submit">Add Player</button>
      </form>

      <div className="players-list">
        <h3>Players</h3>
        {players.map(player => (
          <div key={player._id} className="player-item">
            <img src={player.profilePicture} alt={player.name} />
            <div>
              <h4>{player.name}</h4>
              <p>{player.playerType} - {player.playerStyle}</p>
              <p>Base Points: {player.basePoints}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerManagement;
