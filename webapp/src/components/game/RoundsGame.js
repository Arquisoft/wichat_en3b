"use client"

import { useState } from "react";
import { Typography } from "@mui/material";
import BaseGame from "./BaseGame";

function RoundsGame() {
  const totalRounds = 5;
  const [round, setRound] = useState(1);

  return (
    <BaseGame onNewGame={() => setRound(1)} onRoundComplete={() => setRound(prev => prev + 1)} isGameOver={round === totalRounds + 1}>
      <Typography variant="h4" component="h2" align="center" gutterBottom color="primary" sx={{ fontWeight: "bold" }}>
        Round {Math.min(round, totalRounds)}/{totalRounds}
      </Typography>
    </BaseGame>
  )
}

export default RoundsGame;