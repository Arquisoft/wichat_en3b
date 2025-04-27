import React, { useMemo } from "react";
import { Box, Avatar, Typography, Card, CardActionArea, useTheme } from "@mui/material";

// Big pool of characters
const sampleCharacters = [
  { name: "Alex", confidence: 0.9, price: 200 },
  { name: "Hannah", confidence: 0.8, price: 180 },
  { name: "Jamie", confidence: 0.6, price: 140 },
  { name: "Gracie", confidence: 0.3, price: 100 },
  { name: "Charlie", confidence: 0.95, price: 220 },
  { name: "Taylor", confidence: 0.75, price: 170 },
  { name: "Jordan", confidence: 0.5, price: 130 },
  { name: "Morgan", confidence: 0.4, price: 120 },
  { name: "Skyler", confidence: 0.2, price: 90 },
  { name: "Riley", confidence: 0.85, price: 190 },
  { name: "Quinn", confidence: 0.65, price: 150 },
  { name: "Casey", confidence: 0.55, price: 135 },
  { name: "Peyton", confidence: 0.35, price: 110 },
  { name: "Finley", confidence: 0.25, price: 95 },
  { name: "Avery", confidence: 0.15, price: 80 },
];

const CharacterSelection = ({ onSelectCharacter }) => {
  const theme = useTheme();

  // Pick 4 different confidence ranges
  const displayedCharacters = useMemo(() => {
    const high = sampleCharacters.filter(c => c.confidence >= 0.8);
    const mediumHigh = sampleCharacters.filter(c => c.confidence >= 0.6 && c.confidence < 0.8);
    const mediumLow = sampleCharacters.filter(c => c.confidence >= 0.4 && c.confidence < 0.6);
    const low = sampleCharacters.filter(c => c.confidence < 0.4);

    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    return [
      pickRandom(high),
      pickRandom(mediumHigh),
      pickRandom(mediumLow),
      pickRandom(low)
    ];
  }, []);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 2,
        p: 2,
      }}
    >
      {displayedCharacters.map((character, index) => (
        <Card
          key={index}
          elevation={3}
          sx={{
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
            transition: "transform 0.2s",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: theme.shadows[6],
            }
          }}
        >
          <CardActionArea onClick={() => onSelectCharacter(character)} sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Avatar
                src={character.avatar}
                alt={character.name}
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontSize: "1.5rem",
                }}
              >
                {!character.avatar && character.name.charAt(0)}
              </Avatar>
              <Typography variant="body1" fontWeight="bold" color="text.primary">
                {character.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Confidence: {(character.confidence * 100).toFixed(0)}%
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="secondary" mt={1}>
                💰 {character.price} coins
              </Typography>
            </Box>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
};

export default CharacterSelection;
