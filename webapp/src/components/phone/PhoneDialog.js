import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, Button, LinearProgress, useTheme, Stack, Avatar, alpha, InputBase } from "@mui/material";
import WifiIcon from "@mui/icons-material/Wifi";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from '@mui/icons-material/Search';
import FriendChat from "./FriendChat"; 
import lockedBackgroundImage from "../photos/lockedPic.png";

const PhoneDialog = ({ roundData, spendCoins, canAfford }) => {
  const [view, setView] = useState("locked");
  const [selectedContact, setSelectedContact] = useState(null);
  const [calling, setCalling] = useState(false);
  const [callingContact, setCallingContact] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [searchTerm, setSearchTerm] = useState('');
  const [isLocked, setIsLocked] = useState(true);

  const theme = useTheme();

  const contacts = [
    { name: "Fernando Alonso", profession: "F1 driver", mainTopic: "formula one, racing, sports, asturias" },
    { name: "Ángela Pumariega", profession: "Spanish sailor", mainTopic: "geography, sports, famous places, asturias" },
    { name: "Queen Isabella I", profession: "Queen of Castile", mainTopic: "historical events, historical women" },
    { name: "The Beatles", profession: "Iconic British rock band", mainTopic: "singers, music" },
    { name: "Antonio Banderas", profession: "Spanish actor and film producer", mainTopic: "actors, singers, spain, art" },
    { name: "Saúl Craviotto", profession: "Sports Man", mainTopic: "sports, asturias" },
    { name: "Rafa Nadal", profession: "Tennis player", mainTopic: "sports, spain" },
    { name: "Lady Gaga", profession: "Singer and songwriter", mainTopic: "music, singers, historical women" },
    { name: "Picasso", profession: "Painter and sculptor", mainTopic: "art, spain" },
    { name: "Usain Bolt", profession: "Sprinter", mainTopic: "sports" },
    { name: "One direction", profession: "Iconic British pop band", mainTopic: "singers, music" },
    { name: "Hemingway", profession: "The writer", mainTopic: "historical events" },
    { name: "Cervantes", profession: "Spanish writer", mainTopic: "spain, historial events" },
    { name: "Frida Kahlo", profession: "Painter", mainTopic: "historical women, art" },
    { name: "Jesús Calleja", profession: "Adventurer", mainTopic: "geography, flags, famous places" },
    { name: "Jovellanos", profession: "Asturian Famous", mainTopic: "spain, asturias, historical events" }
  ];

  const filteredContacts = React.useMemo(() => {
    if (!searchTerm) return contacts;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      contact.profession.toLowerCase().includes(lowerCaseSearchTerm) ||
      contact.mainTopic.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [contacts, searchTerm]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const handleUnlock = async () => {
    if (!isLocked)
      return setView("contacts");
    
    if (await spendCoins(25)) {
      setView("contacts");
      setIsLocked(false);
    }
  };

  const handleLock = () => {
    setView("locked");
  };

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setCalling(true);
    setCallingContact(contact.name);
    setTimeout(() => {
      setCalling(false);
      setView("friendChat");
    }, 1000);
  };

  const handleEndChat = () => {
    setView("contacts");
    setSelectedContact(null);
  };

  const getAvatarColor = (name) => {
    const hash = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
    const saturation = 60 + (hash % 20);
    const lightness = 50 + (hash % 20);
    return `hsl(${hash % 360}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <Box
      sx={{
        width: "375px",
        height: "667px",
        borderRadius: 4,
        overflow: "hidden",
        border: `1px solid ${theme.palette.primary.main}`,
        boxShadow: `0px 4px 8px rgba(${parseInt(theme.palette.primary.main.slice(1, 3), 16)}, ${parseInt(theme.palette.primary.main.slice(3, 5), 16)}, ${parseInt(theme.palette.primary.main.slice(5, 7), 16)}, 0.2)`,
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      {/* Status Bar */}
      <Box
        sx={{
          backgroundColor: alpha(theme.palette.text.primary, 0.15),
          color: theme.palette.text.secondary,
          p: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.8rem",
        }}
      >
        <Box>
          <SignalCellularAltIcon sx={{ mr: 0.5, fontSize: "small" }} />
          <WifiIcon sx={{ fontSize: "small" }} />
        </Box>
        <Typography>{currentTime}</Typography>
        <BatteryFullIcon sx={{ fontSize: "small" }} />
      </Box>

      {/* Main Content */}
      {view === "locked" && (
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 3,
            padding: 3,
            textAlign: "center",
          }}
        >
          <Box
            component="img"
            src={lockedBackgroundImage}
            alt="Locked Screen"
            sx={{ width: "120px", height: "120px" }}
          />
          <Typography variant="h5" fontWeight="bold">
            Your phone is locked now
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
            Tap the button below to unlock and access your contacts.
            {isLocked && "Unlocking will cost you 25 coins."}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUnlock}
            disabled={isLocked && !canAfford(25)}
            sx={{
              padding: "12px 24px",
              fontSize: "1rem",
              borderRadius: 8,
              boxShadow: theme.shadows[2],
              '&:hover': {
                boxShadow: theme.shadows[4],
              },
            }}
          >
            Press here to unlock
          </Button>
        </Box>
      )}

      {view === "contacts" && (
        <Box sx={{ p: 3, height: "100%", overflowY: "auto", flexGrow: 1 }}>
          <IconButton onClick={handleLock} size="small" sx={{ color: theme.palette.primary.main }}>
            <CloseIcon />
          </IconButton>

          <Stack spacing={2}>
            {/* Search */}
            <Box
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: '15px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <SearchIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
              <InputBase
                placeholder={`Search ${contacts.length} contacts...`}
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  ml: 1,
                  flex: 1,
                  fontSize: '0.9rem',
                  color: theme.palette.text.primary,
                }}
              />
            </Box>

            {filteredContacts.map((contact, index) => (
              <Box
                key={index}
                onClick={() => handleContactClick(contact)}
                sx={{
                  backgroundColor: theme.palette.surface?.main || theme.palette.background.default,
                  borderRadius: '15px',
                  padding: '10px 15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  boxShadow: theme.shadows[1],
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                <Avatar sx={{ width: 40, height: 40, bgcolor: getAvatarColor(contact.name), color: theme.palette.primary.contrastText }}>
                  {contact.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                    {contact.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem', color: theme.palette.text.secondary }}>
                    {contact.profession}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {calling && (
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: "bold", mb: 1 }}>
            Calling {callingContact}...
          </Typography>
          <LinearProgress sx={{ mt: 2, width: "80%" }} />
        </Box>
      )}

      {view === "friendChat" && selectedContact && !calling && (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <FriendChat
            selectedContact={selectedContact}
            roundData={roundData}
            onEndChat={handleEndChat}
          />
        </Box>
      )}
    </Box>
  );
};

export default PhoneDialog;
