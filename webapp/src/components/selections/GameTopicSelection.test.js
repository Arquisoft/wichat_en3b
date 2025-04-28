import React from 'react';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import GameTopicSelection from "./GameTopicSelection";
import { ThemeProvider } from '../../context/ThemeContext';

// Mock the useNavigate hook
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: () => jest.fn()
}));

// Mock the useAxios hook - including historicalWoman in available topics
jest.mock("../../hooks/useAxios", () => ({
  __esModule: true,
  default: () => ({
    get: jest.fn().mockResolvedValue({
      data: {
        availableTopics: ["city", "flag", "sport", "singer", "athlete", "language", "historicalWoman", "famousPlace"]
      }
    })
  })
}));

// Mock sessionStorage
const mockSessionStorage = {};
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(key => mockSessionStorage[key]),
    setItem: jest.fn((key, value) => {
      mockSessionStorage[key] = value;
    }),
    removeItem: jest.fn(key => {
      delete mockSessionStorage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(mockSessionStorage).forEach(key => {
        delete mockSessionStorage[key];
      });
    })
  },
  writable: true
});

describe("GameTopicSelection Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders correctly with title and selection options", async () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameTopicSelection />
        </MemoryRouter>
      </ThemeProvider>
    );

    expect(screen.getByText(/TRIVIA GAME/i)).toBeInTheDocument();
    expect(screen.getByText(/CHOOSE YOUR TOPICS/i)).toBeInTheDocument();
    expect(screen.getByText(/Custom/i)).toBeInTheDocument();
    expect(screen.getByText(/Wild Mode/i)).toBeInTheDocument();
    
    // Wait for topics to be loaded
    await waitFor(() => {
      expect(screen.getByText(/Geography/i)).toBeInTheDocument();
      expect(screen.getByText(/History/i)).toBeInTheDocument();
    });
  });

  test("NEXT button is disabled initially", async () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameTopicSelection />
        </MemoryRouter>
      </ThemeProvider>
    );
    
    const nextButton = screen.getByText(/NEXT/i);
    expect(nextButton).toBeDisabled();
  });

  test("NEXT button enables when topics are selected", async () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameTopicSelection />
        </MemoryRouter>
      </ThemeProvider>
    );
    
    // Wait for topics to be loaded
    await waitFor(() => {
      expect(screen.getByText(/CHOOSE YOUR TOPICS/i)).toBeInTheDocument();
      expect(screen.getByText(/HISTORICAL WOMEN/i)).toBeInTheDocument();
    });
    
    // Select HISTORICAL WOMEN topic
    const historicalWomenTopic = screen.getByRole('button', { name: /HISTORICAL WOMEN/i });
    fireEvent.click(historicalWomenTopic);
    
    // NEXT button should be enabled
    const nextButton = screen.getByText(/NEXT/i);
    expect(nextButton).not.toBeDisabled();
  });

  test("Topic selection updates count correctly", async () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameTopicSelection />
        </MemoryRouter>
      </ThemeProvider>
    );
    
    // Wait for topics to be loaded
    await waitFor(() => {
      expect(screen.getByText(/0 topics selected/i)).toBeInTheDocument();
      expect(screen.getByText(/HISTORICAL WOMEN/i)).toBeInTheDocument();
      expect(screen.getByText(/FAMOUS PLACES/i)).toBeInTheDocument();
    });
    
    // Select HISTORICAL WOMEN topic
    const historicalWomenTopic = screen.getByRole('button', { name: /HISTORICAL WOMEN/i });
    fireEvent.click(historicalWomenTopic);
    
    // Check that count updated
    expect(screen.getByText(/1 topic selected/i)).toBeInTheDocument();
    
    // Select another topic
    const flagTopic = screen.getByRole('button', { name: /FAMOUS PLACES/i });
    fireEvent.click(flagTopic);
    
    // Check that count updated again
    expect(screen.getByText(/2 topics selected/i)).toBeInTheDocument();
    
    // Deselect a topic
    fireEvent.click(historicalWomenTopic);
    
    // Check count updated after deselection
    expect(screen.getByText(/1 topic selected/i)).toBeInTheDocument();
  });

  test("Wild Mode selects all topics", async () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameTopicSelection />
        </MemoryRouter>
      </ThemeProvider>
    );
    
    // Click Wild Mode button
    const wildModeButton = screen.getByText(/Wild Mode/i);
    fireEvent.click(wildModeButton);
    
    // Check that all topics are selected
    await waitFor(() => {
      expect(screen.getByText(/All \d+ topics selected/i)).toBeInTheDocument();
    });
    
    // NEXT button should be enabled
    const nextButton = screen.getByText(/NEXT/i);
    expect(nextButton).not.toBeDisabled();
  });

  test("Custom mode clears all selections", async () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameTopicSelection />
        </MemoryRouter>
      </ThemeProvider>
    );
    
    // First select Wild Mode
    const wildModeButton = screen.getByText(/Wild Mode/i);
    fireEvent.click(wildModeButton);
    
    // Then switch to Custom Mode
    const customButton = screen.getByText(/Custom/i);
    fireEvent.click(customButton);
    
    // Check that no topics are selected
    await waitFor(() => {
      expect(screen.getByText(/0 topics selected/i)).toBeInTheDocument();
    });
    
    // NEXT button should be disabled again
    const nextButton = screen.getByText(/NEXT/i);
    expect(nextButton).toBeDisabled();
  });

  test("Search functionality filters topics correctly", async () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameTopicSelection />
        </MemoryRouter>
      </ThemeProvider>
    );
    
    // Wait for topics to be loaded
    await waitFor(() => {
      expect(screen.getByText(/Geography/i)).toBeInTheDocument();
      expect(screen.getByText(/History/i)).toBeInTheDocument();
    });
    
    // Enter search term related to History to find HISTORICAL WOMEN
    const searchInput = screen.getByLabelText(/Search topics.../i);
    fireEvent.change(searchInput, { target: { value: 'history' } });
    
    // Check that only History category is shown
    await waitFor(() => {
      expect(screen.getByText(/History/i)).toBeInTheDocument();
      expect(screen.queryByText(/Geography/i)).not.toBeInTheDocument();
    });
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    
    // Check that all categories are shown again
    await waitFor(() => {
      expect(screen.getByText(/Geography/i)).toBeInTheDocument();
      expect(screen.getByText(/History/i)).toBeInTheDocument();
    });
  });

  test("Navigation occurs when clicking NEXT with selected topics", async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router'), 'useNavigate').mockReturnValue(mockNavigate);
    
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameTopicSelection />
        </MemoryRouter>
      </ThemeProvider>
    );
    
    // Wait for topics to be loaded
    await waitFor(() => {
      expect(screen.getByText(/HISTORICAL WOMEN/i)).toBeInTheDocument();
    });
    
    // Select HISTORICAL WOMEN topic
    await waitFor(() => {
      // Check that the button is enabled before clicking
      const historicalWomenTopic = screen.getByRole('button', { name: /HISTORICAL WOMEN/i });
      expect(historicalWomenTopic).not.toBeDisabled();
      fireEvent.click(historicalWomenTopic);
    });
    
    // Make sure the button is enabled before clicking
    await waitFor(() => {
      const nextButton = screen.getByText(/NEXT/i);
      expect(nextButton).not.toBeDisabled();
    });
    
    // Click NEXT button
    fireEvent.click(screen.getByText(/NEXT/i));
    
    // Wait for and check that sessionStorage was updated
    await waitFor(() => {
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
        "selectedTopics",
        expect.any(String)
      );
      
      // Check that navigate was called with the correct path
      expect(mockNavigate).toHaveBeenCalledWith("/gamemode");
    });
  });

  test("Back Home button navigates to home page", async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router'), 'useNavigate').mockReturnValue(mockNavigate);
    
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameTopicSelection />
        </MemoryRouter>
      </ThemeProvider>
    );
    
    // Click BACK HOME button
    const backButton = screen.getByText(/BACK HOME/i);
    fireEvent.click(backButton);
    
    // Check that navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

  test("Unavailable topics are disabled", async () => {
    // Mock the useAxios hook with specific available topics
    jest.spyOn(require('../../hooks/useAxios'), 'default').mockImplementation(() => ({
      get: jest.fn().mockResolvedValue({
        data: {
          availableTopics: ["historicalWoman", "flag"] // Only these topics are available
        }
      })
    }));
    
    render(
      <ThemeProvider>
        <MemoryRouter>
          <GameTopicSelection />
        </MemoryRouter>
      </ThemeProvider>
    );
    
    // Wait for topics to be loaded
    await waitFor(() => {
      expect(screen.getByText(/HISTORICAL WOMEN/i)).toBeInTheDocument();
      expect(screen.getByText(/FOODS/i)).toBeInTheDocument();
    });
    
    // Check that HISTORICAL WOMEN is clickable (available)
    const historicalWomenTopic = screen.getByRole('button', { name: /HISTORICAL WOMEN/i });
    expect(historicalWomenTopic).not.toBeDisabled();
    
    // Check that FOODS is disabled (unavailable)
    const foodTopic = screen.getByRole('button', { name: /FOODS/i });
    expect(foodTopic).toBeDisabled();
  });
});