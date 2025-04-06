// src/components/AddUser.js
import React, { useState } from 'react';
import axios from '../api/axios';

import { Container, Typography, TextField, Button, Snackbar, Box, Paper, alpha } from '@mui/material';
import { NavLink, useNavigate } from 'react-router';
import logInPic from './photos/logInPic.png';
import { grey } from '@mui/material/colors';

const AddUser = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const navigate = useNavigate();

  const addUser = async () => {
    try {
      await axios.post("/adduser", { username, password });
      setOpenSnackbar(true);
    
      setTimeout(() => {
        navigate('/login');
      }, 500);
    
    } catch (error) {
      setError(error.response?.data?.error || 'Unknown error');
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Paper elevation={4} sx={{ display: 'flex', borderRadius: 4, overflow: 'hidden' }}>
        {/* Left Panel - Add User Form */}
        <Box sx={{ width: '50%', p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography component="h1" variant="h5" textAlign="center" fontWeight="bold" mb={3}>
            Register here
          </Typography>

          <TextField
            name="username"
            margin="normal"
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            name="password"
            margin="normal"
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={addUser}
            sx={{
              mt: 1,
              fontWeight: 'bold',
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            Add User
          </Button>

          <Typography component="div" align="center" sx={{ marginTop: 3 }}>
            <NavLink to={"/login"}>
              Already have an account? Login here.
            </NavLink>
          </Typography>
        </Box>

        {/* Right Panel - Placeholder for animation or image */}
        <Box
          sx={{
            width: '50%',
            backgroundColor: 'primary.main',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 3,
          }}
        >
          {/* Placeholder for animation or image */}
          <Box sx={{ mb: 3 }}>
            <img
              src={logInPic} 
              alt="Presenter"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '20px',
              }}
            />
          </Box>

          {/* Speech bubble */}
          <Box
            sx={{
              color: "primary.contrastText",
              backgroundColor: alpha(grey[900], 0.5),
              borderRadius: 2,
              px: 3,
              py: 2,
              fontSize: '1rem',
              fontWeight: 500,
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
              textAlign: 'center',
              maxWidth: '100%',
            }}
          >
            Nice to see you are on board! Fill in the details and add a user to get started!
          </Box>
        </Box>
      </Paper>

      {/* Notifications */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} message="User added successfully" />
      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} message={`Error: ${error}`} />
      )}
    </Container>
  );
};

export default AddUser;
