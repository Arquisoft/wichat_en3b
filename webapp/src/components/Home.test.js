import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import Home from "./Home";
import useAxios from "../hooks/useAxios";
import useAuth from "../hooks/useAuth";
import { ThemeProvider } from "../context/ThemeContext";
import { I18nextProvider } from "react-i18next";
import i18n from "../utils/i18n";
import { formatGameTopics } from "./Home";


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
      <ThemeProvider>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </I18nextProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, testuser!/i)).toBeInTheDocument();
    });
  });

  it("should navigate to the game topic page when 'Play A Game Now' is clicked", async () => {
    render(
      <ThemeProvider>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </I18nextProvider>
      </ThemeProvider>
    );

    const playButton = screen.getByTestId("play-button");
    fireEvent.click(playButton);

    expect(mockNavigate).toHaveBeenCalledWith("/gametopic");
  });

  it("should render the tabs and allow switching between them", async () => {
    render(
      <ThemeProvider>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </I18nextProvider>
      </ThemeProvider>
    );

    const statsTab = screen.getByText(/Your Stats/i);
    const rankingsTab = screen.getByTestId("ranking");

    expect(statsTab).toBeInTheDocument();
    expect(rankingsTab).toBeInTheDocument();

    fireEvent.click(rankingsTab);

    await waitFor(() => {
      expect(screen.getByText(/Leaderboard/i)).toBeInTheDocument();
    });
  });

  it("should fetch and display user stats", async () => {
    // Mock the API responses
    mockAxios.onGet("/getTopics").reply(200, { topics: ["history", "science"] });
    mockAxios.onGet("/userstats?username=testuser&mode=rounds&topic=all").reply(200, { 
      stats: {
        username: "testuser",
        totalScore: 800,
        correctRate: 0.8,
        totalGamesPlayed: 15
      }
    });
    mockAxios.onGet("/userstats?topic=all&mode=rounds").reply(200, { 
      stats: [{
        username: "otheruser",
        totalScore: 1000,
        correctRate: 0.9,
        totalGamesPlayed: 20
      }]
    });
  
    render(
      <ThemeProvider>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </I18nextProvider>
      </ThemeProvider>
    );
  
    // Navigate to the rankings tab
    const rankingsTab = screen.getByTestId("ranking");
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
    const gamesPlayedTab = screen.getAllByRole('tab').find(tab => tab.getAttribute('data-testid') === 'gamesPlayed');
    fireEvent.click(gamesPlayedTab);

    await waitFor(() => {
      expect(screen.getByText(/20 games/i)).toBeInTheDocument();
    });
  });
});

describe("formatGameTopics function", () => {
  const mockT =(key) => {
      if (key === "and") return "and";
      if (key === "more") return "more";
      return key; // Default behavior for other keys
  };

  it("should return topics joined by commas when the number of topics is less than or equal to the maximum length", () => {
      const topics = ["history", "science", "math"];
      const result = formatGameTopics(topics, mockT);
      expect(result).toBe("history, science, math");
  });

  it("should truncate topics and append '... and X more' when the number of topics exceeds the maximum length", () => {
      const topics = ["history", "science", "math", "geography", "art"];
      const result = formatGameTopics(topics, mockT);
      expect(result).toBe("history, science, math... and 2 more");
  });
});

describe("Ranking sorting logic", () => {
  const mockStats = [
      { totalScore: 100, correctRate: 0.8, totalGamesPlayed: 10 },
      { totalScore: 200, correctRate: 0.9, totalGamesPlayed: 20 },
      { totalScore: 150, correctRate: 0.85, totalGamesPlayed: 15 },
  ];

  const sortByStat = (stat, stats) => {
      return [...stats].sort((a, b) => {
          if (stat === "points") return b.totalScore - a.totalScore;
          if (stat === "accuracy") return b.correctRate - a.correctRate;
          if (stat === "gamesPlayed") return b.totalGamesPlayed - a.totalGamesPlayed;
      });
  };

  const sortedStats = [
      { totalScore: 200, correctRate: 0.9, totalGamesPlayed: 20 },
      { totalScore: 150, correctRate: 0.85, totalGamesPlayed: 15 },
      { totalScore: 100, correctRate: 0.8, totalGamesPlayed: 10 },
  ]

  const stats = [
      { stat: "points"},
      { stat: "accuracy"},
      { stat: "gamesPlayed"},
  ]

  stats.forEach(({stat}) => {
      it(`should sort by ${stat}`, () => {
          const sorted = sortByStat(stat, mockStats);
          expect(sorted).toEqual(sortedStats);
      });
  });
});
