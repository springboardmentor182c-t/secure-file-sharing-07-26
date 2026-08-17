import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FormInput from '../components/Form/FormInput';

describe('FormInput Component Unit Tests', () => {
  // Test Case 1: Renders input label, placeholder, and triggers onChange callback when typed into
  test('renders label, placeholder and handles user input events', () => {
    const handleChange = jest.fn();
    render(
      <FormInput
        id="username"
        label="Username"
        placeholder="Enter your username"
        value=""
        onChange={handleChange}
      />
    );

    const labelElement = screen.getByText('Username');
    expect(labelElement).toBeTruthy();

    const inputElement = screen.getByPlaceholderText('Enter your username');
    expect(inputElement).toBeTruthy();

    fireEvent.change(inputElement, { target: { value: 'john_doe' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  // Test Case 2: Renders error message and error formatting when error prop is set
  test('displays error message when error prop is provided', () => {
    render(
      <FormInput
        id="email"
        label="Email Address"
        value="invalid-email"
        onChange={() => {}}
        error="Invalid email address format"
      />
    );

    const errorElement = screen.getByText('Invalid email address format');
    expect(errorElement).toBeTruthy();
  });
});
