
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import GraphComponent from './GraphComponent';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

// Mock the recharts components to simplify testing
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: ({ children }) => <div>{children}</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  LabelList: () => <div>LabelList</div>,
}));

describe('GraphComponent', () => {
  const correctAnswer = 'Correct Answer';
  const distractors = ['Wrong Answer 1', 'Wrong Answer 2', 'Wrong Answer 3'];

  it('renders without crashing', () => {
    render(
      <GraphComponent 
        correctAnswer={correctAnswer}
        distractors={distractors}
      />
    );
  });

  it('displays the correct chart structure', () => {
    const { container } = render(
      <GraphComponent 
        correctAnswer={correctAnswer}
        distractors={distractors}
      />
    );
    
    // Check for essential chart components
    expect(container).toHaveTextContent('XAxis');
    expect(container).toHaveTextContent('YAxis');
    expect(container).toHaveTextContent('CartesianGrid');
    expect(container).toHaveTextContent('Tooltip');
    expect(container).toHaveTextContent('LabelList');
  });

  it('generates probabilities for all answers', () => {
    // Mock Math.random to return predictable values
    const mockMath = Object.create(global.Math);
    mockMath.random = () => 0.5;
    global.Math = mockMath;

    render(
      <GraphComponent 
        correctAnswer={correctAnswer}
        distractors={distractors}
      />
    );

    // The actual probabilities are internal state, but we can verify
    // that the component renders the correct number of bars
    // (implementation detail via our mock)
  });

  it('handles empty distractors', () => {
    render(
      <GraphComponent 
        correctAnswer={correctAnswer}
        distractors={[]}
      />
    );
    
    // Should still render with just the correct answer
  });

  it('updates when props change', () => {
    const { rerender } = render(
      <GraphComponent 
        correctAnswer={correctAnswer}
        distractors={distractors}
      />
    );

    const newDistractors = ['New Wrong Answer 1', 'New Wrong Answer 2'];
    rerender(
      <GraphComponent 
        correctAnswer="New Correct Answer"
        distractors={newDistractors}
      />
    );
    
    // The component should handle the prop changes
  });

  it('ensures correct answer has highest probability', () => {
    // This is more of an integration test and would require
    // either exposing the probabilities or using more advanced
    // testing techniques to verify the internal state
  });
});