import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContactListCards from '@/components/project/ContactListCards';

describe('ContactListCards', () => {
  const fullProps = {
    contactListData: {
      groups: [
        {
          group_name: 'Projektledning',
          contacts: [
            { role: 'Projektchef', name: 'Karin Lindberg', company: 'Bygg AB', mobile: '070-123 4567', email: 'karin@bygg.se' },
            { role: 'Platschef', name: 'Mats Eriksson', company: 'Bygg AB', mobile: '070-765 4321' },
          ],
        },
        {
          group_name: 'Konsulter',
          contacts: [
            { role: 'KMA-ansvarig', name: 'Sofia Gustavsson', company: 'Konsultbolaget', mobile: '073-999 8888', email: 'sofiakonsult.se' },
          ],
        },
      ],
    },
    searchTerm: '',
  };

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ContactListCards {...fullProps} />);
      expect(screen.getByText('Projektledning')).toBeTruthy();
    });

    it('displays group names', () => {
      render(<ContactListCards {...fullProps} />);
      expect(screen.getByText('Projektledning')).toBeTruthy();
      expect(screen.getByText('Konsulter')).toBeTruthy();
    });

    it('displays contact names', () => {
      render(<ContactListCards {...fullProps} />);
      expect(screen.getByText('Karin Lindberg')).toBeTruthy();
      expect(screen.getByText('Mats Eriksson')).toBeTruthy();
      expect(screen.getByText('Sofia Gustavsson')).toBeTruthy();
    });

    it('displays roles', () => {
      render(<ContactListCards {...fullProps} />);
      expect(screen.getByText('Projektchef')).toBeTruthy();
      expect(screen.getByText('Platschef')).toBeTruthy();
      expect(screen.getByText('KMA-ansvarig')).toBeTruthy();
    });

    it('displays companies', () => {
      render(<ContactListCards {...fullProps} />);
      expect(screen.getByText('Bygg AB')).toBeTruthy();
      expect(screen.getByText('Konsultbolaget')).toBeTruthy();
    });

    it('displays phone numbers', () => {
      render(<ContactListCards {...fullProps} />);
      expect(screen.getByText('070-123 4567')).toBeTruthy();
      expect(screen.getByText('070-765 4321')).toBeTruthy();
    });

    it('displays email addresses', () => {
      render(<ContactListCards {...fullProps} />);
      expect(screen.getByText('karin@bygg.se')).toBeTruthy();
    });
  });

  describe('Search filtering', () => {
    it('filters contacts by name', () => {
      render(<ContactListCards {...fullProps} searchTerm="Karin" />);
      expect(screen.getByText('Karin Lindberg')).toBeTruthy();
    });

    it('hides non-matching contacts when searching', () => {
      render(<ContactListCards {...fullProps} searchTerm="Karin" />);
      expect(screen.queryByText('Mats Eriksson')).toBeNull();
    });

    it('filters by role', () => {
      render(<ContactListCards {...fullProps} searchTerm="Projektchef" />);
      expect(screen.getByText('Karin Lindberg')).toBeTruthy();
    });

    it('filters by company', () => {
      render(<ContactListCards {...fullProps} searchTerm="Bygg AB" />);
      expect(screen.getByText('Karin Lindberg')).toBeTruthy();
      expect(screen.getByText('Mats Eriksson')).toBeTruthy();
    });

    it('filters by mobile number', () => {
      render(<ContactListCards {...fullProps} searchTerm="070-123" />);
      expect(screen.getByText('Karin Lindberg')).toBeTruthy();
    });

    it('shows empty message when no matches', () => {
      render(<ContactListCards {...fullProps} searchTerm="Nonexistent Person" />);
      expect(screen.getByText('Inga kontakter matchar sökningen.')).toBeTruthy();
    });

    it('shows all contacts when search term is empty', () => {
      render(<ContactListCards {...fullProps} searchTerm="" />);
      expect(screen.getByText('Karin Lindberg')).toBeTruthy();
      expect(screen.getByText('Mats Eriksson')).toBeTruthy();
      expect(screen.getByText('Sofia Gustavsson')).toBeTruthy();
    });
  });

  describe('Empty data handling', () => {
    it('handles empty groups array', () => {
      render(<ContactListCards contactListData={{ groups: [] }} searchTerm="" />);
      expect(screen.getByText('Inga kontakter matchar sökningen.')).toBeTruthy();
    });

    it('handles empty contact arrays within groups', () => {
      render(
        <ContactListCards
          contactListData={{
            groups: [{ group_name: 'Empty Group', contacts: [] }],
          }}
          searchTerm=""
        />
      );
      expect(screen.getByText('Inga kontakter matchar sökningen.')).toBeTruthy();
    });

    it('handles missing optional contact fields', () => {
      render(
        <ContactListCards
          contactListData={{
            groups: [
              { group_name: 'Minimal', contacts: [{ name: 'Only Name' }] },
            ],
          }}
          searchTerm=""
        />
      );
      expect(screen.getByText('Only Name')).toBeTruthy();
    });
  });

  describe('Phone/email link formatting', () => {
    it('renders phone links correctly', () => {
      render(<ContactListCards {...fullProps} />);
      const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
      expect(phoneLinks.length).toBeGreaterThan(0);
    });

    it('renders email links correctly', () => {
      render(<ContactListCards {...fullProps} />);
      const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
      expect(emailLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Group structure', () => {
    it('renders multiple groups', () => {
      render(<ContactListCards {...fullProps} />);
      const groupHeaders = document.querySelectorAll('h3');
      expect(groupHeaders.length).toBe(2);
    });

    it('preserves group filtering independently', () => {
      render(<ContactListCards {...fullProps} searchTerm="Konsultbolaget" />);
      expect(screen.getByText('Sofia Gustavsson')).toBeTruthy();
      expect(screen.queryByText('Karin Lindberg')).toBeNull();
    });
  });
});
