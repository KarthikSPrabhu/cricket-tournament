// src/pages/Matches.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMatches();
  }, [filter]);

  const fetchMatches = async () => {
    try {
      let url = '/api/matches';
      if (filter !== 'all') {
        url += `?status=${filter}`;
      }

      const response = await axios.get(url);
      setMatches(response.data.matches);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching matches:', error);
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

  const getMatchTypeColor = (type) => {
    const colors = {
      'league': 'bg-indigo-100 text-indigo-800',
      'qualifier': 'bg-purple-100 text-purple-800',
      'eliminator': 'bg-orange-100 text-orange-800',
      'final': 'bg-yellow-100 text-yellow-800'
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
        <h1 className="text-3xl font-bold text-gray-900">Matches</h1>
        <p className="text-gray-600 mt-2">Follow all tournament matches</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <div className="flex space-x-4 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Matches
          </button>
          <button
            onClick={() => setFilter('scheduled')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'scheduled'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('live')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'live'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Live
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'completed'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-6">
        {matches.map(match => (
          <div key={match._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Match Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(match.status)}`}>
                    {match.status.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getMatchTypeColor(match.matchType)}`}>
                    {match.matchType.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-600">
                    {new Date(match.date).toLocaleDateString()} • {match.venue}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {match.matchNumber}
                </div>
              </div>
            </div>

            {/* Match Content */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                {/* Team 1 */}
                <div className="flex-1 text-center">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    {match.team1.logo && (
                      <img 
                        src={match.team1.logo} 
                        alt={match.team1.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">{match.team1.name}</h3>
                      <p className="text-sm text-gray-600">{match.team1.shortName}</p>
                    </div>
                  </div>
                  
                  {/* Innings score if available */}
                  {match.innings?.[0] && (
                    <div className="text-xl font-bold">
                      {match.innings[0].totalRuns}/{match.innings[0].wickets} 
                      <span className="text-sm text-gray-600 ml-2">
                        ({match.innings[0].overs} overs)
                      </span>
                    </div>
                  )}
                </div>

                {/* VS */}
                <div className="mx-8">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-700">VS</span>
                  </div>
                  {match.status === 'live' && (
                    <div className="mt-2 text-center">
                      <span className="inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                      <span className="ml-2 text-sm font-semibold text-red-600">LIVE</span>
                    </div>
                  )}
                </div>

                {/* Team 2 */}
                <div className="flex-1 text-center">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    {match.team2.logo && (
                      <img 
                        src={match.team2.logo} 
                        alt={match.team2.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">{match.team2.name}</h3>
                      <p className="text-sm text-gray-600">{match.team2.shortName}</p>
                    </div>
                  </div>
                  
                  {/* Innings score if available */}
                  {match.innings?.[1] && (
                    <div className="text-xl font-bold">
                      {match.innings[1].totalRuns}/{match.innings[1].wickets} 
                      <span className="text-sm text-gray-600 ml-2">
                        ({match.innings[1].overs} overs)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Match Result */}
              {match.status === 'completed' && match.winner && (
                <div className="mt-6 text-center">
                  <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                    <p className="text-lg font-semibold text-green-800">
                      {match.winner.name} won the match
                      {match.winMargin?.runs && ` by ${match.winMargin.runs} runs`}
                      {match.winMargin?.wickets && ` by ${match.winMargin.wickets} wickets`}
                    </p>
                    {match.manOfTheMatch && (
                      <p className="text-sm text-green-600 mt-1">
                        Man of the Match: {match.manOfTheMatch.name}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Toss Information */}
              {match.toss?.winner && (
                <div className="mt-4 text-center text-sm text-gray-600">
                  Toss: {match.toss.winner.name} chose to {match.toss.decision}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex justify-center space-x-4">
                {match.status === 'live' && (
                  <Link
                    to={`/matches/${match._id}`}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Watch Live
                  </Link>
                )}
                <Link
                  to={`/matches/${match._id}`}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {matches.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No matches found</p>
        </div>
      )}
    </div>
  );
};

export default Matches;