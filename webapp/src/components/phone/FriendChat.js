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
- The user is shown an image and must guess the correct answer.
- You know about: ${selectedContact.mainTopic}.
- The current topic is: ${roundData.mainTopic}.
- The correct answer is: ${roundData.itemWithImage?.name}.

Rules:

1. **Language**: Reply only in English.
2. **Hints**: Keep every hint very short (max 7 words), casual, playful, using emojis.
3. **Never reveal the correct answer directly** unless the user guesses it.
4. **When the user asks "Is it X?"**:
   - If **X is the correct answer**:
     - Reply clearly YES. (You must say "Yes!" or similar)
     - Celebrate briefly and naturally. (Example: "Yes! You nailed it!")
   - If X is not the correct answer*:
     - Reply clearly No.
     - Encourage them to try again. (Example: "Nope, not quite! Keep trying!")
5. If the user asks general questions, give vague hints — never say the answer directly.
6. If asked about topics you don't know, say you're unsure politely.
7. Start the chat by greeting as ${selectedContact.name}, with a pun or friendly joke fitting your personality.
8. Stay in character**: be casual, fun, and text-like. Never sound robotic.
9. If the user asks about a topic that is NOT in your knowledge (${selectedContact.mainTopic}):
   - Politely say something like:
     - "Honestly, that's not really my area! Maybe ask someone into X?"
     - "I'm not sure, buddy! Try asking an expert on [topic]!"

Additional:

- You must **only say "Yes" or "No"** clearly when the user **specifically asks about an option**.
- Otherwise, always give vague clues without confirming.

Goal: Help the user guess the answer by themselves, while being supportive, short, and casual.

Example Good Responses:
- "Hmm you're hot!" (when they guess correctly)
- "Nope, try again!" (when they guess wrong)
- "I'm not sure about that!" (if topic is outside your knowledge)

Priority: Really Short hints ➔ Friendly ➔ Helpful ➔ Never reveal the answer.
`);
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
