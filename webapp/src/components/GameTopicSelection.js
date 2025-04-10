"use client"

import { useState } from "react"
import { Container, Typography, Radio, RadioGroup, FormControlLabel, FormControl, Button, Paper, Box, Grid } from "@mui/material"
import { styled } from "@mui/material/styles"
import { useNavigate } from "react-router"
import { LocationCity, Flag, SportsBasketball, MusicNote, Public, Sports, Map, Event, PushPin, Piano, Female, SportsSoccer, Language, SportsMotorsports, People, Landscape} from "@mui/icons-material"

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

const TopicOption = styled(FormControlLabel, {
  shouldForwardProp: (prop) => prop !== "isSelected",
})(({ theme, isSelected }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  background: isSelected ? "linear-gradient(to right, #2196f3, #9c27b0)" : theme.palette.background.paper,
  color: isSelected ? theme.palette.common.white : theme.palette.text.primary,
  width: "100%",
  margin: 0,
  transition: theme.transitions.create(["background", "color"], {
    duration: theme.transitions.duration.short,
  }),
  "& .MuiFormControlLabel-label": {
    fontWeight: "bold",
  },
}))

const TopicButton = styled(Button, {
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
  "& .MuiButton-startIcon": {
    marginRight: theme.spacing(1),
  },
}))

const GameTopicSelection = () => {
  const navigate = useNavigate();

  // Define all available topics in a constant
  const ALL_TOPICS = [
    "city", "flag", "athlete", "singer", "country", "sport", 
    "spanishProvince", "spanishCommunityFlag", "historicalEvent", 
    "famousPlace", "spanishCity", "musicalInstrument", 
    "historicalWoman", "sportingGijonPlayer", "oviedoPlayer", 
    "realMadridPlayer", "barcelonaPlayer", "atleticoMadridPlayer", 
    "language", "f1Driver", "racingCircuit", "asturianFamous", 
    "asturianCouncil"
  ];

  const TOPIC_DATA = [
    { key: "city", label: "CITIES", icon: <LocationCity /> },
    { key: "flag", label: "FLAGS", icon: <Flag /> },
    { key: "athlete", label: "ATHLETES", icon: <SportsBasketball /> },
    { key: "singer", label: "SINGERS", icon: <MusicNote /> },
    { key: "country", label: "COUNTRIES", icon: <Public /> },
    { key: "sport", label: "SPORTS", icon: <Sports /> },
    { key: "spanishProvince", label: "SPANISH PROVINCES", icon: <Map /> },
    { key: "spanishCommunityFlag", label: "SPANISH COMMUNITIES FLAGS", icon: <Flag /> },
    { key: "historicalEvent", label: "HISTORICAL EVENTS", icon: <Event /> },
    { key: "famousPlace", label: "FAMOUS PLACES", icon: <PushPin /> },
    { key: "spanishCity", label: "SPANISH CITIES", icon: <LocationCity /> },
    { key: "musicalInstrument", label: "MUSICAL INSTRUMENTS", icon: <Piano /> },
    { key: "historicalWoman", label: "HISTORICAL WOMEN", icon: <Female /> },
    { key: "sportingGijonPlayer", label: "SPORTING GIJON PLAYERS", icon: <SportsSoccer /> },
    { key: "oviedoPlayer", label: "OVIEDO PLAYERS", icon: <SportsSoccer /> },
    { key: "realMadridPlayer", label: "REAL MADRID PLAYERS", icon: <SportsSoccer /> },
    { key: "barcelonaPlayer", label: "BARCELONA PLAYERS", icon: <SportsSoccer /> },
    { key: "atleticoMadridPlayer", label: "ATLETICO MADRID PLAYERS", icon: <SportsSoccer /> },
    { key: "language", label: "LANGUAGES", icon: <Language /> },
    { key: "f1Driver", label: "F1 DRIVERS", icon: <SportsMotorsports /> },
    { key: "racingCircuit", label: "RACING CIRCUITS", icon: <SportsMotorsports /> },
    { key: "asturianFamous", label: "ASTURIAN FAMOUS", icon: <People /> },
    { key: "asturianCouncil", label: "ASTURIAN COUNCILS", icon: <Landscape /> },
  ]  

  const [selectedTopics, setSelectedTopics] = useState([])
  const [isWild, setIsWild] = useState(false)

  const handleTopicChange = (topic) => {
    if (!isWild) {
      setSelectedTopics((prevTopics) => {
        if (prevTopics.includes(topic)) {
          return prevTopics.filter((t) => t !== topic)
        } else {
          return [...prevTopics, topic]
        }
      })
    }
  }

  const handleWildSelection = () => {
    setIsWild(true)
    // Select all available topics instead of just the initial four
    setSelectedTopics([...ALL_TOPICS])
  }

  const handleCustomSelection = () => {
    setIsWild(false)
    setSelectedTopics([])
  }

  const isNextDisabled = selectedTopics.length === 0

  const startGame = async () => {
    try {
      // Saving the topics in session storage
      if (!selectedTopics || !Array.isArray(selectedTopics) || selectedTopics.length === 0) {
          throw new Error('Invalid topics parameter'); 
      }

      sessionStorage.setItem('selectedTopics', JSON.stringify(selectedTopics));
      navigate("/gamemode");
    } catch (error) {
      console.error("Error selecting topics:", error);
    }
  };

  return (
    <StyledContainer maxWidth="md">
      <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#3f51b5" }}>
        TRIVIA GAME
      </Typography>

      <SectionPaper elevation={3}>
        <SectionTitle variant="h5">SELECT THE TOPIC</SectionTitle>
        <FormControl component="fieldset" fullWidth>
          <RadioGroup value={isWild ? "wild" : "custom"}>
            <TopicOption
              value="custom"
              control={<Radio color="primary" />}
              label="CUSTOM"
              onChange={handleCustomSelection}
              isSelected={!isWild}
            />

            {/* Topic selection buttons - centered */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                mb: 3,
                mt: 2,
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  maxWidth: "600px",
                  mx: "auto",
                }}
              >
                <Grid container spacing={2} justifyContent="center">
                  {TOPIC_DATA.map(({ key, label, icon }) => (
                    <Grid item xs={12} sm={3} key={key}>
                      <TopicButton
                        fullWidth
                        variant="outlined"
                        startIcon={icon}
                        onClick={() => handleTopicChange(key)}
                        disabled={isWild}
                        isSelected={selectedTopics.includes(key)}
                      >
                        {label}
                      </TopicButton>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>

            <TopicOption
              value="wild"
              control={<Radio color="primary" />}
              label="WILD - EVERYTHING ALL AT ONCE!"
              onChange={handleWildSelection}
              isSelected={isWild}
            />
          </RadioGroup>
        </FormControl>
      </SectionPaper>

      {/* Show selected topics count when in custom mode */}
      {!isWild && selectedTopics.length > 0 && (
        <Typography variant="subtitle1" color="primary" sx={{ fontWeight: "bold", textAlign: "center" }}>
          {selectedTopics.length} topic{selectedTopics.length > 1 ? "s" : ""} selected
        </Typography>
      )}

      {/* Show all topics selected when in wild mode */}
      {isWild && (
        <Typography variant="subtitle1" color="primary" sx={{ fontWeight: "bold", textAlign: "center" }}>
          All {ALL_TOPICS.length} topics selected
        </Typography>
      )}

      <StyledButton
        variant="contained"
        color="primary"
        size="large"
        onClick={startGame}
        disabled={isNextDisabled}
        fullWidth>
        NEXT
      </StyledButton>
    </StyledContainer>
  )
}

export default GameTopicSelection;