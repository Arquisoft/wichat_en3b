// src/components/Login.js
import React, { useEffect, useState } from 'react';
import { Container, Typography, TextField, Button, Snackbar, Checkbox, FormControlLabel } from '@mui/material';
import { NavLink, useLocation, useNavigate } from 'react-router';

import useAuth from "../../hooks/useAuth";
import axios from "../../api/axios";

const Login = () => {
  const { setAuth, persist, setPersist } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from.pathname || "/home";

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const loginUser = async () => {
    try {
      const response = await axios.post("/login", { username, password }, { withCredentials: true });
      // store username and token in memory, where it is safest
      setAuth({ username, accessToken: response.data.accessToken });
      // redirect to the page the user was trying to access before logging in
      navigate(from, { replace: true });
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Unknown error";
      setError(errorMessage);
      setAuth(false);
    }

    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const togglePersist = () => {
    setPersist(prev => !prev);
  };

  useEffect(() => {
    localStorage.setItem("persist", persist);
  }, [persist]);

  return (
    <Container component="main" maxWidth="xs" sx={{ marginTop: 4 }}>
      <div>
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <TextField
          name="username"
          margin="normal"
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          name="password"
          margin="normal"
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FormControlLabel
          control={<Checkbox onChange={togglePersist} checked={persist} />}
          label="Remember me"
        />
        <Button variant="contained" color="primary" onClick={loginUser} data-testid="login-submit">
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
    </Container>
  );
};

export default Login;
