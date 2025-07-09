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

export function generateMaze(width, height) {
    let maze = Array(height).fill(null).map(() => Array(width).fill(TILE_TYPE.WALL));
    const monsters = [];
    const treasures = [];

    function carve(x, y) {
        const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        directions.sort(() => Math.random() - 0.5);

        for (let [dx, dy] of directions) {
            const nx = x + dx * 2;
            const ny = y + dy * 2;

            if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && maze[ny][nx] === TILE_TYPE.WALL) {
                maze[y + dy][x + dx] = TILE_TYPE.PATH;
                maze[ny][nx] = TILE_TYPE.PATH;
                carve(nx, ny);
            }
        }
    }

    const startPos = { x: 1, y: 1 };
    maze[startPos.y][startPos.x] = TILE_TYPE.START;
    carve(startPos.x, startPos.y);

    function placeItem(itemType) {
      let placed = false;
      while (!placed) {
        const x = Math.floor(Math.random() * (width - 2)) + 1;
        const y = Math.floor(Math.random() * (height - 2)) + 1;
        if (maze[y][x] === TILE_TYPE.PATH) {
          // Avoid placing on start
          if (x === startPos.x && y === startPos.y) continue;
          maze[y][x] = itemType;
          placed = true;
          return {x, y};
        }
      }
    }

    placeItem(TILE_TYPE.KEY);
    placeItem(TILE_TYPE.DOOR);
    placeItem(TILE_TYPE.END);
    
    // Place monsters
    const monsterCount = Math.floor((width * height) / 50);
     for (let i = 0; i < monsterCount; i++) {
        const pos = placeItem(TILE_TYPE.MONSTER);
        monsters.push(pos);
    }

    // Place treasures
    const treasureCount = Math.floor((width * height) / 60);
    for (let i = 0; i < treasureCount; i++) {
        const pos = placeItem(TILE_TYPE.TREASURE);
        treasures.push(pos);
    }
    
    // Ensure the start position is not overwritten
    maze[startPos.y][startPos.x] = TILE_TYPE.START;
    
    return { newMaze: maze, startPos, monsters, treasures };
}