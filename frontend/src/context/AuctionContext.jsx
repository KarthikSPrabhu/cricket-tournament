// src/context/AuctionContext.jsx
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
  const [currentAuction, setCurrentAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [timer, setTimer] = useState(30);
  const [isAuctionActive, setIsAuctionActive] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('auction-started', (auction) => {
      setCurrentAuction(auction);
      setIsAuctionActive(true);
      setBids([]);
    });

    newSocket.on('new-bid', (bidData) => {
      setBids(prev => [bidData, ...prev]);
      if (currentAuction) {
        setCurrentAuction(prev => ({
          ...prev,
          currentBid: bidData.amount,
          currentBidder: bidData.team,
          currentBidderName: bidData.teamName
        }));
      }
    });

    newSocket.on('player-sold', (data) => {
      setIsAuctionActive(false);
      setCurrentAuction(null);
    });

    newSocket.on('player-unsold', (data) => {
      setIsAuctionActive(false);
      setCurrentAuction(null);
    });

    return () => newSocket.close();
  }, []);

  const placeBid = (teamId, amount) => {
    if (socket && currentAuction) {
      socket.emit('place-bid', {
        team: teamId,
        amount,
        auctionId: currentAuction._id
      });
    }
  };

  const value = {
    socket,
    currentAuction,
    bids,
    timer,
    isAuctionActive,
    placeBid,
    setTimer
  };

  return (
    <AuctionContext.Provider value={value}>
      {children}
    </AuctionContext.Provider>
  );
};