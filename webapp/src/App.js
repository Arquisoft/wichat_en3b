"use client"

import { Container, CssBaseline, Typography, Button, Box, Paper, Grid } from "@mui/material"
import { styled } from "@mui/material/styles"
import { Outlet, NavLink } from "react-router"
import { School, Login } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import CelebrationIcon from '@mui/icons-material/Celebration';
import logInPic from "./components/photos/homeLogo.png"

//animation to fadeIn
const ZoomInPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  background: "linear-gradient(to bottom right, #f5f7fa, #e4e8f0)",
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  position: "relative",
  overflow: "hidden",
  animation: "zoomInFromFar 1.2s ease-out",

  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "5px",
    background: "linear-gradient(to right, #3f51b5, #7e57c2)",
  },

  "@keyframes zoomInFromFar": {
    "0%": {
      opacity: 0,
      transform: "scale(0.5) translateY(-50px)",
    },
    "100%": {
      opacity: 1,
      transform: "scale(1) translateY(0)",
    },
  },
}))

//animation for the graduation cap 
const BouncingSchoolIcon = styled(School)(({ theme }) => ({
  fontSize: 60,
  color: "#3f51b5",
  marginBottom: theme.spacing(2),
  animation: "bounce 2s infinite ease-in-out",

  "@keyframes bounce": {
    "0%, 100%": {
      transform: "translateY(0)",
    },
    "50%": {
      transform: "translateY(-12px)",
    },
  },
}))

const BouncingImage = styled("img")(({ theme }) => ({
  width: 120,
  height: 120,
  marginTop: theme.spacing(2),
  animation: "bounce 2s infinite ease-in-out",

  "@keyframes bounce": {
    "0%, 100%": {
      transform: "translateY(15px)",
    },
    "50%": {
      transform: "translateY(-5px)",
    },
  },
}));

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
  maxWidth: "200px",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
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
    boxShadow: theme.shadows[4],
  },
}))

const StyledNavLink = styled(NavLink)({
  textDecoration: "none",
  width: "100%",
  display: "flex",
  justifyContent: "center",
})

const SpeechBubble = styled(Box)(({ theme }) => ({
  position: "relative",
  background: "#4a3c8c",
  borderRadius: "15px",
  padding: theme.spacing(2.5),
  color: "#ffffff",
  maxWidth: "80%",
  margin: "0 auto",
  fontWeight: "bold",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: "-30px",
    left: "50%",
    transform: "translateX(-50%)",
    borderWidth: "25px", 
    borderStyle: "solid",
    borderColor: "#4a3c8c transparent transparent transparent",
  },

}));

const TitleTypography = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  background: "linear-gradient(to right, #3f51b5, #7e57c2)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  marginBottom: theme.spacing(3),
}));

function App() {
  const {t} = useTranslation();
  return (
    <Container maxWidth="sm">
      <CssBaseline />
      <ZoomInPaper elevation={3}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <TitleTypography component="h1" variant="h4">
            WICHAT
          </TitleTypography>
          <SpeechBubble variant="h5" color="textSecondary" gutterBottom>
            {t("welcomeMsg")}
          </SpeechBubble>
          <BouncingImage src={logInPic} alt="Bouncing Icon" />
          {/* <BouncingSchoolIcon sx={{ fontSize: 60, color: "#3f51b5", mb: 2 }} /> */}
          
        </Box>
        
        <Grid container sx={{ mt: 2 }}>
          <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
            <StyledNavLink to="/login">
              <LoginButton variant="contained" startIcon={<CelebrationIcon />}>
                Start the fun!
              </LoginButton>
            </StyledNavLink>
          </Grid>
        </Grid>
        
        </ZoomInPaper>
      <Outlet />
    </Container>
  )
}

export default App

