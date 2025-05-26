import React from 'react';

export function LoadingTable() {
  return (
    <div className="animate-pulse">
      {[...Array(12)].map((_, index) => (
        <div key={index} className="h-4 bg-gray-300 rounded my-2"></div>
      ))}
    </div>
  );
} 