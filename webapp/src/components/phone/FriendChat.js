import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Dialog, DialogTitle, DialogContent, TextField, Typography, Avatar, Divider, IconButton } from "@mui/material";
import { Typewriter } from "react-simple-typewriter";
import useAxios from "../../hooks/useAxios";
import useTheme from "../../hooks/useTheme";
import CloseIcon from "@mui/icons-material/Close"; // Import close icon

const FriendChat = ({ open, onClose, selectedContact, roundData }) => {
  const axios = useAxios();
  const { theme } = useTheme();

  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [prompt, setPrompt] = useState("");

  const sendMessage = async () => {
    if (!question.trim()) return;

    let newMessage = { sender: "user", text: question };
    setMessages(previous => [...previous, newMessage]);
    setQuestion("");

    try {
      const history = [...messages, newMessage].map(message => `${message.sender}: ${message.text}`).join("\n");
      const response = await axios.post("/askllm", { question: history, prompt });

      setMessages(previous => [...previous, { sender: "llm", text: response.data.answer }]);
    } catch (error) {
      console.error("Error sending message to LLM:", error.message || error);
      setMessages(previous => [...previous, { sender: "llm", text: "An unexpected error has occurred." }]);
    }
  };

  const chatContainer = useRef(null);
  useEffect(() => {
    if (chatContainer.current)
      chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
  }, [messages]);

  const handleScroll = () => {
    if (chatContainer.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer.current;
      setAutoScroll(scrollHeight - scrollTop <= clientHeight + 5);
    }
    
  };

  useEffect(() => {
    setPrompt(`YOU HAVE TO BE SHORT ON YOUR REPLIES. You are a language model acting as ${selectedContact.name}, and you are helping the user with a trivia game. 
    The user will be shown a picture and four options, and they need to guess what the image is.
    As ${selectedContact.name}, you know about the following topics: ${selectedContact.mainTopic}. 
    The current round is about: ${roundData.mainTopic}. If asked about something outside your scope, you must be honest and say you're not sure.
    The user will ask you for clues to help them guess the correct answer. 
    This round of the game is about ${roundData.topic} and the answer is ${roundData.itemWithImage?.name}. 
    YOU MUST NEVER SAY THE ANSWER UNDER ANY CIRCUMSTANCE, but you can give vague hints to help them guess the answer.
    Your job is to provide hints that are helpful but not too revealing. 
    IMPORTANT: Keep every hint you provide 7 words max. Keep it extremely short, casual, and friendly. 
    No long explanations — just quick, casual, and friendly hints. If the user asks about something outside the topics you know, be honest and say you're unsure. 
    Start by saying "Hello" in a way that feels natural for ${selectedContact.name} and sets the friendly, casual tone for the conversation. Say your name at the beginning and make a funny pun reference to your persona. 
    Wait for the user to ask you a question, 
    don't go straight to trying to get an answer, don't mention the game until the user asks for help.
    Ask something casual like how is the user doing or make a joke according to the character.
    You have to reply always in English. This is the information the user has for ${selectedContact.name}.
    .`);
  }, [selectedContact, roundData]);
  

  // Handle key press to send message
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) { // Detect Enter key press without Shift
      event.preventDefault();  // Prevent default newline behavior
      sendMessage();  // Call the sendMessage function
    }
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
          position: "relative", // Ensure the close button is outside the dialog body
        },
      }}
    >
      {/* Close Button (X) */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          color: "text.primary",
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Dialog Title */}
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "1.25rem",
          p: 2,
          borderBottom: "1px solid #ddd",
        }}
      >
        📱 Chat with {selectedContact.name}
      </DialogTitle>

      <DialogContent sx={{ p: 3, height: "100%", overflowY: "auto" }}>
        {/* Chat messages container */}
        <Box
          ref={chatContainer}
          onScroll={handleScroll}
          sx={{
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            height: "60vh",
            paddingX: 1,
            marginBottom: 2,
          }}
        >
          {messages.map((message, index) => (
            message.sender === "user" ? (
              <Box
                key={index}
                sx={{
                  maxWidth: "75%",
                  alignSelf: "flex-end",
                  padding: 1,
                  margin: 1,
                  bgcolor: "#dcf8c6",
                  color: "black",
                  borderRadius: 2,
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                {message.text}
              </Box>
            ) : (
              <Box
                key={index}
                sx={{
                  maxWidth: "75%",
                  alignSelf: "flex-start",
                  padding: 1,
                  margin: 1,
                  bgcolor: "#f1f1f1",
                  color: "black",
                  borderRadius: 2,
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Typewriter
                  words={[message.text]}
                  typeSpeed={20}
                  onType={() => {
                    if (chatContainer.current && autoScroll)
                      chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
                  }}
                />
              </Box>
            )
          ))}
        </Box>

        <Divider sx={{ marginY: 1 }} />

        {/* Input area for asking for a hint */}
        <Box sx={{ display: "flex", gap: 1, padding: 1 }}>
          <TextField
            fullWidth
            multiline
            placeholder="Ask for a hint"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}  // Add onKeyDown to capture Enter press
            sx={{ background: "#f1f1f1", borderRadius: 2 }}
          />
          <Button
            onClick={sendMessage}
            sx={{
              alignSelf: "flex-end",
              bgcolor: "#25d366",
              color: "white",
              borderRadius: 2,
            }}
          >
            Send
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FriendChat;
