import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import StatusBadge from '../StatusBadge'


test('renders Encrypted badge with correct classes', () => {
  render(<StatusBadge status="Encrypted" />)

  const el = screen.getByText('Encrypted')
  expect(el).toBeInTheDocument()
  expect(el).toHaveClass('badge')
  expect(el).toHaveClass('encrypted')
})
