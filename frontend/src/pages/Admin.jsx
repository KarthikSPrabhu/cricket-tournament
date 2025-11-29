// src/pages/Admin.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PlayerManagement from '../components/Admin/PlayerManagement';
import TeamManagement from '../components/Admin/TeamManagement';
import MatchManagement from '../components/Admin/MatchManagement';

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('players');

  const tabs = [
    { id: 'players', name: 'Players', component: <PlayerManagement /> },
    { id: 'teams', name: 'Teams', component: <TeamManagement /> },
    { id: 'matches', name: 'Matches', component: <MatchManagement /> },
    { id: 'auction', name: 'Auction', component: <div>Auction Management Coming Soon</div> },
    { id: 'tournament', name: 'Tournament', component: <div>Tournament Settings Coming Soon</div> },
  ];

  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage tournament, players, teams, and matches</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default Admin;