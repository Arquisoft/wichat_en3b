// src/components/CharacterSelection.js
import React from 'react';
import { Button, Box, Typography, Card, CardContent, CardActions } from '@mui/material';
import { green, blue, purple, red } from '@mui/material/colors';

const CharacterSelection = ({ onSelectCharacter }) => {
  const characters = [
    { name: "Alex", confidence: 0.8, price: 1000, color: green[400] },
    { name: "Casey", confidence: 0.6, price: 750, color: blue[400] },
    { name: "Taylor", confidence: 0.4, price: 500, color: purple[400] },
    { name: "Dave", confidence: 0.2, price: 350, color: red[400] },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)", // Creates 2 columns
        gap: 3, // Adds space between the cards
        p: 2,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {characters.map((character) => (
        <Card
          key={character.name}
          sx={{
            width: 250,
            textAlign: "center",
            bgcolor: character.color,
            borderRadius: 2,
            boxShadow: 3, // Adds a subtle shadow to the card for a more elevated look
            transition: "transform 0.3s ease, box-shadow 0.3s ease", // Smooth hover transition for the card
            "&:hover": {
              transform: "scale(1.05)", // Scales up the card on hover
              boxShadow: 6, // Adds a more prominent shadow on hover
            },
          }}
        >
          <CardContent sx={{ color: "white", p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
              {character.name}
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: "italic", mb: 1 }}>
              Confidence: {Math.round(character.confidence * 100)}%
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "bold", color: "gold" }}>
              Price: {character.price}🪙
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "center", pb: 3 }}>
            <Button
              size="small"
              sx={{
                color: "white",
                borderColor: "white",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  borderColor: "white",
                },
                fontWeight: "bold",
                paddingX: 3,
              }}
              variant="outlined"
              onClick={() => onSelectCharacter(character)}
            >
              Select
            </Button>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
};

export default CharacterSelection;
