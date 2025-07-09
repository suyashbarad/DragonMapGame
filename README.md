# DragonMapGame
This is a Dungeon maze game where the player moves and interacts using voice commands like “Go right”, “Open the door”, etc. Instead of fixed text, the game uses GPT or Gemini to generate intelligent story narration based on player actions.
# 🧩 AI-Powered Dungeon Maze Game 🎮🗣️

A voice-controlled Python dungeon game enhanced with generative AI narration. Navigate a randomly generated maze with voice commands and experience dynamic storytelling powered by Gemini or GPT.

---

## 🎯 Project Goal

To build an immersive dungeon game where:
- You move and interact using voice (e.g., “Go left”, “Open the door”).
- AI narrates events like enemy encounters or puzzle discoveries.
- Gameplay is saved and resumed easily.

---

## 🔥 Key Features

- 🎙️ **Voice Commands:** Control the game via your microphone using natural language.
- 🗺️ **Maze Engine:** Randomly generated 2D mazes.
- 🤖 **AI Narration:** Gemini/GPT generates descriptive events and scenes.
- 🔊 **Text-to-Speech:** Narrated story using speech output libraries.
- 💾 **Save/Load System:** Resume the game from where you left off.
- 🎭 **Event System:** Encounters with enemies, puzzles, treasures, and traps.

---

## 🛠 Tech Stack

- **Language:** Python 3
- **Voice Input:** `speechrecognition`
- **Speech Output:** `pyttsx3` or `gTTS`
- **AI API:** Gemini or OpenAI GPT
- **Game Display:** `pygame` or `curses` (for terminal-based games)
- **Data Storage:** `JSON` or `SQLite`

---

## 📁 Project Structure

ai_dungeon_maze/
├── main.py # Game loop and logic
├── engine/
│ ├── maze.py # Maze generation logic
│ ├── player.py # Player data and movement
│ └── events.py # Random events (enemies, loot, etc.)
├── ai/
│ ├── narrator.py # Gemini/GPT interaction
│ └── prompts.py # Prompt templates for narration
├── audio/
│ ├── speech_input.py # Voice recognition module
│ └── speak.py # Text-to-speech module
├── saves/
│ └── save.json # Save game state
Interface -> ## 🖼️ Game Preview

![Game Screenshot](assets/game_preview.jpg)

