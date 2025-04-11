import React from 'react';
import { TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

const CustomTextField = ({ name, labelKey, value, onChange, type = "text" }) => {
  const { t } = useTranslation();

  return (
    <TextField
      name={name}
      margin="normal"
      fullWidth
      label={t(labelKey)}
      value={value}
      onChange={onChange}
      type={type}
      sx={{ mb: 2, backgroundColor: "background.default" }}
    />
  );
};

export default CustomTextField;