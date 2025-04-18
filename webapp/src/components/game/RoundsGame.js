"use client"

import { useEffect, useState } from "react"
import { Typography, Card, CardContent, Grid, Container, CircularProgress } from "@mui/material"
import useAxios from "../../hooks/useAxios"
import useAuth from "../../hooks/useAuth"
import { useNavigate} from "react-router";
import { OptionButton, ImageContainer, LoadingContainer, HighlightedTopic } from "./BaseStyles";
import useCoinHandler from "../../handlers/CoinHandler"
import useLifeLinesHandler from "../../handlers/LifeLinesHandler"
import { TOPIC_QUESTION_MAP } from "../../utils/topicQuestionMap";
import BaseGame from "./BaseGameLayout"

function RoundsGame() {
  const axios = useAxios();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [roundData, setRoundData] = useState(null);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatKey, setChatKey] = useState(0); // resets the chat component every time it is updated
  const [showStatistics, setShowStatistics] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  const [round, setRound] = useState(1);
  const totalRounds = 10;

  const { coins, spentCoins, setSpentCoins, canAfford, spendCoins, fetchUserCoins, updateUserCoins } = useCoinHandler(axios, auth);
  const { handleFiftyFifty, handleCallFriend, handleCloseCallFriend, handleAudienceCall, handlePhoneOut, handlePhoneOutClose, handleUseChat, 
    hiddenOptions, isTrue, setHiddenOptions, setShowGraph, newGame } = useLifeLinesHandler(roundData, spendCoins);

  useEffect(() => {
    fetchUserCoins();
  }, [auth]);

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

  // Set up the game when the component mounts
  useEffect(() => {
    gameSetup();
  }, []);

  // Check if the game is still loading after modifying the round data
  useEffect(() => {
    if (roundData && roundData.items.length > 0) {
      const questionInfo = TOPIC_QUESTION_MAP[roundData.topic] || { wh: "What", name: roundData.topic }; // Value by default if topic is not found
      //setRoundPrompt(`${questionInfo.wh} is this ${questionInfo.name}?`);
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
    newGame();
    setSelectedAnswer(null);
    fetchUserCoins(); // Reset coins to the latest value from the server
    setSpentCoins(0);
    setCorrectAnswers(0);

    setRound(1);

    gameSetup();
  };

  const handleOptionSelect = async (index) => {
    if (selectedAnswer !== null) return;

    const isCorrect = correctOption(index);
    setSelectedAnswer(index);

    const pointsIncrement = 50;
    if (isCorrect) {
      setScore(score + pointsIncrement);
      setCorrectAnswers(correctAnswers + 1);
      setShowGraph(false);
    }

    setTimeout(async () => {
      if (round === totalRounds) {
        await endGame();
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
  
  const correctOption = (index) => {
    if (!roundData) return false
    const selectedName = roundData.items[index].name
    const correctName = roundData.itemWithImage.name
    return selectedName === correctName
  }
  
  return (
    <BaseGame
      axios={axios}
      auth={auth}
      roundData={roundData}
      chatKey={chatKey}
      score={score}
      correctAnswers={correctAnswers}
      totalRounds={totalRounds}
      handleNewGame={handleNewGame}
      coins={coins}
      spentCoins={spentCoins}
      showStatistics={showStatistics}
      setShowStatistics={setShowStatistics}
      canAfford={canAfford}
      handleFiftyFifty={handleFiftyFifty}
      handleCallFriend={handleCallFriend}
      handleCloseCallFriend={handleCloseCallFriend}
      handleAudienceCall={handleAudienceCall}
      handlePhoneOut={handlePhoneOut}
      handlePhoneOutClose={handlePhoneOutClose}
      handleUseChat={handleUseChat}
      isTrue={isTrue}
    >
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

    </BaseGame>
  )
}

export default RoundsGame;