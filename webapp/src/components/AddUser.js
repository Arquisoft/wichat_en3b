// src/components/AddUser.js
import React, { useState } from 'react';
import axios from '../api/axios';


import { Container, Typography, TextField, Button, Snackbar, Box, Paper, Alert, FormHelperText } from '@mui/material';
import { NavLink, useNavigate } from 'react-router';
import logInPic from './photos/logInPic.png';

const AddUser = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const navigate = useNavigate();


const validateForm = () => {
  let isValid = true;
  
  const usernameRegex = /^\w+$/;
  if (!username) {
    setUsernameError('Username is required');
    isValid = false;
  } else if (!usernameRegex.test(username)) {
    setUsernameError('Username can only contain letters, numbers, and underscores');
    isValid = false;
  } else {
    setUsernameError('');
  }
  
  const passwordRegExp = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!password) {
    setPasswordError('Password is required');
    isValid = false;
  } else if (password.length < 8) {
    setPasswordError('Password must be at least 8 characters long');
    isValid = false;
  } else if (!passwordRegExp.test(password)) {
    setPasswordError('Password must have at least one capital letter, one digit and one special character');
    isValid = false;
  } else {
    setPasswordError('');
  }
  
  return isValid;
};

  const addUser = async () => {

    setError('');

    if (!validateForm()){
      return; 
    }

    try {
      await axios.post("/adduser", { username, password });
      setOpenSnackbar(true);
    
      setTimeout(() => {
        navigate('/login');
      }, 500);
    
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Unknown error';
      setError(errorMsg);

      if (errorMsg.includes('Username already taken')) {
        setUsernameError('Username already taken');
      } else if (errorMsg.includes('username')) {
        setUsernameError(errorMsg);
      } else if (errorMsg.includes('password') || errorMsg.includes('Password')) {
        setPasswordError(errorMsg);
      }
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
            onChange={(e) => {
              setUsername(e.target.value);
              setUsernameError('');
            }}
            error={!!usernameError}
            helperText={usernameError}
            sx={{ mb: 2 }}
          />
          <TextField
            name="password"
            margin="normal"
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError('');
            }}
            error={!!passwordError}
            helperText={passwordError}
            sx={{ mb: 2 }}
          />

          <FormHelperText sx={{ mb: 2, mx: 1 }}>
            Password must contain at least 8 characters, including a capital letter, a number, and a special character.
          </FormHelperText>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={addUser}
            sx={{
              mt: 1,
              fontWeight: 'bold',
              backgroundColor: '#5254bc', 
              '&:hover': {
                backgroundColor: '#3f47a3',
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
            backgroundColor: '#5254bc',
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
              backgroundColor: '#29293d',
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

      {/* General Error Notification */}
      {error && !usernameError && !passwordError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Success Notification */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} message="User added successfully" />


    </Container>
  );
};

export default AddUser;
