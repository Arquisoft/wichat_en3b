// src/components/Welcome.js
import React, { useState, useEffect } from 'react';
import { Container, Button } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { Typewriter } from "react-simple-typewriter";
import useAxios from "../hooks/useAxios";

const Welcome = () => {
  const axios = useAxios();

  const [message, setMessage] = useState('');
  const [messageCreated, isMessageCreated] = useState(false);

  useEffect(() => {
    const createMessage = async () => {
      try {
        const question = "Please, generate a greeting message for a student called Guest tell them how fun they are going to have using this game. Explain that they have to press the button to start playing. Really short and make it casual. REALLY SHORT";
        const prompt = "You are a helpful assistant";
        const msg = await axios.post("/askllm", { question, prompt });
        setMessage(msg.data.answer);

        isMessageCreated(true);
      } catch (error) {
        console.error(error);
      }
    };

    createMessage();
  }, []);

  return (
    <Container component="main" maxWidth="xs" sx={{ marginTop: 4 }}>
      {messageCreated && (
        <div>
          <Typewriter
            words={[message]} // Pass your message as an array of strings
            cursor
            cursorStyle="|"
            typeSpeed={2} // Typing speed in ms
          />
          <NavLink to="/gametopic">
            <Button variant="contained" color="secondary" fullWidth sx={{ marginTop: 2 }}>
              Start the fun
            </Button>
          </NavLink>
        </div>
      )}
    </Container>
  );
};

export default Welcome;