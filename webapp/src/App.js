"use client"

import { Container, Typography, Button, Box, Paper, Grid } from "@mui/material"
import { styled } from "@mui/material/styles"
import { Outlet, NavLink } from "react-router"
import { School, Login } from "@mui/icons-material"
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
  maxWidth: "200px",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: theme.shadows[4],
  },
}))

const LoginButton = styled(ActionButton)(({ theme }) => ({
  color: theme.palette.secondary.main,
  background: theme.palette.background.default,
  border: `1px solid ${theme.palette.secondary.main}`,
  "&:hover": {
    background: theme.palette.action.hover,
    transform: "translateY(-3px)",
    boxShadow: theme.shadows[4],
  },
}))

const StyledNavLink = styled(NavLink)({
  textDecoration: "none",
  width: "100%",
  display: "flex",
  justifyContent: "center",
})

function App() {
  const { theme } = useTheme();

  return (
    <Container maxWidth="sm">
      <StyledPaper elevation={3}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <School sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
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

        <Grid container sx={{ mt: 4 }}>
          <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
            <StyledNavLink to="/login">
              <LoginButton variant="contained" startIcon={<Login />}>
                LOGIN
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

