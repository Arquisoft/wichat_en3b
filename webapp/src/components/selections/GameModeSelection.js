"use client"

import { useState } from "react"
import { Typography, Box, Grid } from "@mui/material"
import { useNavigate } from 'react-router';
import { StyledContainer, SectionPaper, SectionTitle, StyledButton, StyledCard,
  StyledCardContent,
  StyledCardActions,
  ModeTitle,
  ModeDescription } from './SelectionStyles'

function GameModeSelection() {
  const [selectedMode, setSelectedMode] = useState(null)

  const handleModeChange = (mode) => {
    setSelectedMode(mode === selectedMode ? null : mode)
  }

  const navigate = useNavigate();

  const gameModes = [
    {
      id: "rounds",
      name: "ROUNDS",
      description: "Play through a set of 10 questions and test your knowledge. Perfect for a quick game session.",
      path: "/roundsgame",
    },
    {
      id: "time",
      name: "TIME",
      description: "Race against the clock! Answer as many questions as you can before time runs out.",
      path: "/timegame",
    },
    {
      id: "hide",
      name: "HIDE",
      description:
        "Challenge yourself with hidden images. The picture will get clearer as time goes by, guess it before it is completely revealed!",
      path: "/hidegame",
    },
  ]

  const goToGame = (path) => {
    navigate(path);
  }
  
  return (
    <StyledContainer maxWidth="md">
      <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#3f51b5" }}>
        TRIVIA GAME
      </Typography>

      <SectionPaper elevation={3}>
        <SectionTitle variant="h5">SELECT THE MODE</SectionTitle>
        <Grid container spacing={3}>
          {gameModes.map((mode) => (
            <Grid item xs={12} md={4} key={mode.id}>
              <StyledCard>
                <StyledCardContent>
                  <ModeTitle variant="h6" component="h2">
                    {mode.name}
                  </ModeTitle>
                  <ModeDescription variant="body2">{mode.description}</ModeDescription>
                </StyledCardContent>
                <StyledCardActions>
                  <StyledButton variant="contained" size="small" onClick={() => goToGame(mode.path)}>
                    PLAY {mode.name}
                  </StyledButton>
                </StyledCardActions>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </SectionPaper>
    </StyledContainer>
  )
}

export default GameModeSelection;