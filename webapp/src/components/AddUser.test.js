import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import axios from '../api/axios';
import MockAdapter from 'axios-mock-adapter';
import AddUser from './AddUser';
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";

const mockAxios = new MockAdapter(axios);

describe('AddUser component', () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  it('should add user successfully', async () => {
    render(
      <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <AddUser />
      </MemoryRouter>
      </I18nextProvider>
    );

    const usernameInput = screen.getByLabelText(i18n.t("username"));
    const passwordInput = screen.getByLabelText(i18n.t("password"));
    const addUserButton = screen.getByRole('button', { name: i18n.t("signUp") });

    mockAxios.onPost("/adduser").reply(200);

    fireEvent.change(usernameInput, { target: { value: 'TestUser1' } });
    fireEvent.change(passwordInput, { target: { value: 'TestPassword1!' } });

    fireEvent.click(addUserButton);

    await waitFor(() => {
      expect(screen.getByText(/User added successfully/i)).toBeInTheDocument();
    });
  });

  it('should handle error when adding user', async () => {
    render(
      <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <AddUser />
      </MemoryRouter>
      </I18nextProvider>
    );

    const usernameInput = screen.getByLabelText(i18n.t("username"));
    const passwordInput = screen.getByLabelText(i18n.t("password"));
    const addUserButton = screen.getByRole('button', { name: i18n.t("signUp") });

    mockAxios.onPost("/adduser").reply(500, { error: 'Internal Server Error' });

    fireEvent.change(usernameInput, { target: { value: 'TestUser1' } });
    fireEvent.change(passwordInput, { target: { value: 'TestPassword1!' } });

    fireEvent.click(addUserButton);

    await waitFor(() => {
      expect(
        screen.getByText((content, node) => content.includes('Internal Server Error'))
      ).toBeInTheDocument();
    });
  });
});
