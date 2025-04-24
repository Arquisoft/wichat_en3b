import React from 'react';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import GameModeSelection from "./GameModeSelection";
import { ThemeProvider } from '../../context/ThemeContext';

// Mock the useNavigate hook
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: () => jest.fn()
}));

describe("GameModeSelection Component", () => {
  test("renders correctly with title and mode options", () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameModeSelection />
        </MemoryRouter>
      </ThemeProvider>
    );
    expect(screen.getByText(/trivia game/i)).toBeInTheDocument();
    expect(screen.getByText(/select the mode/i)).toBeInTheDocument();
    expect(screen.getByText(/rounds/i)).toBeInTheDocument();
    expect(screen.getByText(/time/i)).toBeInTheDocument();
    expect(screen.getByText(/hide/i)).toBeInTheDocument();
  });

  test("NEXT button is disabled initially", () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameModeSelection />
        </MemoryRouter>
      </ThemeProvider>
    );
    const nextButton = screen.getByText(/next/i);
    expect(nextButton).toBeDisabled();
  });

  test("NEXT button enables when a mode is selected", async () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameModeSelection />
        </MemoryRouter>
      </ThemeProvider>
    );
    
    const roundsButton = screen.getByText(/rounds/i);
    fireEvent.click(roundsButton);
    
    // Wait for button to be enabled before testing
    await waitFor(() => {
      const nextButton = screen.getByText(/next/i);
      expect(nextButton).not.toBeDisabled();
    });
  });

  test("NEXT button disables when mode is deselected", async () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameModeSelection />
        </MemoryRouter>
      </ThemeProvider>
    );
    
    const roundsButton = screen.getByText(/rounds/i);
    
    // First click to select
    fireEvent.click(roundsButton);
    
    // Wait for button to be enabled
    await waitFor(() => {
      expect(screen.getByText(/next/i)).not.toBeDisabled();
    });
    
    // Click again to deselect
    fireEvent.click(roundsButton);
    
    // Wait for button to be disabled again
    await waitFor(() => {
      expect(screen.getByText(/next/i)).toBeDisabled();
    });
  });

  test("Selecting a mode updates state", async () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameModeSelection />
        </MemoryRouter>
      </ThemeProvider>
    );
    
    const timeButton = screen.getByText(/time/i);
    fireEvent.click(timeButton);
    
    // Wait and verify the mode is selected using the data-selected attribute
    await waitFor(() => {
      expect(timeButton).toHaveAttribute('data-selected', 'true');
    });
  });

  test("Switching modes updates selection state correctly", async () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameModeSelection />
        </MemoryRouter>
      </ThemeProvider>
    );
    
    const roundsButton = screen.getByText(/rounds/i);
    const timeButton = screen.getByText(/time/i);
    
    // Select rounds mode
    fireEvent.click(roundsButton);
    
    // Wait for the selection to be updated
    await waitFor(() => {
      expect(roundsButton).toHaveAttribute('data-selected', 'true');
    });
    
    // Then select time mode
    fireEvent.click(timeButton);
    
    // Wait for selections to update - rounds should be deselected, time selected
    await waitFor(() => {
      expect(roundsButton).not.toHaveAttribute('data-selected', 'true');
      expect(timeButton).toHaveAttribute('data-selected', 'true');
    });
  });

  test("Navigation occurs when clicking NEXT with selected mode", async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router'), 'useNavigate').mockReturnValue(mockNavigate);
    
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameModeSelection />
        </MemoryRouter>
      </ThemeProvider>
    );
    
    // Select hide mode
    const hideButton = screen.getByText(/hide/i);
    fireEvent.click(hideButton);
    
    // Wait for button to be enabled
    await waitFor(() => {
      expect(screen.getByText(/next/i)).not.toBeDisabled();
    });
    
    // Click NEXT button
    fireEvent.click(screen.getByText(/next/i));
    
    // Check that navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/hidegame');
  });
});