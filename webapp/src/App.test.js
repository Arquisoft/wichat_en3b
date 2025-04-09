import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import App from "./App";

// Global mock for Material UI icons using a Proxy to return a simple component
jest.mock("@mui/icons-material", () => {
  return new Proxy({}, {
    get: (_, prop) => () => <div>{prop}</div>
  });
});

test("renders welcome message", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  const welcomeMessage = screen.getByText(/Welcome to the 2025 edition of the Software Architecture course/i);
  expect(welcomeMessage).toBeInTheDocument();
});
