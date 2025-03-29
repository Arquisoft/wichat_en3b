import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import PrivateRoute from "./PrivateRoute";
import useAuth from "../hooks/useAuth";

jest.mock("../hooks/useAuth");

const MockProtectedComponent = () => <div>Protected Content</div>;

describe("PrivateRoute", () => {
  it("redirects to /login when the user is not authenticated", () => {
    useAuth.mockReturnValue({ auth: null });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/protected" element={<PrivateRoute />}>
            <Route index element={<MockProtectedComponent />} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders protected content when the user is authenticated", () => {
    useAuth.mockReturnValue({ auth: { username: "testUser" } });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/protected" element={<PrivateRoute />}>
            <Route index element={<MockProtectedComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
