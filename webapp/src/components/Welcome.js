// src/components/Welcome.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Button } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { Typewriter } from "react-simple-typewriter";

const Welcome = () => {
  const [message, setMessage] = useState('');
  const [messageCreated, isMessageCreated] = useState(false);

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

  useEffect(() => {
    createMessage();
  }, []);

  const createMessage = async () => {
      const question = "Please, generate a greeting message for a student called Guest tell them how fun they are going to have using this game. Explain that they have to press the button to start playing. Really short and make it casual. REALLY SHORT";
      const model = "empathy";
      const msg = await axios.post(`${apiEndpoint}/askllm`, { question, model });
      setMessage(msg.data.answer);

      isMessageCreated(true);
  };

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
          <NavLink to="/gamemode">
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