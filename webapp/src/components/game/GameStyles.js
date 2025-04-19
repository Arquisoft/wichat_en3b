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
  shouldForwardProp: (prop) => prop !== "isHidden",
})(({ theme, isHidden, hasSelectedAnswer, isSelected, isCorrect }) => ({
  padding: theme.spacing(2),
  fontSize: "1.5rem",
  fontWeight: "bold",
  visibility: isHidden ? "hidden" : "visible",
  backgroundColor:
    isCorrect && hasSelectedAnswer // If it's the correct answer, always green
      ? theme.palette.success.main
      : isSelected // If it's the selected answer
        ? theme.palette.error.main // Incorrect selection turns red
        : theme.palette.primary.main, // Default color

  color: theme.palette.common.white,
  "&:hover": {
    backgroundColor:
      isCorrect && hasSelectedAnswer
        ? theme.palette.success.dark
        : isSelected
          ? theme.palette.error.dark
          : theme.palette.primary.dark,
    transform: "scale(1.03)",
    boxShadow: theme.shadows[4],
  },
  transition: theme.transitions.create(["background-color", "transform", "box-shadow"], {
    duration: theme.transitions.duration.short,
  }),
}))

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
