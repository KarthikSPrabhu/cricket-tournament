// src/pages/Auction.jsx
import React, { useState, useEffect } from 'react';
import { useAuction } from '../context/AuctionContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Auction = () => {
  const { currentAuction, bids, placeBid, isAuctionActive } = useAuction();
  const { user } = useAuth();
  const [bidAmount, setBidAmount] = useState(0);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [soldPlayers, setSoldPlayers] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchAvailablePlayers();
    fetchSoldPlayers();
    fetchTeams();
  }, []);

  const fetchAvailablePlayers = async () => {
    try {
      const response = await axios.get('/api/players?isSold=false');
      setAvailablePlayers(response.data.players);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchSoldPlayers = async () => {
    try {
      const response = await axios.get('/api/auction/history');
      setSoldPlayers(response.data.auctions.filter(a => a.status === 'sold'));
    } catch (error) {
      console.error('Error fetching sold players:', error);
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

  const calculateNextBid = () => {
    if (!currentAuction) return 0;
    const current = currentAuction.currentBid || currentAuction.basePrice;
    return current < 1000 ? current + 100 : current + 150;
  };

  const handlePlaceBid = () => {
    if (!user || user.role !== 'team_captain') {
      alert('Only team captains can place bids');
      return;
    }

    if (!user.team) {
      alert('You are not assigned to a team');
      return;
    }

    placeBid(user.team, bidAmount);
    setBidAmount(calculateNextBid());
  };

  const quickBid = () => {
    setBidAmount(calculateNextBid());
  };

  if (!currentAuction && !isAuctionActive) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Auction Room</h1>
          <p className="text-xl text-gray-600">Waiting for auction to start...</p>
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4">Available Players</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availablePlayers.map(player => (
                  <div key={player._id} className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
                    <img 
                      src={player.profilePicture} 
                      alt={player.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{player.name}</h3>
                      <p className="text-sm text-gray-600">{player.playerType} - {player.playerStyle}</p>
                      <p className="text-sm font-medium">Base: {player.basePoints}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Recently Sold</h2>
              <div className="space-y-3">
                {soldPlayers.slice(0, 5).map(auction => (
                  <div key={auction._id} className="bg-white rounded-lg shadow p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{auction.player.name}</span>
                      <span className="text-green-600 font-bold">{auction.soldPrice}</span>
                    </div>
                    <div className="text-sm text-gray-600">to {auction.currentBidderName}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Player Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Live Auction</h1>
            
            {currentAuction && (
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <img 
                    src={currentAuction.player.profilePicture} 
                    alt={currentAuction.player.name}
                    className="w-40 h-40 rounded-full object-cover border-4 border-indigo-500 shadow-lg"
                  />
                </div>
                
                <h2 className="text-4xl font-bold mb-2 text-gray-800">
                  {currentAuction.player.name}
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-semibold text-lg capitalize">{currentAuction.player.playerType}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Style</p>
                    <p className="font-semibold text-lg">{currentAuction.player.playerStyle}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Base Price</p>
                    <p className="font-semibold text-lg">{currentAuction.basePrice}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Current Bid</p>
                    <p className="font-semibold text-lg text-green-600">
                      {currentAuction.currentBid || 'No bids'}
                    </p>
                  </div>
                </div>

                {currentAuction.currentBidderName && (
                  <div className="mb-6">
                    <p className="text-lg">
                      Current Highest Bidder: <span className="font-bold text-indigo-600">
                        {currentAuction.currentBidderName}
                      </span>
                    </p>
                  </div>
                )}

                {/* Bid Controls */}
                {user?.role === 'team_captain' && (
                  <div className="space-y-4 bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        onClick={quickBid}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                      >
                        Quick Bid (+{calculateNextBid() - (currentAuction.currentBid || currentAuction.basePrice)})
                      </button>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-medium">Bid Amount:</span>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(Number(e.target.value))}
                          min={calculateNextBid()}
                          className="border border-gray-300 rounded px-3 py-2 w-32 text-center text-lg font-semibold"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handlePlaceBid}
                      disabled={!isAuctionActive}
                      className={`w-full py-4 rounded-lg font-bold text-lg ${
                        isAuctionActive 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      } transition-colors`}
                    >
                      {isAuctionActive ? `PLACE BID - ${bidAmount} POINTS` : 'BIDDING CLOSED'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Teams Purse */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Teams Purse</h3>
            <div className="space-y-3">
              {teams.map(team => (
                <div key={team._id} className="flex justify-between items-center">
                  <span className="font-medium">{team.name}</span>
                  <span className={`font-bold ${
                    team.purse > 5000 ? 'text-green-600' : 
                    team.purse > 2000 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {team.purse}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Bids Feed */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Live Bids</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {bids.length === 0 ? (
                <p className="text-gray-500 text-center">No bids yet</p>
              ) : (
                bids.map((bid, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800">{bid.teamName}</span>
                      <span className="text-green-600 font-bold text-lg">{bid.amount}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(bid.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Available Players */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Next Players</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {availablePlayers.slice(0, 3).map(player => (
                <div key={player._id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <img 
                    src={player.profilePicture} 
                    alt={player.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{player.name}</p>
                    <p className="text-xs text-gray-500">{player.playerType}</p>
                  </div>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                    {player.basePoints}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auction;