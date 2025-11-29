// frontend/src/context/AuctionContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';

const AuctionContext = createContext();

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error('useAuction must be used within an AuctionProvider');
  }
  return context;
};

export const AuctionProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [bids, setBids] = useState([]);
  const [timer, setTimer] = useState(30);
  const [isAuctionActive, setIsAuctionActive] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('new-bid', (bidData) => {
      setBids(prev => [bidData, ...prev]);
    });

    return () => newSocket.close();
  }, []);

  const placeBid = (teamId, amount) => {
    if (socket) {
      socket.emit('place-bid', {
        team: teamId,
        amount,
        auctionId: 'current' // You'll need to manage auction IDs
      });
    }
  };

  const value = {
    socket,
    currentPlayer,
    bids,
    timer,
    isAuctionActive,
    placeBid,
    setCurrentPlayer,
    setBids,
    setTimer,
    setIsAuctionActive
  };

  return (
    <AuctionContext.Provider value={value}>
      {children}
    </AuctionContext.Provider>
  );
};
