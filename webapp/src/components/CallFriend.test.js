import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CallFriend from './CallFriend';
import CharacterSelection from './CharacterSelection';

// Mock Math.random to control random values in the test
beforeAll(() => {
  jest.spyOn(global.Math, 'random').mockImplementation(() => 0.9); // Mock random to always return 0.9 (greater than 0.8)
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('CallFriend Component', () => {
  const mockClose = jest.fn();

  it('returns a correct answer when confidence is greater than 0.5', async () => {
    const character = { name: 'Friend 1', confidence: 0.6 }; // Confidence > 0.5
    const possibleAnswers = ['Answer 1', 'Answer 2', 'Answer 3'];
    const correctAnswer = 'Answer 1';

    render(
      <CallFriend
        open={true}
        onClose={mockClose}
        correctAnswer={correctAnswer}
        possibleAnswers={possibleAnswers}
      />
    );

    // Select character
    fireEvent.click(screen.getByText('Friend 1')); // Simulating character selection

    await waitFor(() => {
      // Ensure the confidence message is displayed
      expect(screen.getByText(/has a confidence level of 60%/)).toBeInTheDocument();
      // Check that the friend answer is correct since confidence is high
      expect(screen.getByText('Answer 1')).toBeInTheDocument();
    });
  });

  it('returns a wrong answer when confidence is less than 0.5', async () => {
    // Mock random to return a value lower than 0.3 for testing low confidence
    jest.spyOn(global.Math, 'random').mockImplementation(() => 0.1); // Mock random to always return 0.1 (less than 0.3)

    const character = { name: 'Friend 2', confidence: 0.4 }; // Confidence < 0.5
    const possibleAnswers = ['Answer 1', 'Answer 2', 'Answer 3'];
    const correctAnswer = 'Answer 1';

    render(
      <CallFriend
        open={true}
        onClose={mockClose}
        correctAnswer={correctAnswer}
        possibleAnswers={possibleAnswers}
      />
    );

    // Select character
    fireEvent.click(screen.getByText('Friend 2')); // Simulating character selection

    await waitFor(() => {
      // Ensure the confidence message is displayed
      expect(screen.getByText(/has a confidence level of 40%/)).toBeInTheDocument();
      // Check that the friend answer is not correct since confidence is low
      expect(screen.getByText('Answer 3')).toBeInTheDocument(); // Answer 3 is a wrong answer
    });
  });
});
