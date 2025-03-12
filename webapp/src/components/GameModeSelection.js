import "./GameModeSelection.css";
import React, { useState } from "react";
import axios from 'axios';

import Game from './Game';
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const fetchAndStoreCities = async () =>{
  return await axios.post(`${apiEndpoint}/loadcities`);
}

function GameModeSelection() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isWild, setIsWild] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [showGame, setShowGame] = useState(false);
  

  const handleTopicChange = (topic) => {
    if (!isWild) {
      setSelectedTopic(topic === selectedTopic ? null : topic);
    }
  };

  const handleWildSelection = () => {
    setIsWild(true);
    setSelectedTopic("all");
    fetchAndStoreCities();
  };

  const handleCustomSelection = () => {
    setIsWild(false);
    setSelectedTopic(null);
  };

  const handleModeChange = (mode) => {
    setSelectedMode(mode === selectedMode ? null : mode);
  };

  const handleStartGame = () => {
    alert("Game is about to start"); // Here we will redirect to game
    setShowGame(true);
  };

  const isStartDisabled = !selectedTopic || !selectedMode;

  return (
    <div className="game-mode-container">
      {showGame ? (
        <Game /> //Cuando `showGame` es true, mostramos Game.js
      ) : (
        <>
          <div className="final">  
            {/* SELECCIÓN DE TEMA */}
            <div className="section-container">
              <h3 className="mode-title">SELECT THE TOPIC</h3>
              <label className="topic-option">
                <input
                  type="radio"
                  name="topic"
                  checked={!isWild}
                  onChange={handleCustomSelection}
                />
                CUSTOM
              </label>
              <div className="topic-options">
                <label className={`checkbox-container ${isWild ? "disabled" : ""}`}>
                  <input
                    type="checkbox"
                    disabled={isWild}
                    checked={selectedTopic === "movies"}
                    onChange={() => handleTopicChange("movies")}
                  />
                  MOVIES
                </label>
                <label className={`checkbox-container ${isWild ? "disabled" : ""}`}>
                  <input
                    type="checkbox"
                    disabled={isWild}
                    checked={selectedTopic === "flags"}
                    onChange={() => handleTopicChange("flags")}
                  />
                  FLAGS
                </label>
                <label className={`checkbox-container ${isWild ? "disabled" : ""}`}>
                  <input
                    type="checkbox"
                    disabled={isWild}
                    checked={selectedTopic === "music"}
                    onChange={() => handleTopicChange("music")}
                  />
                  MUSIC
                </label>
              </div>
              <label className="topic-option wild">
                <input
                  type="radio"
                  name="topic"
                  checked={isWild}
                  onChange={handleWildSelection}
                />
                WILD - EVERYTHING ALL AT ONCE!
              </label>
            </div>
    
            {/* SELECCIÓN DE MODO */}
            <div className="section-container">
              <h3 className="mode-title">SELECT THE MODE</h3>
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={selectedMode === "rounds"}
                  onChange={() => handleModeChange("rounds")}
                />
                ROUNDS
              </label>
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={selectedMode === "time"}
                  onChange={() => handleModeChange("time")}
                />
                TIME
              </label>
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={selectedMode === "hide"}
                  onChange={() => handleModeChange("hide")}
                />
                HIDE
              </label>
            </div>
          </div>
          {/* BOTÓN PARA EMPEZAR */}
          <button
            className={`btn start-game ${isStartDisabled ? "disabled" : ""}`}
            onClick={handleStartGame}
            disabled={isStartDisabled}
          >
            PLAY NOW
          </button>
        </>
      )}
    </div>
  );
  
}

export default GameModeSelection;
