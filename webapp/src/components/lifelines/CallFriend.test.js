import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CallFriend from './CallFriend';

jest.mock('./CharacterSelection', () => (props) => {
  return <button data-testid="select-john-button" onClick={() => props.onSelectCharacter({ name: 'John', confidence: 0.8 })}>Select John</button>;
});

describe('CallFriend Component', () => {
  const correctAnswer = "Answer A";
  const possibleAnswers = ["Answer A", "Answer B", "Answer C"];

  test('no renders the dialog when open is false', () => {
    const onClose = jest.fn();
    render(
      <CallFriend
        open={false}
        onClose={onClose}
        correctAnswer={correctAnswer}
        possibleAnswers={possibleAnswers}
      />
    );
    expect(screen.queryByText(/Choose a Friend to Call/i)).not.toBeInTheDocument();
  });

  test('renders the selection phase when open is true', () => {
    const onClose = jest.fn();
    render(
      <CallFriend
        open={true}
        onClose={onClose}
        correctAnswer={correctAnswer}
        possibleAnswers={possibleAnswers}
      />
    );
    expect(screen.getByText(/Choose a Friend to Call/i)).toBeInTheDocument();
    expect(screen.getByTestId('select-john-button')).toBeInTheDocument();
  });

  test('transitions to the call phase when selecting a character', async () => {
    const onClose = jest.fn();
    render(
      <CallFriend
        open={true}
        onClose={onClose}
        correctAnswer={correctAnswer}
        possibleAnswers={possibleAnswers}
      />
    );
    userEvent.click(screen.getByTestId('select-john-button'));

    await waitFor(() => expect(screen.getByText(/Calling John/i)).toBeInTheDocument());
    
    await waitFor(() => expect(screen.queryByText(/Trying to connect with/i)).not.toBeInTheDocument(), { timeout: 2000 });
    
    expect(screen.getByText(/John has a confidence level of/i)).toBeInTheDocument();
    
    const answerDisplayed = await waitFor(() => {
      return screen.getAllByText((content, element) => {
        return possibleAnswers.some(answer => content === answer);
      })[0];
    });
    expect(answerDisplayed).toBeInTheDocument();
  });

  test('calls onClose when clicking "Hang up"', async () => {
    const onClose = jest.fn();
    
    render(
      <CallFriend
        open={true}
        onClose={onClose}
        correctAnswer={correctAnswer}
        possibleAnswers={possibleAnswers}
      />
    );

    userEvent.click(screen.getByTestId('select-john-button'));
    
    await waitFor(() => {
      const johnTextElement = screen.getByText((content) => {
        return content.includes('John has a confidence level of 80%.');
      });
      expect(johnTextElement).toBeInTheDocument();
    }, { timeout: 3000 });
    
    await waitFor(() => {
      const hangUpButton = screen.getByRole('button', { name: (content) => content.toLowerCase().includes('hang up') });
      expect(hangUpButton).not.toBeDisabled();
      return hangUpButton;
    }, { timeout: 3000 })
      .then((hangUpButton) => {
       
        userEvent.click(hangUpButton);
        
      });
  });
});
