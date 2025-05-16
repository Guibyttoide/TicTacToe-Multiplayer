import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { database } from '../firebase';

const JoinRoom = () => {
  const navigate = useNavigate();
  const { roomId: urlRoomId } = useParams();
  const [roomId, setRoomId] = useState(urlRoomId || '');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState(null);

  // Get player name from session storage if available
  React.useEffect(() => {
    const tempPlayerName = sessionStorage.getItem('tempPlayerName');
    if (tempPlayerName) {
      setPlayerName(tempPlayerName);
    }
  }, []);

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }

    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setError(null);
    setIsJoining(true);

    try {
      // Check if room exists
      const roomRef = ref(database, `rooms/${roomId}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        setError('Room not found');
        setIsJoining(false);
        return;
      }

      const roomData = snapshot.val();

      // Check if room is full (both X and O players exist)
      if (roomData.players && roomData.players.X && roomData.players.O) {
        setError('This room is full');
        setIsJoining(false);
        return;
      }

      // Save player name to session storage
      sessionStorage.setItem('tempPlayerName', playerName);

      // Navigate to the room
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error('Error checking room:', error);
      setError('Failed to join room. Please try again.');
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Join Game Room
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
            maxLength={20}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
            Room ID
          </label>
          <input
            type="text"
            id="roomId"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter room ID"
          />
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleJoinRoom}
            disabled={isJoining}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isJoining ? 'Joining...' : 'Join Room'}
          </button>
          
          <button
            onClick={() => navigate('/online')}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;