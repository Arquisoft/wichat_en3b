"use client"

import { Container, CssBaseline, Typography, Button, Box, Paper, Grid } from "@mui/material"
import { styled } from "@mui/material/styles"
import { Outlet, NavLink } from "react-router"
import { School, Login, Person } from "@mui/icons-material"

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  background: "linear-gradient(to bottom right, #f5f7fa, #e4e8f0)",
  borderRadius: theme.shape.borderRadius,
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
    background: "linear-gradient(to right, #3f51b5, #7e57c2)",
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
  background: "linear-gradient(to right, #3f51b5, #7e57c2)",
  color: theme.palette.common.white,
  "&:hover": {
    background: "linear-gradient(to right, #303f9f, #5e35b1)",
    transform: "translateY(-3px)",
    boxShadow: theme.shadows[4],
  },
}))

const LoginButton = styled(ActionButton)(({ theme }) => ({
  background: theme.palette.common.white,
  color: theme.palette.primary.main,
  border: `1px solid ${theme.palette.primary.main}`,
  "&:hover": {
    background: theme.palette.grey[100],
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
  return (
    <Container maxWidth="sm">
      <CssBaseline />
      <StyledPaper elevation={3}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <School sx={{ fontSize: 60, color: "#3f51b5", mb: 2 }} />
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(to right, #3f51b5, #7e57c2)",
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

