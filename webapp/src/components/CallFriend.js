import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from "@mui/material";
import CharacterSelection from "./CharacterSelection";

const CallFriend = ({ open, onClose, correctAnswer, possibleAnswers }) => {
  const [step, setStep] = useState(1);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [friendAnswer, setFriendAnswer] = useState("");
  const [confidence, setConfidence] = useState("");

  const handleSelectCharacter = (character) => {
    setSelectedCharacter(character);
    setStep(2); // Move to the call phase
  };

  useEffect(() => {
  if (step === 2 && selectedCharacter) {
    const isConfident = selectedCharacter.confidence >= 0.5; // Higher confidence means better accuracy
    const isCorrect = isConfident ? Math.random() < 0.8 : Math.random() < 0.3;
    const wrongAnswers = possibleAnswers.filter(answer => answer !== correctAnswer);
    const answer = isCorrect
      ? correctAnswer
      : wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];

    setFriendAnswer(answer);
    setConfidence(`${selectedCharacter.name} has a confidence level of ${Math.round(selectedCharacter.confidence * 100)}%. ${isConfident ? "I'm pretty sure" : "I have no idea, but maybe"}`);
  }
}, [step, selectedCharacter, correctAnswer, possibleAnswers]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {step === 1 && (
        <>
          <DialogTitle sx={{ textAlign: "center" }}>Select a Friend to Call</DialogTitle>
          <DialogContent>
            <CharacterSelection onSelectCharacter={handleSelectCharacter} />
          </DialogContent>
        </>
      )}

      {step === 2 && (
        <>
          <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>📞 Calling {selectedCharacter?.name}...</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: "center", p: 2 }}>
              <Typography variant="h6" color="textSecondary" fontStyle="italic">
                "{confidence}... I think the answer might be:
              </Typography>
              <Typography variant="h5" color="primary" fontWeight="bold" mt={2}>
                {friendAnswer}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button onClick={onClose} variant="contained" color="secondary" sx={{ fontWeight: "bold", px: 3 }}>
              Hang up
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default CallFriend;
