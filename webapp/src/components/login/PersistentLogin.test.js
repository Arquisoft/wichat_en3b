import { render, screen, waitFor } from "@testing-library/react";
import PersistentLogin from "./PersistentLogin";
import useAuth from "../../hooks/useAuth";
import useRefreshToken from "../../hooks/useRefreshToken";
import { Outlet } from "react-router";
import { Typography } from "@mui/material";

jest.mock("../../hooks/useAuth");
jest.mock("../../hooks/useRefreshToken");
jest.mock("react-router", () => ({
    Outlet: () => <div>Protected Content</div>,
}));
  

describe("PersistentLogin", () => {
    beforeAll(() => {
        jest.spyOn(console, "error").mockImplementation(() => {});
      });
      
    afterAll(() => {
      console.error.mockRestore();
    });

      
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders Outlet immediately when persist is false", () => {
    useAuth.mockReturnValue({ auth: {}, persist: false });
    
    render(<PersistentLogin />);
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  test("displays loading text when persist is true and loading", async () => {
    useAuth.mockReturnValue({ auth: {}, persist: true });
    useRefreshToken.mockReturnValue(jest.fn(() => new Promise(() => {})));
    
    render(<PersistentLogin />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("renders Outlet after token refresh when persist is true", async () => {
    useAuth.mockReturnValue({ auth: {}, persist: true });
    useRefreshToken.mockReturnValue(jest.fn(() => Promise.resolve()));
    
    render(<PersistentLogin />);
    
    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
  });
});
