import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import '@testing-library/jest-dom';
import GameModeSelection from './GameModeSelection';
import { ThemeProvider } from '../../context/ThemeContext';

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

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

    expect(screen.getByText(/TRIVIA GAME/i)).toBeInTheDocument();
    expect(screen.getByText(/SELECT THE MODE/i)).toBeInTheDocument();
    expect(screen.getByText(/ROUNDS/i)).toBeInTheDocument();
    expect(screen.getByText(/TIME/i)).toBeInTheDocument();
    expect(screen.getByText(/HIDE/i)).toBeInTheDocument();
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

    fireEvent.click(screen.getByText(/ROUNDS/i));
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

    fireEvent.click(screen.getByText(/ROUNDS/i));
    expect(screen.getByRole('button', { name: /NEXT/i })).toBeEnabled();
    
    fireEvent.click(screen.getByText(/ROUNDS/i));
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

    const roundsBtn = screen.getByText(/ROUNDS/i);
    const timeBtn = screen.getByText(/TIME/i);
    const hideBtn = screen.getByText(/HIDE/i);
    
    fireEvent.click(roundsBtn);
    expect(roundsBtn).toHaveAttribute('data-selected', 'true');
    expect(timeBtn).toHaveAttribute('data-selected', 'false');
    expect(hideBtn).toHaveAttribute('data-selected', 'false');

    fireEvent.click(timeBtn);
    expect(roundsBtn).toHaveAttribute('data-selected', 'false');
    expect(timeBtn).toHaveAttribute('data-selected', 'true');
    expect(hideBtn).toHaveAttribute('data-selected', 'false');

    fireEvent.click(hideBtn);
    expect(roundsBtn).toHaveAttribute('data-selected', 'false');
    expect(timeBtn).toHaveAttribute('data-selected', 'false');
    expect(hideBtn).toHaveAttribute('data-selected', 'true');
  });

  it('navigates to the correct page when NEXT is clicked (rounds)', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameModeSelection />
        </MemoryRouter>
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText(/ROUNDS/i));
    fireEvent.click(screen.getByRole('button', { name: /NEXT/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/roundsgame');
  });

  it('navigates to the correct page when NEXT is clicked (time)', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameModeSelection />
        </MemoryRouter>
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText(/TIME/i));
    fireEvent.click(screen.getByRole('button', { name: /NEXT/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/timegame');
  });
});