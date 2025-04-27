import { styled } from "@mui/material/styles"
import { AppBar, Button, Box, Container, Paper } from "@mui/material"

export const GameContainer = styled(Container)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}))

export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.gradient.main.left,
  boxShadow: theme.shadows[3],
}))

export const LogoButton = styled(Button)(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: "bold",
  color: theme.palette.common.white,
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
}))

export const ScoreChip = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.common.white,
  borderRadius: 20,
  display: "inline-flex",
  alignItems: "center",
  fontWeight: "bold",
}))

export const CoinsChip = styled(Button)(({ theme }) => ({
  backgroundColor: "#ffc107",
  color: "#333",
  borderRadius: 20,
  fontWeight: "bold",
  "&:hover": {
    backgroundColor: "#ffb300",
  },
}))

export const LifelineButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "isUsed" && prop !== "colorVariant",
})(({ theme, isUsed, colorVariant }) => ({
  width: "100%",
  marginBottom: theme.spacing(2),
  backgroundColor: isUsed
    ? theme.palette.grey[300]
    : colorVariant === "blue"
      ? theme.palette.primary.main
      : colorVariant === "green"
        ? theme.palette.success.main
        : colorVariant === "red"
          ? "#d94a2b"
          : theme.palette.secondary.main,
  color: isUsed ? theme.palette.text.disabled : theme.palette.common.white,
  "&:hover": {
    backgroundColor: isUsed
      ? theme.palette.grey[300]
      : colorVariant === "blue"
        ? theme.palette.primary.dark
        : colorVariant === "green"
          ? theme.palette.success.dark
          : colorVariant === "red"
            ? "#b14027"
            : theme.palette.secondary.dark,
    transform: isUsed ? "none" : "scale(1.03)",
  },
  transition: theme.transitions.create(["background-color", "transform"], {
    duration: theme.transitions.duration.short,
  }),
}));

export const OptionButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "isHidden" && prop !== "isCorrect" && prop !== "isSelected" && prop !== "hasSelectedAnswer",
})(({ theme, isHidden, hasSelectedAnswer, isSelected, isCorrect }) => ({
  padding: theme.spacing(2),
  fontSize: "1.5rem",
  fontWeight: "bold",
  visibility: isHidden ? "hidden" : "visible",
  backgroundColor:
    isCorrect && hasSelectedAnswer
      ? theme.palette.success.main
      : isSelected
      ? theme.palette.error.main
      : theme.palette.primary.main,

  color: theme.palette.common.white,
  border: `2px solid ${
    isCorrect && hasSelectedAnswer
      ? theme.palette.success.light
      : isSelected
      ? theme.palette.error.light
      : "transparent"
  }`,
  boxShadow: hasSelectedAnswer
    ? isCorrect
      ? `0 0 15px ${theme.palette.success.light}`
      : isSelected
      ? `0 0 15px ${theme.palette.error.light}`
      : "none"
    : "none",

  transform: hasSelectedAnswer
    ? isCorrect
      ? "scale(1.05)"
      : isSelected
      ? "rotate(-2deg)"
      : "none"
    : "none",

  animation: hasSelectedAnswer
    ? isCorrect
      ? "correctBounce 0.5s ease"
      : isSelected
      ? "incorrectShake 0.5s ease"
      : "none"
    : "none",

  transition: theme.transitions.create(
    ["background-color", "transform", "box-shadow", "border"],
    { duration: theme.transitions.duration.short }
  ),

  "@keyframes correctBounce": {
    "0%": { transform: "scale(1)" },
    "50%": { transform: "scale(1.15)" },
    "100%": { transform: "scale(1.05)" },
  },
  "@keyframes incorrectShake": {
    "0%": { transform: "translateX(0)" },
    "20%": { transform: "translateX(-5px)" },
    "40%": { transform: "translateX(5px)" },
    "60%": { transform: "translateX(-5px)" },
    "80%": { transform: "translateX(5px)" },
    "100%": { transform: "translateX(0)" },
  },
}));

export const ImageContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  marginBottom: theme.spacing(3),
  "& img": {
    maxHeight: 250,
    objectFit: "cover",
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
  },
}))

export const LoadingContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6),
  height: "100%",
  minHeight: 300,
}))

export const HighlightedTopic = styled('span')(({ theme }) => ({
  color: theme.palette.secondary.main,
}))
