import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import SearchBar from './SearchBar';


test('renders one search field without duplicate clear or upload controls', () => {
  const onChange = jest.fn();
  const { container } = render(<SearchBar value="report" onChange={onChange} />);

  fireEvent.change(screen.getByRole('textbox', { name: 'Search files' }), { target: { value: 'budget' } });

  expect(onChange).toHaveBeenCalledWith('budget');
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(container.querySelectorAll('svg')).toHaveLength(1);
});
