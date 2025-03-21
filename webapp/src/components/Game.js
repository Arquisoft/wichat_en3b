"use client"

import { useEffect, useState } from "react"
import { AppBar, Toolbar, Typography, Button, Card, CardContent, Grid, Box, Container, Paper, CircularProgress } from "@mui/material"
import { styled } from "@mui/material/styles"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import PhoneIcon from "@mui/icons-material/Phone"
import ChatIcon from "@mui/icons-material/Chat"
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn"

import axios from "axios"
import Chat from "./LLMChat"

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000"

// Custom styled components
const GameContainer = styled(Container)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}))

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: "linear-gradient(to left, #3f51b5, #7e57c2)",
  boxShadow: theme.shadows[3],
}))

const LogoButton = styled(Button)(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: "bold",
  color: theme.palette.common.white,
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
}))

const ScoreChip = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  backgroundColor: "#7860d2",
  color: theme.palette.common.white,
  borderRadius: 20,
  display: "inline-flex",
  alignItems: "center",
  fontWeight: "bold",
}))

const CoinsChip = styled(Button)(({ theme }) => ({
  backgroundColor: "#ffc107",
  color: "#333",
  borderRadius: 20,
  fontWeight: "bold",
  "&:hover": {
    backgroundColor: "#ffb300",
  },
}))

const LifelineButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "isUsed" && prop !== "colorVariant",
})(({ theme, isUsed, colorVariant }) => ({
  width: "100%",
  marginBottom: theme.spacing(2),
  backgroundColor: isUsed
    ? theme.palette.grey[300]
    : colorVariant === "blue"
      ? theme.palette.primary.main
      : colorVariant === "green"
        ? theme.palette.success.main
        : theme.palette.secondary.main,
  color: isUsed ? theme.palette.text.disabled : theme.palette.common.white,
  "&:hover": {
    backgroundColor: isUsed
      ? theme.palette.grey[300]
      : colorVariant === "blue"
        ? theme.palette.primary.dark
        : colorVariant === "green"
          ? theme.palette.success.dark
          : theme.palette.secondary.dark,
    transform: isUsed ? "none" : "scale(1.03)",
  },
  transition: theme.transitions.create(["background-color", "transform"], {
    duration: theme.transitions.duration.short,
  }),
}))

const OptionButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "isHidden",
})(({ theme, isHidden, hasSelectedAnswer, isSelected, isCorrect }) => ({
  padding: theme.spacing(2),
  fontSize: "1.5rem",
  fontWeight: "bold",
  visibility: isHidden ? "hidden" : "visible",
  backgroundColor:
    isCorrect && hasSelectedAnswer // If it's the correct answer, always green
      ? theme.palette.success.main
      : isSelected // If it's the selected answer
        ? theme.palette.error.main // Incorrect selection turns red
        : theme.palette.primary.main, // Default color

  color: theme.palette.common.white,
  "&:hover": {
    backgroundColor:
      isCorrect && hasSelectedAnswer
        ? theme.palette.success.dark
        : isSelected
          ? theme.palette.error.dark
          : theme.palette.primary.dark,
    transform: "scale(1.03)",
    boxShadow: theme.shadows[4],
  },
  transition: theme.transitions.create(["background-color", "transform", "box-shadow"], {
    duration: theme.transitions.duration.short,
  }),
}))

const ImageContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  marginBottom: theme.spacing(3),
  "& img": {
    maxHeight: 250,
    objectFit: "cover",
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
  },
}))

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6),
  height: "100%",
  minHeight: 300,
}))

