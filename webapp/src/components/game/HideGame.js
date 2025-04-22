"use client"

import { useEffect, useRef, useState } from "react";
import { alpha, LinearProgress, Typography } from "@mui/material";
import BaseGame from "./BaseGameLayout";
import useTheme from "../../hooks/useTheme";

function HideGame() {
  const { theme } = useTheme();

  const totalRounds = 10;
  const [round, setRound] = useState(1);
  const roundTime = 30;
  const [roundTimeLeft, setRoundTimeLeft] = useState(roundTime);
  const [blur, setBlur] = useState(50);
  const handleOptionSelectRef = useRef(null);

  const resetValues = () => {
    setRoundTimeLeft(roundTime);
    setBlur(50);
  }

  const onNewGame = () => {
    setRound(1);
    resetValues();
  }

  const onRoundComplete = () => {
    setRound((prevRound) => prevRound + 1);
    resetValues();
  }

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsedTime = (Date.now() - startTime) / 1000;
      const remainingTime = Math.max(roundTime - elapsedTime, 0);
      setRoundTimeLeft(remainingTime);

      if (remainingTime <= 0) {
        clearInterval(interval);
        handleOptionSelectRef.current(-1); // Select option -1 to fail the question and skip the round
      }
    }, 100);

    return () => clearInterval(interval);
  }, [round]);

  return (
    <BaseGame onNewGame={onNewGame} onRoundComplete={onRoundComplete} gameEnding={() => round === totalRounds}>
      {({ handleOptionSelect }) => {
        handleOptionSelectRef.current = handleOptionSelect;

        return (
          <>
            <Typography variant="h4" component="h2" align="center" gutterBottom color="primary" sx={{ fontWeight: "bold" }}>
              Round {round}/{totalRounds}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(roundTimeLeft / roundTime) * 100}
              sx={{
                height: 20,
                borderRadius: 5,
                backgroundColor: alpha(theme.palette.text.primary, 0.1),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 5,
                  background: theme.palette.gradient.main.right,
                },
                mb: 3,
              }}
            />
          </>
        );
      }}
    </BaseGame>
  );
}

export default HideGame;