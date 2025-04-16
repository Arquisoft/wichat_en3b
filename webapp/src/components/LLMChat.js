import { useState, useEffect, useRef } from "react";

import { Box, Button, Container, Divider, TextField, Typography } from "@mui/material";
import { Typewriter } from "react-simple-typewriter";
import useAxios from "../hooks/useAxios";
import useTheme from "../hooks/useTheme";

const LLMChat = (roundData) => {
    const axios = useAxios();
    const { theme } = useTheme();

    const [messages, setMessages] = useState([]);
    const [question, setQuestion] = useState("");
    const [autoScroll, setAutoScroll] = useState(true); // track auto scroll when generating messages
    const [prompt, setPrompt] = useState("");

    const sendMessage = async () => {
        if (!question.trim()) return;
        
        let newMessage = { sender: "user", text: question };
        setMessages(previous => [...previous, newMessage]);
        setQuestion("");

        const model = localStorage.getItem("llmModel") || "mistral";
        
        try {
            // create the history of messages (the memory of the llm) and send it through the gateway
            const history = [...messages, newMessage].map(message => `${message.sender}: ${message.text}`).join("\n");
            const response = await axios.post("/askllm", { question: history, model, prompt });
            
            setMessages(previous => [...previous, { sender: "llm", text: response.data.answer }]);
        } catch (error) {
            console.error("Error sending message to LLM:", error.message || error);
            setMessages(previous => [...previous, { sender: "llm", text: "An unexpected error has occurred." }]);
        }
    }

    // scroll to the bottom of the chat when new messages are added
    const chatContainer = useRef(null);
    useEffect(() => {
        if (chatContainer.current)
            chatContainer.current.scrollTop = chatContainer.current.scrollHeight
    }, [messages]);

    // if user scrolls up, auto scroll is disabled
    const handleScroll = () => {
        if (chatContainer.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainer.current;
            setAutoScroll(scrollHeight - scrollTop <= clientHeight + 5);
        }
    }

    useEffect(() => {
        if (roundData) {
            const data = roundData.roundData;
            setPrompt(`You are an assistant that helps a user get the correct answer in a trivia game. 
                The user is shown a picture of an item and has to guess what it is given four options. 
                This round of the game is about ${data.topic} and the answer is ${data.itemWithImage?.name}. 
                YOU MUST NEVER SAY THE ANSWER UNDER ANY CIRCUMSTANCE, but you can give vague hints to help them guess the answer. 
                Keep your answers short to a few words.`);
        }
    }, [roundData]);

    return (
        <Container sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            padding: 1,
            border: `5px solid ${theme.palette.primary.main}`,
            borderRadius: 5,
            background: theme.palette.background.transparent,
            height: "100%"
        }}>
            <Container fullWidth sx={{padding: 1, color: "text.primary", borderRadius: 1}}>
                <Typography variant="h3" align="center">TipBot</Typography>
            </Container>
            <Divider />
            <Box ref={chatContainer} onScroll={handleScroll} sx={{display: "flex", flexDirection: "column", overflow: "hidden", overflowY: "auto", height: "30vh"}}>
                {messages.map((message, index) => (
                    message.sender === "user" ? (
                        <Typography key={index} sx={{
                            width: "80%",
                            alignSelf: "flex-end",
                            padding: 1,
                            margin: 1,
                            bgcolor: "primary.main",
                            color: "text.primary",
                            borderRadius: 1
                        }}>
                            {message.text}
                        </Typography>
                    ) : (
                        <Typography key={index} sx={{
                            maxWidth: "80%",
                            alignSelf: "flex-start",
                            padding: 1,
                            margin: 1,
                            bgcolor: "background.paper",
                            color: "text.primary",
                            borderRadius: 1
                        }}>
                            <Typewriter
                                key={index}
                                words={[message.text]}
                                typeSpeed={20}
                                onType={() => {if (chatContainer.current && autoScroll) chatContainer.current.scrollTop = chatContainer.current.scrollHeight}}
                            />
                        </Typography>
                    )
                ))}
            </Box>
            <Divider />
            <TextField
                fullWidth
                multiline
                placeholder="Ask for a hint"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
            />
            <Button onClick={sendMessage} sx={{color: "text.primary"}}>Send</Button>
        </Container>
    );
}

export default LLMChat;