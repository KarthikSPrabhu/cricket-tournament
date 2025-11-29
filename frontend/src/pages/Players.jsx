// src/pages/Players.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    playerType: '',
    isSold: '',
    search: ''
  });

  useEffect(() => {
    fetchPlayers();
  }, [filters]);

  const fetchPlayers = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.playerType) params.append('playerType', filters.playerType);
      if (filters.isSold) params.append('isSold', filters.isSold);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`/api/players?${params}`);
      setPlayers(response.data.players);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching players:', error);
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getPlayerTypeColor = (type) => {
    const colors = {
      'batsman': 'bg-blue-100 text-blue-800',
      'bowler': 'bg-red-100 text-red-800',
      'all-rounder': 'bg-green-100 text-green-800',
      'wicket-keeper': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Players</h1>
        <p className="text-gray-600 mt-2">Browse all players in the tournament</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search players..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player Type
            </label>
            <select
              value={filters.playerType}
              onChange={(e) => handleFilterChange('playerType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Types</option>
              <option value="batsman">Batsman</option>
              <option value="bowler">Bowler</option>
              <option value="all-rounder">All-rounder</option>
              <option value="wicket-keeper">Wicket Keeper</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.isSold}
              onChange={(e) => handleFilterChange('isSold', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Players</option>
              <option value="true">Sold</option>
              <option value="false">Available</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ playerType: '', isSold: '', search: '' })}
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {players.map(player => (
          <div key={player._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative">
              {player.profilePicture ? (
                <img 
                  src={player.profilePicture} 
                  alt={player.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-4xl">👤</span>
                </div>
              )}
              
              {player.isSold && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  SOLD
                </div>
              )}
              
              {player.isCaptain && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  CAPTAIN
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{player.name}</h3>
              
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPlayerTypeColor(player.playerType)}`}>
                  {player.playerType}
                </span>
                <span className="text-sm text-gray-600">{player.playerStyle}</span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Base Points:</span>
                  <span className="font-semibold">{player.basePoints}</span>
                </div>
                
                {player.isSold && (
                  <>
                    <div className="flex justify-between">
                      <span>Sold Price:</span>
                      <span className="font-semibold text-green-600">{player.soldPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Team:</span>
                      <span className="font-semibold">{player.team?.name || 'Unknown'}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between">
                  <span>Native Place:</span>
                  <span className="font-semibold">{player.nativePlace}</span>
                </div>
              </div>

              {/* Stats Preview */}
              {player.stats && (player.stats.matches > 0 || player.stats.runs > 0 || player.stats.wickets > 0) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    <div>
                      <div className="font-bold">{player.stats.matches}</div>
                      <div className="text-gray-500">Matches</div>
                    </div>
                    <div>
                      <div className="font-bold">{player.stats.runs}</div>
                      <div className="text-gray-500">Runs</div>
                    </div>
                    <div>
                      <div className="font-bold">{player.stats.wickets}</div>
                      <div className="text-gray-500">Wickets</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {players.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No players found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default Players;