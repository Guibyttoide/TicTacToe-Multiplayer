import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, get, update } from "firebase/database";
import { database } from "../firebase";

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkRoom = async () => {
      try {
        // Check if the room exists
        const roomRef = ref(database, `rooms/${roomId}`);
        const snapshot = await get(roomRef);

        if (!snapshot.exists()) {
          setError("Room not found");
          setLoading(false);
          return;
        }

        const roomData = snapshot.val();
        console.log("Room data on join:", roomData);

        // Get player info from session storage
        const playerInfoStr = sessionStorage.getItem("playerInfo");

        if (playerInfoStr) {
          // Player is returning to a room they were in
          const playerInfo = JSON.parse(playerInfoStr);

          // Verify this is the correct room
          if (playerInfo.roomId === roomId) {
            // Update player's online status
            await update(ref(database), {
              [`rooms/${roomId}/players/${playerInfo.symbol}/online`]: true,
              [`rooms/${roomId}/players/${playerInfo.symbol}/lastSeen`]: Date.now(),
            });

            // Navigate to the game
            navigate(`/game/${roomId}`);
            return;
          }
        }

        // Check if room is full (both X and O players exist)
        if (roomData.players && roomData.players.X && roomData.players.O) {
          setError("This room is full");
          setLoading(false);
          return;
        }

        // Get the temporary player name
        const tempPlayerName = sessionStorage.getItem("tempPlayerName");
        if (!tempPlayerName) {
          setError("Player name not found. Please go back to the lobby.");
          setLoading(false);
          return;
        }

        // Join as player O (since X is the creator)
        const newPlayerId = Date.now().toString();
        const playerSymbol = "O";

        // Update ONLY the player data, don't touch the game data
        await update(ref(database, `rooms/${roomId}/players/${playerSymbol}`), {
          id: newPlayerId,
          name: tempPlayerName,
          online: true,
          lastSeen: Date.now(),
        });

        // Ensure the board exists in the game state (without overwriting)
        if (!roomData.game || !roomData.game.board) {
          console.log("Board missing, initializing...");
          await update(ref(database, `rooms/${roomId}/game`), {
            board: Array(9).fill(null),
            currentTurn: "X",
            winner: null,
            winningLine: null,
            scores: roomData.game?.scores || { X: 0, O: 0 },
          });
        }

        // Store player info in session storage
        sessionStorage.setItem(
          "playerInfo",
          JSON.stringify({
            name: tempPlayerName,
            id: newPlayerId,
            symbol: playerSymbol,
            roomId,
          }),
        );

        // Clear the temporary name
        sessionStorage.removeItem("tempPlayerName");

        // Navigate to the game
        navigate(`/game/${roomId}`);
      } catch (error) {
        console.error("Error joining room:", error);
        setError("Failed to join room. Please try again.");
        setLoading(false);
      }
    };

    checkRoom();
  }, [roomId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-700">Joining room...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="mb-6 text-gray-700">{error}</p>
          <button onClick={() => navigate("/")} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default Room;
