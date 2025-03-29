import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import Home from "./Home";
import useAxios from "../hooks/useAxios";
import useAuth from "../hooks/useAuth";

jest.mock("../hooks/useAxios", () => jest.fn());
jest.mock("../hooks/useAuth", () => jest.fn());
const mockNavigate = jest.fn();
jest.mock("react-router", () => ({
    ...jest.requireActual("react-router"),
    useNavigate: () => mockNavigate,
}));
const mockAxios = new MockAdapter(axios);

describe("Home component", () => {
    beforeEach(() => {
        jest.spyOn(console, "error").mockImplementation(() => { });
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
});