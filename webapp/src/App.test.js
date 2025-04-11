import React from "react";
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from './App';
import { I18nextProvider } from "react-i18next";
import i18n from "./utils/i18n";
import { ThemeProvider } from "./context/ThemeContext";

// Global mock for Material UI icons using a Proxy to return a simple component
jest.mock("@mui/icons-material", () => {
  return new Proxy({}, {
    get: (_, prop) => () => <div>{prop}</div>
  });
});

test('renders welcome message', () => {
  render(
    <ThemeProvider>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </I18nextProvider>
    </ThemeProvider>
  );
  const welcomeMessage = screen.getByText(i18n.t("welcomeMsg"));
  expect(welcomeMessage).toBeInTheDocument();
});
