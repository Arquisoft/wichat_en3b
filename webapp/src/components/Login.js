import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Typography, TextField, Button, Snackbar, Checkbox, FormControlLabel, Box, Paper } from '@mui/material';
import { NavLink, useLocation, useNavigate } from 'react-router';
import logInPic from './photos/logInPic.png';

import useAuth from "../hooks/useAuth";
import axios from "../utils/axios";

const Login = () => {
  const { setAuth, persist, setPersist } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from.pathname || "/home";

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const { t } = useTranslation();

  // Centralized labels for consistency
  const labels = {
    loginStartMsg: "loginStartMsg",
    username: "username",
    password: "password",
    rememberMe: "rememberMe",
    login: "login",
    noAccount: "noAccount",
    registerHere: "registerHere",
    loginQuestion: "loginQuestion",
  };

  // Reusable CustomTextField component
  const CustomTextField = ({ name, labelKey, value, onChange, type = "text" }) => (
    <TextField
      name={name}
      margin="normal"
      fullWidth
      label={t(labelKey)}
      value={value}
      onChange={onChange}
      type={type}
      sx={{ mb: 2 }}
    />
  );

  const loginUser = async () => {
    try {
      const response = await axios.post("/login", { username, password }, { withCredentials: true });
      setAuth({ username, accessToken: response.data.accessToken });
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
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Paper elevation={4} sx={{ display: 'flex', borderRadius: 4, overflow: 'hidden' }}>
        {/* Left Panel - Login Form */}
        <Box sx={{ width: '50%', p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography component="h1" variant="h5" textAlign="center" fontWeight="bold" mb={3}>
            {t(labels.loginStartMsg)}
          </Typography>

          <CustomTextField
            name="username"
            labelKey={labels.username}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <CustomTextField
            name="password"
            labelKey={labels.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />

          <FormControlLabel
            control={<Checkbox onChange={togglePersist} checked={persist} />}
            label={t(labels.rememberMe)}
            sx={{ mb: 2 }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={loginUser}
            data-testid="login-submit"
            sx={{
              mt: 1,
              fontWeight: 'bold',
              backgroundColor: '#5254bc',
              '&:hover': {
                backgroundColor: '#3f47a3',
              },
            }}
          >
            🔓 {t(labels.login)}
          </Button>

          <Typography component="div" align="center" sx={{ marginTop: 3 }}>
            <NavLink to="/signup">
              {t(labels.noAccount)} <strong>{t(labels.registerHere)}</strong>
            </NavLink>
          </Typography>
        </Box>

        {/* Right Panel - Presenter */}
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
          {/* Placeholder for animation */}
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
            {t(labels.loginQuestion)}
          </Box>
        </Box>
      </Paper>

      {/* Notifications */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} message="Login successful" />
      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} message={`Error: ${error}`} />
      )}
    </Container>
  );
};

export default Login;