import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders the friendly label for every status', () => {
    const { rerender } = render(<StatusBadge status="APPLIED" />);
    expect(screen.getByText('Applied')).toBeInTheDocument();

    rerender(<StatusBadge status="SHORTLISTED" />);
    expect(screen.getByText('Shortlisted')).toBeInTheDocument();

    rerender(<StatusBadge status="SELECTED" />);
    expect(screen.getByText('Selected')).toBeInTheDocument();

    rerender(<StatusBadge status="REJECTED" />);
    expect(screen.getByText('Rejected')).toBeInTheDocument();

    rerender(<StatusBadge status="OPEN" />);
    expect(screen.getByText('Open')).toBeInTheDocument();

    rerender(<StatusBadge status="CLOSED" />);
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });
});
