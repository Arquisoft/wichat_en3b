"use client"

import { useState } from "react"
import { Container, Typography, Button, Paper, Box, Grid, TextField, Collapse, Divider, FormControlLabel } from "@mui/material"
import { styled } from "@mui/material/styles"
import { useNavigate } from "react-router"
import {
  LocationCity, Flag, SportsBasketball, MusicNote, Public, Sports, Map, Event, PushPin,
  Piano, Female, SportsSoccer, Language, SportsMotorsports, People, Landscape
} from "@mui/icons-material"
import useAxios from "../../hooks/useAxios"

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
  background: theme.palette.background.paper,
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
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5, 4),
  fontSize: "1.2rem",
  fontWeight: "bold",
  borderRadius: 30,
  background: theme.palette.gradient.main.right,
  "&:hover": {
    background: theme.palette.gradient.hover.right,
    transform: "scale(1.03)",
    color: "white"
  },
  "&.Mui-disabled": {
    background: theme.palette.background.paper,
    color: theme.palette.text.disabled,
  },
  transition: theme.transitions.create(["transform"], {
    duration: theme.transitions.duration.short,
  }),
}))


const TopicOption = styled(FormControlLabel, {
  shouldForwardProp: (prop) => prop !== "isSelected",
})(({ theme, isSelected }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  background: isSelected ? theme.palette.gradient.main.left : theme.palette.background.default,
  color: isSelected ? theme.palette.common.white : theme.palette.text.primary,
  width: "100%",
  margin: 0,
  "& .MuiFormControlLabel-label": {
    fontWeight: "bold",
  },
}))


const TopicButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "isSelected",
})(({ theme, isSelected }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.shape.borderRadius,
  fontWeight: "bold",
  background: isSelected ? theme.palette.gradient.main.left : theme.palette.background.default,
  color: isSelected ? theme.palette.common.white : theme.palette.text.primary,
  border: isSelected ? "none" : `1px solid ${theme.palette.divider}`,
  boxShadow: isSelected ? theme.shadows[3] : "none",
  textTransform: "none",
  transition: theme.transitions.create(["background", "transform", "box-shadow"], {
    duration: theme.transitions.duration.short,
  }),
  width: "100%",
  height: "100%",
  "&:hover": {
    background: isSelected ? theme.palette.gradient.hover.left : theme.palette.action.hover,
    transform: "translateY(-2px)",
    boxShadow: isSelected ? theme.shadows[4] : theme.shadows[1],
  },
  "& .MuiButton-startIcon": {
    marginRight: theme.spacing(1),
  },
}))

const CATEGORY_MAP = {
  "Geography": [
    { key: "city", label: "CITIES", icon: <LocationCity /> },
    { key: "country", label: "COUNTRIES", icon: <Public /> },
    { key: "spanishProvince", label: "SPANISH PROVINCES", icon: <Map /> },
    { key: "spanishCity", label: "SPANISH CITIES", icon: <LocationCity /> },
    { key: "famousPlace", label: "FAMOUS PLACES", icon: <PushPin /> },
    { key: "asturianCouncil", label: "ASTURIAN COUNCILS", icon: <Landscape /> },
  ],
  "Flags & Languages": [
    { key: "flag", label: "FLAGS", icon: <Flag /> },
    { key: "spanishCommunityFlag", label: "SPANISH COMMUNITIES FLAGS", icon: <Flag /> },
    { key: "language", label: "LANGUAGES", icon: <Language /> },
  ],
  "History": [
    { key: "historicalEvent", label: "HISTORICAL EVENTS", icon: <Event /> },
    { key: "historicalWoman", label: "HISTORICAL WOMEN", icon: <Female /> },
  ],
  "Music": [
    { key: "singer", label: "SINGERS", icon: <MusicNote /> },
    { key: "musicalInstrument", label: "MUSICAL INSTRUMENTS", icon: <Piano /> },
  ],
  "Sports": [
    { key: "athlete", label: "ATHLETES", icon: <SportsBasketball /> },
    { key: "sport", label: "SPORTS", icon: <Sports /> },
    { key: "sportingGijonPlayer", label: "SPORTING GIJON PLAYERS", icon: <SportsSoccer /> },
    { key: "oviedoPlayer", label: "OVIEDO PLAYERS", icon: <SportsSoccer /> },
    { key: "realMadridPlayer", label: "REAL MADRID PLAYERS", icon: <SportsSoccer /> },
    { key: "barcelonaPlayer", label: "BARCELONA PLAYERS", icon: <SportsSoccer /> },
    { key: "atleticoMadridPlayer", label: "ATLETICO MADRID PLAYERS", icon: <SportsSoccer /> },
    { key: "f1Driver", label: "F1 DRIVERS", icon: <SportsMotorsports /> },
    { key: "racingCircuit", label: "RACING CIRCUITS", icon: <SportsMotorsports /> },
  ],
  "Famous People": [
    { key: "asturianFamous", label: "ASTURIAN FAMOUS", icon: <People /> },
  ]
}

