import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Skeleton from './Skeleton';

describe('Skeleton Component', () => {
  it('renders a skeleton with default props', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass('skeleton');
    expect(container.firstChild).toHaveStyle({ width: '100%', height: '1rem', borderRadius: '0.5rem' });
  });

  it('renders a skeleton with custom props', () => {
    const { container } = render(<Skeleton width="50px" height="50px" borderRadius="50%" className="custom-class" />);
    expect(container.firstChild).toHaveClass('skeleton custom-class');
    expect(container.firstChild).toHaveStyle({ width: '50px', height: '50px', borderRadius: '50%' });
  });
});
