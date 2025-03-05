import React from 'react';
import { Grid, Fab } from '@mui/material';

const OptionButton = ({ text, ariaLabel }) => {
    return (
        <Grid item xs={12} sm={6} display="flex" justifyContent="center" alignItems="center">
            <Fab color="primary" aria-label={ariaLabel}>
                {text}
            </Fab>
        </Grid>
    );
};

export default OptionButton;