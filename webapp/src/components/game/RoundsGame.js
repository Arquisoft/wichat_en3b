"use client"

import { useState } from "react";
import { Typography } from "@mui/material";
import BaseGame from "./BaseGameLayout";

function RoundsGame() {
  const totalRounds = 10;
  const [round, setRound] = useState(1);

  return (
    <BaseGame onNewGame={() => setRound(1)} onRoundComplete={() => setRound(round + 1)} gameEnding={() => round === totalRounds}>
      <Typography variant="h4" component="h2" align="center" gutterBottom color="primary" sx={{ fontWeight: "bold" }}>
        Round {round}/{totalRounds}
      </Typography>
    </BaseGame>
  )
}

export default RoundsGame;