"use client"

import { useEffect, useState } from "react"
import { Toolbar, Typography, Button, Card, CardContent, Grid, Box, Container, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import PhoneIcon from "@mui/icons-material/Phone"
import ChatIcon from "@mui/icons-material/Chat"
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn"
import InterpreterModeIcon from '@mui/icons-material/InterpreterMode';
import Chat from "../LLMChat"
import useAxios from "../../hooks/useAxios"
import GraphComponent from '../lifelines/GraphComponent';
import CallFriend from "../lifelines/CallFriend"
import PhoneDialog from "../phone/PhoneDialog";
import useAuth from "../../hooks/useAuth"
import { NavLink, useNavigate } from "react-router";
import { GameContainer, StyledAppBar, LogoButton, ScoreChip, CoinsChip, LifelineButton, OptionButton, ImageContainer, LoadingContainer } from "./BaseStyles";
import useCoinHandler from "../CoinHandler"
import useLifeLinesHandler from "../lifelines/LifeLinesHandler"

function RoundsGame() {
  const axios = useAxios();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [roundData, setRoundData] = useState(null);
  const [roundPrompt, setRoundPrompt] = useState("");
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatKey, setChatKey] = useState(0); // resets the chat component every time it is updated
  const [questions, setQuestions] = useState([]);
  const [showStatistics, setShowStatistics] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  const [round, setRound] = useState(1);
  const totalRounds = 3;
  const { coins, spentCoins, setSpentCoins, canAfford, spendCoins, fetchUserCoins, updateUserCoins } = useCoinHandler(axios, auth);
  const { handleFiftyFifty, handleCallFriend, handleCloseCallFriend, handleAudienceCall, handlePhoneOut, handlePhoneOutClose, handleUseChat, 
    hiddenOptions, isTrue, setHiddenOptions, setShowGraph, newGame } = useLifeLinesHandler(roundData, spendCoins);

  useEffect(() => {
    fetchUserCoins();
  }, [auth, axios]);

  // Function to load the data for each round.
  const loadRound = async () => {
    try {
      setLoading(true)
      setChatKey(chatKey + 1);

      const selectedTopics = JSON.parse(sessionStorage.getItem('selectedTopics'));
      let response = ""; 

      if (!selectedTopics || !Array.isArray(selectedTopics) || selectedTopics.length === 0) {
        navigate("/home", {replace:true}); 
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
      // Calculate earned coins based on score
      const earnedCoins = Math.round(score * 0.3);
      console.log(score);
      await updateUserCoins(earnedCoins);
      await axios.post("/addgame", { username: auth.username, questions });
    } catch (error) {
      console.error("Error saving user stadistics:", error);
    }
    setShowStatistics(true);
  };
  
  const handleNewGame = async () => {
    setShowStatistics(false);
    setRoundData(null);
    setScore(0);
    setQuestions([]);
    newGame();
    setHiddenOptions([]);
    setSelectedAnswer(null);
    fetchUserCoins(); // Reset coins to the latest value from the server
    setSpentCoins(0);

    setRound(1);
    setCorrectAnswers(0);
    
    gameSetup();
  };

  const handleOptionSelect = async (index) => {
    if (selectedAnswer !== null) return;

    const isCorrect = CorrectOption(index);
    setSelectedAnswer(index);

    const pointsIncrement = 50;
    if (isCorrect) {
      setScore(score + pointsIncrement);
      console.log(score);
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
            {coins} 🪙
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
                disabled={isTrue("50") || !canAfford(100)}
                isUsed={isTrue("50")}
                colorVariant="blue"
              >
                50/50 - 100 🪙 {isTrue("50") && "(Used)"}
              </LifelineButton>

              <LifelineButton
                variant="contained"
                startIcon={<PhoneIcon />}
                onClick={handleCallFriend}
                disabled={isTrue("CallFriend")}
                isUsed={isTrue("CallFriend")}
                colorVariant="green"
              >
                Call a Friend {isTrue("CallFriend") && "(Used)"}
              </LifelineButton>

              <LifelineButton
                variant="contained"
                startIcon={<InterpreterModeIcon />}
                onClick={handleAudienceCall}
                disabled={isTrue("AskAudience") || !canAfford(150)}
                isUsed={isTrue("AskAudience")}
                colorVariant="red"
              >
                Audience Call - 150 🪙 {isTrue("AskAudience") && "(Used)"}
              </LifelineButton>

              <LifelineButton
                variant="contained"
                startIcon={<ChatIcon />}
                onClick={handleUseChat}
                disabled={isTrue("UseChat") || !canAfford(200)}
                isUsed={isTrue("UseChat")}
                colorVariant="purple"
              >
                Use the Chat - 200 🪙 {isTrue("UseChat") && "(Used)"}
              </LifelineButton>

              <LifelineButton
                variant="contained"
                onClick={handlePhoneOut}
                colorVariant="purple"
              >
                Phone Out
              </LifelineButton>

              {isTrue("CallFriend") && (<CallFriend
                open={isTrue("CallFriendOpen")}
                onClose={handleCloseCallFriend}
                correctAnswer={roundData.itemWithImage.name}
                possibleAnswers={roundData.items.map(item => item.name)}
              />)}
              {isTrue("PhoneOut") && (<PhoneDialog
                open={isTrue("PhoneOut")}
                onClose={handlePhoneOutClose}
                key={chatKey} roundData={roundData}
              />)}

            </CardContent>{isTrue("ShowGraph") && (
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
                    <Typography variant="h4" component="h2" align="center" gutterBottom color="primary" sx={{ fontWeight: "bold" }}>
                      Round {round}/{totalRounds}
                    </Typography>
                    <ImageContainer>
                      <img
                        src={roundData.itemWithImage.imageUrl || "/placeholder.svg"}
                        alt={roundData.itemWithImage.imageAltText || "Item image"}
                      />
                    </ImageContainer>
                    <Container sx={{ textAlign: "center", mb: 2 }}>
                      <Typography data-testid="question-prompt" variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>{roundPrompt}</Typography>
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

      {/* Game statistics */}
      <Dialog 
        open={showStatistics} 
        onClose={(event, reason) => {
          // Prevent the user to interact with the rest of the screen when the dialog is shown
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            setShowStatistics(false)
          }
        }}
        >
        <DialogTitle sx={{ fontWeight: "bold", color: "primary.main" }}>Game Over</DialogTitle>
        <DialogContent>
          <Typography variant="body1"><b>Final Score:</b> {score}</Typography>
          <Typography variant="body1"><b>Correct Answers:</b> {correctAnswers} / {totalRounds}</Typography>
          <Typography variant="body1"><b>Accuracy Rate:</b> {((correctAnswers / totalRounds) * 100).toFixed(2)}%</Typography>
          <Typography variant="body1"><b>Spent on lifelines:</b> {spentCoins} 🪙</Typography>
          <Typography variant="body1"><b>Coins earned:</b> {Math.round(score * 0.3)} 🪙</Typography>     
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <NavLink to="/home">
            <Button variant="contained" color="secondary">
              Return Home
            </Button>
          </NavLink>
          <Button variant="contained" color="primary" onClick={handleNewGame}>
            New Game
          </Button>
        </DialogActions>
      </Dialog>
    </GameContainer>
  )
}

export default RoundsGame;