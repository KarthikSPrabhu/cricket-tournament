// src/components/Admin/PlayerManagement.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const PlayerManagement = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('/api/players');
      setPlayers(response.data.players);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setMessage('');

      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'profilePicture' && data[key][0]) {
          formData.append('profilePicture', data[key][0]);
        } else if (data[key]) {
          formData.append(key, data[key]);
        }
      });

      await axios.post('/api/players', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage('Player created successfully!');
      reset();
      fetchPlayers();
    } catch (error) {
      setMessage('Error creating player: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Player Management</h2>

      {/* Create Player Form */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Add New Player</h3>
        
        {message && (
          <div className={`p-4 rounded mb-4 ${
            message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Name *</label>
            <input
              {...register('name', { required: 'Name is required' })}
              type="text"
              className="form-input"
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div>
            <label className="form-label">Email *</label>
            <input
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              className="form-input"
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div>
            <label className="form-label">Phone *</label>
            <input
              {...register('phone', { required: 'Phone is required' })}
              type="tel"
              className="form-input"
            />
            {errors.phone && <p className="form-error">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="form-label">Native Place *</label>
            <input
              {...register('nativePlace', { required: 'Native place is required' })}
              type="text"
              className="form-input"
            />
            {errors.nativePlace && <p className="form-error">{errors.nativePlace.message}</p>}
          </div>

          <div>
            <label className="form-label">Player Type *</label>
            <select
              {...register('playerType', { required: 'Player type is required' })}
              className="form-input"
            >
              <option value="">Select Type</option>
              <option value="batsman">Batsman</option>
              <option value="bowler">Bowler</option>
              <option value="all-rounder">All Rounder</option>
              <option value="wicket-keeper">Wicket Keeper</option>
            </select>
            {errors.playerType && <p className="form-error">{errors.playerType.message}</p>}
          </div>

          <div>
            <label className="form-label">Player Style *</label>
            <input
              {...register('playerStyle', { required: 'Player style is required' })}
              type="text"
              className="form-input"
              placeholder="e.g., Right-handed batsman, Fast bowler"
            />
            {errors.playerStyle && <p className="form-error">{errors.playerStyle.message}</p>}
          </div>

          <div>
            <label className="form-label">Base Points</label>
            <input
              {...register('basePoints')}
              type="number"
              className="form-input"
              defaultValue={100}
            />
          </div>

          <div>
            <label className="form-label">Profile Picture</label>
            <input
              {...register('profilePicture')}
              type="file"
              accept="image/*"
              className="form-input"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Creating Player...' : 'Create Player'}
            </button>
          </div>
        </form>
      </div>

      {/* Players List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">All Players ({players.length})</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {players.map(player => (
                <tr key={player._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {player.profilePicture && (
                        <img 
                          src={player.profilePicture} 
                          alt={player.name}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{player.name}</div>
                        <div className="text-sm text-gray-500">{player.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      player.playerType === 'batsman' ? 'bg-blue-100 text-blue-800' :
                      player.playerType === 'bowler' ? 'bg-red-100 text-red-800' :
                      player.playerType === 'all-rounder' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {player.playerType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {player.basePoints}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      player.isSold ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {player.isSold ? 'Sold' : 'Available'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {player.team?.name || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlayerManagement;