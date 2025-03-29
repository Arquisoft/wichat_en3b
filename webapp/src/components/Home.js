import { useState } from "react";
import { Avatar, Box, Button, CardHeader, Container, Divider, FormControl, InputLabel, MenuItem, Paper, Select, Tab, Tabs, Typography } from "@mui/material";
import { BarChart, ChevronRight, FilterAlt, People } from "@mui/icons-material";
import { useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";

const Home = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState(0);
    const [gamemode, setGamemode] = useState("");
    const [stat, setStat] = useState("points");
    const [ranking, setRanking] = useState([{
        rank: 1,
        name: "Sarah Kim",
        points: 7250,
        precision: 94,
        avgTime: "18s",
        gamesPlayed: 120,
        avatar: "/placeholder.svg?height=40&width=40",
    },
    {
        rank: 2,
        name: "Mike Chen",
        points: 6840,
        precision: 91,
        avgTime: "20s",
        gamesPlayed: 105,
        avatar: "/placeholder.svg?height=40&width=40",
    },
    {
        rank: 3,
        name: "Taylor Swift",
        points: 6210,
        precision: 88,
        avgTime: "19s",
        gamesPlayed: 98,
        avatar: "/placeholder.svg?height=40&width=40",
    },
    {
        rank: 4,
        name: "Alex Johnson",
        points: 4850,
        precision: 82,
        avgTime: "24s",
        gamesPlayed: 42,
        avatar: "/placeholder.svg?height=40&width=40",
        isCurrentUser: true,
    },
    {
        rank: 5,
        name: "Jordan Lee",
        points: 4720,
        precision: 85,
        avgTime: "22s",
        gamesPlayed: 65,
        avatar: "/placeholder.svg?height=40&width=40",
    },
    {
        rank: 5,
        name: "Jordan Lee",
        points: 4720,
        precision: 85,
        avgTime: "22s",
        gamesPlayed: 65,
        avatar: "/placeholder.svg?height=40&width=40",
    },
    {
        rank: 5,
        name: "Jordan Lee",
        points: 4720,
        precision: 85,
        avgTime: "22s",
        gamesPlayed: 65,
        avatar: "/placeholder.svg?height=40&width=40",
    },]);

    const gamemodes = ["cities", "flags", "athletes", "singers"];
    const stats = ["points", "accuracy", "avgTime", "gamesPlayed"];

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
                justifyContent: "space-between",
                pb: 2
            }}>
                <Box>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        Welcome back, {auth.username}!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Ready for your next trivia challenge?
                    </Typography>
                </Box>
                <Avatar src={auth.avatar || "/placeholder.svg"} alt={auth.username} sx={{
                    width: 48,
                    height: 48,
                    border: 2,
                    borderColor: "primary.main",
                }} />
            </Box>

            {/* Main content */}
            <Box>
                {/* Tab navigation */}
                <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tab icon={<BarChart fontSize="small" />} label="Your Stats" iconPosition="start" />
                    <Tab icon={<People fontSize="small" />} label="Rankings" iconPosition="start" />
                </Tabs>

                {/* Statistics tab */}
                <Box hidden={activeTab !== 0} my={4}>
                    <CardHeader title="Your Statistics" subheader="// TODO" sx={{ p: 0, mb: 2 }} />
                </Box>

                {/* Rankings tab */}
                <Box hidden={activeTab !== 1} mb={4}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", width: "100%" }}>
                        <CardHeader title="Leaderboard" subheader="Top players ranked by some stat" />
                        <Box sx={{ p: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
                                Rank by:
                            </Typography>
                            <Tabs
                                value={stat}
                                onChange={(_, val) => setStat(val)}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{ bgcolor: "rgba(64, 64, 64, 0.1)", borderRadius: 2, gap: 1 }}
                            >
                                {stats.map((stat) => <Tab key={stat} value={stat} label={stat} />)}
                            </Tabs>
                        </Box>
                        <FormControl variant="outlined" size="small" sx={{ justifySelf: "end", minWidth: 150 }}>
                            <InputLabel>Game Mode</InputLabel>
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
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", bgcolor: "rgba(255, 255, 255, 0.8)", borderRadius: 2, maxHeight: "40vh", overflowY: "auto" }}>
                        {ranking.map((user, index) => (
                            <>
                                <Box key={user.username} sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: auth.username === user.username ? "rgba(25, 118, 210, 0.1)" : "transparent",
                                    border: auth.username === user.username ? 1 : 0,
                                    borderColor: "primary.main",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        <Typography variant="body1" fontWeight="bold">
                                            {index + 1}
                                        </Typography>
                                        <Avatar src={user.avatar} alt={user.name} sx={{ width: 40, height: 40 }} />
                                        <Typography variant="body1" fontWeight="medium">
                                            {user.name}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Some stat
                                    </Typography>
                                </Box>
                                {index < ranking.length - 1 && <Divider />}
                            </>
                        ))}
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