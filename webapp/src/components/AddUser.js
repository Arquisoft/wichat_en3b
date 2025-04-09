// src/components/AddUser.js
import React, { useState } from 'react';
import axios from '../api/axios';
import {useTranslation} from 'react-i18next';

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

  const {t} = useTranslation();

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

  const CustomTextField = ({ name, labelKey, value, onChange, error, helperText }) => {

    return (
      <TextField
        name={name}
        margin="normal"
        fullWidth
        label={t(labelKey)}
        value={value}
        onChange={onChange}
        error={!!error}
        helperText={helperText}
        sx={{ mb: 2 }}
    />
  );
};

  const navigate = useNavigate();

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

          <CustomTextField
            name="username"
            labelKey={labels.username}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setUsernameError('');
            }}
            error={usernameError}
            helperText={usernameError}
          />
          <CustomTextField
            name="password"
            labelKey={labels.password}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError('');
            }}
            error={passwordError}
            helperText={passwordError}
          />

          <FormHelperText sx={{ mb: 2, mx: 1 }}>
            {t(labels.passwordReq)}
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
            {t(labels.signUp)}
          </Button>

          <Typography component="div" align="center" sx={{ marginTop: 3 }}>
            <NavLink to={"/login"}>
              {t(labels.alreadyAccount)} <strong>{t(labels.loginHere)}</strong>
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
            {t(labels.registerTxtBubble)}
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
