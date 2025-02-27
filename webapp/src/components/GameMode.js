// src/components/GameModes.js
import React from 'react';
import { Button, Typography } from '@mui/material';

const GameModes = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <Typography variant="h5">Select a Game Mode</Typography>
      <Button variant="contained" color="primary" sx={{ marginTop: 2 }}>
        Easy
      </Button>
      <Button variant="contained" color="secondary" sx={{ marginTop: 2 }}>
        Medium
      </Button>
      <Button variant="contained" color="success" sx={{ marginTop: 2 }}>
        Hard
      </Button>
    </div>
  );
};

export default GameModes;
