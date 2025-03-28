import React from 'react';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Game from "./Game";
import { AuthProvider } from "../context/AuthContext";
import useAxios from "../hooks/useAxios";

jest.mock("../hooks/useAxios", () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      get: jest.fn().mockResolvedValue({ data: mockQuestion }),
    })),
  };
});

const mockQuestion = {
  imageUrl: "https://example.com/image.jpg",
  correctAnswer: "Paris",
  options: ["Paris", "London", "Rome", "Berlin"],
};

describe("Game Component", () => {
  test("renders game and loads question", async () => {
    render(
      <AuthProvider>
        <Game />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole("img")).toBeInTheDocument();
    }, { timeout: 3000 });
    
    expect(screen.getByRole("img")).toHaveAttribute("src", mockQuestion.imageUrl);
    mockQuestion.options.forEach((option) => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  test("selecting an answer", async () => {
    render(
      <AuthProvider>
        <Game />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText("Paris")).toBeInTheDocument());
    const optionButton = screen.getByText("Paris");
    fireEvent.click(optionButton);
    expect(optionButton).toHaveClass("selected");
  });
});