const GameTopicSelection = () => {
  const navigate = useNavigate()
  const [selectedTopics, setSelectedTopics] = useState([])
  const [isWild, setIsWild] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const ALL_TOPICS = Object.values(CATEGORY_MAP).flat().map((t) => t.key)

  const handleTopicChange = (topic) => {
    if (!isWild) {
      setSelectedTopics((prev) =>
        prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
      )
    }
  }

  const handleWildSelection = () => {
    setIsWild(true)
    setSelectedTopics([...ALL_TOPICS])
  }

  const handleCustomSelection = () => {
    setIsWild(false)
    setSelectedTopics([])
  }

  const isNextDisabled = selectedTopics.length === 0

  const startGame = async () => {
    try {
      if (!selectedTopics.length) throw new Error("Invalid topics parameter")
      sessionStorage.setItem("selectedTopics", JSON.stringify(selectedTopics))
      navigate("/gamemode")
    } catch (error) {
      console.error("Error selecting topics:", error)
    }
  }

  const filterBySearch = (categoryMap, searchTerm) => {
    return Object.entries(categoryMap).map(([category, topics]) => {
      const filteredTopics = topics.filter(({ label, key }) =>
        label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase()) ||  // Check the category itself
        key.toLowerCase().includes(searchTerm.toLowerCase())        // Check the topic key
      );

      // Only include categories that have matching topics or category names
      if (filteredTopics.length > 0 || category.toLowerCase().includes(searchTerm.toLowerCase())) {
        return { category, topics: filteredTopics }; // Return category with filtered topics
      }
      return null; // Exclude categories with no matches
    }).filter(item => item !== null); // Remove null entries
  };


  return (
    <StyledContainer maxWidth="md">
      <Typography variant="h3" align="center" fontWeight="bold" color="primary.main">
        TRIVIA GAME
      </Typography>

      <SectionPaper>
        <SectionTitle variant="h5">CHOOSE YOUR TOPICS</SectionTitle>

        <TextField
          fullWidth
          margin="normal"
          variant="outlined"
          label="Search topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            sx: {
              backgroundColor: "#f0f4ff",
              borderRadius: 2,
              fontSize: "1rem",
              boxShadow: 1,
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: 3,
                backgroundColor: "#e8f0fe",
              },
              "&.Mui-focused": {
                boxShadow: 4,
                backgroundColor: "#e3ecff",
              },
            }
          }}
          InputLabelProps={{
            sx: {
              color: "primary.main",
              fontWeight: "bold",
            }
          }}
        />


        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap", mt: 2 }}>
          <StyledButton
            variant={isWild ? "outlined" : "contained"}
            onClick={handleCustomSelection}
            color="primary"
            sx={{
              background: !isWild ? "linear-gradient(to right, #3f51b5, #7e57c2)" : "transparent",
              border: isWild ? "2px solid #7e57c2" : "none",
              color: isWild ? "#7e57c2" : "#fff",
            }}
          >
            🎯 Custom
          </StyledButton>

          <StyledButton
            variant={isWild ? "contained" : "outlined"}
            onClick={handleWildSelection}
            color="secondary"
            sx={{
              background: isWild ? "linear-gradient(to right, #3f51b5, #7e57c2)" : "transparent",
              border: !isWild ? "2px solid #3f51b5" : "none",
              color: !isWild ? "#3f51b5" : "#fff",
            }}
          >
            🌀 Wild Mode
          </StyledButton>
        </Box>


        <Collapse in={!isWild}>
          {filterBySearch(CATEGORY_MAP, searchTerm).map(({ category, topics }) => {
            return (
              <Box key={category} sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#5e35b1", mb: 1 }}>
                  {category}
                </Typography>
                <Grid container spacing={2}>
                  {topics.map(({ key, label, icon }) => (
                    <Grid item xs={6} sm={4} md={3} key={key}>
                      <TopicButton
                        startIcon={icon}
                        onClick={() => handleTopicChange(key)}
                        isSelected={selectedTopics.includes(key)}
                      >
                        {label}
                      </TopicButton>
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ mt: 2 }} />
              </Box>
            );
          })}
        </Collapse>



        <Typography variant="subtitle1" color="primary" sx={{ textAlign: "center", mt: 2 }}>
          {isWild
            ? `All ${ALL_TOPICS.length} topics selected`
            : `${selectedTopics.length} topic${selectedTopics.length !== 1 ? "s" : ""} selected`}
        </Typography>

        <StyledButton
          variant="contained"
          color="primary"
          size="large"
          onClick={startGame}
          disabled={isNextDisabled}
          fullWidth
        >
          NEXT
        </StyledButton>

        <StyledButton
          variant="contained"
          color="secondary"
          size="large"
          onClick={() => navigate("/home")}
          fullWidth
          sx={{
            background: "linear-gradient(to right, #9e9e9e, #616161)",
            "&:hover": {
              background: "linear-gradient(to right, #757575, #424242)",
            }
          }}
        >
          BACK HOME
        </StyledButton>
      </SectionPaper>
    </StyledContainer>
  )
}

export default GameTopicSelection;