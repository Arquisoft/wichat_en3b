import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, Select, MenuItem, InputAdornment, OutlinedInput } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';

const LanguageSelect = () => {
  const { i18n } = useTranslation();

  const handleChange = (event) => {
    const selectedLanguage = event.target.value;
    i18n.changeLanguage(selectedLanguage); // This triggers the language change
  };

  return (
    <FormControl fullWidth variant="outlined" size="small">
      <Select
        value={i18n.language}
        onChange={handleChange}
        displayEmpty
        input={
          <OutlinedInput
            startAdornment={
              <InputAdornment position="start">
                <PublicIcon sx={{ color: 'text.primary' }} />
              </InputAdornment>
            }
          />
        }
        sx={{ color: "text.primary", "& .MuiSelect-icon": { color: "text.primary" }, backgroundColor: "background.default" }}
      >
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="es">Español</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSelect;