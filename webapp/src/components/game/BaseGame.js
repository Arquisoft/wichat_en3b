"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router";
import { Toolbar, Typography, Button, Card, CardContent, Grid, Box, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress, Container } from "@mui/material";
import { HelpOutline, Phone, Chat, InterpreterMode, EmojiEvents, MonetizationOn } from "@mui/icons-material";
import LLMChat from "../LLMChat";
import GraphComponent from '../lifelines/GraphComponent';
import CallFriend from "../lifelines/CallFriend";
import PhoneDialog from "../phone/PhoneDialog";
import { NavLink } from "react-router";
import { GameContainer, StyledAppBar, LogoButton, ScoreChip, CoinsChip, LifelineButton, LoadingContainer, ImageContainer, HighlightedTopic, OptionButton } from "./GameStyles";
import useAxios from "../../hooks/useAxios";
import useAuth from "../../hooks/useAuth";
import useCoinHandler from "../../handlers/CoinHandler";
import useLifeLinesHandler from "../../handlers/LifeLinesHandler";
import { TOPIC_QUESTION_MAP } from "../../utils/topicQuestionMap";
import { motion } from "framer-motion";



const BaseGame = React.forwardRef(({
  children,
  onNewGame = () => { },
  onRoundComplete = () => { },
  isGameOver = false,
  mode = "rounds",
}, ref) => {
  const axios = useAxios();
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [roundData, setRoundData] = useState(null);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatKey, setChatKey] = useState(0); // resets the chat component every time it is updated
  const [showStatistics, setShowStatistics] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [usedImages, setUsedImages] = useState([]);



  const answerTimer = useRef(null); // Holds the timer for the answer selection

  const { coins, spentCoins, setSpentCoins, canAfford, spendCoins, fetchUserCoins, updateUserCoins } = useCoinHandler(axios, auth);
  const { handleFiftyFifty, handleCallFriend, handleCloseCallFriend, handleAudienceCall, handlePhoneOut, handlePhoneOutClose, handleUseChat,
    handleSelectCharacter, hiddenOptions, isTrue, setHiddenOptions, setShowGraph, newGame } = useLifeLinesHandler(roundData, spendCoins);

  // Load rounds every time the roundsPlayed changes and on start up
  useEffect(() => {
    if (!isGameOver) {
      const load = async () => {
        setRoundData(null);
        try {
          const data = await loadRound();
          setRoundData(data);
        } catch (error) {
          console.error("Error loading new round", error);
          setLoading(false);
        }
      }

      load();
    }
  }, [roundsPlayed, isGameOver]);

  useEffect(() => {
    fetchUserCoins();
  }, [auth]);

  // Function to load the data for each round.
  const loadRound = async () => {
    try {
      setLoading(true)
      setChatKey(chatKey + 1);
      setHiddenOptions([])

      const selectedTopics = JSON.parse(sessionStorage.getItem('selectedTopics'));
      let response = "";

      if (!selectedTopics || !Array.isArray(selectedTopics) || selectedTopics.length === 0) {
        navigate("/home", { replace: true });
      } else {
        response = await axios.get("/getRound", {
          params: {
            topics: selectedTopics,
            mode: mode,
            usedImages: usedImages
          }
        });
      }

      // When we get a new round, add the current image to usedImages
      if (response.data && response.data.itemWithImage && response.data.itemWithImage.imageUrl) {
        setUsedImages(prev => [...prev, response.data.itemWithImage.imageUrl]);
      }

      return response.data
    } catch (error) {
      console.error("Error fetching data from question service:", error)
      setLoading(false)
      return null;
    }
  }

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

    if (loading && !isGameOver) {
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
  useEffect(() => {
    if (isGameOver) {
      const endGame = async () => {
        try {
          // Calculate earned coins based on score
          const earnedCoins = Math.round(score * 0.5);
          await updateUserCoins(earnedCoins);
          await axios.post("/addgame", { username: auth.username, mode, questions });
        } catch (error) {
          console.error("Error saving user stadistics:", error);
        }

        setShowStatistics(true);
      };

      endGame();
    }
  }, [isGameOver]);

  const handleNewGame = async () => {
    // Mode specific setup
    onNewGame();

    // General setup
    setUsedImages([]);
    setShowStatistics(false);
    setRoundData(null);
    setScore(0);
    newGame();
    setSelectedAnswer(null);
    fetchUserCoins(); // Reset coins to the latest value from the server
    setSpentCoins(0);
    setQuestions([]);
    setCorrectAnswers(0);
    setRoundsPlayed(0);
  };

  const handleOptionSelect = async (index) => {
    if (isGameOver || selectedAnswer !== null) return; // Prevent multiple selections

    const isCorrect = correctOption(index);
    setSelectedAnswer(index);

    const pointsIncrement = 50;
    if (isCorrect) {
      setScore(score + pointsIncrement);
      setCorrectAnswers(correctAnswers + 1);
      setShowGraph(false);
    }

    setQuestions((prev) => [
      ...prev,
      {
        topic: roundData.topic,
        isCorrect: isCorrect,
        pointsIncrement: pointsIncrement,
      },
    ]);

    answerTimer.current = setTimeout(() => {
      triggerNewRound(); // Trigger the next round after 2 seconds

      answerTimer.current = null; // Clear the timer reference
    }, 2000);
  }

  useEffect(() => {
    if (isGameOver && answerTimer.current) {
      clearTimeout(answerTimer.current); // Clear the timer when the game is over
      answerTimer.current = null; // Reset the timer reference

      triggerNewRound(); // Trigger the next round immediately
    }
  }, [isGameOver]);

  const triggerNewRound = () => {
    setRoundsPlayed(roundsPlayed + 1);
    setSelectedAnswer(null);

    // Clear the current round data to force a reload
    setRoundData(null);
    setLoading(true);
    
    // Mode specific round complete
    onRoundComplete();
  }

  const correctOption = (index) => {
    if (!roundData || !roundData.items[index]) return false
    const selectedName = roundData.items[index].name
    const correctName = roundData.itemWithImage.name
    return selectedName === correctName
  }

  // Values for the graph component
  const distractors = useMemo(() => {
    if (!roundData) return [];
    return roundData.items
      .filter(item => item.name !== roundData.itemWithImage.name)
      .map(item => item.name);
  }, [roundData]);

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
            <CoinsChip variant="contained" startIcon={<MonetizationOn />}>
              {coins} 🪙
            </CoinsChip>
            <ScoreChip elevation={0}>
              <EmojiEvents sx={{ mr: 1 }} />
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
                startIcon={<HelpOutline />}
                onClick={handleFiftyFifty}
                disabled={isTrue("50") || !canAfford(100)}
                isUsed={isTrue("50")}
                colorVariant="blue"
              >
                50/50 - 100 🪙 {isTrue("50") && "(Used)"}
              </LifelineButton>

              <LifelineButton
                variant="contained"
                startIcon={<Phone />}
                onClick={handleCallFriend}
                disabled={isTrue("CallFriend")}
                isUsed={isTrue("CallFriend")}
                colorVariant="green"
              >
                Call a Friend {isTrue("CallFriend") && "(Used)"}
              </LifelineButton>

              <LifelineButton
                variant="contained"
                startIcon={<InterpreterMode />}
                onClick={handleAudienceCall}
                disabled={isTrue("AskAudience") || !canAfford(150)}
                isUsed={isTrue("AskAudience")}
                colorVariant="red"
              >
                Audience Call - 150 🪙 {isTrue("AskAudience") && "(Used)"}
              </LifelineButton>

              <LifelineButton
                variant="contained"
                startIcon={<Chat />}
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
                handleSelectCharacter={handleSelectCharacter}
              />)}
              {isTrue("PhoneOut") && (<PhoneDialog
                open={isTrue("PhoneOut")}
                onClose={handlePhoneOutClose}
                key={chatKey} roundData={roundData}
              />)}

              {isTrue("ShowGraph") && (
              <Card elevation={3} sx={{ marginTop: 2, paddingTop: 3 }}>
                <CardContent>
                <Typography data-testid="audience-response" variant="h4" component="h2" color="primary" sx={{ fontSize: '1.5rem' }}>
                   The audience says...
                </Typography>
                  {roundData && <GraphComponent correctAnswer={roundData.itemWithImage.name}
                    distractors={roundData.items
                      .filter(item => item.name !== roundData.itemWithImage.name)
                      .map(item => item.name)
                    }
                  />}

                  <Typography variant="h4" component="h2" color="primary" sx={{ fontSize: '1.5rem' }}>
                    The audience says...
                  </Typography>
                  {roundData && <GraphComponent correctAnswer={roundData.itemWithImage.name} distractors={distractors} />}

                </CardContent>
              </Card>
            )}
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
                    Get ready for round {roundsPlayed + 1}!
                  </Typography>
                </LoadingContainer>
              ) : (
                roundData && (
                  <>
                    {typeof children === 'function' ? children({ handleOptionSelect }) : children}
                    <ImageContainer>
                      <img
                        ref={ref}
                        src={roundData.itemWithImage.imageUrl || "/placeholder.svg"}
                        alt={roundData.itemWithImage.imageAltText || "Item image"}
                      />
                    </ImageContainer>
                    <Container sx={{ textAlign: "center", mb: 2 }}>
                      {roundData && (
                        <Typography data-testid="question-prompt" variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                          {TOPIC_QUESTION_MAP[roundData.topic]?.wh || "What"} is this <HighlightedTopic>{TOPIC_QUESTION_MAP[roundData.topic]?.name || roundData.topic.toUpperCase()}</HighlightedTopic>?
                        </Typography>
                      )}
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
                            isCorrect={correctOption(index)}
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
              {roundData && <LLMChat key={chatKey} roundData={roundData} />}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Game statistics */}
      <Dialog
        open={showStatistics}
        onClose={(_, reason) => {
          // Prevent the user to interact with the rest of the screen when the dialog is shown
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            setShowStatistics(false)
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "primary.main" }}>Game Over</DialogTitle>
        <DialogContent>
          <Typography variant="body1"><b>Final Score:</b> {score}</Typography>
          <Typography variant="body1"><b>Correct Answers:</b> {correctAnswers} / {roundsPlayed}</Typography>
          <Typography variant="body1"><b>Accuracy Rate:</b> {roundsPlayed ? ((correctAnswers / roundsPlayed) * 100).toFixed(2) : 0}%</Typography>
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
  );
});

export default BaseGame;