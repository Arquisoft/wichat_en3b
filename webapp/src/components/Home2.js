import { useState } from "react";
import { Box, Button, Card, CardHeader, Container, FormControl, InputLabel, MenuItem, Paper, Select, Tab, Tabs, Typography } from "@mui/material";
import { BarChart, ChevronRight, FilterAlt, People } from "@mui/icons-material";
import { useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";

const Home = () => {
    const axios = useAxios();
    const { auth } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState(0);
    const [gamemode, setGamemode] = useState("");
    const [ranking, setRanking] = useState([]);

    const gamemodes = [];

    return (
        <Container sx={{
            bgcolor: "rgba(255, 255, 255, 0.5)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            borderRadius: 4,
            my: 4,
            py: 4
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
                <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tab icon={<BarChart fontSize="small" />} label="Your Stats" iconPosition="start" />
                    <Tab icon={<People fontSize="small" />} label="Rankings" iconPosition="start" />
                </Tabs>

                {/* Statistics tab */}
                <Box hidden={activeTab !== 0} py={4}>
                    <Typography variant="h6" fontWeight="bold">
                        Your Statistics
                    </Typography>
                </Box>

                {/* Rankings tab */}
                <Box hidden={activeTab !== 1} py={4}>
                    <CardHeader title="Leaderboard" subheader="Top players ranked by some stat" sx={{ p: 0 }} action={
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150, mt: { xs: 2, sm: 0 } }}>
                            <InputLabel id="game-mode-select-label">Game Mode</InputLabel>
                            <Select
                                value={gamemode}
                                onChange={(e) => setGamemode(e.target.value)}
                                label="Game Mode"
                                startAdornment={<FilterAlt fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />}
                            >
                                {gamemodes.map((mode) => (
                                    <MenuItem key={mode.id} value={mode.id}>
                                        {mode.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    } />
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                        {ranking.map((user, index) => {
                            {/* ranking data */}
                        })}
                    </Box>
                </Box>
            </Box>

            {/* Game mode selection */}
            <Paper elevation={3} sx={{ p: 2, display: "flex", justifyContent: "space-between", gap: 2 }}>
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