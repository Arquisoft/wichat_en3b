import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import ChatIcon from "@mui/icons-material/Chat";
import Contacts from "./Contacts"; // Importa el componente Contacts
import Chat from "../LLMChat"

const PhoneDialog = ({ open, onClose, chatKey, roundData }) => {
  const [view, setView] = useState("main"); // "main", "call", "chat", "contacts"
  const [phoneStatus, setPhoneStatus] = useState("");

  const handleCall = () => {
    setView("contacts"); // Cambia a la vista de contactos en lugar de "call"
  };

  const handleChat = () => {
    setPhoneStatus("💬 Chat Started");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "375px",
          height: "667px",
          borderRadius: 4,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "1.25rem",
          p: 2,
          borderBottom: "1px solid #ddd",
        }}
      >
        📱 Phone Interface
      </DialogTitle>

      <DialogContent sx={{ p: 3, height: "100%", overflowY: "auto" }}>
        {view === "main" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              height: "80%",
              gap: 4,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleCall}
              sx={{
                width: 100,
                height: 100,
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold",
                fontSize: "0.9rem",
              }}
            >
              <PhoneIcon sx={{ fontSize: 36, mb: 1 }} />
              Call
            </Button>

            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                handleChat();
                setView("chat");
              }}
              sx={{
                width: 100,
                height: 100,
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold",
                fontSize: "0.9rem",
              }}
            >
              <ChatIcon sx={{ fontSize: 36, mb: 1 }} />
              Chat
            </Button>
          </Box>
        )}

        {view === "call" && (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="h6" color="textSecondary">
              {phoneStatus}
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              sx={{ fontWeight: "bold", mt: 4 }}
              onClick={() => {
                setView("main");
                setPhoneStatus("");
              }}
            >
              End Call
            </Button>
          </Box>
        )}

        {view === "chat" && (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            {/* <Typography variant="h6" color="textSecondary">
              {phoneStatus}
            </Typography>
            <Typography variant="body1" color="textPrimary" sx={{ mt: 2 }}>
              📝 This is the chat interface.
            </Typography> */}
            <Chat key={chatKey} roundData={roundData} />
            <Button
              variant="contained"
              color="secondary"
              sx={{ fontWeight: "bold", mt: 4 }}
              onClick={() => {
                setView("main");
                setPhoneStatus("");
              }}
            >
              End Chat
            </Button>
          </Box>
        )}

        {view === "contacts" && (
          <Box sx={{ height: "100%" }}>
            <Contacts
              onBack={() => setView("main")}
              onCall={() => {
                setPhoneStatus("📞 Calling...");
                setView("call");
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="error"
          sx={{ fontWeight: "bold", width: "80%" }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhoneDialog;