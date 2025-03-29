import React from "react";
import { render, fireEvent, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import Game from "./Game";
import useAxios from "../hooks/useAxios";

jest.mock("../hooks/useAxios", () => jest.fn());
const mockAxios = new MockAdapter(axios);

describe("Game component", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    useAxios.mockReturnValue(axios);
  });
  
  afterAll(() => {
    console.error.mockRestore();
  });

  it("should render the game and load the first question", async () => {
    mockAxios.onGet("/getRound").reply(200, {
      mode: "city",
      itemWithImage: { name: "Paris", imageUrl: "paris.jpg" },
      items: [
        { name: "Paris" },
        { name: "London" },
        { name: "Berlin" },
        { name: "Madrid" }
      ]
    });

    render(
      <MemoryRouter>
        <Game />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/What is this city\?/i)).toBeInTheDocument();
      expect(screen.getByText("Paris")).toBeInTheDocument();
      expect(screen.getByText("London")).toBeInTheDocument();
      expect(screen.getByText("Berlin")).toBeInTheDocument();
      expect(screen.getByText("Madrid")).toBeInTheDocument();
    });
  });

  it("should allow selecting an answer and update the score if correct", async () => {
    mockAxios.onGet("/getRound").reply(200, {
      mode: "city",
      itemWithImage: { name: "Paris", imageUrl: "paris.jpg" },
      items: [
        { name: "Paris" },
        { name: "London" },
        { name: "Berlin" },
        { name: "Madrid" }
      ]
    });

    render(
      <MemoryRouter>
        <Game />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/What is this city\?/i));

    const correctAnswer = screen.getByText("Paris");
    fireEvent.click(correctAnswer);

    await waitFor(() => {
      expect(screen.getByText(/Score: 50/i)).toBeInTheDocument();
    });
  });

  it("should remove two incorrect options when 50/50 is used and disable the button", async () => {
    mockAxios.onGet("/getRound").reply(200, {
      mode: "city",
      itemWithImage: { name: "Paris", imageUrl: "paris.jpg" },
      items: [
        { name: "Paris" },
        { name: "London" },
        { name: "Berlin" },
        { name: "Madrid" }
      ]
    });
  
    render(
      <MemoryRouter>
        <Game />
      </MemoryRouter>
    );
  
    await waitFor(() => screen.getByText(/What is this city\?/i));
  
    expect(screen.getByText("Paris")).toBeVisible();
    expect(screen.getByText("London")).toBeVisible();
    expect(screen.getByText("Berlin")).toBeVisible();
    expect(screen.getByText("Madrid")).toBeVisible();
  
    const fiftyFiftyButton = screen.getByText(/50\/50/i);
  
    fireEvent.click(fiftyFiftyButton);
  
    await waitFor(() => expect(fiftyFiftyButton).toBeDisabled());

    await waitFor(() => {
      const visibleCities = ["Paris", "London", "Berlin", "Madrid"].filter((city) => {
        const element = screen.queryByText(city);
        return element && window.getComputedStyle(element).display !== "none" && element.offsetHeight > 0;
      });
    
      expect(visibleCities.length).toBe(2);
    });
        
  });
});
