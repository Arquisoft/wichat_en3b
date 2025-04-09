import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import Home from "./Home";
import useAxios from "../hooks/useAxios";
import useAuth from "../hooks/useAuth";

// Mock the hooks
jest.mock("../hooks/useAxios", () => jest.fn());
jest.mock("../hooks/useAuth", () => jest.fn());

// Mock useNavigate from react-router
const mockNavigate = jest.fn();
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: () => mockNavigate,
}));

// Global mock for Material UI icons using a Proxy to return a simple component
jest.mock("@mui/icons-material", () => {
  return new Proxy({}, {
    get: (_, prop) => () => <div>{prop}</div>
  });
});

const mockAxios = new MockAdapter(axios);

describe("Home component", () => {
  beforeEach(() => {
    // Suppress console errors for cleaner test output
    jest.spyOn(console, "error").mockImplementation(() => {});
    useAxios.mockReturnValue(axios);
    useAuth.mockReturnValue({ auth: { username: "testuser" } });
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  it("should render the home and show the welcome message", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, testuser!/i)).toBeInTheDocument();
    });
  });

  it("should navigate to the game topic page when 'Play A Game Now' is clicked", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const playButton = screen.getByText(/Play A Game Now/i);
    fireEvent.click(playButton);

    expect(mockNavigate).toHaveBeenCalledWith("/gametopic");
  });

  it("should render the tabs and allow switching between them", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const statsTab = screen.getByText(/Your Stats/i);
    const rankingsTab = screen.getByText(/Rankings/i);

    expect(statsTab).toBeInTheDocument();
    expect(rankingsTab).toBeInTheDocument();

    fireEvent.click(rankingsTab);

    await waitFor(() => {
      expect(screen.getByText(/Leaderboard/i)).toBeInTheDocument();
    });
  });

  it("should fetch and display user stats", async () => {
    const mockStats = {
      stats: [{
        username: "otheruser",
        totalScore: 1000,
        correctRate: 0.9,
        totalQuestions: 200,
        totalGamesPlayed: 20
      }]
    };
  
    // Mock the API responses
    mockAxios.onGet("/getTopics").reply(200, { topics: ["history", "science"] });
    mockAxios.onGet("/userstats/testuser/all").reply(200, { 
      stats: {
        username: "testuser",
        totalScore: 800,
        correctRate: 0.8,
        totalGamesPlayed: 15
      }
    });
    mockAxios.onGet("/userstats/topic/all").reply(200, { 
      stats: [{
        username: "otheruser",
        totalScore: 1000,
        correctRate: 0.9,
        totalQuestions: 200,
        totalGamesPlayed: 20
      }]
    });
  
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
  
    // Navigate to the rankings tab
    const rankingsTab = screen.getByText(/Rankings/i);
    fireEvent.click(rankingsTab);
  
    await waitFor(() => {
      expect(screen.getByText(/otheruser/i)).toBeInTheDocument();
      expect(screen.getByText(/1000 pts/i)).toBeInTheDocument();
    });
  
    // Find the accuracy tab specifically among all tabs
    const accuracyTab = screen.getAllByRole('tab').find(tab => /accuracy/i.test(tab.textContent));
    fireEvent.click(accuracyTab);
    
    await waitFor(() => {
      expect(screen.getByText(/90.00 %/i)).toBeInTheDocument();
    });
  
    // Find the gamesPlayed tab specifically among all tabs
    const gamesPlayedTab = screen.getAllByRole('tab').find(tab => /gamesPlayed/i.test(tab.textContent));
    fireEvent.click(gamesPlayedTab);
    
    await waitFor(() => {
      expect(screen.getByText(/20 games/i)).toBeInTheDocument();
    });
  });
});
