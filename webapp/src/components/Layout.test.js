import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import Layout from "./Layout";
import useAuth from "../hooks/useAuth";
import axios from "../utils/axios";
import { I18nextProvider } from "react-i18next";
import i18n from "../utils/i18n";
import { ThemeProvider } from "../context/ThemeContext";

jest.mock("../hooks/useAuth");
jest.mock("../utils/axios", () => ({
  post: jest.fn(),
}));

describe("Layout Component", () => {
  const renderLayout = () => {
    render(
      <ThemeProvider>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <Layout />
          </MemoryRouter>
        </I18nextProvider>
      </ThemeProvider>
    );
  };

  const mockAuth = (authState) => {
    useAuth.mockReturnValue(authState);
  };

  const getButtonByText = (key) => screen.getByText(i18n.t(key));

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  test("renders Layout component correctly", () => {
    mockAuth({ auth: {} });
    renderLayout();

    expect(getButtonByText("home")).toBeInTheDocument();
  });

  test("shows Login and Sign up buttons when user is not authenticated", () => {
    mockAuth({ auth: {} });
    renderLayout();

    expect(getButtonByText("login")).toBeInTheDocument();
    expect(getButtonByText("signUp")).toBeInTheDocument();
  });

  test("shows Log Out button when user is authenticated", () => {
    mockAuth({ auth: { username: "testuser" } });
    renderLayout();

    expect(getButtonByText("logout")).toBeInTheDocument();
  });

  test("calls logout API when Log Out button is clicked", async () => {
    const setAuthMock = jest.fn();
    mockAuth({ auth: { username: "testuser" }, setAuth: setAuthMock });
    axios.post.mockResolvedValue({});
    renderLayout();

    const logoutButton = getButtonByText("logout");
    await userEvent.click(logoutButton);

    expect(axios.post).toHaveBeenCalledWith("/logout", {}, { withCredentials: true });
    expect(setAuthMock).toHaveBeenCalledWith({});
  });

  test("logs an error to the console when the logout API fails", async () => {
    const setAuthMock = jest.fn();
    const errorMock = new Error("Logout failed");
    mockAuth({ auth: { username: "testuser" }, setAuth: setAuthMock });
    axios.post.mockRejectedValue(errorMock);

    const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {});

    renderLayout();

    const logoutButton = getButtonByText("logout");
    await userEvent.click(logoutButton);

    expect(consoleErrorMock).toHaveBeenCalledWith(errorMock);
    consoleErrorMock.mockRestore();
  });
});