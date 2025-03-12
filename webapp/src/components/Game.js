import React, { useState, useEffect } from "react";
import "./GameStyles.css";
import Chat from './LLMChat/LLMChat';
import axios from 'axios';
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';


function Game() {
    const [round, setRound] = useState(1);
    const totalRounds = 10;
    const [rounds, setRounds] = useState(Array(totalRounds + 1).fill(null));

    //Handles the question logic
    useEffect(() => {
        const fetchRounds = async () => {
            const newRounds = await Promise.all(
                rounds.map(async (_, index) => {
                    const response = await axios.post(`${apiEndpoint}/getRound`);
                    return response.data;
                })
            );
            setRounds(newRounds);
        };

        fetchRounds();
    }, []); 

    //Handles the buttons and the round logic
    const handleOptionClick = async () => {
        if (round < totalRounds) {
            const response = await axios.post(`${apiEndpoint}/getRound`);
            const newRounds = [...rounds];
            newRounds[round + 1] = response.data;
            setRounds(newRounds);
            setRound(round + 1);
        }else {
            setIsGameVisible(false);
            setRounds(Array(totalRounds + 1).fill(null));
            setRound(1);
        };
    }
    

    return (
        <div className="app-container">
            {/* Top Bar */}
            <div className="top-bar">
                <button className="btn logo">LOGO</button>
                <div className="top-right">
                    <button className="btn">Coins 🪙</button>
                    <button className="btn">Score</button>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Left Side */}
                <div className="left-side">
                    <div className="help-section"></div>
                    <div className="help-buttons">
                        <button className="btn help">50/50 - 100 🪙</button>
                        <button className="btn help">Call a Friend - 150 🪙</button>
                        <button className="btn help">Use the Chat - 200 🪙</button>
                    </div>
                </div>

                {/* Game Area */}
                <div className="game-area">
                    <script>
                        let round = axios.post('${apiEndpoint}/getRound');
                    </script>
                    <h2 className="round-info">
                        Round {round}/{totalRounds}
                    </h2>
                    <div className="image-container">
                        {rounds[round] && (
                            <img src={rounds[round].imageUrl} alt="City" className="game-image" />
                        )}
                    </div>
                    <div className="options-grid">
                        {rounds[round] && rounds[round].cities.map((city, index) => (
                            <button key={index} className="btn option" onClick={handleOptionClick}>{city.name}</button>
                        ))}
                    </div>
                </div>

                {/* Right Side (Chat) */}
                <div className="chat-container">
                    <div className="chat-box">
                        {
                            <Chat />
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Game;
