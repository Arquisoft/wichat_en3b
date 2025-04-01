

import React from 'react'
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import GameTopicSelection from "./GameTopicSelection";
import useAxios from "../hooks/useAxios";

jest.mock("../hooks/useAxios", () => () => ({ post: jest.fn() }));

describe("GameTopicSelection Component", () => {
  test("renders correctly with title and options", () => {
    render(
      <MemoryRouter>
        <GameTopicSelection />
      </MemoryRouter>
    );
    expect(screen.getByText(/trivia game/i)).toBeInTheDocument();
    expect(screen.getByText(/select the topic/i)).toBeInTheDocument();
    expect(screen.getByText(/custom/i)).toBeInTheDocument();
    expect(screen.getByText(/wild - everything all at once!/i)).toBeInTheDocument();
  });

  test("NEXT button is disabled initially", () => {
    render(
      <MemoryRouter>
        <GameTopicSelection />
      </MemoryRouter>
    );
    const nextButton = screen.getByText(/next/i);
    expect(nextButton).toBeDisabled();
  });

  test("NEXT button enables when a topic is selected", () => {
    render(
      <MemoryRouter>
        <GameTopicSelection />
      </MemoryRouter>
    );
    const cityButton = screen.getByText(/cities/i);
    fireEvent.click(cityButton);
    expect(screen.getByText(/next/i)).toBeEnabled();
  });

  test("NEXT button disables when all topics are deselected", () => {
    render(
      <MemoryRouter>
        <GameTopicSelection />
      </MemoryRouter>
    );
    const cityButton = screen.getByText(/cities/i);
    fireEvent.click(cityButton);
    fireEvent.click(cityButton);
    expect(screen.getByText(/next/i)).toBeDisabled();
  });

  test("Selecting 'Wild' automatically selects all topics", () => {
    render(
      <MemoryRouter>
        <GameTopicSelection />
      </MemoryRouter>
    );
    const wildOption = screen.getByText(/wild - everything all at once!/i);
    fireEvent.click(wildOption);
    expect(screen.getByText(/next/i)).toBeEnabled();
  });

  test("Selecting a specific topic updates state", () => {
    render(
      <MemoryRouter>
        <GameTopicSelection />
      </MemoryRouter>
    );
    const cityButton = screen.getByText(/cities/i);
    fireEvent.click(cityButton);
    expect(cityButton).toHaveStyle("background: linear-gradient(to right, #2196f3, #9c27b0)");
  });
  
  test("Topic buttons are disabled when 'Wild' mode is selected", () => {
    render(
      <MemoryRouter>
        <GameTopicSelection />
      </MemoryRouter>
    );
    const wildOption = screen.getByText(/wild - everything all at once!/i);
    fireEvent.click(wildOption);
  
    const cityButton = screen.getByText(/cities/i);
    expect(cityButton).toBeDisabled();
  });
  
  test("handleCustomSelection resets wild mode and clears selected topics", () => {
    render(
      <MemoryRouter>
        <GameTopicSelection />
      </MemoryRouter>
    );
    const customOption = screen.getByText(/custom/i);
    fireEvent.click(customOption);
  
    expect(screen.getByText(/next/i)).toBeDisabled(); 
  });
  
  test("startGame makes API call and handles errors", async () => {
    const mockAxiosPost = jest.fn().mockResolvedValue({ data: {} });
    jest.mock("../hooks/useAxios", () => () => ({ post: mockAxiosPost }));
  
    render(
      <MemoryRouter>
        <GameTopicSelection />
      </MemoryRouter>
    );
  
    const cityButton = screen.getByText(/cities/i);
    fireEvent.click(cityButton);
  
    const nextButton = screen.getByText(/next/i);
    fireEvent.click(nextButton);
  
    await waitFor(() =>
      expect(mockAxiosPost).toHaveBeenCalledWith("/loadQuestion", { modes: ["city"] })
    );
  
    mockAxiosPost.mockRejectedValueOnce(new Error("Network error"));
  
    fireEvent.click(nextButton);
  
    await waitFor(() =>
      expect(console.error).toHaveBeenCalledWith("Error fetching game data:", expect.any(Error))
    );
  });
  
  test("Topic buttons work correctly based on isWild and selectedTopics states", () => {
  
    render(
      <MemoryRouter>
        <GameTopicSelection />
      </MemoryRouter>
    );
  
    const flagButton = screen.getByText(/flags/i);
    const athleteButton = screen.getByText(/athletes/i);
    const singerButton = screen.getByText(/singers/i);
  
    expect(flagButton).not.toBeDisabled();
    expect(flagButton).not.toHaveStyle("background: linear-gradient(to right, #2196f3, #9c27b0)");
  
    fireEvent.click(flagButton);
    expect(flagButton).toHaveStyle("background: linear-gradient(to right, #2196f3, #9c27b0)");
  
    const wildOption = screen.getByText(/wild - everything all at once!/i);
    fireEvent.click(wildOption);
  
    expect(flagButton).toBeDisabled();
    expect(athleteButton).toBeDisabled();
    expect(singerButton).toBeDisabled();
  });
  
  
});
