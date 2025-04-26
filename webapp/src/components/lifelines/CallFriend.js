import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Avatar, CircularProgress, useTheme } from "@mui/material";
import CharacterSelection from "./CharacterSelection";

const CallFriend = ({ open, onClose, correctAnswer, possibleAnswers }) => {
  const theme = useTheme();
  const [step, setStep] = useState(1);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [friendAnswer, setFriendAnswer] = useState("");
  const [confidenceText, setConfidenceText] = useState("");
  const [feelingText, setFeelingText] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const handleSelectCharacter = (character) => {
    setSelectedCharacter(character);
    setStep(2);
    setIsThinking(true);
  };

  useEffect(() => {
    if (step === 2 && selectedCharacter) {
      const timer = setTimeout(() => {
        const isConfident = selectedCharacter.confidence >= 0.5;
        const isCorrect = isConfident ? Math.random() < 0.8 : Math.random() < 0.3;
        const wrongAnswers = possibleAnswers.filter(answer => answer !== correctAnswer);
        const answer = isCorrect
          ? correctAnswer
          : wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];

        setFriendAnswer(answer);
        setConfidenceText(`${selectedCharacter.name} has a confidence level of ${Math.round(selectedCharacter.confidence * 100)}%.`);
        setFeelingText(isConfident ? "I'm pretty sure it is " : "I'm not very sure, but maybe it is");
        setIsThinking(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [step, selectedCharacter, correctAnswer, possibleAnswers]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
          p: 2,
          overflow: 'hidden',
        }
      }}
    >
      {step === 1 && (
        <>
          <DialogTitle
            sx={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "1.5rem",
              color: theme.palette.primary.main,
            }}
          >
            Choose a Friend to Call
          </DialogTitle>
          <DialogContent>
            <CharacterSelection onSelectCharacter={handleSelectCharacter} />
          </DialogContent>
        </>
      )}

      {step === 2 && selectedCharacter && (
        <>
          <DialogTitle sx={{ textAlign: "center", mb: 1 }}>
            <Typography variant="h6" fontWeight="bold" color="primary">
              📞 Calling {selectedCharacter.name}...
            </Typography>
          </DialogTitle>

          <DialogContent>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 2,
              mt: 2,
            }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  fontSize: "2rem",
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                }}
              >
                {selectedCharacter.name.charAt(0)}
              </Avatar>

              {isThinking ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1 }}>
                  <CircularProgress color="secondary" />
                  <Typography variant="body2" sx={{ mt: 2, color: theme.palette.text.secondary }}>
                    Trying to connect with {selectedCharacter.name}
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ mt: 3 }}>
                    {/* Confidence line */}
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {confidenceText}
                    </Typography>

                    {/* Feeling emphasized like a "semi-answer" */}
                    <Typography
                      variant="h4"
                      color="secondary"
                      sx={{ mt: 2 }}
                    >
                      {feelingText}
                    </Typography>

                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="secondary"
                      sx={{ mt: 2 }}
                    >
                     {friendAnswer}
                    </Typography>
                  </Box>

                </>
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              onClick={onClose}
              variant="contained"
              color="secondary"
              sx={{
                fontWeight: "bold",
                px: 4,
                py: 1.5,
                borderRadius: 2,
                mt: 2,
              }}
              disabled={isThinking}
            >
              {isThinking ? "..." : "Hang up"}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default CallFriend;
