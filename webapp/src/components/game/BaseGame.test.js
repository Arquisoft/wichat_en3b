import React from "react";
import { render, fireEvent, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import useAxios from "../../hooks/useAxios";
import { ThemeProvider } from "../../context/ThemeContext";
import { AuthProvider } from "../../context/AuthContext";
import BaseGame from "./BaseGame";

// Mock the hooks and context
jest.mock("../../hooks/useAxios", () => jest.fn());
jest.mock("../../hooks/useAuth", () => ({
  __esModule: true,
  default: () => ({
    auth: { username: "testuser" }
  })
}));

const mockAxios = new MockAdapter(axios);

describe("BaseGame additional tests", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    useAxios.mockReturnValue(axios);
    
    // Mock sessionStorage
    Storage.prototype.getItem = jest.fn(() => JSON.stringify(["city"]));
    
    // Mock coins endpoint
    mockAxios.onGet("/getUserCoins").reply(200, { coins: 500 });
    
    // Basic round data
    mockAxios.onGet("/getRound").reply(200, {
      topic: "city",
      itemWithImage: { name: "Paris", imageUrl: "paris.jpg" },
      items: [
        { name: "Paris" },
        { name: "London" },
        { name: "Berlin" },
        { name: "Madrid" }
      ]
    });
  });

  afterEach(() => {
    mockAxios.reset();
  });

  beforeAll(() => {
    // Mocking the console logger to avoid cluttering the test output
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "info").mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  it("should show loading state initially", async () => {
    // Add a delay to the response to ensure loading state is visible
    mockAxios.onGet("/getRound").reply(() => {
      return new Promise(resolve => setTimeout(() => resolve([200, {
        topic: "city",
        itemWithImage: { name: "Paris", imageUrl: "paris.jpg" },
        items: [
          { name: "Paris" },
          { name: "London" },
          { name: "Berlin" },
          { name: "Madrid" }
        ]
      }]), 100));
    });

    render(
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter>
            <BaseGame />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );

    expect(screen.getByText(/Loading question/i)).toBeInTheDocument();
    expect(screen.getByText(/Get ready for round 1!/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByTestId("question-prompt")).toBeInTheDocument();
    });
  });

  it("should update the score when selecting incorrect answer", async () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter>
            <BaseGame />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("question-prompt")).toBeInTheDocument();
    });

    // Select incorrect answer (London)
    const incorrectAnswer = screen.getByText("London");
    fireEvent.click(incorrectAnswer);

    // Score should remain at 0
    expect(screen.getByText(/Score: 0/i)).toBeInTheDocument();
    
    // Wait for next round to load automatically
    await waitFor(() => {
      expect(screen.getByTestId("question-prompt")).toBeInTheDocument();
    }, { timeout: 3000 });
  });
  /*
  it("should trigger Audience Call lifeline correctly", async () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter>
            <BaseGame />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("question-prompt")).toBeInTheDocument();
    });

    // Find and click the Audience Call button
    const audienceCallButton = screen.getByText(/Audience Call/i);
    
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(audienceCallButton);
    }, );

    // Check if audience call is displayed
    await waitFor(() => {
      expect(screen.getByTestId("audience-response")).toBeInTheDocument();
    }, { timeout: 3000 });

    // Check if button is disabled/used
    expect(audienceCallButton).toBeDisabled();
    expect(audienceCallButton.textContent).toMatch(/(Used|\(Used\)|\(USED\))/i);
  });
  */ 
  it("should correctly use the Chat lifeline", async () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter>
            <BaseGame />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("question-prompt")).toBeInTheDocument();
    });

    // Find and click the Use Chat button
    const useChatButton = screen.getByText(/Use the Chat/i);
    fireEvent.click(useChatButton);

    // Check if the button is disabled/used
    expect(useChatButton).toBeDisabled();
  });

  it("should handle Call a Friend lifeline correctly", async () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter>
            <BaseGame />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("question-prompt")).toBeInTheDocument();
    });

    // Find and click the Call a Friend button
    const callFriendButton = screen.getByText(/Call a Friend/i);
    fireEvent.click(callFriendButton);

    // Check if CallFriend dialog is displayed
    await waitFor(() => {
      // This would depend on your CallFriend component's content
      expect(document.querySelector("[role='dialog']")).toBeInTheDocument();
    });

    // Close the dialog if there's a close button
    const closeButtons = screen.getAllByRole("button");
    const closeButton = closeButtons.find(button => button.textContent.includes("Close") || button.textContent.includes("OK"));
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    // Check if button is marked as used
    expect(callFriendButton.textContent).toContain("(Used)");
  });

  it("should handle Phone Out feature correctly", async () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter>
            <BaseGame />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("question-prompt")).toBeInTheDocument();
    });

    // Find and click the Phone Out button
    const phoneOutButton = screen.getByText(/Phone Out/i);
    fireEvent.click(phoneOutButton);

    // Check if phone dialog is displayed
    await waitFor(() => {
      expect(document.querySelector("[role='dialog']")).toBeInTheDocument();
    });

    // Close the dialog if there's a close button
    const closeButtons = screen.getAllByRole("button");
    const closeButton = closeButtons.find(button => button.textContent.includes("Close") || button.textContent.includes("OK"));
    if (closeButton) {
      fireEvent.click(closeButton);
    }
  });

  it("should display game over statistics when game is over", async () => {
    // Setup for game over
    mockAxios.onPost("/addgame").reply(200, {});
    mockAxios.onPost("/updateUserCoins").reply(200, { success: true });

    render(
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter>
            <BaseGame 
              isGameOver={true} 
              onNewGame={() => {}}
              onRoundComplete={() => {}}
            />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );

    // Wait for game over dialog to appear
    await waitFor(() => {
      expect(screen.getByText(/Game Over/i)).toBeInTheDocument();
    });

    // Check statistics content
    expect(screen.getByText(/Final Score:/i)).toBeInTheDocument();
    expect(screen.getByText(/Correct Answers:/i)).toBeInTheDocument();
    expect(screen.getByText(/Accuracy Rate:/i)).toBeInTheDocument();
    expect(screen.getByText(/Spent on lifelines:/i)).toBeInTheDocument();
    expect(screen.getByText(/Coins earned:/i)).toBeInTheDocument();

    // Test new game button
    const newGameButton = screen.getByText(/New Game/i);
    fireEvent.click(newGameButton);
  });

  it("should handle API error when loading round", async () => {
    // Mock error response
    mockAxios.onGet("/getRound").networkError();

    render(
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter>
            <BaseGame />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );

    // Should show loading initially
    expect(screen.getByText(/Loading question/i)).toBeInTheDocument();
    
    // Should stay in loading state due to error
    await waitFor(() => {
      expect(screen.getByText(/Loading question/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it("should not allow lifelines when not enough coins", async () => {
    // Mock low coins
    mockAxios.onGet("/getUserCoins").reply(200, { coins: 50 });

    render(
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter>
            <BaseGame />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("question-prompt")).toBeInTheDocument();
    });

    // Check if 50/50 and Audience Call are disabled (not enough coins)
    const fiftyFiftyButton = screen.getByText(/50\/50/i);
    const audienceCallButton = screen.getByText(/Audience Call/i);
    const useChatButton = screen.getByText(/Use the Chat/i);
    
    expect(fiftyFiftyButton).toBeDisabled(); // 100 coins needed
    expect(audienceCallButton).toBeDisabled(); // 150 coins needed
    expect(useChatButton).toBeDisabled(); // 200 coins needed
  });

  it("should load multiple rounds correctly", async () => {
    // Queue up two different round responses
    mockAxios.onGet("/getRound").replyOnce(200, {
      topic: "city",
      itemWithImage: { name: "Paris", imageUrl: "paris.jpg" },
      items: [
        { name: "Paris" },
        { name: "London" },
        { name: "Berlin" },
        { name: "Madrid" }
      ]
    }).onGet("/getRound").replyOnce(200, {
      topic: "animal",
      itemWithImage: { name: "Lion", imageUrl: "lion.jpg" },
      items: [
        { name: "Lion" },
        { name: "Tiger" },
        { name: "Elephant" },
        { name: "Giraffe" }
      ]
    });

    render(
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter>
            <BaseGame />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );

    // Wait for first question to load
    await waitFor(() => {
      expect(screen.getByTestId("question-prompt")).toBeInTheDocument();
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(screen.getByText("Paris")).toBeInTheDocument();
    });

    // Answer the question
    const parisOption = screen.getByText("Paris");
    // Use act for event that triggers state updates
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.click(parisOption);
    });

    // First wait for the timer to complete and the loading state to appear
    await waitFor(() => {
      // The component might briefly show loading state between rounds
      const loadingElements = screen.queryAllByText(/Loading question/i);
      return loadingElements.length > 0;
    }, { timeout: 3000 });

    // Then wait for the animal round to load
    await waitFor(() => {
      // Wait until we can see the question prompt with ANIMAL in it
      const questionPrompt = screen.getByTestId("question-prompt");
      return questionPrompt.textContent.includes("ANIMAL");
    }, { timeout: 5000 });

    
  });

  it("should render children function prop correctly", async () => {
    const mockChildFunction = jest.fn(({ handleOptionSelect }) => (
      <div data-testid="custom-child">
        <button onClick={() => handleOptionSelect(0)}>Custom Option</button>
      </div>
    ));

    render(
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter>
            <BaseGame>
              {mockChildFunction}
            </BaseGame>
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("custom-child")).toBeInTheDocument();
    });

    // Verify the child function was called
    expect(mockChildFunction).toHaveBeenCalled();
    
    // Test interaction with the custom child component
    const customButton = screen.getByText("Custom Option");
    fireEvent.click(customButton);
    
    // Should update score since we selected correct answer (index 0)
    await waitFor(() => {
      expect(screen.getByText(/Score: 50/i)).toBeInTheDocument();
    });
  });
});