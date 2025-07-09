import React from 'react';
import { motion } from 'framer-motion';
import { Key, DoorOpen, User, GitCommit } from 'lucide-react';

const TILE_CONFIG = {
  '#': { icon: null, color: 'bg-slate-700', description: 'Wall' },
  '.': { icon: null, color: 'bg-slate-900', description: 'Floor' },
  'D': { icon: <DoorOpen />, color: 'bg-yellow-800', description: 'Door' },
  'K': { icon: <Key />, color: 'bg-yellow-500', description: 'Key' },
  'E': { icon: <GitCommit />, color: 'bg-green-600', description: 'Exit' }, // 🔧 FIXED
  '@': { icon: <User />, color: 'bg-blue-500', description: 'Player' },
};

const DungeonMap = ({ map, playerPos }) => {
  const tileSize = 32;

  return (
    <div
      className="relative bg-black border-2 border-slate-600 mx-auto"
      style={{
        width: map[0].length * tileSize,
        height: map.length * tileSize,
      }}
    >
      {map.map((row, y) =>
        row.split('').map((tile, x) => {
          const config = TILE_CONFIG[tile] || TILE_CONFIG['.'];
          return (
            <div
              key={`${x}-${y}`}
              className={`absolute flex items-center justify-center ${config.color}`}
              style={{
                left: x * tileSize,
                top: y * tileSize,
                width: tileSize,
                height: tileSize,
              }}
              title={config.description}
            >
              {config.icon && React.cloneElement(config.icon, { className: 'w-5 h-5 text-white' })}
            </div>
          );
        })
      )}
      <motion.div
        className="absolute flex items-center justify-center rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"
        animate={{ x: playerPos.x * tileSize, y: playerPos.y * tileSize }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: tileSize,
          height: tileSize,
          zIndex: 10,
        }}
        title="You are here"
      >
        <User className="w-5 h-5 text-white" />
      </motion.div>
    </div>
  );
};

export default DungeonMap;
