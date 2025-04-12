import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, InputLabel, Select, MenuItem, InputAdornment, OutlinedInput } from '@mui/material';

import { styled } from '@mui/material/styles';
import PublicIcon from '@mui/icons-material/Public';

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 180,
  background: "transparent", 
  borderRadius: 12,
  marginRight: '16px',
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: 'transparent',
    transition: 'all 0.3s ease',
    outline: 'none',
    '&:hover': {
      backgroundColor: 'transparent', 
      boxShadow: 'none',
      outline: 'none',
      color: 'black'
    },
    '&.Mui-focused': {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      outline: 'none',
    },
    '& .MuiInputBase-input': {
      color: 'white', 
      outline: 'none',
      '&:hover': {
        color: 'black', 
        outline: 'none',
      }
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  }
}));


const LanguageSelect = () => {
  const { i18n } = useTranslation();

  const handleChange = (event) => {
    const selectedLanguage = event.target.value;
    i18n.changeLanguage(selectedLanguage); // This triggers the language change
  };

  return (

    <StyledFormControl variant="outlined" size="small">
      <InputLabel id="language-select-label" color='primary.contrastText'>Language</InputLabel>
      <Select
        value={i18n.language}
        onChange={handleChange}
        displayEmpty
        label="Language"
        input={
          <OutlinedInput
            notched={false}
            startAdornment={
              <InputAdornment position="start">
                <PublicIcon sx={{ color: 'white' }} />
              </InputAdornment>
            }
          />
        }
        sx={{ color: "primary.contrastText", "& .MuiSelect-icon": { color: "primary.contrastText" } }}
      >
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="es">Español</MenuItem>
      </Select>
    </StyledFormControl>
  );
};

export default LanguageSelect;