"use client"

import { Toolbar, Typography, Button, Card, CardContent, Grid, Box, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import PhoneIcon from "@mui/icons-material/Phone"
import ChatIcon from "@mui/icons-material/Chat"
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn"
import InterpreterModeIcon from '@mui/icons-material/InterpreterMode';
import Chat from "../LLMChat"
import GraphComponent from '../lifelines/GraphComponent';
import CallFriend from "../lifelines/CallFriend"
import PhoneDialog from "../phone/PhoneDialog";
import { NavLink } from "react-router";
import { GameContainer, StyledAppBar, LogoButton, ScoreChip, CoinsChip, LifelineButton } from "./BaseStyles";

const BaseGame = ({
  children,
  roundData,
  chatKey,
  score,
  correctAnswers,
  totalRounds,
  handleNewGame,
  coins,
  spentCoins,
  showStatistics,
  setShowStatistics,
  canAfford,
  handleFiftyFifty,
  handleCallFriend,
  handleCloseCallFriend,
  handleAudienceCall,
  handlePhoneOut,
  handlePhoneOutClose,
  handleUseChat,
  isTrue
}) => {

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
          </Card>
          
        </Grid>

        {/* Game Area */}
        {children}

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
  );
};

export default BaseGame;