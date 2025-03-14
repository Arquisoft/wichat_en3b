// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, Snackbar } from '@mui/material';
import { NavLink } from 'react-router';
import { Typewriter } from "react-simple-typewriter";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [createdAt, setCreatedAt] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

  const loginUser = async () => {
    try {
      const response = await axios.post(`${apiEndpoint}/login`, { username, password });

      const question = "Please, generate a greeting message for a student called " + username + " tell them how fun they are going to have using this game. Explain that they have to press the button to start playing. Really short and make it casual. REALLY SHORT";
      const model = "empathy";
      const msg = await axios.post(`${apiEndpoint}/askllm`, { question, model });
      setMessage(msg.data.answer);
      // Extract data from the response
      const { createdAt: userCreatedAt } = response.data;

      setCreatedAt(userCreatedAt);
      setLoginSuccess(true);

      setOpenSnackbar(true);

      } catch (error) {
      setError(error.response.data.error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ marginTop: 4 }}>
      {loginSuccess ? (
        <div>
          <Typewriter
              words={[message]} // Pass your message as an array of strings
              cursor
              cursorStyle="|"
              typeSpeed={2} // Typing speed in ms
          />
          { createdAt && (
              <Typography component="p" variant="body1" sx={{ textAlign: "center", marginTop: 2 }}>
                  Your account was created on {new Date(createdAt).toLocaleDateString()}.
              </Typography>
          )}
          <NavLink to="/gamemode">
              <Button variant="contained" color="secondary" fullWidth sx={{ marginTop: 2 }}>
                  Start the fun
              </Button>
          </NavLink>
      </div>
      ) : (
        <div>
          <Typography component="h1" variant="h5">
            Login
          </Typography>
          <TextField
            margin="normal"
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={loginUser}>
            Login
          </Button>
          <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} message="Login successful" />
          {error && (
            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} message={`Error: ${error}`} />
          )}
          <Typography component="div" align="center" sx={{ marginTop: 2 }}>
            <NavLink to={"/signup"}>
              Don't have an account? Register here.
            </NavLink>
          </Typography>
        </div>
      )}
    </Container>
  );
};

export default Login;