function Game() {
  const totalRounds = 10;
  
  const [round, setRound] = useState(1);
  const [roundData, setRoundData] = useState(null);
  const [score, setScore] = useState(0);
  
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [callFriendUsed, setCallFriendUsed] = useState(false);
  const [useChatUsed, setUseChatUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [chatKey, setChatKey] = useState(0); // resets the chat component every time it is updated

  // Function to load the data for each round.
  const loadRound = async () => {
    try {
      setLoading(true)
      setChatKey(chatKey + 1);
      
      const response = await axios.get(`${apiEndpoint}/getRound`)
      setHiddenOptions([])
      return response.data
    } catch (error) {
      console.error("Error fetching data from question service:", error)
      setLoading(false)
    }
  }

  const gameSetup = async () => {
    try {
      // First round
      const data = await loadRound()
      setRoundData(data)
    } catch (error) {
      console.error("Error fetching data from question service:", error)
      setLoading(false)
    }
  }

  // Set up the game when the component mounts
  useEffect(() => {
    gameSetup();
  }, []);

  // Check if the game is still loading after modifying the round data
  useEffect(() => {
    if (roundData && roundData.items.length > 0) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [roundData]);

  // Load data every 500ms while the game is loading
  useEffect(() => {
    let intervalId;
  
    if (loading) {
      intervalId = setInterval(async () => {
        try {
          const data = await loadRound();
          if (data && data.items.length > 0) {
            setRoundData(data);
          }
        } catch (error) {
          console.error("Error in interval loading round data:", error);
        }
      }, 500);
    }
  
    return () => {
      if (intervalId) {
        clearInterval(intervalId); // Cleanup interval on unmount or when loading stops
      }
    };
  }, [loading]);

  const handleOptionSelect = async (index) => {
    if (selectedAnswer !== null) return;

    const isCorrect = CorrectOption(index);
    setSelectedAnswer(index);

    if (isCorrect) {
      setScore(score + 50);
    }

    setTimeout(async () => {
      if (round === totalRounds) {
        alert("Game Over");
        setRoundData(null);
        setRound(1);
        setScore(0);
        setFiftyFiftyUsed(false);
        setCallFriendUsed(false);
        setUseChatUsed(false);
        setHiddenOptions([]);
        setSelectedAnswer(null);
        gameSetup();
        return;
      }

      setSelectedAnswer(null);

      setRound(round + 1);
      setRoundData(null);

      try {
        const data = await loadRound();
        setRoundData(data);
      } catch (error) {
        console.error("Error loading new round", error);
        setLoading(false);
      }
    }, 2000);
  }

  const CorrectOption = (index) => {
    if (!roundData) return false
    const selectedName = roundData.items[index].name
    const correctName = roundData.itemWithImage.name
    return selectedName === correctName
  }

  const handleFiftyFifty = () => {
    if (fiftyFiftyUsed || !roundData) return

    // Find the correct answer index
    const correctIndex = roundData.items.findIndex((item) => item.name === roundData.itemWithImage.name)

    // Get two random incorrect indices
    let incorrectIndices = [0, 1, 2, 3].filter((i) => i !== correctIndex)
    // Shuffle and take first two
    incorrectIndices = incorrectIndices.sort(() => 0.5 - Math.random()).slice(0, 2)

    setHiddenOptions(incorrectIndices)
    setFiftyFiftyUsed(true)
  }

  const handleCallFriend = () => {
    if (callFriendUsed || !roundData) return
    // Implement logic to simulate calling a friend
    alert("Your friend thinks the answer might be: " + roundData.itemWithImage.name)
    setCallFriendUsed(true)
  }

  const handleUseChat = () => {
    if (useChatUsed || !roundData) return
    // Implement logic to use the chat
    alert("Chat is now available to help you!")
    setUseChatUsed(true)
  }

  return (
    <GameContainer maxWidth="100%" height="100%">
      {/* Top Bar */}
      <StyledAppBar position="static">
        <Toolbar>
          <LogoButton color="inherit" disableRipple>
            TRIVIA
          </LogoButton>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex", gap: 2 }}>
            <CoinsChip variant="contained" startIcon={<MonetizationOnIcon />}>
              Coins
            </CoinsChip>
            <ScoreChip elevation={0}>
              <EmojiEventsIcon sx={{ mr: 1 }} />
              Score: {score}
            </ScoreChip>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Main Content */}
      <Grid container spacing={3} sx={{ flex: 1, mt: 2 }}>
        {/* Left Side (Lifelines) */}
        <Grid item xs={12} md={3}>
          <Card elevation={3} >
            <CardContent>
              <Typography variant="h4" component="h2" gutterBottom color="primary" sx={{ fontWeight: "bold", textDecoration: "underline" }}>
                Lifelines
              </Typography>
              <LifelineButton
                variant="contained"
                startIcon={<HelpOutlineIcon />}
                onClick={handleFiftyFifty}
                disabled={fiftyFiftyUsed}
                isUsed={fiftyFiftyUsed}
                colorVariant="blue"
              >
                50/50 - 100 🪙 {fiftyFiftyUsed && "(Used)"}
              </LifelineButton>
              <LifelineButton
                variant="contained"
                startIcon={<PhoneIcon />}
                onClick={handleCallFriend}
                disabled={callFriendUsed}
                isUsed={callFriendUsed}
                colorVariant="green"
              >
                Call a Friend - 150 🪙 {callFriendUsed && "(Used)"}
              </LifelineButton>
              <LifelineButton
                variant="contained"
                startIcon={<ChatIcon />}
                onClick={handleUseChat}
                disabled={useChatUsed}
                isUsed={useChatUsed}
                colorVariant="purple"
              >
                Use the Chat - 200 🪙 {useChatUsed && "(Used)"}
              </LifelineButton>
            </CardContent>
          </Card>
        </Grid>

        {/* Game Area */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: "100%", minHeight: 400 }}>
            <CardContent>
              {loading ? (
                <LoadingContainer>
                  <CircularProgress size={60} thickness={4} color="primary" />
                  <Typography variant="h6" color="textSecondary" sx={{ mt: 3 }}>
                    Loading question...
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Get ready for round {round}!
                  </Typography>
                </LoadingContainer>
              ) : (
                roundData && (
                  <>
                    <Typography variant="h4" component="h2" align="center" gutterBottom color="primary" sx={{ fontWeight: "bold", textDecoration: "underline" }}>
                      Round {round}/{totalRounds}
                    </Typography>
                    <ImageContainer>
                      <img
                        src={roundData.itemWithImage.imageUrl || "/placeholder.svg"}
                        alt={roundData.itemWithImage.imageAltText || "Item image"}
                      />
                    </ImageContainer>
                    <Grid container spacing={2}>
                      {roundData.items.map((item, index) => (
                        <Grid item xs={6} key={index}>
                          <OptionButton
                            variant="contained"
                            fullWidth
                            onClick={() => handleOptionSelect(index)}
                            disabled={hiddenOptions.includes(index)}
                            isHidden={hiddenOptions.includes(index)}
                            hasSelectedAnswer={selectedAnswer !== null}
                            isSelected={selectedAnswer === index}
                            isCorrect={CorrectOption(index)}
                          >
                            {item.name}
                          </OptionButton>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side (Chat) */}
        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ height: "100%" }}>
            <CardContent>
              <Chat key={chatKey} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </GameContainer>
  )
}

export default Game;