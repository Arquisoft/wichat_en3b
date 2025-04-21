"use client"

import { useState } from "react"
import { Typography, Box } from "@mui/material"
import { useNavigate } from 'react-router';
import { StyledContainer, SectionPaper, SectionTitle, StyledButton, ModeButton } from './SelectionStyles'

function GameModeSelection() {
  const [selectedMode, setSelectedMode] = useState(null)

  const handleModeChange = (mode) => {
    setSelectedMode(mode === selectedMode ? null : mode)
  }

  const navigate = useNavigate();

  const goToGame = (mode) => {
    switch (mode) {
      case "rounds": navigate("/roundsgame"); break;
      case "time": navigate("/timegame"); break;
      case "hide": alert("Not yet implemented"); break;
      default: break;
    }
  }
  
  return (
    <StyledContainer maxWidth="md">
      <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#3f51b5" }}>
        TRIVIA GAME
      </Typography>

      <SectionPaper elevation={3}>
        <SectionTitle variant="h5">SELECT THE MODE</SectionTitle>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center", mt: 2 }}>
          <ModeButton
            fullWidth
            onClick={() => handleModeChange("rounds")}
            isSelected={selectedMode === "rounds"}
            data-selected={selectedMode === "rounds"} // For the test (isSelected is not a valid HTML attribute and therefore is not rendered automatically)
          >
            ROUNDS
          </ModeButton>
          <ModeButton
            fullWidth
            onClick={() => handleModeChange("time")}
            isSelected={selectedMode === "time"}
            data-selected={selectedMode === "time"} // For the test (isSelected is not a valid HTML attribute and therefore is not rendered automatically)
          >
            TIME
          </ModeButton>
          <ModeButton
            fullWidth
            onClick={() => handleModeChange("hide")}
            isSelected={selectedMode === "hide"}
            data-selected={selectedMode === "hide"} // For the test (isSelected is not a valid HTML attribute and therefore is not rendered automatically)
          >
            HIDE
          </ModeButton>
        </Box>
      </SectionPaper>

      <StyledButton
        variant="contained"
        color="primary"
        size="large"
        disabled={!selectedMode}
        onClick={() => goToGame(selectedMode)}
        fullWidth>
        NEXT
      </StyledButton>
    </StyledContainer>
  )
}

export default GameModeSelection;