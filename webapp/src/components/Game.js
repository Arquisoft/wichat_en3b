"use client"

import { useEffect, useState } from "react"
import { AppBar, Toolbar, Typography, Button, Card, CardContent, Grid, Box, Container, Paper, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import { styled } from "@mui/material/styles"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import PhoneIcon from "@mui/icons-material/Phone"
import ChatIcon from "@mui/icons-material/Chat"
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn"
import InterpreterModeIcon from '@mui/icons-material/InterpreterMode';
import Chat from "./LLMChat"
import useAxios from "../hooks/useAxios"
import GraphComponent from './GraphComponent';
import CallFriend from "./CallFriend"
import PhoneDialog from "./phone/PhoneDialog";

import useAuth from "../hooks/useAuth"
import { NavLink , useNavigate} from "react-router";

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
        : colorVariant === "red"
          ? "#d94a2b"
          : theme.palette.secondary.main,
  color: isUsed ? theme.palette.text.disabled : theme.palette.common.white,
  "&:hover": {
    backgroundColor: isUsed
      ? theme.palette.grey[300]
      : colorVariant === "blue"
        ? theme.palette.primary.dark
        : colorVariant === "green"
          ? theme.palette.success.dark
          : colorVariant === "red"
            ? "#b14027"
            : theme.palette.secondary.dark,
    transform: isUsed ? "none" : "scale(1.03)",
  },
  transition: theme.transitions.create(["background-color", "transform"], {
    duration: theme.transitions.duration.short,
  }),
}));


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
  const axios = useAxios();
  const { auth } = useAuth();

  const totalRounds = 10;
  const [round, setRound] = useState(1);
  const [roundData, setRoundData] = useState(null);
  const [roundPrompt, setRoundPrompt] = useState("");
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [callFriendUsed, setCallFriendUsed] = useState(false);
  const [phoneOut, setPhoneOut] = useState(false);

  const [askAudience, setAskAudience] = useState(false);
  const [useChatUsed, setUseChatUsed] = useState(false);
  const [isCallFriendOpen, setIsCallFriendOpen] = useState(false);

  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatKey, setChatKey] = useState(0); // resets the chat component every time it is updated
  const [questions, setQuestions] = useState([]);
  const [showStatistics, setShowStatistics] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showGraph, setShowGraph] = useState(false); // State to control the visibility of GraphComponent
  const navigate = useNavigate();
  
  // Function to load the data for each round.
  const loadRound = async () => {
    try {
      
      setLoading(true)
      setChatKey(chatKey + 1);

      const selectedTopics = JSON.parse(localStorage.getItem('selectedTopics'));
      let response = ""; 

      if (!selectedTopics || !Array.isArray(selectedTopics) || selectedTopics.length === 0) {
        await navigate("/home", {replace:true}); 
      }
      else {
        response = await axios.get("/getRound", {
          params: { topics: selectedTopics }
        });
      }
      
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
      let wh = (roundData.topic === "athlete" || roundData.topic === "singer") ? "Who" : "What";
      setRoundPrompt(`${wh} is this ${roundData.topic}?`);
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



  // Add the game statistics to the database and show the statistics dialog
const endGame = async (questions) => {
    try {
      await axios.post("/addgame", { username: auth.username, questions }).then(res => console.log(res.data));
      localStorage.setItem('selectedTopics', "");
    } catch (error) {
      console.error("Error saving user stadistics:", error);
    }

    setShowStatistics(true);
  };

  const handleNewGame = async () => {
    setShowStatistics(false);
    setRoundData(null);
    setRound(1);
    setScore(0);
    setQuestions([]);
    setFiftyFiftyUsed(false);
    setCallFriendUsed(false);
    setPhoneOut(false);
    setAskAudience(false);
    setUseChatUsed(false);
    setHiddenOptions([]);
    setSelectedAnswer(null);
    gameSetup();
  };

  const handleOptionSelect = async (index) => {
    if (selectedAnswer !== null) return;

    const isCorrect = CorrectOption(index);
    setSelectedAnswer(index);

    const pointsIncrement = 50;
    if (isCorrect) {
      setScore(score + pointsIncrement);
      setCorrectAnswers(correctAnswers + 1);
      setShowGraph(false);
    }

    let updatedQuestions = [];
    setQuestions((prev) => {
      updatedQuestions = [
        ...prev,
        {
          topic: roundData.topic,
          isCorrect: isCorrect,
          pointsIncrement: pointsIncrement,
        },
      ];
      return updatedQuestions;
    });

    setTimeout(async () => {
      if (round === totalRounds) {
        await endGame(updatedQuestions);
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
    if (callFriendUsed || !roundData) return;
    // Implement logic to simulate calling a friend
    // alert("Your friend thinks the answer might be: " + roundData.itemWithImage.name);
    setCallFriendUsed(true);
    setIsCallFriendOpen(true);
  };

  const handlePhoneOut = () => {
    if (phoneOut || !roundData) return;
    setPhoneOut(true);
  };

  const handlePhoneOutClose = () => {
    setPhoneOut(false);
  };

  const handleCloseCallFriend = () => {
    setCallFriendUsed(false);
    setIsCallFriendOpen(false);
  };

  const handleAudienceCall = () => {
    if (askAudience || !roundData) return
    setAskAudience(true)
    setShowGraph(true); // Make the graph visible when the audience call is used
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
                Call a Friend {callFriendUsed && "(Used)"}
              </LifelineButton>

              <LifelineButton
                variant="contained"
                startIcon={<InterpreterModeIcon />}
                onClick={handleAudienceCall}
                disabled={askAudience}
                isUsed={askAudience}
                colorVariant="red"
              >
                Audience Call - 150 🪙 {askAudience && "(Used)"}
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
              <LifelineButton
                variant="contained"
                onClick={handlePhoneOut}
                colorVariant="purple"
              >
                Phone Out
              </LifelineButton>
              {callFriendUsed && (<CallFriend
                open={isCallFriendOpen}
                onClose={handleCloseCallFriend}
                correctAnswer={roundData.itemWithImage.name}
                possibleAnswers={roundData.items.map(item => item.name)}
              />)}
              {phoneOut && (<PhoneDialog
                open={phoneOut}
                onClose={handlePhoneOutClose}
                key={chatKey} roundData={roundData}
              />)}
            </CardContent>{showGraph && (
            <Card elevation={3} sx={{ marginTop: 2, paddingTop: 3 }}>
              <CardContent>
                <Typography variant="h4" component="h2" color="primary" sx={{ fontSize: '1.5rem' }}>
                  The audience says...
                </Typography>
                {roundData && <GraphComponent correctAnswer={roundData.itemWithImage.name}
                  distractors={roundData.items
                    .filter(item => item.name !== roundData.itemWithImage.name)
                    .map(item => item.name)
                  }
                />}
              </CardContent>
            </Card>
          )}
            <CardContent>
              
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
                    <Container sx={{ textAlign: "center", mb: 2 }}>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>{roundPrompt}</Typography>
                    </Container>
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
              {roundData && <Chat key={chatKey} roundData={roundData} />}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog open={showStatistics} onClose={() => setShowStatistics(false)}>
        <DialogTitle sx={{ fontWeight: "bold", color: "primary.main" }}>Game Over</DialogTitle>
        <DialogContent>
          <Typography variant="body1"><b>Final Score:</b> {score}</Typography>
          <Typography variant="body1"><b>Correct Answers:</b> {correctAnswers} / {totalRounds}</Typography>
          <Typography variant="body1"><b>Accuracy Rate:</b> {((correctAnswers / totalRounds) * 100).toFixed(2)}%</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button variant="contained" color="primary" onClick={handleNewGame}>
            New Game
          </Button>
          <NavLink to="/home">
            <Button variant="contained" color="secondary">
              Return Home
            </Button>
          </NavLink>
        </DialogActions>
      </Dialog>
    </GameContainer>
  )
}

export default Game;