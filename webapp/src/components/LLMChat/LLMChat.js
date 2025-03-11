import { useState, useEffect, useRef } from "react";
import axios from "axios";

import { Button, Container, Divider, TextField, Typography } from "@mui/material";
import { Typewriter } from "react-simple-typewriter";

const LLMChat = () => {
    const [messages, setMessages] = useState([]);
    const [question, setQuestion] = useState("");
    const [thinking, setThinking] = useState(false);

    const [autoScroll, setAutoScroll] = useState(true); // track auto scroll when generating messages

    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

    const sendMessage = async () => {
        if (!question.trim()) return;

        let newMessage = { sender: "user", text: question };
        setMessages(previous => [...previous, newMessage]);
        setQuestion("");
        
        setThinking(true);
        try {
            // create the history of messages (the memory of the llm) and send it through the gateway
            const history = [...messages, newMessage].map(message => `${message.sender}: ${message.text}`).join("\n");
            const response = await axios.post(`${apiEndpoint}/askllm`, { question: history, model: "empathy" });
            
            setMessages(previous => [...previous, { sender: "llm", text: response.data.answer }]);
        } catch (error) {
            console.error("Error sending message to LLM:", error.message || error);
            setMessages(previous => [...previous, { sender: "llm", text: "An unexpected error has occurred." }]);
        }
        setThinking(false);
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

    return (
        <Container sx={{display: "flex", flexDirection: "column", gap: 1, padding: 1, border: "5px solid #ccc", borderRadius: 5}}>
            <Container sx={{padding: 1, bgcolor: "#1976d2", color: "white", borderRadius: 1 }}>
                <Typography variant="h3" align="center">TipBot</Typography>
            </Container>
            <Divider />
            <Container ref={chatContainer} onScroll={handleScroll} sx={{display: "flex", flexDirection: "column", overflow: "hidden", overflowY: "auto", height: "30vh"}}>
                {messages.map((message, index) => (
                    message.sender === "user" ? (
                        <Typography key={index} sx={{
                            maxWidth: "80%",
                            alignSelf: "flex-end",
                            padding: 1,
                            margin: 1,
                            bgcolor: "#1976d2",
                            color: "white",
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
                            bgcolor: "#eee",
                            color: "black",
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

                {thinking && (
                    <Typography sx={{
                        maxWidth: "80%",
                        alignSelf: "flex-start",
                        padding: 1,
                        margin: 1,
                        bgcolor: "#eee",
                        color: "black",
                        borderRadius: 1
                    }}>
                        Thinking...
                    </Typography>
                    )}
            </Container>
            <Divider />
            <TextField
                fullWidth
                multiline
                placeholder="Ask for a hint"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
            />
            <Button onClick={sendMessage}>Send</Button>
        </Container>
    );
}

export default LLMChat;