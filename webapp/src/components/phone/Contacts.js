// contacts.js
import React from 'react';
import { 
  Box, 
  Typography, 
  Divider,
  Button,
  Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';

const Contacts = ({ onBack, onCall }) => {
  const contacts = [
    { name: "John", profession: "Pop Star"},
    { name: "Carrie", profession: "Historian"},
    { name: "Steve", profession: "Geographer"},
    { name: "Miranda", profession: "Sports Reporter"}
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={onBack}
        sx={{ mb: 2 }}
      >
        Back
      </Button>
      
      <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>Contacts</Typography>
      
      <Stack spacing={0} divider={<Divider sx={{ backgroundColor: 'black', height: '2px' }} />}>
        {contacts.map((contact, index) => (
          <Box 
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2,
              px: 1
            }}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
             <Typography>
                {contact.name} the <Typography component="span" fontWeight="bold">{contact.profession}</Typography> {contact.number}
              </Typography>
              
            </Box>
            
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<PhoneIcon />}
              onClick={onCall}
              size="small"
              sx={{ minWidth: '50px' }}
            >
              Call
            </Button>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default Contacts;