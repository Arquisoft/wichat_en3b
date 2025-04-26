import React, { useState } from 'react';
import { Dialog, DialogTitle, Container, DialogActions, Button, IconButton, Typography, Divider, FormControl, MenuItem, Select, Box, Accordion, AccordionSummary, AccordionDetails, alpha } from '@mui/material';
import { Check, Close, ExpandMore } from '@mui/icons-material';
import LanguageSelect from './LanguageSelect';
import useTheme from '../hooks/useTheme';

const SettingsDialog = ({ open, onClose }) => {
  const [llmModel, setLlmModel] = useState(localStorage.getItem('llmModel') || 'mistral');
  const { theme, themes, selectTheme } = useTheme();

  const handleSave = () => {
    localStorage.setItem('llmModel', llmModel);

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Settings
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <Container sx={{ py: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Language */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>🌐 Language</Typography>
          <LanguageSelect />
        </Box>

        {/* Theme */}
        <Box>
          <Typography variant="subtitle1">🎨 Theme</Typography>
          <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, p: 1 }}>
            {Object.keys(themes).map((themeOption) => {
              const primaryColor = themes[themeOption].palette.primary.main;
              const themeGradient = themes[themeOption].palette.gradient.main.right;

              return (
                <Box
                  key={themeOption}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: 64,
                  }}
                >
                  <Button
                    onClick={() => selectTheme(themeOption)}
                    aria-label={`Select ${themeOption} theme`}
                    sx={{
                      minWidth: 64,
                      maxWidth: 64,
                      height: 64,
                      borderRadius: 3,
                      background: themeGradient,
                      border: theme.name === themeOption ? `2px solid ${primaryColor}` : 'none',
                      boxShadow: theme.name === themeOption ? `0 0 10px ${primaryColor}` : 'none',
                      '&:hover': {
                        opacity: 0.9,
                      },
                    }}
                  >
                    {theme.name === themeOption && (
                      <Check
                        sx={{
                          color: alpha(themes[themeOption].palette.primary.contrastText, 0.9),
                          fontSize: 48,
                          padding: 0.5,
                        }}
                      />
                    )}
                  </Button>
                  <Typography variant="caption" sx={{ mt: 1 }}>
                    {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Container>

      {/* Advanced Settings */}
      <Accordion disableGutters elevation={0} sx={{ backgroundColor: 'transparent' }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">⚙️ Advanced Settings</Typography>
        </AccordionSummary>
        <Divider />
        <Container sx={{ py: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {/* LLM Model */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>🧠 LLM Model</Typography>
            <FormControl fullWidth size="small">
              <Select
                value={llmModel}
                onChange={(e) => setLlmModel(e.target.value)}
                sx={{ backgroundColor: 'background.default' }}
              >
                <MenuItem value="mistral">Mistral</MenuItem>
                <MenuItem value="qwen">Qwen</MenuItem>
                <MenuItem value="gemini">Gemini</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Container>
      </Accordion>

      <Divider />
      <DialogActions>
        <Button onClick={onClose} color="text.primary">
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