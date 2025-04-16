import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import '@testing-library/jest-dom';
import GameModeSelection from './GameModeSelection';
import { ThemeProvider } from "../context/ThemeContext";

describe('GameModeSelection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component correctly', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameModeSelection />
        </MemoryRouter>
      </ThemeProvider>
    );

    /*expect(screen.getByText(/TRIVIA GAME/i)).toBeInTheDocument();
    expect(screen.getByText(/SELECT THE MODE/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ROUNDS/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/TIME/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/HIDE/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /NEXT/i })).toBeDisabled();
  });

  it('enables the NEXT button when a mode is selected', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameModeSelection />
        </MemoryRouter>
      </ThemeProvider>
    );

    const roundsCheckbox = screen.getByLabelText(/ROUNDS/i);
    fireEvent.click(roundsCheckbox);
    
    expect(screen.getByRole('button', { name: /NEXT/i })).toBeEnabled();
  });

  it('disables the NEXT button when the selected mode is deselected', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameModeSelection />
        </MemoryRouter>
      </ThemeProvider>
    );

    const roundsCheckbox = screen.getByLabelText(/ROUNDS/i);
    fireEvent.click(roundsCheckbox);
    expect(screen.getByRole('button', { name: /NEXT/i })).toBeEnabled();
    
    fireEvent.click(roundsCheckbox);
    expect(screen.getByRole('button', { name: /NEXT/i })).toBeDisabled();
  });

  it('allows switching between different modes', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameModeSelection />
        </MemoryRouter>
      </ThemeProvider>
    );

    const roundsCheckbox = screen.getByLabelText(/ROUNDS/i);
    const timeCheckbox = screen.getByLabelText(/TIME/i);
    
    fireEvent.click(roundsCheckbox);
    expect(roundsCheckbox).toBeChecked();
    expect(timeCheckbox).not.toBeChecked();
    
    fireEvent.click(timeCheckbox);
    expect(timeCheckbox).toBeChecked();
    expect(roundsCheckbox).not.toBeChecked();
  });

  it('navigates to the game page when NEXT is clicked', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameModeSelection />
        </MemoryRouter>
      </ThemeProvider>
    );

    const roundsCheckbox = screen.getByLabelText(/ROUNDS/i);
    fireEvent.click(roundsCheckbox);
    
    const nextButton = screen.getByRole('button', { name: /NEXT/i });
    expect(nextButton.closest('a')).toHaveAttribute('href', '/game');*/
  });
});