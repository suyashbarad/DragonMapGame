import { useState, useCallback } from 'react';

const initialMapLayout = [
  "###########",
  "#@..#...#E#",
  "#.K.#.D.#.#",
  "#...#...#.#",
  "#####.###.#",
  "#.....#...#",
  "###########",
];

const getInitialPlayerPos = (map) => {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === '@') {
        return { x, y };
      }
    }
  }
  return { x: 1, y: 1 };
};

const initialGameState = {
  map: [...initialMapLayout],
  hasKey: false,
  status: 'playing',
};

const useDungeonState = () => {
  const [gameState, setGameState] = useState(initialGameState);
  const [playerPos, setPlayerPos] = useState(getInitialPlayerPos(initialGameState.map));
  const [narration, setNarration] = useState("You awaken in a cold, stone-walled room. The air is thick with the smell of damp earth. A single torch flickers on a nearby wall. What do you do?");
  
  const narrate = useCallback((action, context) => {
    // This is a mock AI narrator. In a real scenario, this would call a language model.
    const playerState = `You are at position (${playerPos.x}, ${playerPos.y}). ${gameState.hasKey ? "You are holding an ancient key." : "Your hands are empty."}`;
    
    const prompts = {
      move: {
        wall: `You walk straight into a solid stone wall. The impact stings. That's not a way forward.`,
        floor: `You cautiously step forward. The sound of your boots echoes in the silence. ${playerState}`,
        door_locked: `You approach a sturdy wooden door. It's barred from the other side or locked tight. You'll need a key.`,
        door_unlocked: `With the key in hand, you approach the door. It unlocks with a satisfying *click*.`,
        key: `You spot something glinting on the floor. It's a heavy, ornate key! You pick it up. ${playerState}`,
        exit_locked: `You've reached what seems to be the exit, but it's heavily barred. You can't open it with your bare hands.`,
      },
      interact: {
        no_object: `You wave your hands around but there's nothing here to interact with.`,
        door_locked_no_key: `You push against the heavy door, but it won't budge. It seems firmly locked.`,
        door_open_with_key: `You insert the ancient key into the lock. It turns with a loud *clunk*, and the door creaks open! The path ahead is dark.`,
        exit_win: `You have escaped the labyrinth! The fresh air fills your lungs as you step into freedom.`,
      },
      win: `With a final, heroic effort, you push open the exit and are blinded by sunlight. You've escaped the dark corridors! Victory is yours!`,
      lose: `A hidden trap springs from the floor! Your adventure ends here. The dungeon claims another soul.`,
    };

    const newNarration = prompts[action]?.[context] || "An eerie silence answers you.";
    setNarration(newNarration);
  }, [playerPos, gameState.hasKey]);


  const movePlayer = useCallback((dx, dy) => {
    if (gameState.status !== 'playing') return;

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    const destination = gameState.map[newY]?.[newX];

    if (!destination) return;

    switch (destination) {
      case '#':
        narrate('move', 'wall');
        break;
      case '.':
        setPlayerPos({ x: newX, y: newY });
        narrate('move', 'floor');
        break;
      case 'K':
        setPlayerPos({ x: newX, y: newY });
        setGameState(prev => ({ ...prev, hasKey: true }));
        const newMapWithKeyTaken = [...gameState.map];
        newMapWithKeyTaken[newY] = newMapWithKeyTaken[newY].substring(0, newX) + '.' + newMapWithKeyTaken[newY].substring(newX + 1);
        setGameState(prev => ({...prev, map: newMapWithKeyTaken}));
        narrate('move', 'key');
        break;
      case 'D':
        if (gameState.hasKey) {
            setPlayerPos({ x: newX, y: newY });
            narrate('move', 'door_unlocked');
        } else {
            narrate('move', 'door_locked');
        }
        break;
      case 'E':
        setPlayerPos({ x: newX, y: newY });
        setGameState(prev => ({...prev, status: 'won' }));
        narrate('win');
        break;
      default:
        setPlayerPos({ x: newX, y: newY });
        narrate('move', 'floor');
        break;
    }
  }, [playerPos, gameState, narrate]);

  const interact = useCallback(() => {
    if (gameState.status !== 'playing') return;
    
    // Check adjacent tiles for interactable objects
    const {x, y} = playerPos;
    const targets = [
      {nx: x, ny: y - 1}, // North
      {nx: x, ny: y + 1}, // South
      {nx: x + 1, ny: y}, // East
      {nx: x - 1, ny: y}, // West
    ];

    for(const target of targets) {
        const tile = gameState.map[target.ny]?.[target.nx];
        if (tile === 'D') {
            if (gameState.hasKey) {
                const newMapWithDoorOpen = [...gameState.map];
                newMapWithDoorOpen[target.ny] = newMapWithDoorOpen[target.ny].substring(0, target.nx) + '.' + newMapWithDoorOpen[target.ny].substring(target.nx + 1);
                setGameState(prev => ({...prev, map: newMapWithDoorOpen}));
                narrate('interact', 'door_open_with_key');
                return;
            } else {
                narrate('interact', 'door_locked_no_key');
                return;
            }
        }
    }
    
    narrate('interact', 'no_object');

  }, [playerPos, gameState, narrate]);

  const resetGame = useCallback(() => {
    setGameState(initialGameState);
    setPlayerPos(getInitialPlayerPos(initialGameState.map));
    setNarration("You awaken once more in the cold, stone-walled room. Can you escape this time?");
  }, []);

  return { gameState, playerPos, narration, movePlayer, interact, resetGame };
};

export default useDungeonState;