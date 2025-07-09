import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Key, DoorOpen, Map, Compass, Skull, Crown, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/components/ui/use-toast';
import useVoiceRecognition from '@/hooks/useVoiceRecognition';
import DungeonMap from '@/components/DungeonMap';
import useDungeonState from '@/hooks/useDungeonState';

function App() {
  const {
    gameState,
    playerPos,
    narration,
    movePlayer,
    interact,
    resetGame,
  } = useDungeonState();

  const [lastCommand, setLastCommand] = useState('');

  const processCommand = useCallback((command) => {
    const lowerCaseCommand = command.toLowerCase();
    setLastCommand(lowerCaseCommand);

    if (gameState.status !== 'playing') return;

    if (lowerCaseCommand.includes('go') || lowerCaseCommand.includes('move')) {
      if (lowerCaseCommand.includes('north') || lowerCaseCommand.includes('up')) movePlayer(0, -1);
      else if (lowerCaseCommand.includes('south') || lowerCaseCommand.includes('down')) movePlayer(0, 1);
      else if (lowerCaseCommand.includes('east') || lowerCaseCommand.includes('right')) movePlayer(1, 0);
      else if (lowerCaseCommand.includes('west') || lowerCaseCommand.includes('left')) movePlayer(-1, 0);
      else toast({ title: "Unknown Direction", description: "Try 'go north', 'south', 'east', or 'west'.", variant: "destructive" });
    } else if (lowerCaseCommand.includes('open') || lowerCaseCommand.includes('use')) {
      interact();
    } else if (lowerCaseCommand.includes('speak') || lowerCaseCommand.includes('talk')) {
       toast({
        title: "🚧 Feature Not Implemented",
        description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
      });
    } else {
      toast({ title: "Command Not Understood", description: "Try 'go...', 'move...', or 'open door'.", variant: "destructive" });
    }
  }, [gameState.status, movePlayer, interact]);

  const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = useVoiceRecognition({ onResult: processCommand });

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    if (narration && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(narration);
      utterance.lang = 'en-US';
      utterance.rate = 1.1;
      utterance.pitch = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, [narration]);
  
  const getStatusIcon = () => {
    switch(gameState.status) {
      case 'won': return <Crown className="w-16 h-16 text-yellow-400" />;
      case 'lost': return <Skull className="w-16 h-16 text-red-500" />;
      default: return <Compass className="w-16 h-16 text-blue-400" />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Dungeon Maze Adventure - A Voice-Controlled Quest</title>
        <meta name="description" content="Embark on a voice-controlled dungeon crawl with AI-powered narration. Navigate the maze, find the key, and escape the ancient ruins." />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-slate-100 p-4 font-serif flex flex-col items-center justify-center">
        <main className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Map and Player Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-1 space-y-6"
          >
            <Card className="bg-slate-800/50 border-slate-700 p-4 text-center">
              <h2 className="text-2xl font-bold text-amber-300 mb-4 font-['IM_Fell_English_SC'] tracking-widest">The Labyrinth</h2>
              <DungeonMap map={gameState.map} playerPos={playerPos} />
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <h3 className="text-xl font-bold text-amber-300 mb-3 font-['IM_Fell_English_SC']">Inventory</h3>
              <div className="flex items-center space-x-4">
                <Key className={`w-8 h-8 transition-colors duration-500 ${gameState.hasKey ? 'text-yellow-400' : 'text-slate-600'}`} />
                <span className={`transition-colors duration-500 ${gameState.hasKey ? 'text-white' : 'text-slate-500'}`}>
                  {gameState.hasKey ? "Ancient Key" : "No key found"}
                </span>
              </div>
            </Card>
          </motion.div>

          {/* Center Panel - Narration and Status */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="bg-slate-800/50 border-slate-700 p-6 flex flex-col h-full">
              <h1 className="text-4xl text-center font-bold text-amber-400 mb-4 font-['IM_Fell_English_SC'] tracking-wider">Dungeon Depths</h1>
              <div className="flex-grow bg-black/30 rounded-lg p-4 border border-slate-700 min-h-[200px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={narration}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-lg text-slate-300 leading-relaxed italic text-center"
                  >
                    {narration}
                  </motion.p>
                </AnimatePresence>
              </div>
              <div className="mt-4 text-center text-sm text-slate-500">
                <p>Last Command: <span className="font-mono text-amber-300">{lastCommand || 'none'}</span></p>
                {isListening && <p className="text-blue-400 animate-pulse">Transcript: <span className="font-mono text-blue-300">{transcript}</span></p>}
              </div>
            </Card>
          </motion.div>
          
          {/* Game Over Modal */}
          <AnimatePresence>
            {(gameState.status === 'won' || gameState.status === 'lost') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              >
                <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-amber-400 text-center p-8 max-w-md w-full">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.2, type: 'spring' } }} className="flex justify-center mb-4">
                    {getStatusIcon()}
                  </motion.div>
                  <h2 className="text-4xl font-bold text-amber-300 mb-4 font-['IM_Fell_English_SC']">{gameState.status === 'won' ? "Victory!" : "You Died"}</h2>
                  <p className="text-slate-300 mb-6 text-lg">{gameState.status === 'won' ? "You have escaped the labyrinth!" : "The dungeon claims another soul..."}</p>
                  <Button onClick={resetGame} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold">
                    Play Again
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        {/* Footer - Controls */}
        <footer className="w-full max-w-6xl mx-auto mt-6">
          <Card className="bg-slate-800/50 border-slate-700 p-4 flex items-center justify-center space-x-4">
            {hasRecognitionSupport ? (
              <Button onClick={toggleListening} size="lg" className={`rounded-full w-20 h-20 transition-all duration-300 ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </Button>
            ) : (
              <p className="text-red-400">Voice recognition is not supported in your browser.</p>
            )}
            <div className="text-left">
              <p className="font-bold text-lg">{isListening ? "Listening..." : "Click Mic to Speak"}</p>
              <p className="text-sm text-slate-400">Try "go north", "open door", etc.</p>
            </div>
             <Button
              onClick={() => {
                if ('speechSynthesis' in window && narration) {
                  const utterance = new SpeechSynthesisUtterance(narration);
                  utterance.lang = 'en-US';
                  window.speechSynthesis.speak(utterance);
                }
              }}
              variant="outline"
              className="border-slate-600 hover:bg-slate-700"
            >
              <Volume2 className="w-5 h-5 mr-2" /> Repeat
            </Button>
          </Card>
        </footer>
        <Toaster />
      </div>
    </>
  );
}

export default App;