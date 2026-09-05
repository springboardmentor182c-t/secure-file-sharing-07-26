import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Pagination from '../Pagination'


test('renders pagination with five buttons and active class', () => {
  render(<Pagination />)

  const buttons = screen.getAllByRole('button')
  expect(buttons).toHaveLength(5)

  // active button is the second one in the markup
  expect(buttons[1]).toHaveClass('active')
})
