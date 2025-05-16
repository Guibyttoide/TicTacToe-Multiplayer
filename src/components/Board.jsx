import React from 'react';
import Square from './Square';

const Board = ({ squares, onClick, winningLine }) => {
  const renderSquare = (i) => {
    const isWinningSquare = winningLine && winningLine.includes(i);
    
    return (
      <Square
        key={i}
        value={squares[i]}
        onClick={() => onClick(i)}
        isWinning={isWinningSquare}
      />
    );
  };

  return (
    <div className="mb-6">
      <div className="grid grid-cols-3 gap-1 w-64 h-64 mx-auto">
        {Array(9).fill(null).map((_, i) => renderSquare(i))}
      </div>
    </div>
  );
};

export default Board;