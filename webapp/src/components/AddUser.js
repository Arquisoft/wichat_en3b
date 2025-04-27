import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { useTranslation } from 'react-i18next';
import { Container, Typography, TextField, Button, Snackbar, Box, Paper, FormHelperText, alpha, InputLabel } from '@mui/material';
import { NavLink, useNavigate } from 'react-router';
import logInPic from './photos/logInPic.png';
import { grey } from '@mui/material/colors';
import useAuth from '../hooks/useAuth';

const AddUser = () => {
  const { auth } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [_, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();

  const labels = {
    createAccount: "createAccount",
    username: "username",
    password: "password",
    passwordReq: "passwordReq",
    signUp: "signUp",
    alreadyAccount: "alreadyAccount",
    loginHere: "loginHere",
    registerTxtBubble: "registerTxtBubble",
  };

  // Redirect if already logged in
  useEffect(() => {
    if (auth.username)
      navigate("/home", { replace: true });
  }, [auth, navigate]);

  const addUser = async () => {
    setError('');
    setUsernameError('');
    setPasswordError('');

    try {
      await axios.post("/adduser", { username, password });
      setOpenSnackbar(true);

      setTimeout(() => {
        navigate('/login');
      }, 500);
    } catch (error) {
      
      const errorMsg = error.response && error.response.data && error.response.data.error
      ? error.response.data.error
      : error.message || 'Unknown error';

    setError(errorMsg);

    if (errorMsg.includes('Username already taken')) {
      setUsernameError('Username already taken');
    } else if (errorMsg.toLowerCase().includes('username')) {
      setUsernameError(errorMsg);
    } else if (errorMsg.toLowerCase().includes('password')) {
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
            {t(labels.createAccount)}
          </Typography>
          <form onSubmit={(e) => { e.preventDefault(); addUser(); }}>
          <Box sx={{ mb: 3 }}>
            <InputLabel 
              htmlFor="username" 
              sx={{ 
                mb: 1, 
                fontWeight: 500,
                color: 'text.primary' 
              }}
            >
              {t(labels.username)}
            </InputLabel>
            <TextField
              id="username"
              name="username"
              fullWidth
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError('');
              }}
              error={!!usernameError}
              helperText={usernameError}
              variant="outlined"
              placeholder="Enter your username"
              sx={{ backgroundColor: "background.default" }}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <InputLabel 
              htmlFor="password" 
              sx={{ 
                mb: 1, 
                fontWeight: 500,
                color: 'text.primary' 
              }}
            >
              {t(labels.password)}
            </InputLabel>
            <TextField
              id="password"
              name="password"
              fullWidth
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              error={!!passwordError}
              helperText={passwordError}
              type="password"
              variant="outlined"
              placeholder="Enter your password"
              sx={{ backgroundColor: "background.default" }}
            />
            <FormHelperText sx={{ mt: 1, mx: 1, color: 'text.secondary' }}>
              {t(labels.passwordReq)}
            </FormHelperText>
          </Box>

          <Button
            fullWidth
            type="submit" 
            variant="contained"
            color="primary"
            data-testid="add-user-button"
            sx={{
              mt: 3,
              py: 1.5,
              fontWeight: 'bold',
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            {t(labels.signUp)}
          </Button>
        </form>


          <Typography component="div" align="center" sx={{ marginTop: 4 }}>
            <NavLink to={"/login"} style={{ textDecoration: 'none' }}>
              {t(labels.alreadyAccount)} <strong>{t(labels.loginHere)}</strong>
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
            {t(labels.registerTxtBubble)}
          </Box>
        </Box>
      </Paper>

      {/* Success Notification */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={t("userAddedSuccess")}
      />
    </Container>
  );
};

export default AddUser;