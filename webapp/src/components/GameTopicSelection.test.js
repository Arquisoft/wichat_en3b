import React from 'react';
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import GameTopicSelection from "./GameTopicSelection";
import useAxios from "../hooks/useAxios";

// Mock the useAxios hook
jest.mock("../hooks/useAxios", () => () => ({ post: jest.fn() }));

// Global mock for Material UI icons
jest.mock("@mui/icons-material", () => {
  return new Proxy({}, {
    get: (_, prop) => () => <div>{prop}</div>
  });
});

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
    const button = screen.getByText(/f1 drivers/i);
    fireEvent.click(button);
    expect(screen.getByText(/next/i)).toBeEnabled();
  });

  test("NEXT button disables when all topics are deselected", () => {
    render(
      <MemoryRouter>
        <GameTopicSelection />
      </MemoryRouter>
    );
    const button = screen.getByText(/f1 drivers/i);
    fireEvent.click(button);
    fireEvent.click(button);
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
    const button = screen.getByText(/f1 drivers/i);
    fireEvent.click(button);
    expect(button).toHaveStyle("background: linear-gradient(to right, #2196f3, #9c27b0)");
  });

  test("Topic buttons are disabled when 'Wild' mode is selected", () => {
    render(
      <MemoryRouter>
        <GameTopicSelection />
      </MemoryRouter>
    );
    const wildOption = screen.getByText(/wild - everything all at once!/i);
    fireEvent.click(wildOption);

    const button = screen.getByText(/f1 drivers/i);
    expect(button).toBeDisabled();
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
});
