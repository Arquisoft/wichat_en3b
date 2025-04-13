import React, { useState } from 'react';
import { Dialog, DialogTitle, Container, DialogActions, Button, IconButton, Typography, Divider, FormControl, MenuItem, Select, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Close, ExpandMore } from '@mui/icons-material';
import LanguageSelect from './LanguageSelect';
import useTheme from '../hooks/useTheme';

const SettingsDialog = ({ open, onClose }) => {
  const [llmModel, setLlmModel] = useState("mistral");
  const { theme, themes, selectTheme } = useTheme();

  const handleSave = () => {
    localStorage.setItem('llmModel', llmModel);

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Settings</Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <Box>
        <Container sx={{ py: 3, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Language */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>🌐 Language</Typography>
            <LanguageSelect />
          </Box>

          {/* Theme */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>🎨 Theme</Typography>
            <Select
              value={theme.name || "classic"}
              onChange={(e) => selectTheme(e.target.value)}
              size='small'
              fullWidth
            >
              {Object.keys(themes).map((themeKey) => (
                <MenuItem key={themeKey} value={themeKey}>
                  {themeKey.charAt(0).toUpperCase() + themeKey.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Container>

        {/* Advanced Settings divider */}
        <Accordion disableGutters elevation={0} sx={{ backgroundColor: 'transparent' }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">⚙️ Advanced Settings</Typography>
          </AccordionSummary>
          <Divider />
          <AccordionDetails>
            {/* LLM Model */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>🧠 LLM Model</Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={llmModel}
                  onChange={(e) => setLlmModel(e.target.value)}
                >
                  <MenuItem value="mistral">Mistral</MenuItem>
                  <MenuItem value="qwen">Qwen</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>

      <Divider />
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