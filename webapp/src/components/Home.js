import { useEffect, useState } from "react";
import { Avatar, Box, Button, CardHeader, Chip, Container, Divider, FormControl, InputLabel, MenuItem, Paper, Select, Tab, Tabs, Typography } from "@mui/material";
import { BarChart, ChevronRight, FilterAlt, People } from "@mui/icons-material";
import { useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";

const Home = () => {
    const axios = useAxios();
    const { auth } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState(0);
    const [gametopic, setGameTopic] = useState("all");
    const [gametopics, setGameTopics] = useState(["all"]);
    const [stat, setStat] = useState("points");
    const [ranking, setRanking] = useState([]);
    const [userStats, setUserStats] = useState(null);

    const stats = ["points", "accuracy", "gamesPlayed"];

    useEffect(() => {
        axios.get(`/userstats/${auth.username}/all`)
            .then((res) => {
                setUserStats(res.data.stats);
            }).catch((err) => {
                console.error("Error fetching user stats:", err);
            });

        axios.get("/getTopics")
            .then((res) => {
                setGameTopics(["all", ...res.data.topics]);
            }).catch((err) => {
                console.error("Error fetching gametopics:", err);
            });
    }, []);

    useEffect(() => {
        axios.get(`/userstats/topic/${gametopic}`)
            .then((res) => {
                // sort the ranking based on the selected stat
                const sortedRanking = res.data.stats.sort((a, b) => {
                    if (stat === "points") return b.totalScore - a.totalScore;
                    if (stat === "accuracy") return b.correctRate - a.correctRate;
                    if (stat === "gamesPlayed") return b.totalGamesPlayed - a.totalGamesPlayed;
                });
                setRanking(sortedRanking);
            }).catch((err) => {
                console.error("Error fetching user stats:", err);
            });
    }, [stat, gametopic]);


    const getStatLabel = (user, stat) => {
        switch (stat) {
            case "accuracy":
                return (user.correctRate * 100).toFixed(2) + " %";
            case "gamesPlayed":
                return user.totalGamesPlayed + " games";
            case "points":
                return user.totalScore + " pts";
        }
    }

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
                    <CardHeader title="Your Statistics" sx={{ p: 0, mb: 2 }} />
                    {userStats?.username ? (
                        <Box>
                            <Typography variant="body1">Total score: {getStatLabel(userStats, "points")}</Typography>
                            <Typography variant="body1">Accuracy rate: {getStatLabel(userStats, "accuracy")}</Typography>
                            <Typography variant="body1">Games played: {getStatLabel(userStats, "gamesPlayed")}</Typography>
                        </Box>
                    ) : (
                        <Typography variant="body1" color="text.secondary">No statistics found.</Typography>
                    )}
                </Box>

                {/* Rankings tab */}
                <Box hidden={activeTab !== 1} mb={4}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", width: "100%" }}>
                        <CardHeader title="Leaderboard" subheader={`Top players ranked by ${stat}`} />
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
                            <InputLabel>Game topic</InputLabel>
                            <Select
                                value={gametopic}
                                onChange={(e) => setGameTopic(e.target.value)}
                                label="Game topic"
                                startAdornment={<FilterAlt fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />}
                            >
                                {gametopics.map((topic) => (
                                    <MenuItem key={topic} value={topic}>
                                        {topic}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", bgcolor: "rgba(255, 255, 255, 0.8)", borderRadius: 2, maxHeight: "40vh", overflowY: "auto" }}>
                        {ranking.map((user, index) => (
                            <>
                                <Box key={user._id} sx={{
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
                                        <Avatar src={user.avatar} alt={user.username} sx={{ width: 40, height: 40 }} />
                                        <Typography variant="body1" fontWeight="medium">
                                            {user.username}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        {auth.username === user.username && <Chip label="You" color="primary" size="small" variant="outlined" />}
                                        <Typography variant="body2" color="text.secondary">
                                            {getStatLabel(user, stat)}
                                        </Typography>
                                    </Box>
                                </Box>
                                {index < ranking.length - 1 && <Divider />}
                            </>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* Game topic selection */}
            <Paper elevation={3} sx={{ p: 2, display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">
                        Ready to play?
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.8 }}>
                        Choose a game topic and test your knowledge!
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