import { styled } from "@mui/material/styles"
import { Button, Container, Paper, Typography } from "@mui/material"

export const StyledContainer = styled(Container)(({ theme }) => ({
    padding: theme.spacing(4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(3),
}))
  
export const SectionPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    width: "100%",
    background: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
}))

export const SectionTitle = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    fontWeight: "bold",
    color: theme.palette.primary.main,
    textAlign: "center",
    textTransform: "uppercase",
    borderBottom: `2px solid ${theme.palette.primary.main}`,
    paddingBottom: theme.spacing(1),
}))

export const StyledButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
    padding: theme.spacing(1.5, 4),
    fontSize: "1.2rem",
    fontWeight: "bold",
    borderRadius: 30,
    background: theme.palette.gradient.main.right,
    "&:hover": {
      background: theme.palette.gradient.hover.right,
      transform: "scale(1.03)",
      color: "white"
    },
    "&.Mui-disabled": {
      background: theme.palette.background.paper,
      color: theme.palette.text.disabled,
    },
    transition: theme.transitions.create(["transform"], {
      duration: theme.transitions.duration.short,
    }),
}))

export const ModeButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== "isSelected",
    })(({ theme, isSelected }) => ({
    padding: theme.spacing(2, 3),
    borderRadius: theme.shape.borderRadius,
    fontWeight: "bold",
    background: isSelected ? "linear-gradient(to right, #2196f3, #9c27b0)" : theme.palette.background.paper,
    color: isSelected ? theme.palette.common.white : theme.palette.text.primary,
    border: isSelected ? "none" : `1px solid ${theme.palette.divider}`,
    boxShadow: isSelected ? theme.shadows[3] : "none",
    transition: theme.transitions.create(["background", "transform", "box-shadow"], {
        duration: theme.transitions.duration.short,
    }),
    "&:hover": {
        background: isSelected ? "linear-gradient(to right, #1e88e5, #1e88e5)" : theme.palette.action.hover,
        transform: "translateY(-2px)",
        boxShadow: isSelected ? theme.shadows[4] : theme.shadows[1],
    },
    textAlign: "center",
}))

export const TopicButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== "isSelected",
})(({ theme, isSelected }) => ({
    padding: theme.spacing(1.5, 2),
    borderRadius: theme.shape.borderRadius,
    fontWeight: "bold",
    background: isSelected ? theme.palette.gradient.main.left : theme.palette.background.default,
    color: isSelected ? theme.palette.common.white : theme.palette.text.primary,
    border: isSelected ? "none" : `1px solid ${theme.palette.divider}`,
    boxShadow: isSelected ? theme.shadows[3] : "none",
    textTransform: "none",
    transition: theme.transitions.create(["background", "transform", "box-shadow"], {
      duration: theme.transitions.duration.short,
    }),
    width: "100%",
    height: "100%",
    "&:hover": {
      background: isSelected ? theme.palette.gradient.hover.left : theme.palette.action.hover,
      transform: "translateY(-2px)",
      boxShadow: isSelected ? theme.shadows[4] : theme.shadows[1],
    },
    "& .MuiButton-startIcon": {
      marginRight: theme.spacing(1),
    },
}))