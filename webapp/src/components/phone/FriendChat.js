import React, { useState, useEffect, useRef } from "react";
import { Box, Button, TextField, Typography, Divider, IconButton, Avatar, alpha } from "@mui/material";
import { Typewriter } from "react-simple-typewriter";
import CloseIcon from "@mui/icons-material/Close";
import useAxios from "../../hooks/useAxios";
import useTheme from "../../hooks/useTheme";

const FriendChat = ({ selectedContact, roundData, onEndChat }) => {
  const axios = useAxios();
  const { theme } = useTheme();

  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [prompt, setPrompt] = useState("");

  const chatContainer = useRef(null);

  const sendMessage = async () => {
    if (!question.trim()) return;

    setAutoScroll(true);
    const newMessage = { sender: "user", text: question };
    setMessages(prev => [...prev, newMessage]);
    setQuestion("");

    try {
      const history = [...messages, newMessage].map(msg => `${msg.sender}: ${msg.text}`).join("\n");
      const response = await axios.post("/askllm", { question: history, prompt });
      setMessages(prev => [...prev, { sender: "llm", text: response.data.answer }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { sender: "llm", text: "An unexpected error has occurred." }]);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleScroll = () => {
    if (chatContainer.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer.current;
      setAutoScroll(scrollHeight - (scrollTop + clientHeight) < 50);
    }
  };

  useEffect(() => {
    setPrompt(`...your prompt...`);
  }, [selectedContact, roundData]);

  useEffect(() => {
    if (chatContainer.current) {
      chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Top bar */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <IconButton
          onClick={onEndChat}
          sx={{ color: theme.palette.text.primary, '&:hover': { bgcolor: theme.palette.action.hover } }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: "1rem", bgcolor: theme.palette.primary.main }}>
            {selectedContact.name.charAt(0)}
          </Avatar>
          <Typography variant="h6" noWrap sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
            {selectedContact.name}
          </Typography>
        </Box>

        <Box sx={{ width: '48px' }} />
      </Box>

      {/* Messages */}
      <Box
        ref={chatContainer}
        onScroll={handleScroll}
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          p: 2,
          bgcolor: theme.palette.background.default,
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.sender === "user" ? "flex-end" : "flex-start",
              mb: 1,
            }}
          >
            <Box
              sx={{
                maxWidth: "75%",
                p: 1.5,
                borderRadius: 3,
                bgcolor: message.sender === "user" ? alpha(theme.palette.primary.main, 0.3) : theme.palette.background.paper,
                color: theme.palette.text.primary,
                boxShadow: theme.shadows[1],
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                <Typewriter
                  words={[message.text]}
                  typeSpeed={20}
                  onType={() => {
                    if (chatContainer.current && autoScroll) {
                      chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
                    }
                  }}
                />
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Input */}
      <Divider />
      <Box sx={{ display: 'flex', p: 2, gap: 1 }}>
        <TextField
          fullWidth
          multiline
          placeholder="Ask for a hint..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
          }}
        />
        <Button
          onClick={sendMessage}
          variant="contained"
          color="primary"
          sx={{ borderRadius: 2 }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default FriendChat;
