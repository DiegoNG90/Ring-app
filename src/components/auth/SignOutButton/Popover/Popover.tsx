import React from 'react';

function Popover() {
  return (
    <div className="relative">
      <div className="relative bg-gray-600 select-none px-3 py-1.5 rounded-sm z-[9]">
        Log out
      </div>
      <div className="absolute top-[6px] right-0 bg-gray-600 min-h-[24px] min-w-[24px] rotate-45 z-[1]"></div>
    </div>
  );
}

export default Popover;
