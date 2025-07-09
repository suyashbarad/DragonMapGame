import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Mic, MicOff, Key, Swords, Map, Heart, Skull, DoorOpen, Trophy as Treasure, ChevronRight, Volume2 } from 'lucide-react';
import { generateMaze } from '@/lib/mazeGenerator';
import { getNarration } from '@/lib/aiNarrator';

const TILE_TYPE = {
  WALL: '#',
  PATH: '.',
  PLAYER: '@',
  START: 'S',
  END: 'E',
  DOOR: 'D',
  KEY: 'K',
  MONSTER: 'M',
  TREASURE: 'T',
};

const MAZE_SIZE = 15;

const DungeonGame = () => {
  const [maze, setMaze] = useState([]);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [hasKey, setHasKey] = useState(false);
  const [health, setHealth] = useState(3);
  const [monsters, setMonsters] = useState([]);
  const [treasures, setTreasures] = useState([]);
  const [narration, setNarration] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [gameState, setGameState] = useState('playing'); // playing, won, lost
  const [recognition, setRecognition] = useState(null);

  const initializeGame = useCallback(() => {
    const { newMaze, startPos, monsters: newMonsters, treasures: newTreasures } = generateMaze(MAZE_SIZE, MAZE_SIZE);
    setMaze(newMaze);
    setPlayerPos(startPos);
    setHasKey(false);
    setHealth(3);
    setMonsters(newMonsters);
    setTreasures(newTreasures);
    setGameState('playing');
    const initialNarration = getNarration('start', { maze, playerPos });
    setNarration(initialNarration);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support the Web Speech API. Please try Chrome.",
        variant: "destructive",
      });
      return;
    }

    const rec = new window.webkitSpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onresult = (event) => {
      const last = event.results.length - 1;
      const command = event.results[last][0].transcript.trim().toLowerCase();
      handleVoiceCommand(command);
    };
    
    rec.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        toast({ title: "Microphone Access Denied", description: "Please allow microphone access to use voice commands.", variant: "destructive" });
      } else {
        toast({ title: "Voice Recognition Error", description: `An error occurred: ${event.error}`, variant: "destructive" });
      }
    };

    setRecognition(rec);
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
      toast({ title: "Voice commands off", description: "You are now silent in the dark..." });
    } else {
      recognition?.start();
      setIsListening(true);
      toast({ title: "Voice commands on", description: "The dungeon hears your whispers..." });
    }
  };

  const speakNarration = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = speechSynthesis.getVoices().find(v => v.name.includes("Google") && v.lang.startsWith("en")) || speechSynthesis.getVoices()[0];
      utterance.pitch = 0.8;
      utterance.rate = 1;
      speechSynthesis.speak(utterance);
    }
  };
  
  const movePlayer = useCallback((dx, dy) => {
    if (gameState !== 'playing') return;

    const newPos = { x: playerPos.x + dx, y: playerPos.y + dy };
    const targetTile = maze[newPos.y]?.[newPos.x];

    let action = '';
    let outcome = null;

    if (!targetTile) {
      action = 'bump_wall_edge';
      setNarration(getNarration(action, {}));
      return;
    }

    switch (targetTile) {
      case TILE_TYPE.PATH:
      case TILE_TYPE.START:
        setPlayerPos(newPos);
        action = 'move_path';
        break;
      case TILE_TYPE.WALL:
        action = 'bump_wall';
        break;
      case TILE_TYPE.KEY:
        setPlayerPos(newPos);
        setHasKey(true);
        action = 'get_key';
        setMaze(prev => {
            const newMaze = prev.map(row => [...row]);
            newMaze[newPos.y][newPos.x] = TILE_TYPE.PATH;
            return newMaze;
        });
        toast({ title: "Key Acquired!", description: "You found a mysterious old key." });
        break;
      case TILE_TYPE.DOOR:
        if (hasKey) {
          setPlayerPos(newPos);
          action = 'open_door';
          setMaze(prev => {
              const newMaze = prev.map(row => [...row]);
              newMaze[newPos.y][newPos.x] = TILE_TYPE.PATH;
              return newMaze;
          });
        } else {
          action = 'bump_door_locked';
        }
        break;
      case TILE_TYPE.TREASURE:
        setPlayerPos(newPos);
        action = 'get_treasure';
        const updatedTreasures = treasures.filter(t => t.x !== newPos.x || t.y !== newPos.y);
        setTreasures(updatedTreasures);
        setMaze(prev => {
            const newMaze = prev.map(row => [...row]);
            newMaze[newPos.y][newPos.x] = TILE_TYPE.PATH;
            return newMaze;
        });
        toast({ title: "Treasure Found!", description: "Riches are yours!" });
        break;
      case TILE_TYPE.MONSTER:
        action = 'encounter_monster';
        const newHealth = health - 1;
        setHealth(newHealth);
        if (newHealth <= 0) {
          setGameState('lost');
          outcome = 'lost';
          toast({ title: "You Died!", description: "The monster overwhelmed you.", variant: 'destructive' });
        } else {
          toast({ title: "Ouch!", description: `You took 1 damage. ${newHealth} health remaining.` });
          const updatedMonsters = monsters.filter(m => m.x !== newPos.x || m.y !== newPos.y);
          setMonsters(updatedMonsters);
          setMaze(prev => {
              const newMaze = prev.map(row => [...row]);
              newMaze[newPos.y][newPos.x] = TILE_TYPE.PATH;
              return newMaze;
          });
          setPlayerPos(newPos);
        }
        break;
      case TILE_TYPE.END:
        setPlayerPos(newPos);
        action = 'win';
        outcome = 'won';
        setGameState('won');
        toast({ title: "You Escaped!", description: "You've found your way out of the dungeon!" });
        break;
      default:
        action = 'bump_wall';
        break;
    }
    
    const newNarration = getNarration(action, { outcome, health: health - (action === 'encounter_monster' ? 1 : 0) });
    setNarration(newNarration);
    speakNarration(newNarration);
  }, [playerPos, maze, hasKey, health, gameState, treasures, monsters]);
  
  const handleVoiceCommand = useCallback((command) => {
    if (gameState !== 'playing' || !isListening) return;
    
    toast({ description: `Command heard: "${command}"` });

    if (command.includes('go up') || command.includes('move up') || command.includes('north')) {
      movePlayer(0, -1);
    } else if (command.includes('go down') || command.includes('move down') || command.includes('south')) {
      movePlayer(0, 1);
    } else if (command.includes('go left') || command.includes('move left') || command.includes('west')) {
      movePlayer(-1, 0);
    } else if (command.includes('go right') || command.includes('move right') || command.includes('east')) {
      movePlayer(1, 0);
    } else if (command.includes('open door') || command.includes('use key')) {
      // Check adjacent tiles for doors and attempt to open
      const adjacent = [{dx:0, dy:-1}, {dx:0, dy:1}, {dx:-1, dy:0}, {dx:1, dy:0}];
      let doorFound = false;
      for (const {dx, dy} of adjacent) {
        const checkPos = {x: playerPos.x + dx, y: playerPos.y + dy};
        if (maze[checkPos.y]?.[checkPos.x] === TILE_TYPE.DOOR) {
          movePlayer(dx, dy);
          doorFound = true;
          break;
        }
      }
      if (!doorFound) {
        const newNarration = getNarration('no_door', {});
        setNarration(newNarration);
        speakNarration(newNarration);
      }
    } else if (command.includes('look around') || command.includes('describe')) {
        const newNarration = getNarration('look_around', { maze, playerPos });
        setNarration(newNarration);
        speakNarration(newNarration);
    } else {
        const newNarration = getNarration('unknown_command', { command });
        setNarration(newNarration);
        speakNarration(newNarration);
    }
  }, [gameState, movePlayer, isListening, maze, playerPos]);
  
  const Tile = useMemo(() => ({ tile, x, y }) => {
    let content = '';
    let tileClass = 'bg-black/30';
    switch (tile) {
      case TILE_TYPE.WALL:
        content = <img  alt="A stone wall tile from a dungeon maze game" src="https://images.unsplash.com/photo-1552757703-953896d532eb" />;
        tileClass = 'bg-slate-800';
        break;
      case TILE_TYPE.PATH:
      case TILE_TYPE.START:
        content = <img  alt="A stone floor tile from a dungeon maze game" src="https://images.unsplash.com/photo-1607136280537-6695af76d644" />;
        tileClass = 'bg-slate-700/50';
        break;
      case TILE_TYPE.DOOR:
        content = <DoorOpen className="w-full h-full text-yellow-500/50 p-1" />;
        tileClass = 'bg-slate-700/50';
        break;
      case TILE_TYPE.KEY:
        content = <Key className="w-full h-full text-yellow-400 animate-pulse p-1.5" />;
        tileClass = 'bg-slate-700/50';
        break;
      case TILE_TYPE.END:
        content = <Treasure className="w-full h-full text-green-400 animate-pulse p-1" />;
        tileClass = 'bg-slate-700/50';
        break;
      case TILE_TYPE.MONSTER:
        content = <Skull className="w-full h-full text-red-500 animate-pulse p-1.5" />;
        tileClass = 'bg-slate-700/50';
        break;
       case TILE_TYPE.TREASURE:
        content = <Treasure className="w-full h-full text-amber-400 animate-pulse p-1.5" />;
        tileClass = 'bg-slate-700/50';
        break;
    }

    const isPlayerPos = playerPos.x === x && playerPos.y === y;
    
    return (
      <div className={`relative w-full h-full aspect-square transition-colors duration-300 ${tileClass}`}>
        {content}
        {isPlayerPos && (
           <motion.div layoutId="player" className="absolute inset-0 flex items-center justify-center">
             <img  alt="A heroic adventurer character icon in a dungeon game" className="w-3/4 h-3/4 text-blue-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" src="https://images.unsplash.com/photo-1634896941598-b6b500a502a7" />
           </motion.div>
        )}
      </div>
    );
  }, [playerPos]);

  return (
    <div className="flex flex-col lg:flex-row h-screen p-4 gap-4 bg-slate-900 font-[Cinzel]">
        <div className="flex-grow lg:w-2/3 flex items-center justify-center p-4 bg-black/20 rounded-lg border border-slate-700 shadow-2xl shadow-black/50">
           <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${MAZE_SIZE}, minmax(0, 1fr))` }}>
             {maze.map((row, y) =>
               row.map((tile, x) => <Tile key={`${x}-${y}`} tile={tile} x={x} y={y} />)
             )}
           </div>
        </div>
        
        <div className="lg:w-1/3 flex flex-col gap-4">
            <Card className="flex-shrink-0 bg-slate-800/50 border-slate-700 text-slate-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-2xl font-bold tracking-wider text-amber-300">STATUS</CardTitle>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xl">
                            <Heart className="w-6 h-6 text-red-500" />
                            <span>{health}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xl transition-opacity ${hasKey ? 'opacity-100' : 'opacity-30'}`}>
                            <Key className="w-6 h-6 text-yellow-400" />
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Card className="flex-grow flex flex-col bg-slate-800/50 border-slate-700 text-slate-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-bold tracking-wider text-amber-300">NARRATION</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={narration}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="text-lg leading-relaxed font-[MedievalSharp] text-slate-300 italic"
                    >
                      {narration}
                    </motion.p>
                  </AnimatePresence>
                </CardContent>
            </Card>

             <Card className="flex-shrink-0 bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="text-sm text-slate-400">
                        <p className="font-bold">VOICE COMMANDS:</p>
                        <p>"Go [up, down, left, right]", "Open door", "Look around"</p>
                    </div>
                    <Button onClick={toggleListening} size="lg" className={`rounded-full w-20 h-20 transition-all duration-300 ${isListening ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                        {isListening ? <Mic className="w-8 h-8"/> : <MicOff className="w-8 h-8"/>}
                    </Button>
                </CardContent>
            </Card>
        </div>

      <AnimatePresence>
        {(gameState === 'won' || gameState === 'lost') && (
            <motion.div
              initial={{ backdropFilter: 'blur(0px)', opacity: 0 }}
              animate={{ backdropFilter: 'blur(8px)', opacity: 1 }}
              exit={{ backdropFilter: 'blur(0px)', opacity: 0 }}
              className="absolute inset-0 bg-black/60 flex items-center justify-center z-50"
            >
                <Card className="w-full max-w-md text-center p-8 bg-slate-800 border-amber-400/50">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
                    >
                      <CardTitle className="text-5xl font-bold mb-4 text-amber-300">
                          {gameState === 'won' ? 'You Have Escaped!' : 'You Are Dead!'}
                      </CardTitle>
                      <p className="text-slate-300 mb-6 text-xl">
                          {gameState === 'won'
                            ? 'Your tale of survival will be sung for ages.'
                            : 'Your journey ends here, in the cold, dark depths.'}
                      </p>
                      <Button onClick={initializeGame} size="lg" className="bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold text-lg">
                          Play Again <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                </Card>
            </motion.div>
        )}
       </AnimatePresence>
    </div>
  );
};

export default DungeonGame;