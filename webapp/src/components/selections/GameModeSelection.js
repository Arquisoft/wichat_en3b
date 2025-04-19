"use client"

import { useState } from "react"
import { Container, Typography, Button, Paper, Box } from "@mui/material"
import { styled } from "@mui/material/styles"
import { useNavigate } from 'react-router';

const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(3),
}))

const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  width: "100%",
  background: "linear-gradient(to right, #f5f7fa, #e4e8f0)",
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
}))

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: "bold",
  color: theme.palette.primary.main,
  textAlign: "center",
  textTransform: "uppercase",
  borderBottom: `2px solid ${theme.palette.primary.main}`,
  paddingBottom: theme.spacing(1),
}))

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(1.5, 4),
  fontSize: "1.2rem",
  fontWeight: "bold",
  borderRadius: 30,
  background: "linear-gradient(to right, #3f51b5, #7e57c2)",
  "&:hover": {
    background: "linear-gradient(to right, #303f9f, #5e35b1)",
    transform: "scale(1.03)",
  },
  "&.Mui-disabled": {
    background: theme.palette.grey[300],
    color: theme.palette.text.disabled,
  },
  transition: theme.transitions.create(["background", "transform"], {
    duration: theme.transitions.duration.short,
  }),
}))

const ModeButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "isSelected",
})(({ theme, isSelected }) => ({
  padding: theme.spacing(2, 3),
  borderRadius: theme.shape.borderRadius,
  fontWeight: "bold",
  background: isSelected ? "linear-gradient(to right, #2196f3, #9c27b0)" : theme.palette.background.paper,
  color: isSelected ? theme.palette.common.white : theme.palette.text.primary,
  border: isSelected ? "none" : `1px solid ${theme.palette.divider}`,
  boxShadow: isSelected ? theme.shadows[3] : "none",
  transition: theme.transitions.create(["background", "transform", "box-shadow"], {
    duration: theme.transitions.duration.short,
  }),
  "&:hover": {
    background: isSelected ? "linear-gradient(to right, #1e88e5, #1e88e5)" : theme.palette.action.hover,
    transform: "translateY(-2px)",
    boxShadow: isSelected ? theme.shadows[4] : theme.shadows[1],
  },
  textAlign: "center",
}))

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