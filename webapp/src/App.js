"use client"

import { Container, Typography, Button, Box, Paper, Grid } from "@mui/material"
import { styled } from "@mui/material/styles"
import { Outlet, useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import CelebrationIcon from '@mui/icons-material/Celebration';
import logInPic from "./components/photos/homeLogo.png";

//animation to fadeIn
const ZoomInPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  background: "background.paper",
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
    background: theme.palette.gradient.main.right,
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
}));

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

const StyledForm = styled('form')({
  textDecoration: "none",
  width: "100%",
  display: "flex",
  justifyContent: "center"
});

const SpeechBubble = styled(Box)(({ theme }) => ({
  position: "relative",
  background: theme.palette.primary.main,
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
    borderColor: `${theme.palette.primary.main} transparent transparent transparent`,
  },
}));

const TitleTypography = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  background: theme.palette.gradient.main.right,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  marginBottom: theme.spacing(3),
}));

function App() {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <Container maxWidth="sm">
      <ZoomInPaper elevation={3}>
        <Box data-testid="app-name-div" sx={{ textAlign: "center", mb: 4 }}>
          <TitleTypography component="h1" variant="h4">
            WICHAT
          </TitleTypography>
          <SpeechBubble variant="h5" color="textSecondary">
            {t("welcomeMsg")}
          </SpeechBubble>
          <BouncingImage src={logInPic} alt="Bouncing Icon" />
        </Box>
        
        <Grid container sx={{ mt: 2 }}>
          <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
            <StyledForm onSubmit={handleSubmit}> 
              <LoginButton type ="submit" variant="contained" startIcon={<CelebrationIcon />}>
                {t("welcomeButton")}
              </LoginButton>
            </StyledForm>
          </Grid>
        </Grid>
        
        </ZoomInPaper>
      <Outlet />
    </Container>
  )
}

export default App

