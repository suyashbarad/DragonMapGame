const TILE_TYPE = {
  WALL: '#',
  PATH: '.',
  DOOR: 'D',
  KEY: 'K',
  MONSTER: 'M',
  TREASURE: 'T',
  START: 'S',
  END: 'E'
};

const NARRATIONS = {
  start: [
    "You awaken on cold stone, the air thick with the smell of damp earth and decay. Your journey begins.",
    "A faint light from an unseen source reveals towering stone walls. You are in a dungeon. The only way is forward.",
    "The silence is deafening, broken only by the drip of water somewhere in the darkness. You must find a way out.",
  ],
  move_path: [
    "You tread carefully down the corridor, your footsteps echoing ominously.",
    "The path continues. Each step takes you deeper into the unknown.",
    "You move through the passage, senses on high alert for any sign of danger.",
    "A cool breeze brushes past you, carrying whispers from the depths of the maze.",
  ],
  bump_wall: [
    "You bump into a solid stone wall. There's no way through here.",
    "The wall is cold and unforgiving to the touch. This is a dead end.",
    "Dark, unyielding stone blocks your path.",
  ],
  bump_wall_edge: [
    "You've reached the edge of the known dungeon. The outer walls are impenetrable.",
    "The air grows heavy here, a solid boundary to this cursed place.",
    "There is nowhere else to go in this direction but the cold, final wall of the maze."
  ],
  get_key: [
    "A glint of metal catches your eye. You've found a heavy, ornate key. It feels important.",
    "Resting on a dusty pedestal, you find an ancient key. Perhaps this opens a way forward.",
    "You pocket the cold, iron key. The weight of it is strangely comforting in this dark place.",
  ],
  open_door: [
    "The key slides into the lock with a satisfying click. The heavy door groans open, revealing the path beyond.",
    "With a turn of the key, the ancient tumblers align. The door creaks open.",
    "The lock gives way, and the door swings inward. A new passage awaits.",
  ],
  bump_door_locked: [
    "You push against a large, reinforced door, but it's securely locked.",
    "The door is barred. You'll need a key to get through.",
    "A sturdy lock holds the door fast. There must be a key somewhere in this maze.",
  ],
  no_door: [
    "You feel around the walls, but there are no doors nearby to open.",
    "Your hands find only cold stone. There are no doors in this section of the passage.",
  ],
  encounter_monster: {
    survive: [
      "A grotesque creature lunges from the shadows! You fight it off, but not without injury.",
      "Claws and teeth meet your desperate defense. You survive the encounter, but you are wounded.",
      "The beast shrieks as you land a blow, but it rakes its claws across you as it retreats into the darkness.",
    ],
    die: [
      "The monster's attack is too swift, too brutal. Your vision fades to black as its final blow lands.",
      "Overwhelmed by the foul beast, you fall to the stone floor. The dungeon claims another soul.",
      "Your strength fails you. The creature's victory is absolute. Darkness consumes you.",
    ],
  },
  get_treasure: [
    "You stumble upon a hidden alcove containing a chest overflowing with gold and jewels!",
    "A treasure chest! You pry it open to find riches beyond your wildest dreams.",
    "Your path leads to a forgotten treasure. The glimmer of gold is a welcome sight in the gloom.",
  ],
  win: [
    "You see a light ahead! It's an exit! You've escaped the dungeon!",
    "The passage opens into a vast chamber with a staircase leading up into the light. Freedom is yours!",
    "You've found the way out! The darkness is finally behind you.",
  ],
  unknown_command: [
    "You mutter to yourself, but the words are lost in the oppressive silence.",
    "Your command echoes, but nothing happens. The dungeon does not understand.",
    "Confusion clouds your mind. That doesn't seem to be a useful course of action right now.",
  ],
  look_around: (context) => {
    const { maze, playerPos } = context;
    const adjacent = {
      north: maze[playerPos.y - 1]?.[playerPos.x],
      south: maze[playerPos.y + 1]?.[playerPos.x],
      east: maze[playerPos.y]?.[playerPos.x + 1],
      west: maze[playerPos.y]?.[playerPos.x - 1],
    };
    
    let descriptions = [];
    if (adjacent.north === TILE_TYPE.PATH) descriptions.push("a passage continues to the north");
    if (adjacent.south === TILE_TYPE.PATH) descriptions.push("a path stretches south into the darkness");
    if (adjacent.east === TILE_TYPE.PATH) descriptions.push("an opening leads east");
    if (adjacent.west === TILE_TYPE.PATH) descriptions.push("the corridor extends to the west");

    if (adjacent.north === TILE_TYPE.DOOR) descriptions.push("a large door blocks the way to the north");
    if (adjacent.south === TILE_TYPE.DOOR) descriptions.push("a locked door is to your south");
    if (adjacent.east === TILE_TYPE.DOOR) descriptions.push("to the east, you see a sturdy door");
    if (adjacent.west === TILE_TYPE.DOOR) descriptions.push("a door stands to the west");

    if (descriptions.length === 0) return "You are surrounded by cold, unyielding stone walls.";
    
    return `You stand in a stone corridor. You see ${descriptions.join(', ')}.`;
  }
};

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getNarration(action, context) {
  if (action === 'encounter_monster') {
    const { outcome, health } = context;
    if (outcome === 'lost' || health <= 0) {
      return getRandom(NARRATIONS.encounter_monster.die);
    }
    return getRandom(NARRATIONS.encounter_monster.survive);
  }

  if(action === 'look_around') {
      return NARRATIONS.look_around(context);
  }

  if (action === 'unknown_command') {
    const base = getRandom(NARRATIONS.unknown_command);
    return `${base} You spoke: "${context.command}".`;
  }
  
  const narrationOptions = NARRATIONS[action];
  if (!narrationOptions) {
    return "The dungeon is silent.";
  }
  
  return getRandom(narrationOptions);
}