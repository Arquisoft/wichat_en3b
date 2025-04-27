import { useEffect, useState } from "react";
import { alpha, Avatar, Box, Button, CardHeader, Chip, Container, Divider, FormControl, Grid2, InputLabel, MenuItem, Select, Tab, Tabs, Typography } from "@mui/material";
import { AccessTime, AutoAwesome, BarChart, BlurOn, ChevronRight, FilterAlt, Games, LocationCity, MusicNote, OutlinedFlag, People, SportsBasketball, SportsEsports, TrackChanges } from "@mui/icons-material";
import { useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import useTheme from "../hooks/useTheme";
import {useTranslation} from "react-i18next";

const Home = () => {
    const axios = useAxios();
    const { auth } = useAuth();
    const navigate = useNavigate();
    const { theme } = useTheme();

    const [activeMainTab, setactiveMainTab] = useState(0);
    const [activeModeTab, setActiveModeTab] = useState("rounds");
    const [mode, setMode] = useState("rounds");
    const [gametopic, setGameTopic] = useState("all");
    const [gametopics, setGameTopics] = useState(["all"]);
    const [stat, setStat] = useState("points");
    const [ranking, setRanking] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [games, setGames] = useState([]);

    const stats = ["points", "accuracy", "gamesPlayed"];

    useEffect(() => {
        // Clear selected topics after finishing the game and navigating back to the home page
        sessionStorage.removeItem("selectedTopics");

        // Get game topics
        axios.get("/getTopics")
            .then((res) => {
                setGameTopics(["all", ...res.data.topics]);
            }).catch((err) => {
                console.error("Error fetching gametopics:", err);
            });

        // Get recent games
        axios.get(`/games/${auth.username}`)
            .then((res) => {
                setGames(res.data.games.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            }).catch((err) => {
                console.error("Error fetching games:", err);
            });
    }, []);

    useEffect(() => {
        // Get user statistics for the selected mode
        axios.get(`/userstats?username=${auth.username}&mode=${mode}&topic=all`)
            .then((res) => {
                setUserStats(res.data.stats[0]);
            }).catch((err) => {
                console.error("Error fetching user stats:", err);
            });
    }, [mode]);

    // Get all user statistics for the selected game topic and stat
    useEffect(() => {
        axios.get(`/userstats?topic=${gametopic}&mode=${mode}`)
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
    }, [stat, gametopic, mode]);

    const getStatLabel = (user, stat) => {
        switch (stat) {
            case "accuracy":
                return (user.correctRate * 100).toFixed(2) + " %";
            case "gamesPlayed":
                return user.totalGamesPlayed == 1? 
                `${user.totalGamesPlayed} ${t("game")}`:
                `${user.totalGamesPlayed} ${t("games")}`;
            case "points":
                return user.totalScore + " pts";
        }
    }

    const getIconForTopics = (topics) => {
        const icons = {
            "all": <AutoAwesome sx={{ p: 0.5, color: "secondary.main", bgcolor: "rgba(169, 64, 255, 0.2)", borderRadius: "100%" }} />,
            "flag": <OutlinedFlag sx={{ p: 0.5, color: "greenyellow", bgcolor: "rgba(173, 255, 47, 0.2)", borderRadius: "100%" }} />,
            "city": <LocationCity sx={{ p: 0.5, color: "green", bgcolor: "rgba(0, 128, 0, 0.2)", borderRadius: "100%" }} />,
            "athlete": <SportsBasketball sx={{ p: 0.5, color: "orange", bgcolor: "rgba(255, 165, 0, 0.2)", borderRadius: "100%" }} />,
            "singer": <MusicNote sx={{ p: 0.5, color: "blue", bgcolor: "rgba(0, 0, 255, 0.2)", borderRadius: "100%" }} />,
        }

        return topics.length > 1 ? icons["all"] : icons[topics[0]];
    }

    const getMsg2 = (num) => {
        if(num === 1) {
            return t("game");
        }else{
            return t("games");
        }
    }

    const { t, i18n } = useTranslation();

    const formatGameTopics = (topics) => {
        const maxLength = 3;
        if(topics.length <= maxLength) {
            return topics.join(", ");
        }else{
            return topics.slice(0, maxLength).join(", ") + "... " + t("and") + (topics.length - maxLength) +  t("more");
        }
    }

    return (
        <Container sx={{
            bgcolor: alpha(theme.palette.background.paper, 0.5),
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
                        {t("welcomeBack")} {auth.username}!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t("ready")}
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
                <Box sx={{ display: "flex", justifyContent: "space-between", borderBottom: 1, borderColor: "divider" }}>
                    <Tabs value={activeMainTab} onChange={(_, val) => setactiveMainTab(val)}>
                        <Tab icon={<BarChart fontSize="small" />} label={t("stats")} iconPosition="start" />
                        <Tab icon={<People fontSize="small" />} data-testid="ranking" label={t("ranking")} iconPosition="start" />
                    </Tabs>

                    <Tabs
                        value={activeModeTab}
                        onChange={(_, val) => {
                            setActiveModeTab(val);
                            setMode(val);
                        }}
                    >
                        <Tab value="rounds" label={t("rounds")} icon={<Games fontSize="small" />} iconPosition="start" />
                        <Tab value="time" label={t("time")} icon={<AccessTime fontSize="small" />} iconPosition="start" />
                        <Tab value="hide" label={t("hide")} icon={<BlurOn fontSize="small" />} iconPosition="start" />
                    </Tabs>
                </Box>

                {/* Statistics tab */}
                <Box hidden={activeMainTab !== 0} mb={4}>
                    {/* User statistics */}
                    <CardHeader 
                        title={
                            <Typography variant="h5">
                                {t("statsFor")} <Typography component="span" variant="h5" fontWeight="bold">{t(mode)}</Typography>
                            </Typography>
                        } 
                        sx={{ p: 0, my: 2 }} 
                    />
                    {userStats?.username ? (
                        <Grid2 container spacing={2}>
                            <Grid2 size={4} sx={{ display: "flex", alignItems: "center", gap: 2, p: 4, borderRadius: 2, bgcolor: "background.paper", border: 1, borderColor: "divider" }}>
                                <SportsEsports fontSize="large" sx={{ p: 1, color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.2), borderRadius: "100%" }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">{t("totalScore")}</Typography>
                                    <Typography variant="h5" fontWeight="bold">{getStatLabel(userStats, "points")}</Typography>
                                </Box>
                            </Grid2>
                            <Grid2 size={4} sx={{ display: "flex", alignItems: "center", gap: 2, p: 4, borderRadius: 2, bgcolor: "background.paper", border: 1, borderColor: "divider" }}>
                                <TrackChanges fontSize="large" sx={{ p: 1, color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.2), borderRadius: "100%" }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">{t("accuracyRate")}</Typography>
                                    <Typography variant="h5" fontWeight="bold">{getStatLabel(userStats, "accuracy")}</Typography>
                                </Box>
                            </Grid2>
                            <Grid2 size={4} sx={{ display: "flex", alignItems: "center", gap: 2, p: 4, borderRadius: 2, bgcolor: "background.paper", border: 1, borderColor: "divider" }}>
                                <AutoAwesome fontSize="large" sx={{ p: 1, color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.2), borderRadius: "100%" }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">{t("gamesPlayed")}</Typography>
                                    <Typography variant="h5" fontWeight="bold">{getStatLabel(userStats, "gamesPlayed")}</Typography>
                                </Box>
                            </Grid2>
                        </Grid2>
                    ) : (
                        <Typography variant="body1" color="text.secondary">{t("noStats")}</Typography>
                    )}

                    {/* Recent games */}
                    <CardHeader title={t("recentGames")} subheader={`${t("recentMsg1")} ${games.length} ${getMsg2(games.length)}`} sx={{ p: 0, my: 2 }} />
                    <Box sx={{ display: "flex", flexDirection: "column", bgcolor: "background.paper", borderRadius: 2, maxHeight: "25vh", overflowY: "auto" }}>
                        {games.length > 0 ? games.map((game, index) => (
                            <>
                                <Box key={index} sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: "transparent",
                                    borderColor: "primary.main",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        {getIconForTopics(game.gameTopic)}
                                        <Box>
                                            <Typography variant="body1" fontWeight="bold">
                                                {t(game.gameMode).toUpperCase()} - {t("topics")}: {formatGameTopics(game.gameTopic)}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {t("playedAt")}{new Date(game.createdAt).toLocaleDateString(i18n.language)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {game.score} pts
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {(game.correctRate * 100).toFixed(2)}% {t("accuracy")}
                                        </Typography>
                                    </Box>
                                </Box>
                                {index < games.length - 1 && <Divider />}
                            </>
                        )) : (
                            <Typography variant="body1" color="text.secondary">{t("noRecentGames")}</Typography>
                        )}
                    </Box>
                </Box>

                {/* Rankings tab */}
                <Box hidden={activeMainTab !== 1} mb={4}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", width: "100%" }}>
                    <CardHeader 
                        title={`${t(mode)}: ${t("leaderboard")}`} 
                        subheader={
                            <Typography variant="subtitle2" color="text.secondary">
                                {t("topBy")} <Typography component="span" fontWeight="bold">{t(stat)}</Typography>
                            </Typography>
                        }
                    />
                        <Box sx={{ p: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
                                ":
                            </Typography>
                            <Tabs
                                value={stat}
                                onChange={(_, val) => setStat(val)}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{ bgcolor: "background.paper", borderRadius: 2, gap: 1 }}
                            >
                                {stats.map((stat) => <Tab key={stat} value={stat} label={t(stat)} data-testid={stat} />)}
                            </Tabs>
                        </Box>
                        <FormControl variant="outlined" size="small" sx={{ justifySelf: "end", minWidth: 150 }}>
                            <InputLabel>{t("gameTopic")}</InputLabel>
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
                    <Box sx={{ display: "flex", flexDirection: "column", bgcolor: "background.paper", borderRadius: 2, maxHeight: "40vh", overflowY: "auto" }}>
                        {ranking.map((user, index) => (
                            <>
                                <Box key={user._id} sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: auth.username === user.username ? alpha(theme.palette.primary.main, 0.1) : "transparent",
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
            <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", gap: 2, bgcolor: "background.paper", borderRadius: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">
                        {t("readyToPlay")}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.8 }}>
                        {t("chooseGameTopicMsg")}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    data-testid="play-button"
                    endIcon={<ChevronRight />}
                    onClick={() => navigate("/gametopic")}
                    sx={{
                        width: { xs: "100%", md: "auto" },
                        whiteSpace: "nowrap"
                    }}
                >
                    {t("playNow")}
                </Button>
            </Box>
        </Container >
    );
}

export default Home;