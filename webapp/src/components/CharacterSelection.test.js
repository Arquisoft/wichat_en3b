import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CharacterSelection from './CharacterSelection';

describe('CharacterSelection Component', () => {
  it('renders all characters with correct information', () => {
    render(<CharacterSelection onSelectCharacter={jest.fn()} />);

    // Check if all character names are rendered
    expect(screen.getByText('Alex')).toBeInTheDocument();
    expect(screen.getByText('Casey')).toBeInTheDocument();
    expect(screen.getByText('Taylor')).toBeInTheDocument();
    expect(screen.getByText('Dave')).toBeInTheDocument();

    // Check the confidence and price info for each character
    expect(screen.getByText('Confidence: 80%')).toBeInTheDocument();
    expect(screen.getByText('Price: 1000🪙')).toBeInTheDocument();

    expect(screen.getByText('Confidence: 60%')).toBeInTheDocument();
    expect(screen.getByText('Price: 750🪙')).toBeInTheDocument();

    expect(screen.getByText('Confidence: 40%')).toBeInTheDocument();
    expect(screen.getByText('Price: 500🪙')).toBeInTheDocument();

    expect(screen.getByText('Confidence: 20%')).toBeInTheDocument();
    expect(screen.getByText('Price: 350🪙')).toBeInTheDocument();
  });

  it('calls onSelectCharacter with the correct character when a button is clicked', () => {
    const mockSelectCharacter = jest.fn();
    render(<CharacterSelection onSelectCharacter={mockSelectCharacter} />);

    // Click on the 'Select' button for "Alex"
    fireEvent.click(screen.getByText('Select', { selector: 'button' }));

    // Ensure that onSelectCharacter was called with the correct character
    expect(mockSelectCharacter).toHaveBeenCalledWith({
      name: 'Alex',
      confidence: 0.8,
      price: 1000,
      color: '#4caf50', // green[400] hex value
    });

    // Optionally, you can test for other characters as well
    fireEvent.click(screen.getByText('Select', { selector: 'button' }));

    expect(mockSelectCharacter).toHaveBeenCalledWith({
      name: 'Casey',
      confidence: 0.6,
      price: 750,
      color: '#2196f3', // blue[400] hex value
    });
  });
});
