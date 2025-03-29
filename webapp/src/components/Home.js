"use client"

import { useState } from "react"
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material"
import {
  BarChart as BarChartIcon,
  ChevronRight,
  Timer as ClockIcon,
  EmojiEvents as TrophyIcon,
  Psychology as BrainIcon,
  SportsEsports as GamepadIcon,
  People as UsersIcon,
  AutoAwesome as SparklesIcon,
  EmojiEvents as MedalIcon,
  Percent as PercentIcon,
  Speed as SpeedIcon,
  FilterAlt as FilterIcon,
} from "@mui/icons-material"

// Enhanced mock data with additional stats
const userData = {
  name: "Alex Johnson",
  avatar: "/placeholder.svg?height=40&width=40",
  level: 12,
  totalPoints: 4850,
  gamesPlayed: 42,
  winRate: 76,
  averageTime: "24s",
  streak: 5,
  precision: 82, // percentage of correct answers
}

const userStats = [
  { title: "Games Played", value: userData.gamesPlayed, icon: GamepadIcon, color: "#bbdefb", textColor: "#1565c0" },
  { title: "Win Rate", value: `${userData.winRate}%`, icon: TrophyIcon, color: "#fff9c4", textColor: "#c6a700" },
  { title: "Avg. Answer Time", value: userData.averageTime, icon: ClockIcon, color: "#c8e6c9", textColor: "#2e7d32" },
  { title: "Current Streak", value: userData.streak, icon: SparklesIcon, color: "#e1bee7", textColor: "#6a1b9a" },
]

