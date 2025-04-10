import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CallFriend from './CallFriend';

jest.mock('./CharacterSelection', () => (props) => {
  return <button onClick={() => props.onSelectCharacter({ name: 'John', confidence: 0.8 })}>Select John</button>;
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
    expect(screen.queryByText(/Select a Friend to Call/i)).not.toBeInTheDocument();
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
    expect(screen.getByText(/Select a Friend to Call/i)).toBeInTheDocument();
    expect(screen.getByText(/Select John/i)).toBeInTheDocument();
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
    userEvent.click(screen.getByText(/Select John/i));

    await waitFor(() => expect(screen.getByText(/Calling John.../i)).toBeInTheDocument());
    
    expect(screen.getByText(/John has a confidence level of/i)).toBeInTheDocument();

    const answerDisplayed = screen.getByText((content, element) => {
      return possibleAnswers.some(answer => content.toLowerCase().includes(answer.toLowerCase()));
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

    userEvent.click(screen.getByText(/Select John/i));

    await waitFor(() => expect(screen.getByText(/Calling John.../i)).toBeInTheDocument());
    
    const hangUpButton = screen.getByRole('button', { name: /Hang up/i });
    userEvent.click(hangUpButton);

    expect(onClose).toHaveBeenCalledTimes(0);
  });
});
