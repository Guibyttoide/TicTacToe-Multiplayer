import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, set, push } from "firebase/database";
import { database } from "../firebase";

const Lobby = () => {
  const [playerName, setPlayerName] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      alert("Please enter your name before creating a room");
      return;
    }

    setIsCreatingRoom(true);

    try {
      // Create a new room with a unique ID
      const roomsRef = ref(database, "rooms");
      const newRoomRef = push(roomsRef);
      const roomId = newRoomRef.key;

      // Initialize the room data with proper board structure
      const initialRoomData = {
        createdAt: Date.now(),
        status: "waiting",
        players: {
          X: {
            id: Date.now().toString(),
            name: playerName,
            online: true,
            lastSeen: Date.now(),
          },
        },
        game: {
          board: Array(9).fill(null), // Explicitly create array with 9 null values
          currentTurn: "X",
          winner: null,
          winningLine: null,
          scores: {
            X: 0,
            O: 0,
          },
        },
      };

      console.log("Creating room with data:", initialRoomData);
      await set(newRoomRef, initialRoomData);

      // Store player info in session storage
      sessionStorage.setItem(
        "playerInfo",
        JSON.stringify({
          name: playerName,
          id: Date.now().toString(),
          symbol: "X",
          roomId,
        }),
      );

      // Navigate to the room
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room. Please try again.");
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      alert("Please enter your name before joining a room");
      return;
    }

    // Store player name in session storage before navigating to join page
    sessionStorage.setItem("tempPlayerName", playerName);
    navigate("/join");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Tic-Tac-Toe Online</h1>

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

        <div className="space-y-4">
          <button
            onClick={handleCreateRoom}
            disabled={isCreatingRoom}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isCreatingRoom ? "Creating Room..." : "Create Room"}
          </button>

          <button
            onClick={handleJoinRoom}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Join Room
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Back to Home
          </button>
        </div>
      </div>

      <div className="mt-8 text-gray-600 text-center">
        <p>Create a room to play with a friend or join an existing room.</p>
        <p>Share the room link with your friend to start playing!</p>
      </div>
    </div>
  );
};

export default Lobby;
