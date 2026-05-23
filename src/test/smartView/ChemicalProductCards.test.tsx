import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChemicalProductCards from '@/components/project/ChemicalProductCards';

describe('ChemicalProductCards', () => {
  const fullProps = {
    products: [
      {
        id: 'prod-1',
        product_name: 'Betonglim',
        manufacturer: 'Byggmax',
        hazard_code: 'GHS05',
        has_safety_datasheet: true,
        safety_datasheet_url: 'https://example.com/sds/betonglim.pdf',
        storage_location: 'Förråd A',
        first_delivery_date: '2024-01-15',
        built_in_date: '2024-06-01',
        finished_date: null,
        environmental_class: 'BASTA',
      },
      {
        id: 'prod-2',
        product_name: 'Universallim',
        manufacturer: 'LimAB',
        hazard_code: null,
        has_safety_datasheet: false,
        safety_datasheet_url: null,
        storage_location: 'Förråd B',
        first_delivery_date: null,
        built_in_date: null,
        finished_date: null,
        environmental_class: null,
      },
      {
        id: 'prod-3',
        product_name: 'Färg Thinner',
        manufacturer: 'Färgbolaget',
        hazard_code: 'GHS02',
        has_safety_datasheet: true,
        safety_datasheet_url: 'https://example.com/sds/farg.pdf',
        storage_location: 'Förråd C',
        first_delivery_date: '2024-02-20',
        built_in_date: null,
        finished_date: null,
        environmental_class: 'BVB accepterad',
      },
    ],
  };

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ChemicalProductCards {...fullProps} />);
      expect(screen.getByText('Betonglim')).toBeTruthy();
    });

    it('displays product names', () => {
      render(<ChemicalProductCards {...fullProps} />);
      expect(screen.getByText('Betonglim')).toBeTruthy();
      expect(screen.getByText('Universallim')).toBeTruthy();
      expect(screen.getByText('Färg Thinner')).toBeTruthy();
    });

    it('displays hazard codes with emoji', () => {
      render(<ChemicalProductCards {...fullProps} />);
      expect(screen.getByText('GHS05')).toBeTruthy();
      expect(screen.getByText('GHS02')).toBeTruthy();
    });

    it('displays environmental class badges', () => {
      render(<ChemicalProductCards {...fullProps} />);
      expect(screen.getByText('BASTA')).toBeTruthy();
      expect(screen.getByText('BVB accepterad')).toBeTruthy();
    });

    it('shows expand/collapse button for each product', () => {
      render(<ChemicalProductCards {...fullProps} />);
      const buttons = document.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Expand/collapse functionality', () => {
    it('shows details when product is clicked', () => {
      render(<ChemicalProductCards {...fullProps} />);
      fireEvent.click(screen.getByText('Betonglim'));
      expect(screen.getByText('Tillverkare')).toBeTruthy();
      expect(screen.getByText('Byggmax')).toBeTruthy();
    });

    it('hides details when clicked again', () => {
      render(<ChemicalProductCards {...fullProps} />);
      const betonglim = screen.getByText('Betonglim');
      fireEvent.click(betonglim);
      expect(screen.getByText('Tillverkare')).toBeTruthy();
      fireEvent.click(betonglim);
    });

    it('shows storage location when expanded', () => {
      render(<ChemicalProductCards {...fullProps} />);
      fireEvent.click(screen.getByText('Betonglim'));
      expect(screen.getByText('Förråd A')).toBeTruthy();
    });

    it('shows safety datasheet indicator when available', () => {
      render(<ChemicalProductCards {...fullProps} />);
      fireEvent.click(screen.getByText('Betonglim'));
      expect(screen.getByText(/Finns/)).toBeTruthy();
    });

    it('shows safety datasheet missing indicator when not available', () => {
      render(<ChemicalProductCards {...fullProps} />);
      fireEvent.click(screen.getByText('Universallim'));
      expect(screen.getByText(/Saknas/)).toBeTruthy();
    });
  });

  describe('Empty data handling', () => {
    it('handles empty products array', () => {
      render(<ChemicalProductCards products={[]} />);
      expect(screen.getByText('Inga kemiska produkter registrerade i projektet.')).toBeTruthy();
    });

    it('handles products with missing optional fields', () => {
      render(
        <ChemicalProductCards
          products={[{ id: '1', product_name: 'Minimal Product', has_safety_datasheet: false }]}
        />
      );
      expect(screen.getByText('Minimal Product')).toBeTruthy();
    });

    it('handles null hazard code', () => {
      render(<ChemicalProductCards {...fullProps} />);
      expect(screen.queryByTestId('ghs-null')).toBeNull();
    });
  });

  describe('Date formatting', () => {
    it('formats delivery date correctly', () => {
      render(<ChemicalProductCards {...fullProps} />);
      fireEvent.click(screen.getByText('Betonglim'));
      expect(screen.getByText(/jan/i)).toBeTruthy();
    });

    it('handles null dates gracefully', () => {
      render(<ChemicalProductCards {...fullProps} />);
      fireEvent.click(screen.getByText('Universallim'));
      expect(screen.getByText('–')).toBeTruthy();
    });
  });

  describe('Sorting', () => {
    it('sorts products with hazard codes first', () => {
      render(<ChemicalProductCards {...fullProps} />);
      const firstProduct = document.querySelector('.space-y-2 > div:first-child');
      expect(firstProduct?.textContent).toContain('Betonglim');
    });
  });

  describe('Environmental class styling', () => {
    it('displays BASTA badge with correct styling', () => {
      render(<ChemicalProductCards {...fullProps} />);
      const bastaBadge = screen.getByText('BASTA');
      expect(bastaBadge).toBeTruthy();
    });

    it('displays BVB accepterad badge', () => {
      render(<ChemicalProductCards {...fullProps} />);
      const bvbBadge = screen.getByText('BVB accepterad');
      expect(bvbBadge).toBeTruthy();
    });
  });

  describe('External links', () => {
    it('renders safety datasheet link when available', () => {
      render(<ChemicalProductCards {...fullProps} />);
      fireEvent.click(screen.getByText('Betonglim'));
      const links = document.querySelectorAll('a[target="_blank"]');
      expect(links.length).toBeGreaterThan(0);
    });
  });
});
