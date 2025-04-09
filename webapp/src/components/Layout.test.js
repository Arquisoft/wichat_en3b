import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import Layout from "./Layout";
import useAuth from "../hooks/useAuth";
import axios from "../api/axios";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";

jest.mock("../hooks/useAuth");
jest.mock("../api/axios", () => ({
  post: jest.fn(),
}));

describe("Layout Component", () => {
  const renderLayout = () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <Layout />
        </MemoryRouter>
      </I18nextProvider>
    );
  }

  test("renders Layout component correctly", () => {
    useAuth.mockReturnValue({ auth: {} });
    renderLayout();
    expect(screen.getByText(i18n.t("home"))).toBeInTheDocument();
  });

  test("shows Login button when user is not authenticated", () => {
    useAuth.mockReturnValue({ auth: {} });
    renderLayout();

    expect(screen.getByText(i18n.t("login"))).toBeInTheDocument();
  });

  test("shows Sign up button when user is not authenticated", () => {
    useAuth.mockReturnValue({ auth: {} });
    renderLayout();

    expect(screen.getByText(i18n.t("signUp"))).toBeInTheDocument();
  });

  test("shows Log Out button when user is authenticated", () => {
    useAuth.mockReturnValue({ auth: { username: "testuser" } });
    renderLayout();

    expect(screen.getByText(i18n.t("logout"))).toBeInTheDocument();
  });

  test("calls logout API when Log Out button is clicked", async () => {
    const setAuthMock = jest.fn();
    useAuth.mockReturnValue({ auth: { username: "testuser" }, setAuth: setAuthMock });
    axios.post.mockResolvedValue({});
    renderLayout();

    const logoutButton = screen.getByText(i18n.t("logout"));
    await userEvent.click(logoutButton);

    expect(axios.post).toHaveBeenCalledWith("/logout", {}, { withCredentials: true });
    expect(setAuthMock).toHaveBeenCalledWith({});
  });

  test("logs an error to the console when the logout API fails", async () => {
    const setAuthMock = jest.fn();
    const errorMock = new Error("Logout failed");
    useAuth.mockReturnValue({ auth: { username: "testuser" }, setAuth: setAuthMock });
    axios.post.mockRejectedValue(errorMock);

    const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {});

    renderLayout();

    const logoutButton = screen.getByText(i18n.t("logout"));
    await userEvent.click(logoutButton);

    expect(consoleErrorMock).toHaveBeenCalledWith(errorMock);
    consoleErrorMock.mockRestore();
  });
});