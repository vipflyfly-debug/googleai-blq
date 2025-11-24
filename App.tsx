import React, { useState } from 'react';
import { GamePhase, FrameResult, GameConfig } from './types';
import { MAX_FRAMES } from './constants';
import BowlingLane from './components/BowlingLane';
import GameControls from './components/GameControls';
import ScoreBoard from './components/ScoreBoard';
import { Trophy, RotateCcw, Play } from 'lucide-react';

const CONFIG: GameConfig = {
  maxFrames: MAX_FRAMES,
  maxThrowsPerFrame: 2,
};

function App() {
  // Game State
  const [phase, setPhase] = useState<GamePhase>(GamePhase.START_SCREEN);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [throwIdx, setThrowIdx] = useState(0); // 0 or 1
  const [frames, setFrames] = useState<FrameResult[]>([]);
  
  // Lane/Physics State
  const [ballStartPos, setBallStartPos] = useState(50);
  const [throwParams, setThrowParams] = useState<{power: number, angle: number} | null>(null);
  const [resetLaneTrigger, setResetLaneTrigger] = useState(0);
  
  // Score Tracking for current frame
  const [pinsDownInFrame, setPinsDownInFrame] = useState<number[]>([]);

  const startGame = () => {
    setFrames(Array(CONFIG.maxFrames).fill(null));
    setCurrentFrameIdx(0);
    setThrowIdx(0);
    setPinsDownInFrame([]);
    setPhase(GamePhase.AIMING);
    setResetLaneTrigger(prev => prev + 1);
  };

  const handlePositionChange = (val: number) => {
    setBallStartPos(val);
  };

  const handleConfirmAim = () => {
    setPhase(GamePhase.POWER_ANGLE);
  };

  const handleThrow = (power: number, angle: number) => {
    setThrowParams({ power, angle });
    setPhase(GamePhase.ROLLING);
  };

  // Helper to finalize a frame state
  const completeFrame = (t1: number, t2: number, totalScore: number) => {
    setFrames(prev => {
        const newFrames = [...prev];
        newFrames[currentFrameIdx] = {
            frameNumber: currentFrameIdx + 1,
            throw1: t1,
            throw2: t2,
            score: totalScore,
            isComplete: true
        };
        return newFrames;
    });

    // Check Game Over
    if (currentFrameIdx >= CONFIG.maxFrames - 1) {
        setPhase(GamePhase.GAME_OVER);
    } else {
        // Next Frame
        setCurrentFrameIdx(prev => prev + 1);
        setThrowIdx(0);
        setPinsDownInFrame([]);
        setResetLaneTrigger(prev => prev + 1); // Reset pins for new frame
        setPhase(GamePhase.AIMING);
        setThrowParams(null);
    }
  };

  // Called when physics simulation ends
  const handleRollingComplete = (downedPinIds: number[]) => {
    // Logic to calculate score based on pins down
    // F-06: Count score based on total pins down.
    
    // We get ALL pins currently down from the lane.
    // Calculate how many *new* pins fell this throw.
    const totalDownCount = downedPinIds.length;
    
    const isFirstThrow = throwIdx === 0;
    
    if (isFirstThrow) {
        // Logic for first throw
        if (totalDownCount === 10) {
            // STRIKE
            // Rule F-06: "In a round's 2 throws... if all 10... +2"
            // Assuming Strike ends frame immediately for 10 + 2 = 12 points.
            const frameScore = 12; 
            completeFrame(10, 0, frameScore);
        } else {
            // Not a strike, move to throw 2
            setPinsDownInFrame(downedPinIds);
            setThrowIdx(1);
            setPhase(GamePhase.AIMING);
            // DO NOT reset lane pins, user needs to hit remaining
            setThrowParams(null);
        }
    } else {
        // Second throw
        // Rule: If total 10 down -> +2 bonus.
        let frameScore = totalDownCount;
        if (totalDownCount === 10) {
            frameScore += 2; // Bonus
        }

        const firstThrowCount = pinsDownInFrame.length;
        const secondThrowCount = totalDownCount - firstThrowCount;

        completeFrame(firstThrowCount, secondThrowCount, frameScore);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center py-8 font-sans">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600 drop-shadow-sm">
          BOWLING ARCADE
        </h1>
        <p className="text-slate-400 text-sm mt-1">Target: 10 Pins | Frame Bonus: +2</p>
      </header>

      {/* Main Game Container */}
      <div className="relative w-full max-w-4xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 px-4">
        
        {/* Left Column: Game Board (Canvas) */}
        <div className="flex-shrink-0">
          <BowlingLane 
            phase={phase}
            ballStartXPercent={ballStartPos}
            throwParams={throwParams}
            onRollingComplete={handleRollingComplete}
            resetTrigger={resetLaneTrigger}
          />
        </div>

        {/* Right Column: UI & Controls */}
        <div className="flex flex-col w-full max-w-[400px] gap-4">
            
            {/* Scoreboard */}
            {phase !== GamePhase.START_SCREEN && (
                <ScoreBoard frames={frames} currentFrameIndex={currentFrameIdx} />
            )}

            {/* START SCREEN */}
            {phase === GamePhase.START_SCREEN && (
                <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 text-center animate-fade-in">
                    <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-4">Ready to Roll?</h2>
                    <ul className="text-left text-slate-300 mb-6 space-y-2 text-sm">
                        <li>• 3 Frames per game</li>
                        <li>• 2 Throws per frame</li>
                        <li>• Clear all pins for <span className="text-amber-400 font-bold">+2 Bonus Points!</span></li>
                    </ul>
                    <button 
                        onClick={startGame}
                        className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                    >
                        <Play fill="currentColor" /> Start Game
                    </button>
                </div>
            )}

            {/* GAME OVER SCREEN */}
            {phase === GamePhase.GAME_OVER && (
                 <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 text-center animate-fade-in">
                 <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
                 <p className="text-slate-400 mb-6">Final Score</p>
                 <div className="text-6xl font-black text-amber-400 mb-8">
                     {frames.reduce((acc, f) => acc + (f?.score || 0), 0)}
                 </div>
                 <button 
                     onClick={startGame}
                     className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                 >
                     <RotateCcw size={18} /> Play Again
                 </button>
             </div>
            )}

            {/* CONTROLS (Only visible during active gameplay phases) */}
            {(phase === GamePhase.AIMING || phase === GamePhase.POWER_ANGLE || phase === GamePhase.ROLLING) && (
                <GameControls 
                    phase={phase}
                    onPositionChange={handlePositionChange}
                    onConfirmAim={handleConfirmAim}
                    onThrow={handleThrow}
                />
            )}

            {/* Tutorial/Hint Text */}
            {phase === GamePhase.AIMING && (
                 <div className="bg-slate-800/50 p-4 rounded text-xs text-slate-400">
                    <p><strong>Tip:</strong> Drag the slider to position the ball. Try to hit slightly off-center to deflect pins into each other.</p>
                 </div>
            )}

        </div>
      </div>

      <footer className="mt-12 text-slate-600 text-sm font-light tracking-widest">
        版权所有：飞鸿踏雪
      </footer>
    </div>
  );
}

export default App;