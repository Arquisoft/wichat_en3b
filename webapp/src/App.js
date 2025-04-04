"use client"

import { Container, Typography, Button, Box, Paper, Grid } from "@mui/material"
import { styled } from "@mui/material/styles"
import { Outlet, NavLink } from "react-router"
import { School, Login, Person } from "@mui/icons-material"
import useTheme from "./hooks/useTheme";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "5px",
    background: theme.palette.gradient.main.right,
  },
}))

const ActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 3),
  margin: theme.spacing(1, 0),
  borderRadius: "30px",
  fontWeight: "bold",
  width: "100%",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: theme.shadows[4],
  },
}))

const GuestButton = styled(ActionButton)(({ theme }) => ({
  background: theme.palette.gradient.main.right,
  "&:hover": {
    background: theme.palette.gradient.hover.right,
    transform: "translateY(-3px)",
    boxShadow: theme.shadows[4],
  },
}))

const LoginButton = styled(ActionButton)(({ theme }) => ({
  background: "transparent",
  border: `1px solid ${theme.palette.primary.main}`,
  "&:hover": {
    background: "rgba(128, 128, 128, 0.1)",
    transform: "translateY(-3px)",
    boxShadow: theme.shadows[2],
  },
}))

const StyledNavLink = styled(NavLink)({
  textDecoration: "none",
  width: "100%",
  display: "block",
})

function App() {
  const { theme } = useTheme();

  return (
    <Container maxWidth="sm">
      <StyledPaper elevation={3}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <School sx={{ fontSize: 60, color: "#3f51b5", mb: 2 }} />
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: "bold",
              background: theme.palette.gradient.main.right,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            WICHAT
          </Typography>
          <Typography variant="h5" color="textSecondary" gutterBottom>
            Welcome to the 2025 edition of the Software Architecture course
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={6}>
            <StyledNavLink to="/home">
              <GuestButton variant="contained" startIcon={<Person />}>
                Continue as Guest
              </GuestButton>
            </StyledNavLink>
          </Grid>
          <Grid item xs={12} sm={6}>
            <StyledNavLink to="/login">
              <LoginButton variant="outlined" startIcon={<Login />}>
                Login
              </LoginButton>
            </StyledNavLink>
          </Grid>
        </Grid>
      </StyledPaper>
      <Outlet />
    </Container>
  )
}

export default App

