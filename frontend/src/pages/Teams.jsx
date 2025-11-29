// src/pages/Teams.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data.teams);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setLoading(false);
    }
  };

  const fetchTeamDetails = async (teamId) => {
    try {
      const response = await axios.get(`/api/teams/${teamId}/squad`);
      setSelectedTeam(response.data.team);
    } catch (error) {
      console.error('Error fetching team details:', error);
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
        <p className="text-gray-600 mt-2">Explore all teams participating in the tournament</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Teams List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map(team => (
              <div 
                key={team._id} 
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => fetchTeamDetails(team._id)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {team.logo && (
                        <img 
                          src={team.logo} 
                          alt={team.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
                        <p className="text-gray-600">{team.shortName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Players</p>
                      <p className="font-semibold">{team.players?.length || 0}/15</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Purse Remaining</p>
                      <p className="font-semibold text-green-600">{team.purse} pts</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Points</p>
                      <p className="font-semibold">{team.points}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Win Rate</p>
                      <p className="font-semibold">
                        {team.matchesPlayed > 0 
                          ? `${((team.matchesWon / team.matchesPlayed) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </p>
                    </div>
                  </div>

                  {team.captain && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">Captain</p>
                      <p className="font-semibold">{team.captain.name}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Details Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
            <h3 className="text-xl font-bold mb-4">Team Details</h3>
            
            {selectedTeam ? (
              <div>
                <div className="text-center mb-6">
                  {selectedTeam.logo && (
                    <img 
                      src={selectedTeam.logo} 
                      alt={selectedTeam.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                  )}
                  <h4 className="text-2xl font-bold">{selectedTeam.name}</h4>
                  <p className="text-gray-600">{selectedTeam.shortName}</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-500">Total Players</p>
                      <p className="font-semibold text-lg">{selectedTeam.players?.length || 0}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-500">Remaining Purse</p>
                      <p className="font-semibold text-lg text-green-600">{selectedTeam.purse}</p>
                    </div>
                  </div>

                  {/* Squad by Type */}
                  {selectedTeam.squadByType && (
                    <div className="space-y-3">
                      <h5 className="font-semibold">Squad Composition</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Batsmen</span>
                          <span className="font-semibold">{selectedTeam.squadByType.batsmen?.length || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Bowlers</span>
                          <span className="font-semibold">{selectedTeam.squadByType.bowlers?.length || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>All-rounders</span>
                          <span className="font-semibold">{selectedTeam.squadByType.allRounders?.length || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Wicket Keepers</span>
                          <span className="font-semibold">{selectedTeam.squadByType.wicketKeepers?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Performance */}
                  <div>
                    <h5 className="font-semibold mb-2">Performance</h5>
                    <div className="grid grid-cols-3 gap-2 text-xs text-center">
                      <div className="bg-green-100 text-green-800 p-2 rounded">
                        <div className="font-bold">{selectedTeam.matchesWon}</div>
                        <div>Won</div>
                      </div>
                      <div className="bg-red-100 text-red-800 p-2 rounded">
                        <div className="font-bold">{selectedTeam.matchesLost}</div>
                        <div>Lost</div>
                      </div>
                      <div className="bg-gray-100 text-gray-800 p-2 rounded">
                        <div className="font-bold">{selectedTeam.matchesTied || 0}</div>
                        <div>Tied</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Select a team to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teams;