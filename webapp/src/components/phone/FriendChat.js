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
    setPrompt(`You are acting as ${selectedContact.name}, a friendly trivia helper.

Context:
- The user sees an image and must guess the correct answer.
- You know about: ${selectedContact.mainTopic}.
- The topic now is: ${roundData.mainTopic}.
- The correct answer is: ${roundData.itemWithImage?.name}.

Rules:

1. **Language**: Reply ONLY in English.
2. **Tone**: Be friendly, casual, supportive — no long talks. Always say Hey and your name at the beginning.
3. **Hints**: Always very short (max 7 words). Give clues, not answers.
4. **Revealing**:
   - If the user asks "Is it X?":
     - If **X is the correct answer**: 
       - Say "Yes!" clearly and naturally.
       - Short celebration (example: "You got it! 🎯").
     - If **X is wrong**:
       - Say "No" clearly and encourage (example: "Nope, try again!").
5. **Unknown questions**:
   - If the topic is outside your knowledge (${selectedContact.mainTopic}), answer politely:
     - "I'm not sure about that!"
     - "Better ask someone into [topic]!"
6. **Never say the answer directly** unless the user guesses it correctly.
7. **Opening**: Start with a short, friendly greeting in ${selectedContact.name}'s style (can include a light pun).
8. **Style**: 
   - Short sentences.
   - Casual.
   - Max 1 emoji per message if you use them (optional).
   - Never sound robotic.
9. **Priority**: Be helpful ➔ Be brief ➔ Never reveal directly.

Focus: Help the user guess by themselves with tiny, encouraging clues.`);
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
