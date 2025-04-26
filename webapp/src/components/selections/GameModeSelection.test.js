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
    expect(screen.getByRole('button', { name: /PLAY ROUNDS/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /PLAY TIME/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /PLAY HIDE/i })).toBeInTheDocument();
  });

  it('navigates to /roundsgame when PLAY ROUNDS button is clicked', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameModeSelection />
        </MemoryRouter>
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /PLAY ROUNDS/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/roundsgame');
  });

  it('navigates to /timegame when PLAY TIME button is clicked', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameModeSelection />
        </MemoryRouter>
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /PLAY TIME/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/timegame');
  });

  it('navigates to /hidegame when PLAY HIDE button is clicked', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameModeSelection />
        </MemoryRouter>
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /PLAY HIDE/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/hidegame');
  });
});