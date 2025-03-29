import { render, screen, fireEvent } from "@testing-library/react";
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
});
