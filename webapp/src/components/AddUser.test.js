import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import axios from '../utils/axios';
import MockAdapter from 'axios-mock-adapter';
import AddUser from './AddUser';
import { I18nextProvider } from "react-i18next";
import i18n from "../utils/i18n";
import { ThemeProvider } from "../context/ThemeContext";

const mockAxios = new MockAdapter(axios);
jest.mock("../hooks/useAuth", () => ({
  __esModule: true,
  default: () => ({
    auth: { username: null },
  }),
}));

describe('AddUser component', () => {
  const renderLayout = () => {
    render(
      <ThemeProvider>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <AddUser />
          </MemoryRouter>
        </I18nextProvider>
      </ThemeProvider>
    );
  };

  const getInputsAndButton = () => {
    const usernameInput = screen.getByLabelText(i18n.t("username"));
    const passwordInput = screen.getByLabelText(i18n.t("password"));
    const addUserButton = screen.getByRole('button', { name: i18n.t("signUp") });
    return { usernameInput, passwordInput, addUserButton };
  };

  beforeEach(() => {
    mockAxios.reset();
  });

  it('should add user successfully', async () => {
    renderLayout();

    const { usernameInput, passwordInput, addUserButton } = getInputsAndButton();

    mockAxios.onPost("/adduser").reply(200);

    fireEvent.change(usernameInput, { target: { value: 'TestUser1' } });
    fireEvent.change(passwordInput, { target: { value: 'TestPassword1!' } });

    fireEvent.click(addUserButton);

    await waitFor(() => {
      expect(screen.getByText(i18n.t("userAddedSuccess"))).toBeInTheDocument();
    });
  });
});