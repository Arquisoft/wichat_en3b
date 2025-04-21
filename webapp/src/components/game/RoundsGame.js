"use client"

import { Typography } from "@mui/material";
import BaseGame from "./BaseGameLayout";
import { useState } from "react";

function RoundsGame() {
  const totalRounds = 10;
  const [round, setRound] = useState(1);

  const onNewGame = () => {
    setRound(1);
  }

  const onRoundComplete = async () => {
    setRound(round + 1);
  }

  const gameEnding = () => {
    console.log(round, totalRounds, round === totalRounds);
    return round === totalRounds;
  }

  return (
    <BaseGame onNewGame={onNewGame} onRoundComplete={onRoundComplete} gameEnding={gameEnding}>
      <Typography variant="h4" component="h2" align="center" gutterBottom color="primary" sx={{ fontWeight: "bold" }}>
        Round {round}/{totalRounds}
      </Typography>
    </BaseGame>
  )
}

export default RoundsGame;