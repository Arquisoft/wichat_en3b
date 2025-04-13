import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const LanguageSelect = () => {
  const { i18n } = useTranslation();

  const handleChange = (event) => {
    const selectedLanguage = event.target.value;
    i18n.changeLanguage(selectedLanguage); // This triggers the language change
  };

  return (
    <FormControl variant="outlined" size="small" style={{ minWidth: 120, margin: 0, padding: 0 }}>
      <InputLabel id="language-select-label">Language</InputLabel>
      <Select
        labelId="language-select-label"
        id="language-select"
        value={i18n.language} // Current language
        onChange={handleChange}
        label="Language"
        sx={{ color: "text.primary", "& .MuiSelect-icon": { color: "text.primary" } }}
      >
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="es">Español</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSelect;