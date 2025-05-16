import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import Lobby from './components/Lobby';
import Room from './components/Room';
import JoinRoom from './components/JoinRoom';
import OnlineGame from './components/OnlineGame';

function App() {
  // Local game state
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  
  const handleClick = (i) => {
    const newHistory = history.slice(0, currentMove + 1);
    const current = newHistory[newHistory.length - 1];
    const squares = [...current];
    
    // Return early if there's a winner or the square is already filled
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    
    squares[i] = xIsNext ? 'X' : 'O';
    setHistory([...newHistory, squares]);
    setCurrentMove(newHistory.length);
    
    // Check if this move resulted in a win
    const { winner } = calculateWinner(squares);
    if (winner) {
      setScores({
        ...scores,
        [winner]: scores[winner] + 1,
      });
    }
  };

  const resetGame = () => {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
  };

  const { winner, line: winningLine } = calculateWinner(currentSquares);
  const isDraw = !winner && currentSquares.every(square => square !== null);
  
  let status;
  if (winner) {
    status = `Winner: Player ${winner}`;
  } else if (isDraw) {
    status = "It's a draw!";
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }

  const LocalGame = () => (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Tic-Tac-Toe</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-md">
        <Board
          squares={currentSquares}
          onClick={handleClick}
          winningLine={winningLine}
        />
        
        <GameInfo
          status={status}
          scores={scores}
          onReset={resetGame}
          xIsNext={xIsNext}
        />
      </div>
      
      <div className="mt-8 text-gray-600">
        <p>Take turns to place X and O on the board.</p>
        <p>The first player to get 3 in a row wins!</p>
      </div>
    </div>
  );

  const HomePage = () => (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Tic-Tac-Toe</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center">
            <Link 
              to="/local" 
              className="inline-block w-full bg-blue-600 text-white py-3 px-6 rounded-md text-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Play Locally
            </Link>
            <p className="mt-2 text-sm text-gray-600">Play with a friend on this device</p>
          </div>
          
          <div className="text-center">
            <Link 
              to="/online" 
              className="inline-block w-full bg-green-600 text-white py-3 px-6 rounded-md text-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Play Online
            </Link>
            <p className="mt-2 text-sm text-gray-600">Play with others over the internet</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-600">
        <p>© 2023 Tic-Tac-Toe Online</p>
      </div>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/local" element={<LocalGame />} />
        <Route path="/online" element={<Lobby />} />
        <Route path="/join" element={<JoinRoom />} />
        <Route path="/join/:roomId" element={<JoinRoom />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/game/:roomId" element={<OnlineGame />} />
      </Routes>
    </BrowserRouter>
  );
}

// Helper function to calculate the winner
function calculateWinner(squares) {
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
}

export default App;