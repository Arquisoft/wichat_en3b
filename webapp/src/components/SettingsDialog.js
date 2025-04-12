import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LanguageSelect from './LanguageSelect';
import useTheme from '../hooks/useTheme';

const SettingsDialog = ({ open, onClose }) => {
  const [llmModel, setLlmModel] = useState("model1");
  const { theme, themes, selectTheme } = useTheme();

  const handleSave = () => {
    // Save logic here (e.g., save selected LLM model, theme, etc.)
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Settings</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
        {/* Language */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>🌐 Language</Typography>
          <LanguageSelect />
        </Box>

        {/* Theme */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>🎨 Theme</Typography>
          <FormControl fullWidth size="small">
            <Select
              value={theme.name}
              onChange={(e) => selectTheme(e.target.value)}
            >
              {Object.keys(themes).map((themeKey) => (
                <MenuItem key={themeKey} value={themeKey}>
                  {themeKey.charAt(0).toUpperCase() + themeKey.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Advanced Settings divider */}
        <Typography variant="subtitle1" sx={{ mt: 2 }}>⚙️ Advanced Settings</Typography>
        <Divider />
        
        {/* LLM Model */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>🧠 LLM Model</Typography>
          <FormControl fullWidth size="small">
            <Select
              value={llmModel}
              onChange={(e) => setLlmModel(e.target.value)}
            >
              <MenuItem value="model1">Model 1</MenuItem>
              <MenuItem value="model2">Model 2</MenuItem>
              <MenuItem value="model3">Model 3</MenuItem>
              <MenuItem value="model4">Model 4</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;
