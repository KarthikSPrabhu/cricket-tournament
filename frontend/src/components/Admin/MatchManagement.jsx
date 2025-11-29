// src/components/Admin/MatchManagement.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const MatchManagement = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMatches();
    fetchTeams();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await axios.get('/api/matches');
      setMatches(response.data.matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

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

      await axios.post('/api/matches', {
        ...data,
        overs: parseInt(data.overs),
        date: new Date(data.date).toISOString()
      });

      setMessage('Match created successfully!');
      reset();
      fetchMatches();
    } catch (error) {
      setMessage('Error creating match: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'live': 'bg-green-100 text-green-800',
      'completed': 'bg-gray-100 text-gray-800',
      'abandoned': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Match Management</h2>

      {/* Create Match Form */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Schedule New Match</h3>
        
        {message && (
          <div className={`p-4 rounded mb-4 ${
            message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Team 1 *</label>
            <select
              {...register('team1', { required: 'Team 1 is required' })}
              className="form-input"
            >
              <option value="">Select Team 1</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>{team.name}</option>
              ))}
            </select>
            {errors.team1 && <p className="form-error">{errors.team1.message}</p>}
          </div>

          <div>
            <label className="form-label">Team 2 *</label>
            <select
              {...register('team2', { required: 'Team 2 is required' })}
              className="form-input"
            >
              <option value="">Select Team 2</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>{team.name}</option>
              ))}
            </select>
            {errors.team2 && <p className="form-error">{errors.team2.message}</p>}
          </div>

          <div>
            <label className="form-label">Venue *</label>
            <input
              {...register('venue', { required: 'Venue is required' })}
              type="text"
              className="form-input"
              placeholder="e.g., Wankhede Stadium"
            />
            {errors.venue && <p className="form-error">{errors.venue.message}</p>}
          </div>

          <div>
            <label className="form-label">Date & Time *</label>
            <input
              {...register('date', { required: 'Date is required' })}
              type="datetime-local"
              className="form-input"
            />
            {errors.date && <p className="form-error">{errors.date.message}</p>}
          </div>

          <div>
            <label className="form-label">Overs *</label>
            <select
              {...register('overs', { required: 'Overs is required' })}
              className="form-input"
              defaultValue="20"
            >
              <option value="20">20 Overs (T20)</option>
              <option value="50">50 Overs (ODI)</option>
            </select>
            {errors.overs && <p className="form-error">{errors.overs.message}</p>}
          </div>

          <div>
            <label className="form-label">Match Type *</label>
            <select
              {...register('matchType', { required: 'Match type is required' })}
              className="form-input"
              defaultValue="league"
            >
              <option value="league">League</option>
              <option value="qualifier">Qualifier</option>
              <option value="eliminator">Eliminator</option>
              <option value="final">Final</option>
            </select>
            {errors.matchType && <p className="form-error">{errors.matchType.message}</p>}
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Creating Match...' : 'Create Match'}
            </button>
          </div>
        </form>
      </div>

      {/* Matches List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">All Matches ({matches.length})</h3>
        <div className="space-y-4">
          {matches.map(match => (
            <div key={match._id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold">
                    {match.team1?.name} vs {match.team2?.name}
                  </h4>
                  <p className="text-gray-600">
                    {new Date(match.date).toLocaleDateString()} • {match.venue} • {match.overs} overs
                  </p>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(match.status)}`}>
                    {match.status.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                    {match.matchType.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  {match.toss?.winner && (
                    <p className="text-sm text-gray-600">
                      Toss: {match.toss.winner.name} chose to {match.toss.decision}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button className="btn-secondary text-xs">Edit</button>
                  {match.status === 'scheduled' && (
                    <button className="btn-primary text-xs">Start Match</button>
                  )}
                  {match.status === 'live' && (
                    <button className="btn-primary text-xs">Manage</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchManagement;