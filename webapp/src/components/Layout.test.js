import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import Layout from "./Layout";
import useAuth from "../hooks/useAuth";
import axios from "../api/axios";

jest.mock("../hooks/useAuth");
jest.mock("../api/axios", () => ({
  post: jest.fn(),
}));

describe("Layout Component", () => {
  test("renders Layout component correctly", () => {
    useAuth.mockReturnValue({ auth: {} });
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );
    
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  test("shows Login button when user is not authenticated", () => {
    useAuth.mockReturnValue({ auth: {} });
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );
    
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  test("shows Log Out button when user is authenticated", () => {
    useAuth.mockReturnValue({ auth: { username: "testuser" } });
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );
    
    expect(screen.getByText("Log Out")).toBeInTheDocument();
  });

  test("calls logout API when Log Out button is clicked", async () => {
    const setAuthMock = jest.fn();
    useAuth.mockReturnValue({ auth: { username: "testuser" }, setAuth: setAuthMock });
    axios.post.mockResolvedValue({});
    
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );
    
    const logoutButton = screen.getByText("Log Out");
    await userEvent.click(logoutButton);
    
    expect(axios.post).toHaveBeenCalledWith("/logout", {}, { withCredentials: true });
    expect(setAuthMock).toHaveBeenCalledWith({});
  });
});
