import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsDialog from './SettingsDialog';
import useTheme from '../hooks/useTheme';
import { I18nextProvider } from "react-i18next";
import i18n from "../utils/i18n";

// Mock the useTheme hook
jest.mock('../hooks/useTheme', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock LanguageSelect component
jest.mock('./LanguageSelect', () => () => <div data-testid="language-select">Language Select</div>);

describe('SettingsDialog', () => {
  const mockSelectTheme = jest.fn();

  beforeEach(() => {
    useTheme.mockReturnValue({
      theme: { name: 'light' },
      themes: {
        light: { palette: { primary: { main: "#fff", contrastText: "#000" }, gradient: { main: { right: "#fff" } } } },
        dark: { palette: { primary: { main: "#000", contrastText: "#000" }, gradient: { main: { right: "#000" } } } }
      },
      selectTheme: mockSelectTheme,
    });
  });

  const setup = (props = {}) => {
    const onClose = jest.fn();
    render(
      <I18nextProvider i18n={i18n}>
        <SettingsDialog open={true} onClose={onClose} {...props} />
      </I18nextProvider>
      );
    return { onClose };
  };

  const openAdvancedSettings = async () => {
    const advancedSettingsButton = screen.getByTestId("advancedSettings");
    fireEvent.click(advancedSettingsButton);
    await screen.getByTestId("llmModel");
  };

  test('renders the dialog with title and all sections', () => {
    setup();

    expect(screen.getByTestId("settings")).toBeInTheDocument();
    expect(screen.getByTestId('language-select')).toBeInTheDocument();
    expect(screen.getByTestId("theme")).toBeInTheDocument();
    expect(screen.getByTestId("advancedSettings")).toBeInTheDocument();
    expect(screen.getByTestId("llmModel")).toBeInTheDocument();
  });

  test('closes dialog when cancel button is clicked', () => {
    const { onClose } = setup();
    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);
    expect(onClose).toHaveBeenCalled();
  });

  test('calls onClose when save is clicked', () => {
    const { onClose } = setup();
    const saveButton = screen.getByText(/Save/i);
    fireEvent.click(saveButton);
    expect(onClose).toHaveBeenCalled();
  });

  test('allows selecting a theme', () => {
    setup();

    const themeButton = screen.getByRole('button', { name: /select dark theme/i });
    fireEvent.click(themeButton);

    expect(mockSelectTheme).toHaveBeenCalledWith('dark');
  });

  test('allows selecting a LLM model', async () => {
    setup();

    await openAdvancedSettings();

    const modelSelect = screen.getByRole('combobox');
    expect(modelSelect).toHaveTextContent(/mistral/i);
    fireEvent.mouseDown(modelSelect);

    const model2Option = screen.getByRole('option', { name: /qwen/i });
    fireEvent.click(model2Option);

    expect(modelSelect).toHaveTextContent(/qwen/i);
  });

  test('calls onClose when close icon is clicked', () => {
    const { onClose } = setup();
    const closeIcon = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeIcon);
    expect(onClose).toHaveBeenCalled();
  });
});
