"use client"

import { useState } from "react"
import { Container, Typography, FormControlLabel, FormControl, Checkbox, Button, Paper, Box } from "@mui/material"
import { styled } from "@mui/material/styles"
import { NavLink } from 'react-router';

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

function GameModeSelection() {
  const [selectedMode, setSelectedMode] = useState(null)

  const handleModeChange = (mode) => {
    setSelectedMode(mode === selectedMode ? null : mode)
  }

  return (
    <StyledContainer maxWidth="md">
      <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#3f51b5" }}>
        TRIVIA GAME
      </Typography>

      <SectionPaper elevation={3}>
        <SectionTitle variant="h5">SELECT THE MODE</SectionTitle>
        <FormControl component="fieldset" fullWidth>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  name="rounds"
                  checked={selectedMode === "rounds"}
                  onChange={() => handleModeChange("rounds")}
                  color="primary"
                />
              }
              label="ROUNDS"
            />
            <FormControlLabel
              control={
                <Checkbox checked={selectedMode === "time"} onChange={() => handleModeChange("time")} color="primary" name="time" />
              }
              label="TIME"
            />
            <FormControlLabel
              control={
                <Checkbox checked={selectedMode === "hide"} onChange={() => handleModeChange("hide")} color="primary" name="hide" />
              }
              label="HIDE"
            />
          </Box>
        </FormControl>
      </SectionPaper>

      <NavLink to="/game">
        <StyledButton
          variant="contained"
          color="primary"
          size="large"
          disabled={!selectedMode}
          fullWidth
        >
          NEXT
        </StyledButton>
      </NavLink>
    </StyledContainer>
  )
}

export default GameModeSelection;