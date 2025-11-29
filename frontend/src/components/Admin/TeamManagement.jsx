// src/components/Admin/TeamManagement.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const TeamManagement = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data.teams);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setMessage('');

      await axios.post('/api/teams', data);

      setMessage('Team created successfully!');
      reset();
      fetchTeams();
    } catch (error) {
      setMessage('Error creating team: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Team Management</h2>

      {/* Create Team Form */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Create New Team</h3>
        
        {message && (
          <div className={`p-4 rounded mb-4 ${
            message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Team Name *</label>
            <input
              {...register('name', { required: 'Team name is required' })}
              type="text"
              className="form-input"
              placeholder="e.g., Mumbai Indians"
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div>
            <label className="form-label">Short Name *</label>
            <input
              {...register('shortName', { 
                required: 'Short name is required',
                maxLength: {
                  value: 3,
                  message: 'Short name must be 3 characters or less'
                }
              })}
              type="text"
              className="form-input uppercase"
              placeholder="e.g., MI"
            />
            {errors.shortName && <p className="form-error">{errors.shortName.message}</p>}
          </div>

          <div>
            <label className="form-label">Primary Color</label>
            <input
              {...register('primaryColor')}
              type="color"
              className="form-input h-10"
              defaultValue="#000000"
            />
          </div>

          <div>
            <label className="form-label">Secondary Color</label>
            <input
              {...register('secondaryColor')}
              type="color"
              className="form-input h-10"
              defaultValue="#FFFFFF"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Creating Team...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>

      {/* Teams List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">All Teams ({teams.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <div key={team._id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold">{team.name}</h4>
                  <p className="text-gray-600">{team.shortName}</p>
                </div>
                {team.logo && (
                  <img 
                    src={team.logo} 
                    alt={team.name}
                    className="w-12 h-12 rounded-full"
                  />
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Players:</span>
                  <span className="font-semibold">{team.players?.length || 0}/15</span>
                </div>
                <div className="flex justify-between">
                  <span>Purse:</span>
                  <span className="font-semibold text-green-600">{team.purse} pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Points:</span>
                  <span className="font-semibold">{team.points}</span>
                </div>
                <div className="flex justify-between">
                  <span>Captain:</span>
                  <span className="font-semibold">{team.captain?.name || 'Not set'}</span>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="btn-secondary text-xs flex-1">Edit</button>
                <button className="btn-primary text-xs flex-1">Manage</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;