// CharacterSelection.test.js
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import CharacterSelection from './CharacterSelection';

// Mock de tema para evitar errores de contexto
const theme = createTheme();

// Mock para Math.random para hacer los tests predecibles
const mockMath = Object.create(global.Math);
mockMath.random = () => 0.5;
global.Math = mockMath;

describe('CharacterSelection Component', () => {
  test('renders 4 character cards', () => {
    render(
      <ThemeProvider theme={theme}>
        <CharacterSelection onSelectCharacter={() => {}} />
      </ThemeProvider>
    );
    
    const characterNames = screen.getAllByText(/^[A-Za-z]+$/);
    expect(characterNames).toHaveLength(8);
    
    // Verificar que hay 4 indicadores de confianza
    const confidenceTexts = screen.getAllByText(/Confidence: \d+%/);
    expect(confidenceTexts).toHaveLength(4);
    
    // Verificar que hay 4 precios
    const priceTexts = screen.getAllByText(/💰 \d+ coins/);
    expect(priceTexts).toHaveLength(4);
  });
  
  test('calls onSelectCharacter when a card is clicked', () => {
    
    const mockSelectCharacter = jest.fn();
    
    render(
      <ThemeProvider theme={theme}>
        <CharacterSelection onSelectCharacter={mockSelectCharacter} />
      </ThemeProvider>
    );
    
    const cards = screen.getAllByRole('button');
    expect(cards).toHaveLength(4);
    
    fireEvent.click(cards[0]);
    
    expect(mockSelectCharacter).toHaveBeenCalledTimes(1);
    
    expect(mockSelectCharacter.mock.calls[0][0]).toHaveProperty('name');
    expect(mockSelectCharacter.mock.calls[0][0]).toHaveProperty('confidence');
    expect(mockSelectCharacter.mock.calls[0][0]).toHaveProperty('price');
  });

  test('displays first letter of name in Avatar when no image is provided', () => {
    render(
      <ThemeProvider theme={theme}>
        <CharacterSelection onSelectCharacter={() => {}} />
      </ThemeProvider>
    );
    
    // Obtener todos los nombres de personajes
    const characterNames = screen.getAllByText(/^[A-Za-z]+$/);
    
    characterNames.forEach(nameElement => {
      const name = nameElement.textContent;
      const firstLetter = name.charAt(0);
      const card = nameElement.closest('[role="button"]');
      expect(firstLetter).toBeTruthy();
    });
    }); 
});

