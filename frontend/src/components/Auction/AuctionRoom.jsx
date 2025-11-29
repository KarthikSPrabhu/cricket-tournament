// frontend/src/components/Auction/AuctionRoom.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const AuctionRoom = () => {
  const { socket, currentPlayer, bids, timer, placeBid } = useAuction();
  const { user } = useAuth();
  const [bidAmount, setBidAmount] = useState(0);
  const [players, setPlayers] = useState([]);
  const [auctionStatus, setAuctionStatus] = useState('waiting');
  const timerRef = useRef(null);

  useEffect(() => {
    fetchAuctionPlayers();
    setupSocketListeners();
  }, [socket]);

  const fetchAuctionPlayers = async () => {
    try {
      const response = await axios.get('/api/players?isSold=false');
      setPlayers(response.data.players);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const setupSocketListeners = () => {
    if (!socket) return;

    socket.on('auction-started', (auction) => {
      setAuctionStatus('active');
      setBidAmount(auction.currentBid || auction.basePrice);
    });

    socket.on('player-sold', (data) => {
      setAuctionStatus('waiting');
      setPlayers(prev => prev.filter(p => p._id !== data.playerId));
    });
  };

  const handlePlaceBid = () => {
    if (user?.role !== 'team_captain') {
      alert('Only team captains can place bids');
      return;
    }

    placeBid(user.team, bidAmount);
  };

  const calculateNextBid = (currentBid) => {
    return currentBid < 1000 ? currentBid + 100 : currentBid + 150;
  };

  return (
    <div className="auction-room grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Current Player Section */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Auction Room</h2>
          
          {currentPlayer ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <img 
                  src={currentPlayer.profilePicture} 
                  alt={currentPlayer.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500"
                />
              </div>
              <h3 className="text-3xl font-bold mb-2">{currentPlayer.name}</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-600">Type</p>
                  <p className="font-semibold capitalize">{currentPlayer.playerType}</p>
                </div>
                <div>
                  <p className="text-gray-600">Style</p>
                  <p className="font-semibold">{currentPlayer.playerStyle}</p>
                </div>
                <div>
                  <p className="text-gray-600">Base Price</p>
                  <p className="font-semibold">{currentPlayer.basePoints}</p>
                </div>
                <div>
                  <p className="text-gray-600">Current Bid</p>
                  <p className="font-semibold text-green-600">
                    {currentPlayer.currentBid || 'No bids yet'}
                  </p>
                </div>
              </div>
              
              {/* Timer */}
              <div className="mb-6">
                <div className={`text-4xl font-bold ${
                  timer <= 10 ? 'text-red-600' : 'text-gray-800'
                }`}>
                  {timer}s
                </div>
              </div>

              {/* Bid Controls */}
              {user?.role === 'team_captain' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => setBidAmount(calculateNextBid(currentPlayer.currentBid || currentPlayer.basePoints))}
                      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                      Quick Bid (+{calculateNextBid(currentPlayer.currentBid || currentPlayer.basePoints) - (currentPlayer.currentBid || currentPlayer.basePoints)})
                    </button>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      min={calculateNextBid(currentPlayer.currentBid || currentPlayer.basePoints)}
                      className="border rounded px-3 py-2 w-32 text-center"
                    />
                  </div>
                  <button
                    onClick={handlePlaceBid}
                    disabled={auctionStatus !== 'active'}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400"
                  >
                    PLACE BID - {bidAmount} POINTS
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">Waiting for next player...</p>
            </div>
          )}
        </div>
      </div>

      {/* Live Feed Section */}
      <div className="space-y-6">
        {/* Teams Purse */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Teams Purse</h3>
          <div className="space-y-2">
            {/* Team purse data will be populated here */}
          </div>
        </div>

        {/* Live Bids Feed */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Live Bids</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {bids.map((bid, index) => (
              <div key={index} className="border-l-4 border-green-500 pl-3 py-1">
                <div className="flex justify-between">
                  <span className="font-semibold">{bid.teamName}</span>
                  <span className="text-green-600 font-bold">{bid.amount}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(bid.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Players */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Available Players</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {players.slice(0, 5).map(player => (
              <div key={player._id} className="flex items-center space-x-3 p-2 border rounded">
                <img 
                  src={player.profilePicture} 
                  alt={player.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{player.name}</p>
                  <p className="text-xs text-gray-500">{player.playerType}</p>
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {player.basePoints}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionRoom;