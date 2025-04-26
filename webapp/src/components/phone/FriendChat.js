import React, { useState, useEffect, useRef } from "react";
import { Box, Button, TextField, Typography, Divider, IconButton } from "@mui/material";
import { Typewriter } from "react-simple-typewriter";
import CloseIcon from "@mui/icons-material/Close";
import useAxios from "../../hooks/useAxios";
import useTheme from "../../hooks/useTheme";
import { Avatar } from "@mui/material"; 


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
2. **Tone**: Be friendly, casual, supportive — no long talks. Always say Hey and your name at the begginging.
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

Examples of good replies:
- "Maybe look closer at the shape 👀"
- "You're close but not there yet!"
- "Not quite, keep trying!"
- "Yes! You nailed it!"
- "I'm not sure, better check geography experts!"

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

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onEndChat}
          sx={{
            color: theme.palette.text.primary,
            '&:hover': {
              bgcolor: theme.palette.action.hover,
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Avatar + Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center', gap: 1 }}>
          <Avatar
            sx={{ width: 32, height: 32, fontSize: "1rem", bgcolor: theme.palette.primary.main }}
          >
            {selectedContact.name.charAt(0)}
          </Avatar>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '1rem', md: '1.2rem' },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: "160px",
            }}
          >
            {selectedContact.name}
          </Typography>
        </Box>

        {/* Right spacer for symmetry */}
        <Box sx={{ width: '48px' }} />
      </Box>


      {/* Messages */}
      <Box
        ref={chatContainer}
        onScroll={handleScroll}
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          padding: 2,
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
                bgcolor: message.sender === "user" ? "#dcf8c6" : "#ffffff",
                color: "black",
                p: 1.5,
                borderRadius: 3,
                borderTopRightRadius: message.sender === "user" ? 0 : 3,
                borderTopLeftRadius: message.sender === "user" ? 3 : 0,
                boxShadow: message.sender === "user"
                  ? "0px 2px 4px rgba(37, 211, 102, 0.4)"
                  : "0px 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
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
          sx={{ backgroundColor: "#f1f1f1", borderRadius: 2 }}
        />
        <Button
          onClick={sendMessage}
          variant="contained"
          sx={{ bgcolor: "#25d366", color: "white", borderRadius: 2 }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default FriendChat;
