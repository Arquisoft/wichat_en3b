// src/components/AddUser.js
import React, { useState } from 'react';
import axios from '../api/axios';
import { Container, Typography, TextField, Button, Snackbar } from '@mui/material';
import { NavLink } from 'react-router';

const AddUser = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const addUser = async () => {
    try {
      await axios.post("/adduser", { username, password });
      setOpenSnackbar(true);
    } catch (error) {
      setError(error.response?.data?.error || 'Unknown error');
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ marginTop: 4 }}>
      <Typography component="h1" variant="h5">
        Add User
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
      <Button variant="contained" color="primary" onClick={addUser}>
        Add User
      </Button>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} message="User added successfully" />
      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} message={`Error: ${error}`} />
      )}
      
      <Typography component="div" align="center" sx={{ marginTop: 2 }}>
        <NavLink to={"/login"}>
          Already have an account? Login here.
        </NavLink>
      </Typography>
    </Container>
  );
};

export default AddUser;
