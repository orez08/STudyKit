import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export const PomodoroTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      alert('Pomodoro session finished!');
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-20 right-8 z-50 p-4 rounded-2xl bg-[#0A0A0A] border border-[#262626] shadow-2xl flex items-center gap-4">
      <span className="text-xl font-mono font-bold text-white">{formatTime(timeLeft)}</span>
      <div className="flex gap-2">
        <button onClick={() => setIsActive(!isActive)} className="p-2 rounded-lg bg-[#1C1C1C] text-white hover:bg-[#262626]">
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button onClick={() => { setTimeLeft(25 * 60); setIsActive(false); }} className="p-2 rounded-lg bg-[#1C1C1C] text-white hover:bg-[#262626]">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
