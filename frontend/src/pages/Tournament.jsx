// src/pages/Tournament.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Tournament = () => {
  const [pointTable, setPointTable] = useState([]);
  const [leaderboard, setLeaderboard] = useState({ batsmen: [], bowlers: [] });
  const [activeTab, setActiveTab] = useState('points');

  useEffect(() => {
    fetchTournamentData();
  }, []);

  const fetchTournamentData = async () => {
    try {
      // For now, we'll use mock data since the backend endpoints might not be fully implemented
      const teamsResponse = await axios.get('/api/teams');
      const teams = teamsResponse.data.teams;
      
      // Create point table from teams data
      const pointTableData = teams.map(team => ({
        ...team,
        netRunRate: team.netRunRate || 0,
        matchesPlayed: team.matchesPlayed || 0,
        matchesWon: team.matchesWon || 0,
        matchesLost: team.matchesLost || 0,
        matchesTied: team.matchesTied || 0
      })).sort((a, b) => {
        // Sort by points, then by net run rate
        if (b.points !== a.points) return b.points - a.points;
        return b.netRunRate - a.netRunRate;
      });

      setPointTable(pointTableData);

      // Mock leaderboard data
      setLeaderboard({
        batsmen: [
          { name: 'Virat Kohli', team: 'RCB', runs: 450, average: 75.0, strikeRate: 145.2 },
          { name: 'Rohit Sharma', team: 'MI', runs: 420, average: 60.0, strikeRate: 138.5 },
          { name: 'KL Rahul', team: 'LSG', runs: 380, average: 63.3, strikeRate: 142.1 }
        ],
        bowlers: [
          { name: 'Jasprit Bumrah', team: 'MI', wickets: 18, economy: 7.2, average: 18.5 },
          { name: 'Yuzvendra Chahal', team: 'RR', wickets: 16, economy: 8.1, average: 22.3 },
          { name: 'Rashid Khan', team: 'GT', wickets: 15, economy: 6.8, average: 19.7 }
        ]
      });
    } catch (error) {
      console.error('Error fetching tournament data:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tournament</h1>
        <p className="text-gray-600 mt-2">Track tournament progress and statistics</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('points')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'points'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Point Table
          </button>
          <button
            onClick={() => setActiveTab('batsmen')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'batsmen'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Top Batsmen
          </button>
          <button
            onClick={() => setActiveTab('bowlers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bowlers'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Top Bowlers
          </button>
        </nav>
      </div>

      {/* Point Table */}
      {activeTab === 'points' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Tournament Point Table</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    W
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    T
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NRR
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pointTable.map((team, index) => (
                  <tr key={team._id} className={index < 4 ? 'bg-green-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {team.logo && (
                          <img 
                            src={team.logo} 
                            alt={team.name}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{team.name}</div>
                          <div className="text-sm text-gray-500">{team.shortName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {team.matchesPlayed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {team.matchesWon}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {team.matchesLost}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {team.matchesTied}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {team.points}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {team.netRunRate.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Batsmen */}
      {activeTab === 'batsmen' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Leading Run Scorers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batsman
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Runs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Strike Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.batsmen.map((batsman, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{batsman.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {batsman.team}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {batsman.runs}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {batsman.average}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {batsman.strikeRate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Bowlers */}
      {activeTab === 'bowlers' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Leading Wicket Takers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bowler
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wickets
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Economy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.bowlers.map((bowler, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{bowler.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bowler.team}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {bowler.wickets}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bowler.economy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bowler.average}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tournament;