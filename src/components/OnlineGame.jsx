import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue, off, update, get } from "firebase/database";
import { database } from "../firebase";
import Board from "./Board";
import GameInfo from "./GameInfo";

const OnlineGame = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(null);
  const [playerInfo, setPlayerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Get player info from session storage
    const storedPlayerInfo = sessionStorage.getItem("playerInfo");
    if (!storedPlayerInfo) {
      setError("Player information not found. Please go back to the lobby.");
      setLoading(false);
      return;
    }

    const playerData = JSON.parse(storedPlayerInfo);
    if (playerData.roomId !== roomId) {
      setError("Room ID mismatch. Please go back to the lobby.");
      setLoading(false);
      return;
    }

    setPlayerInfo(playerData);

    // Set up Firebase realtime listener
    const roomRef = ref(database, `rooms/${roomId}`);

    // Update player's online status
    updatePlayerOnlineStatus(roomId, playerData.symbol, true);

    // Listen for game state changes
    const unsubscribe = onValue(
      roomRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setError("Room not found.");
          setLoading(false);
          return;
        }

        setGameState(data);
        setLoading(false);
      },
      (error) => {
        console.error("Firebase error:", error);
        setError("Failed to connect to the game room.");
        setLoading(false);
      },
    );

    // Set up online status ping and offline cleanup
    const pingInterval = setInterval(() => {
      if (playerData && playerData.symbol) {
        updatePlayerLastSeen(roomId, playerData.symbol);
      }
    }, 30000);

    // Cleanup function
    return () => {
      off(roomRef);
      clearInterval(pingInterval);
      if (playerData && playerData.symbol) {
        updatePlayerOnlineStatus(roomId, playerData.symbol, false);
      }
    };
  }, [roomId]);

  const updatePlayerOnlineStatus = (roomId, symbol, isOnline) => {
    const playerRef = ref(database, `rooms/${roomId}/players/${symbol}/online`);
    update(ref(database), {
      [`rooms/${roomId}/players/${symbol}/online`]: isOnline,
      [`rooms/${roomId}/players/${symbol}/lastSeen`]: Date.now(),
    }).catch((error) => {
      console.error("Error updating online status:", error);
    });
  };

  const updatePlayerLastSeen = (roomId, symbol) => {
    update(ref(database), {
      [`rooms/${roomId}/players/${symbol}/lastSeen`]: Date.now(),
    }).catch((error) => {
      console.error("Error updating last seen:", error);
    });
  };

  const handleSquareClick = async (i) => {
    if (!gameState || !playerInfo || !gameState.game) return;

    // Use the already destructured board variable instead of checking gameState.game directly
    if (!board || !Array.isArray(board) || board.length !== 9) {
      console.log("Board missing or invalid, initializing...");
      const newBoard = Array(9).fill(null);

      // Update Firebase with the missing board
      const gameRef = ref(database, `rooms/${roomId}/game`);
      try {
        await update(gameRef, {
          board: newBoard,
          currentTurn: currentTurn || "X",
          winner: winner || null,
          winningLine: null,
          scores: scores || { X: 0, O: 0 },
        });
        console.log("Board initialized successfully");
      } catch (error) {
        console.error("Error initializing board:", error);
      }
      return; // Return early and let Firebase sync trigger re-render
    }

    // Check if it's not the player's turn or if the game is over
    if (playerInfo.symbol !== currentTurn || winner || board[i]) {
      console.log("Cannot make move:", {
        playerSymbol: playerInfo.symbol,
        currentTurn,
        winner,
        squareValue: board[i],
      });
      return;
    }

    // Create a new board with the player's move
    const newBoard = [...board];
    newBoard[i] = currentTurn;

    // Calculate if there's a winner
    const result = calculateWinner(newBoard);

    // CRITICAL FIX: Ensure Firebase stores arrays properly by using string indexes
    // Convert array to object with numbered string keys to avoid Firebase auto-conversion
    const boardObject = {};
    newBoard.forEach((value, index) => {
      if (value !== null) {
        boardObject[index.toString()] = value;
      }
    });

    // Update the game state in Firebase
    const gameRef = ref(database, `rooms/${roomId}/game`);
    update(gameRef, {
      board: boardObject, // Store as object to prevent Firebase conversion issues
      currentTurn: currentTurn === "X" ? "O" : "X",
      winner: result.winner,
      winningLine: result.line,
      ...(result.winner && {
        [`scores.${result.winner}`]: gameState.game.scores[result.winner] + 1,
      }),
    }).catch((error) => {
      console.error("Error updating game state:", error);
    });
  };

  const handleResetGame = () => {
    // Reset the game board but keep scores
    const gameRef = ref(database, `rooms/${roomId}/game`);

    // Use an empty object for the board to represent all null values
    update(gameRef, {
      board: {}, // Empty object represents all null values
      currentTurn: "X",
      winner: null,
      winningLine: null,
    }).catch((error) => {
      console.error("Error resetting game:", error);
    });
  };

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}/join/${roomId}`;
    navigator.clipboard.writeText(roomLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const leaveRoom = () => {
    navigate("/");
  };

  // Helper function to calculate the winner
  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], // top row
      [3, 4, 5], // middle row
      [6, 7, 8], // bottom row
      [0, 3, 6], // left column
      [1, 4, 7], // middle column
      [2, 5, 8], // right column
      [0, 4, 8], // diagonal top-left to bottom-right
      [2, 4, 6], // diagonal top-right to bottom-left
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return {
          winner: squares[a],
          line: [a, b, c],
        };
      }
    }

    return { winner: null, line: null };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-700">Loading game room...</p>
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

  if (!gameState || !playerInfo) {
    return null;
  }

  // Extract and normalize game state data
  let { board = Array(9).fill(null), currentTurn, winner, winningLine, scores = { X: 0, O: 0 } } = gameState.game || {};

  // CRITICAL FIX: Firebase converts sparse arrays to objects
  // Convert board object back to array if needed
  if (board && typeof board === "object" && !Array.isArray(board)) {
    console.log("🔧 Converting board object to array");
    const arrayBoard = Array(9).fill(null);
    Object.keys(board).forEach((key) => {
      const index = parseInt(key);
      if (index >= 0 && index < 9) {
        arrayBoard[index] = board[key];
      }
    });
    board = arrayBoard;
    console.log("🔧 Converted board:", board);
  }

  const opponent = playerInfo.symbol === "X" ? "O" : "X";
  const opponentPlayer = gameState.players && gameState.players[opponent];
  const isMyTurn = currentTurn === playerInfo.symbol;

  // Check if board needs to be initialized in Firebase
  if (gameState.game && (!gameState.game.board || Object.keys(gameState.game.board || {}).length === 0)) {
    console.log("Board missing in Firebase, initializing...");
    const gameRef = ref(database, `rooms/${roomId}/game`);
    update(gameRef, {
      board: Array(9).fill(null),
      currentTurn: currentTurn || "X",
      winner: winner || null,
      winningLine: null,
      scores: scores,
    }).catch((error) => {
      console.error("Error initializing board in Firebase:", error);
    });
  }

  // FIX: Add proper validation for board length and draw detection
  const isValidBoard = board && Array.isArray(board) && board.length === 9;
  const isDraw = !winner && isValidBoard && board.every((square) => square !== null);

  // Generate status message
  let status;
  if (winner) {
    status = winner === playerInfo.symbol ? "You won!" : `${opponentPlayer?.name || "Opponent"} won!`;
  } else if (isDraw) {
    status = "It's a draw!";
  } else {
    status = isMyTurn ? "Your turn" : `Waiting for ${opponentPlayer?.name || "opponent"}...`;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Room: {roomId.substring(0, 6)}...</h2>
          <div>
            <button onClick={copyRoomLink} className="px-3 py-1 bg-blue-500 text-white text-sm rounded mr-2 hover:bg-blue-600 transition-colors">
              {copied ? "Copied!" : "Share Link"}
            </button>
            <button onClick={leaveRoom} className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors">
              Leave
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${playerInfo.symbol === "X" ? "bg-blue-500" : "bg-red-500"} mr-2`}></div>
            <span className="font-bold">
              You: {playerInfo.name} ({playerInfo.symbol})
            </span>
          </div>

          {opponentPlayer ? (
            <div className="flex items-center">
              <span className="font-bold">
                {opponentPlayer.name} ({opponent})
              </span>
              <div className={`w-3 h-3 rounded-full ${opponentPlayer.online ? "bg-green-500" : "bg-gray-400"} ml-2`}></div>
            </div>
          ) : (
            <div className="flex items-center">
              <span className="text-gray-500 italic">Waiting for opponent...</span>
              <div className="w-3 h-3 rounded-full bg-gray-400 ml-2"></div>
            </div>
          )}
        </div>

        <div className={`mb-6 text-center p-2 rounded ${isMyTurn ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"}`}>{status}</div>

        <Board squares={board} onClick={handleSquareClick} winningLine={winningLine} />

        <GameInfo
          status={status}
          scores={{
            X: scores.X,
            O: scores.O,
          }}
          onReset={handleResetGame}
          xIsNext={currentTurn === "X"}
        />
      </div>
    </div>
  );
};

export default OnlineGame;
