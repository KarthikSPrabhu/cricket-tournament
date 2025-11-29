// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalTeams: 0,
    upcomingMatches: 0,
    activeAuctions: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch basic stats
      const [playersRes, teamsRes, matchesRes, auctionRes] = await Promise.all([
        axios.get('/api/players'),
        axios.get('/api/teams'),
        axios.get('/api/matches?status=scheduled'),
        axios.get('/api/auction/current')
      ]);

      setStats({
        totalPlayers: playersRes.data.total || playersRes.data.players.length,
        totalTeams: teamsRes.data.results,
        upcomingMatches: matchesRes.data.results,
        activeAuctions: auctionRes.data.auction ? 1 : 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getQuickActions = () => {
    if (user?.role === 'admin') {
      return [
        { name: 'Add Player', href: '/admin?tab=players', icon: '👤', color: 'bg-indigo-500' },
        { name: 'Create Team', href: '/admin?tab=teams', icon: '🏏', color: 'bg-green-500' },
        { name: 'Schedule Match', href: '/admin?tab=matches', icon: '📅', color: 'bg-yellow-500' },
        { name: 'Start Auction', href: '/auction', icon: '💰', color: 'bg-red-500' }
      ];
    } else if (user?.role === 'team_captain') {
      return [
        { name: 'View My Team', href: '/teams', icon: '👥', color: 'bg-blue-500' },
        { name: 'Join Auction', href: '/auction', icon: '💰', color: 'bg-green-500' },
        { name: 'View Matches', href: '/matches', icon: '🏆', color: 'bg-purple-500' }
      ];
    } else {
      return [
        { name: 'View Players', href: '/players', icon: '👤', color: 'bg-indigo-500' },
        { name: 'View Teams', href: '/teams', icon: '👥', color: 'bg-green-500' },
        { name: 'View Matches', href: '/matches', icon: '🏆', color: 'bg-yellow-500' },
        { name: 'Watch Auction', href: '/auction', icon: '💰', color: 'bg-red-500' }
      ];
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {user?.role === 'admin' 
            ? 'Manage the tournament and monitor all activities'
            : user?.role === 'team_captain'
            ? 'Lead your team to victory in the tournament'
            : 'Enjoy watching the cricket tournament unfold'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <span className="text-2xl">👤</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-500">Total Players</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalPlayers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <span className="text-2xl">🏏</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-500">Total Teams</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTeams}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-500">Upcoming Matches</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.upcomingMatches}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-500">Active Auctions</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.activeAuctions}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {getQuickActions().map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                <div className={`p-3 rounded-full ${action.color} text-white mb-2`}>
                  <span className="text-xl">{action.icon}</span>
                </div>
                <span className="text-sm font-medium text-center">{action.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="border-l-4 border-indigo-500 pl-4 py-2">
              <p className="text-sm font-medium">Welcome to Cricket Tournament 2024</p>
              <p className="text-xs text-gray-500">Just now</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-sm font-medium">Tournament registration is open</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4 py-2">
              <p className="text-sm font-medium">Player auctions starting soon</p>
              <p className="text-xs text-gray-500">2 days ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Role Specific Content */}
      {user?.role === 'team_captain' && user?.team && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">My Team</h3>
          <div className="text-center py-8">
            <p className="text-gray-600">Team management features coming soon...</p>
            <Link 
              to="/teams" 
              className="inline-block mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              View Team Details
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;