import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock dependencies before importing the component
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    i18n: { language: 'en' },
  }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
    <a href={to}>{children}</a>,
}));

vi.mock('../lib/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: { data: [] } }), post: vi.fn() },
}));

vi.mock('../hooks/useRegion', () => ({
  useRegion: () => ({ selectedRegion: null }),
}));

vi.mock('../hooks/usePrices', () => ({
  useSubmitPrice: () => ({ submitPrice: vi.fn(), isSubmitting: false, error: null }),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'test-user' } }),
}));

vi.mock('../lib/storage', () => ({
  uploadPriceImage: vi.fn(),
}));

vi.mock('../lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

vi.mock('../components/VoiceSubmitFlow', () => ({
  default: () => <div>VoiceSubmitFlow</div>,
}));

vi.mock('../components/InlineAddProduct', () => ({
  default: () => <div>InlineAddProduct</div>,
}));

vi.mock('../components/InlineAddStore', () => ({
  default: () => <div>InlineAddStore</div>,
}));

import Submit from '../pages/Submit';

describe('Submit page', () => {
  it('should render step 0 with search input', () => {
    render(<Submit />);
    expect(screen.getByPlaceholderText('submit_page.search_product')).toBeTruthy();
  });

  it('should render the page title', () => {
    render(<Submit />);
    expect(screen.getByText('submit_page.title')).toBeTruthy();
  });

  it('should render barcode scan button on step 0', () => {
    render(<Submit />);
    // The barcode button has a ScanBarcode icon and a title attribute
    const barcodeButton = screen.getByTitle('Scan Barcode');
    expect(barcodeButton).toBeTruthy();
  });
});
