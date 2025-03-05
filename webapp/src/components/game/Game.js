import React from "react";
import { Container, Typography, Grid } from '@mui/material';
import OptionButton from "./OptionButton";

const Game = () => {
    const options = ["option1", "option2", "option3", "option4"];

    return (
        <Container component="main" maxWidth="md" sx={{ marginTop: 4 }}>
            <Typography component="h3" align="center">
                Round test
            </Typography>
            <img 
                src="https://www.psdstamps.com/wp-content/uploads/2022/04/test-stamp-png.png" 
                alt="Test Stamp" 
                style={{ width: '25%', height: 'auto', display: 'block', margin: '0 auto' }} 
            />
            <Typography component="h2" align="center">
                Choose the correct option
            </Typography>
            <Grid container spacing={2} justifyContent="center">
                {options.map((option, index) => (
                    <OptionButton key={index} text={option} ariaLabel={`option ${index + 1}`} />
                ))}
            </Grid>
        </Container>
    );
};

export default Game;