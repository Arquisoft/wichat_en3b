import React from 'react';
import './App.css';

import { Container, CssBaseline, Typography, Button } from '@mui/material';
import { Outlet, NavLink } from 'react-router';

function App() {

  return (
    <Container component="main" maxWidth="xs">

      <nav>
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/signup">Sign up</NavLink>
        <NavLink to="/welcome">Guest</NavLink>
      </nav>

      <CssBaseline />
      <Typography component="h1" variant="h5" align="center" sx={{ marginTop: 2 }}>
        Welcome to the 2025 edition of the Software Architecture course!
      </Typography>
      <NavLink to="/welcome">
        <Button variant="contained" color="primary">
          Continue as a guest
        </Button>
      </NavLink>
      <NavLink to="/login">
        <Button variant="contained" color="primary">
          Login
        </Button>
      </NavLink>
      <Outlet />
    </Container>
  );
}

export default App;