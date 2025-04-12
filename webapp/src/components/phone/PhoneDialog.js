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
import Contacts from "./Contacts";
import Chat from "../LLMChat";

const PhoneDialog = ({ open, onClose, chatKey, roundData }) => {
  const [view, setView] = useState("contacts");
  const [selectedContact, setSelectedContact] = useState(null); // Store the selected contact
  const [calling, setCalling] = useState(false); // Track the calling state
  const [callingContact, setCallingContact] = useState(null); // Store the contact name being called

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setCalling(true); // Set calling state to true
    setCallingContact(contact.name); // Store the contact name
    // Simulate a delay for the "calling" effect, then switch to chat
    setTimeout(() => {
      setCalling(false);
      setView("chat");
    }, 2000); // Delay for 2 seconds before showing the chat
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
        📱 Phone
      </DialogTitle>

      <DialogContent sx={{ p: 3, height: "100%", overflowY: "auto" }}>
        {view === "contacts" && (
          <Box sx={{ height: "100%" }}>
            <Contacts
              roundData={roundData} 
              onBack={() => setView("contacts")}
              onContactClick={handleContactClick} // Pass the function to handle contact click
            />
          </Box>
        )}

        {view === "chat" && !calling && (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Chat key={chatKey} roundData={roundData} />
            <Button
              variant="contained"
              color="secondary"
              sx={{ fontWeight: "bold", mt: 4 }}
              onClick={() => {
                setView("contacts");
                setSelectedContact(null); // Clear the selected contact when leaving chat
              }}
            >
              End Chat
            </Button>
          </Box>
        )}

        {calling && (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="h6">Calling {callingContact}...</Typography>
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
