import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import TimeGame from "./TimeGame";
import useAxios from "../../hooks/useAxios";
import { ThemeProvider } from "../../context/ThemeContext";

// Global mock for Material UI icons
jest.mock("@mui/icons-material", () => {
  const originalModule = jest.requireActual("@mui/icons-material");
  return {
    ...originalModule,
    // Override specific icons if needed
    ArrowBack: () => <div>ArrowBackIcon</div>,
    Phone: () => <div>PhoneIcon</div>,
  };
});

jest.mock("../../hooks/useAxios", () => jest.fn());
const mockAxios = new MockAdapter(axios);

describe("TimeGame component", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    useAxios.mockReturnValue(axios);
    // Mock sessionStorage
    Storage.prototype.getItem = jest.fn(() => JSON.stringify(["city"]));
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  it("should render the game and show the time remaining", async () => {
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
  
    render(
      <ThemeProvider>
        <MemoryRouter>
          <TimeGame />
        </MemoryRouter>
      </ThemeProvider>
    );
      
    await waitFor(() => {
      expect(screen.getByText(/Time remaining:/i)).toBeInTheDocument();
    });
  });
});