// Enhanced rankings with additional stats
const rankings = [
  {
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
]

const categories = [
  { name: "General Knowledge", icon: BrainIcon, color: "#2196f3" },
  { name: "Science", icon: SparklesIcon, color: "#9c27b0" },
  { name: "History", icon: ClockIcon, color: "#ff9800" },
  { name: "Entertainment", icon: GamepadIcon, color: "#e91e63" },
]

// Game modes for filtering
const gameModes = [
  { id: "all", name: "All Modes" },
  { id: "classic", name: "Classic" },
  { id: "timed", name: "Timed Challenge" },
  { id: "multiplayer", name: "Multiplayer" },
  { id: "daily", name: "Daily Quiz" },
]

// Ranking stats options
const rankingStats = [
  { id: "points", name: "Total Points", icon: TrophyIcon },
  { id: "precision", name: "Precision", icon: PercentIcon },
  { id: "avgTime", name: "Response Time", icon: SpeedIcon },
  { id: "gamesPlayed", name: "Games Played", icon: GamepadIcon },
]

// TabPanel component for Material UI tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedStat, setSelectedStat] = useState("points")
  const [gameMode, setGameMode] = useState("all")
  const theme = useTheme()

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleStatChange = (event, newValue) => {
    setSelectedStat(newValue)
  }

  const handleGameModeChange = (event) => {
    setGameMode(event.target.value)
  }

  // Sort rankings based on selected stat
  const sortedRankings = [...rankings].sort((a, b) => b[selectedStat] - a[selectedStat])

  // Apply rank numbers based on the sort
  const rankedPlayers = sortedRankings.map((player, index) => ({
    ...player,
    displayRank: index + 1,
  }))

  // Get the stat display value based on the selected stat
  const getStatValue = (player) => {
    switch (selectedStat) {
      case "precision":
        return `${player.precision}%`
      case "avgTime":
        return player.avgTime
      case "gamesPlayed":
        return player.gamesPlayed
      case "points":
      default:
        return player.points
    }
  }

  // Get the stat label based on the selected stat
  const getStatLabel = () => {
    const stat = rankingStats.find((s) => s.id === selectedStat)
    return stat ? stat.name : "Points"
  }

  return (
    // Translucent container with dark overlay and blur
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        padding: 3,
        borderRadius: 4,
        // Dark translucent overlay
        bgcolor: "rgba(0, 0, 0, 0.25)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header with greeting */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            mb: 4,
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" sx={{ color: "white" }}>
              Welcome back, {userData.name}!
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
              Ready for your next trivia challenge?
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <Chip
                label={`Level ${userData.level}`}
                variant="outlined"
                size="small"
                sx={{ mb: 0.5, color: "white", borderColor: "rgba(255, 255, 255, 0.5)" }}
              />
              <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                {userData.totalPoints} points
              </Typography>
            </Box>
            <Avatar
              src={userData.avatar}
              alt={userData.name}
              sx={{
                width: 48,
                height: 48,
                border: 2,
                borderColor: "primary.main",
              }}
            />
          </Box>
        </Box>

        {/* Main content with tabs */}
        <Box sx={{ mb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: "8px 8px 0 0",
              bgcolor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="dashboard tabs"
              sx={{
                "& .MuiTab-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                  "&.Mui-selected": { color: "white" },
                },
                "& .MuiTabs-indicator": { backgroundColor: "white" },
              }}
            >
              <Tab icon={<BarChartIcon fontSize="small" />} label="Your Stats" iconPosition="start" />
              <Tab icon={<UsersIcon fontSize="small" />} label="Rankings" iconPosition="start" />
            </Tabs>
          </Paper>

          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {userStats.map((stat, index) => {
                const StatIcon = stat.icon
                return (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.9)",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: "50%",
                            bgcolor: stat.color,
                            color: stat.textColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <StatIcon />
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {stat.title}
                          </Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {stat.value}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>

            <Card
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.9)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardHeader title="Recent Activity" subheader="Your last 5 trivia games" />
              <CardContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {[...Array(5)].map((_, i) => {
                    const CategoryIcon = categories[i % categories.length].icon
                    return (
                      <Box key={i}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            pb: i < 4 ? 2 : 0,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box
                              sx={{
                                p: 1,
                                borderRadius: "50%",
                                bgcolor: categories[i % categories.length].color,
                                color: "white",
                                display: "flex",
                              }}
                            >
                              <CategoryIcon fontSize="small" />
                            </Box>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {categories[i % categories.length].name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(Date.now() - i * 86400000).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Chip
                              label={i % 3 === 0 ? "Lost" : "Won"}
                              color={i % 3 === 0 ? "error" : "success"}
                              size="small"
                            />
                            <Typography variant="body1" fontWeight="medium">
                              {100 - i * 10} pts
                            </Typography>
                          </Box>
                        </Box>
                        {i < 4 && <Divider />}
                      </Box>
                    )
                  })}
                </Box>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Card
              sx={{
                mb: 3,
                bgcolor: "rgba(255, 255, 255, 0.9)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardHeader
                title={`${getStatLabel()} Leaderboard`}
                subheader={`Top players ranked by ${getStatLabel().toLowerCase()}`}
                action={
                  <FormControl variant="outlined" size="small" sx={{ minWidth: 150, mt: { xs: 2, sm: 0 } }}>
                    <InputLabel id="game-mode-select-label">Game Mode</InputLabel>
                    <Select
                      labelId="game-mode-select-label"
                      id="game-mode-select"
                      value={gameMode}
                      onChange={handleGameModeChange}
                      label="Game Mode"
                      startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />}
                    >
                      {gameModes.map((mode) => (
                        <MenuItem key={mode.id} value={mode.id}>
                          {mode.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                }
              />
              <CardContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {rankedPlayers.map((player) => (
                    <Paper
                      key={player.name}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: player.isCurrentUser ? "rgba(25, 118, 210, 0.1)" : "transparent",
                        border: player.isCurrentUser ? 1 : 0,
                        borderColor: "primary.main",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                          sx={{
                            width: 32,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {player.displayRank <= 3 ? (
                            <MedalIcon
                              sx={{
                                color:
                                  player.displayRank === 1 ? "gold" : player.displayRank === 2 ? "silver" : "#cd7f32", // bronze
                              }}
                            />
                          ) : (
                            <Typography variant="body1" fontWeight="bold">
                              {player.displayRank}
                            </Typography>
                          )}
                        </Box>
                        <Avatar src={player.avatar} alt={player.name} />
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {player.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {getStatValue(player)} {selectedStat === "points" ? "points" : ""}
                          </Typography>
                        </Box>
                      </Box>
                      {player.isCurrentUser && <Chip label="You" variant="outlined" size="small" />}
                    </Paper>
                  ))}
                </Box>
              </CardContent>
              <Divider />
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: "text.secondary" }}>
                  Rank by:
                </Typography>
                <Tabs
                  value={selectedStat}
                  onChange={handleStatChange}
                  aria-label="ranking stats tabs"
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    minHeight: "48px",
                    "& .MuiTab-root": {
                      minHeight: "48px",
                      py: 1,
                    },
                  }}
                >
                  {rankingStats.map((stat) => {
                    const StatIcon = stat.icon
                    return (
                      <Tab
                        key={stat.id}
                        value={stat.id}
                        icon={<StatIcon fontSize="small" />}
                        label={stat.name}
                        iconPosition="start"
                      />
                    )
                  })}
                </Tabs>
              </Box>
            </Card>

            <Card
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.9)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardHeader title="Category Champions" subheader="Top players in each category" />
              <CardContent>
                <Grid container spacing={2}>
                  {categories.map((category, index) => {
                    const CategoryIcon = category.icon
                    return (
                      <Grid item xs={12} md={6} key={index}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            bgcolor: "rgba(255, 255, 255, 0.5)",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box
                              sx={{
                                p: 1,
                                borderRadius: "50%",
                                bgcolor: category.color,
                                color: "white",
                                display: "flex",
                              }}
                            >
                              <CategoryIcon fontSize="small" />
                            </Box>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {category.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {rankings[index % rankings.length].name}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body1" fontWeight="bold">
                            {5000 + index * 500} pts
                          </Typography>
                        </Paper>
                      </Grid>
                    )
                  })}
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>
        </Box>

        {/* Game mode selection */}
        <Card
          sx={{
            bgcolor: "rgba(25, 118, 210, 0.85)",
            color: "white",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "stretch", md: "center" },
                gap: 2,
              }}
            >
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
                onClick={() => console.log("Navigate to game mode selection")}
                sx={{
                  width: { xs: "100%", md: "auto" },
                  whiteSpace: "nowrap",
                  bgcolor: "white",
                  color: "primary.main",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.9)",
                  },
                }}
              >
                Select Game Mode
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

