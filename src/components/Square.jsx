import React from "react";

const Square = ({ value, onClick, isWinning }) => {
  const baseClasses =
    "w-full h-20 flex items-center justify-center text-4xl font-bold border-2 border-gray-300 transition-all duration-200 ease-in-out";

  // Add different styling based on the value and winning status
  const valueClasses = value === "X" ? "text-blue-600 hover:bg-blue-50" : value === "O" ? "text-red-600 hover:bg-red-50" : "hover:bg-gray-100"; // Empty square styling

  const winningClass = isWinning ? "bg-yellow-100 border-yellow-400" : "";

  return (
    <button className={`${baseClasses} ${valueClasses} ${winningClass}`} onClick={onClick} disabled={value !== null}>
      {value}
    </button>
  );
};

export default Square;
