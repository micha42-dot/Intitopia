import React, { useState } from 'react';
import World from './components/World';

function App() {
  const [username, setUsername] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  const handleStart = () => {
    if (username.trim()) {
      setHasStarted(true);
    }
  };

  if (hasStarted) {
    return <World username={username} />;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-[#008080] font-sans">
      {/* Windows 3.1 Dialog Box */}
      <div className="win31-bg win31-border-outset p-1 w-96 shadow-2xl">
        {/* Fake Title Bar */}
        <div className="bg-[#000080] text-white px-2 py-1 mb-4 flex justify-between items-center">
            <span className="font-bold text-sm tracking-wide">Login - Intitopia.exe</span>
            <div className="win31-btn w-4 h-4 text-[10px] leading-none flex items-center justify-center font-bold text-black bg-[#c0c0c0]">X</div>
        </div>

        <div className="px-4 pb-4">
            <div className="flex items-start gap-4 mb-6">
                {/* Icon */}
                <div className="w-8 h-8 flex-shrink-0">
                    <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-sm">
                        <rect width="32" height="32" fill="#c0c0c0" />
                        <rect x="4" y="4" width="24" height="24" fill="#fff" stroke="black" strokeWidth="1"/>
                        <circle cx="16" cy="14" r="6" fill="#000080" />
                        <path d="M6 28 Q16 18 26 28" fill="#000080" />
                    </svg>
                </div>
                
                <div className="text-sm">
                    <p className="mb-2">Welcome to Intitopia Multiplayer.</p>
                    <p>Please identify yourself to join the server.</p>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-xs mb-1 font-bold">USERNAME:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                    className="w-full win31-border-inset px-2 py-1 text-sm focus:outline-none font-mono uppercase"
                    placeholder="PLAYER 1"
                    maxLength={12}
                    autoFocus
                />
            </div>

            <div className="flex justify-end gap-2">
                <button 
                    onClick={handleStart}
                    disabled={!username.trim()}
                    className="win31-btn w-20 py-1 text-sm font-bold border border-black disabled:text-gray-500"
                >
                    JOIN
                </button>
                <button className="win31-btn w-20 py-1 text-sm border border-black">
                    Cancel
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;