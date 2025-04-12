import React, { useState } from 'react';
import { Box, Typography, Stack, Avatar, Button } from '@mui/material';
import FriendChat from "./FriendChat"; // Updated import to match the new name

const Contacts = ({ onBack, onCall, roundData }) => {
  const [showChat, setShowChat] = useState(false); // State to control the visibility of FriendChat
  const [selectedContact, setSelectedContact] = useState(null); // Store the selected contact

  const contacts = [
    { name: "Fernando Alonso", profession: "F1 driver", mainTopic: "formula one, racing, sports, asturias" },
    { name: "Fernando de Magallanes", profession: "Explorer", mainTopic: "geography, flags, famous places" },
    { name: "Jesús Calleja", profession: "Adventurer", mainTopic: "geography, flags, famous places" },
    { name: "Saúl Craviotto", profession: "Sports Man", mainTopic: "sports, asturias" },
    { name: "Rafa Nadal", profession: "Tennis player", mainTopic: "sports, spain" },
    { name: "Lady Gaga", profession: "Singer and songwriter", mainTopic: "music, singers, historical women" },
    { name: "The Beatles", profession: "Iconic British rock band", mainTopic: "singers, music" },
    { name: "Usain Bolt", profession: "Sprinter", mainTopic: "sports" },
    { name: "Picasso", profession: "Painter and sculptor", mainTopic: "art, spain" },
    { name: "Hemingway", profession: "The writer", mainTopic: "historical events" },
    { name: "Queen Isabella I", profession: "Queen of Castile", mainTopic: "historical events, historical women" },
    { name: "Cervantes", profession: "Spanish writer", mainTopic: "spain, historial events" },
    { name: "Frida Kahlo", profession: "Painter", mainTopic: "historical women, art" },
    { name: "Jovellanos", profession: "Asturian Famous", mainTopic: "spain, asturias, historical events" },
    { name: "Antonio Banderas", profession: "Spanish actor and film producer", mainTopic: "actors, singers, spain, art" }
  ];

  function handleContactClick(contact) {
    setSelectedContact(contact);
    setShowChat(true); // Show the chat when a contact is clicked
  }

  const handleCloseChat = () => {
    setShowChat(false); // Close the chat when "Back" button is pressed
    setSelectedContact(null); // Reset the selected contact
  };

  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      {/* Render FriendChat dialog when showChat is true */}
      {showChat && selectedContact ? (
        <FriendChat
          open={showChat}
          onClose={handleCloseChat} // Close the chat dialog
          selectedContact={selectedContact}
          roundData={roundData}
        />
      ) : (
        <Stack spacing={2}>
          {contacts.map((contact, index) => (
            <Box
              key={index}
              onClick={() => handleContactClick(contact)} // Trigger the chat with the contact info
              sx={{
                backgroundColor: '#f3f4f6',
                borderRadius: '15px',
                padding: '10px 15px',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer', // Change cursor to pointer for clickable effect
                '&:hover': {
                  backgroundColor: '#e0e0e0', // Highlight on hover
                },
              }}
            >
              {/* Profile picture (Avatar) with a random color */}
              <Avatar sx={{ width: 40, height: 40 }}>
                {contact.name.charAt(0)} {/* Display the first letter of the name */}
              </Avatar>

              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Typography sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  {contact.name}
                </Typography>
                <Typography sx={{ fontSize: '0.9rem', color: '#555' }}>
                  {contact.profession}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default Contacts;
