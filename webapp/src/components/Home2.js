import { useState } from "react";
import { Box, Button, Container, Paper, Tab, Tabs, Typography } from "@mui/material";
import { BarChart, ChevronRight, People } from "@mui/icons-material";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router";

const Home = () => {
    const [activeTab, setActiveTab] = useState(0);
    const { auth } = useAuth();
    const navigate = useNavigate();

    const handleTabChange = (_, newValue) => {
        setActiveTab(newValue);
    }

    return (
        <Container sx={{
            bgcolor: "rgba(0, 0, 0, 0.15)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            borderRadius: 4,
            my: 4,
            py: 4,
        }}>
            {/* Header with greeting */}
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                pb: 2
            }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Welcome back, {auth.username}!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Ready for your next trivia challenge?
                </Typography>
            </Box>

            {/* Main content */}
            <Box>
                {/* Tab navigation */}
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard tabs">
                        <Tab icon={<BarChart fontSize="small" />} label="Your Stats" iconPosition="start" />
                        <Tab icon={<People fontSize="small" />} label="Rankings" iconPosition="start" />
                    </Tabs>
                </Box>

                {/* Statistics tab */}
                <Box hidden={activeTab !== 0}>
                    <Typography variant="h6" fontWeight="bold">
                        Your Statistics
                    </Typography>
                </Box>

                {/* Rankings tab */}
                <Box hidden={activeTab !== 1}>
                    <Typography variant="h6" fontWeight="bold">
                        Global Rankings
                    </Typography>
                </Box>
            </Box>

            {/* Game mode selection */}
            <Paper elevation={3} sx={{ mt: 4, p: 2, display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">
                        Ready to play?
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.8 }}>
                        Choose a game mode and test your knowledge!
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    endIcon={<ChevronRight />}
                    onClick={() => navigate("/gametopic")}
                    sx={{
                        width: { xs: "100%", md: "auto" },
                        whiteSpace: "nowrap"
                    }}
                >
                    Play A Game Now
                </Button>
            </Paper>
        </Container>
    );
}

export default Home;