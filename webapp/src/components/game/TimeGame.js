"use client"

import { useEffect, useState } from "react"
import { Typography, Box, LinearProgress } from "@mui/material"
import BaseGame from "./BaseGame"

function TimeGame() {
  const TIME = 60;
  const [timeLeft, setTimeLeft] = useState(TIME);
  const [gameEnded, setGameEnded] = useState(false);

  const onNewGame = () => {
    setTimeLeft(TIME);
    setGameEnded(false);
  }

  useEffect(() => {
    if (gameEnded)
      return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsedTime = (Date.now() - startTime) / 1000;
      const remainingTime = Math.max(TIME - elapsedTime, 0);
      setTimeLeft(remainingTime);

      if (remainingTime <= 0) {
        clearInterval(interval);
        setGameEnded(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameEnded]);

  return (
    <BaseGame mode="time" onNewGame={onNewGame} isGameOver={gameEnded}>
      <Box sx={{ width: "100%", mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="h6" fontWeight="bold" color="primary">
            Time remaining: {timeLeft.toFixed(0)}s
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={(timeLeft / TIME) * 100}
          sx={{
            height: 20,
            borderRadius: 5,
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 5,
              backgroundColor: timeLeft > 30 ? "success.main" : timeLeft > 10 ? "warning.main" : "error.main",
            },
          }}
        />
      </Box>
    </BaseGame>
  )
}

export default TimeGame;