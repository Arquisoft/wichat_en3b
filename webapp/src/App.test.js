import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from './App';
import { I18nextProvider } from "react-i18next";
import i18n from "./utils/i18n";

test('renders welcome message', () => {
  render(
    <I18nextProvider i18n={i18n}>
    <MemoryRouter>
      <App />
    </MemoryRouter>
    </I18nextProvider>
  );
  const welcomeMessage = screen.getByText(i18n.t("welcomeMsg"));
  expect(welcomeMessage).toBeInTheDocument();
});
