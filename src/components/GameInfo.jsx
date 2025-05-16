import React from 'react';

const GameInfo = ({ status, scores, onReset, xIsNext }) => {
  return (
    <div className="mt-4">
      {/* Game status message */}
      <div 
        className={`text-center font-semibold text-lg mb-4 ${
          status.includes('Winner') || status.includes('won') 
            ? 'text-green-600' 
            : status.includes('draw') 
              ? 'text-orange-600'
              : 'text-gray-700'
        }`}
      >
        {status}
      </div>

      {/* Score display */}
      <div className="flex justify-around mb-6">
        <div 
          className={`text-center p-3 rounded-md ${
            xIsNext ? 'bg-blue-100 ring-1 ring-blue-300' : ''
          }`}
        >
          <div className="text-blue-600 font-bold text-lg">Player X</div>
          <div className="text-2xl font-bold mt-1">{scores.X}</div>
        </div>
        
        <div 
          className={`text-center p-3 rounded-md ${
            !xIsNext ? 'bg-red-100 ring-1 ring-red-300' : ''
          }`}
        >
          <div className="text-red-600 font-bold text-lg">Player O</div>
          <div className="text-2xl font-bold mt-1">{scores.O}</div>
        </div>
      </div>

      {/* Reset button */}
      <button 
        onClick={onReset}
        className="w-full py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        New Game
      </button>
    </div>
  );
};

export default GameInfo;