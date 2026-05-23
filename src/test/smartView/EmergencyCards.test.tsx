import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmergencyCards from '@/components/project/EmergencyCards';

describe('EmergencyCards', () => {
  const fullProps = {
    emergencyData: {
      emergency_number: '112',
      checklist: [
        'Vad har hänt?',
        'Var har det hänt?',
        'Hur många är skadade?',
        'Vem ringer du från?',
      ],
      workplace_address: 'Byggarbetsplats 123',
      responsible_person: {
        role: 'BAS-U',
        name: 'Anna Ansvarig',
        phone: '070-123 4567',
      },
      additional_contacts: [
        { role: 'Brandkår', name: 'Brand Station', phone: '112' },
        { role: 'Polis', name: 'Police', phone: '114 14' },
      ],
    },
    searchTerm: '',
  };

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<EmergencyCards {...fullProps} />);
      expect(screen.getByText('112')).toBeTruthy();
    });

    it('displays emergency number prominently', () => {
      render(<EmergencyCards {...fullProps} />);
      expect(screen.getByText('Vid nödsituation')).toBeTruthy();
      expect(screen.getByText('112')).toBeTruthy();
    });

    it('displays checklist items with numbers', () => {
      render(<EmergencyCards {...fullProps} />);
      expect(screen.getByText('Vad har det hänt?')).toBeTruthy();
      expect(screen.getByText(/^1$/)).toBeTruthy();
    });

    it('displays workplace address', () => {
      render(<EmergencyCards {...fullProps} />);
      expect(screen.getByText('Byggarbetsplats 123')).toBeTruthy();
    });

    it('displays responsible person with role', () => {
      render(<EmergencyCards {...fullProps} />);
      expect(screen.getByText('BAS-U')).toBeTruthy();
      expect(screen.getByText('Anna Ansvarig')).toBeTruthy();
    });

    it('displays additional contacts', () => {
      render(<EmergencyCards {...fullProps} />);
      expect(screen.getByText('Brandkår')).toBeTruthy();
      expect(screen.getByText('Polis')).toBeTruthy();
    });
  });

  describe('Search filtering', () => {
    it('filters checklist by search term', () => {
      render(<EmergencyCards {...fullProps} searchTerm="skadade" />);
      expect(screen.getByText('Hur många är skadade?')).toBeTruthy();
    });

    it('hides non-matching checklist items when searching', () => {
      render(<EmergencyCards {...fullProps} searchTerm="skadade" />);
      expect(screen.queryByText('Vad har det hänt?')).toBeNull();
    });

    it('shows all items when search term is empty', () => {
      render(<EmergencyCards {...fullProps} searchTerm="" />);
      expect(screen.getByText('Vad har det hänt?')).toBeTruthy();
      expect(screen.getByText('Hur många är skadade?')).toBeTruthy();
    });
  });

  describe('Empty data handling', () => {
    it('handles empty emergencyData gracefully', () => {
      render(<EmergencyCards emergencyData={{}} searchTerm="" />);
      expect(screen.queryByText('Vid nödsituation')).toBeNull();
    });

    it('handles missing checklist', () => {
      render(
        <EmergencyCards
          emergencyData={{ emergency_number: '112' }}
          searchTerm=""
        />
      );
      expect(screen.getByText('112')).toBeTruthy();
    });

    it('handles empty checklist array', () => {
      render(
        <EmergencyCards
          emergencyData={{ checklist: [], searchTerm: '' }}
          searchTerm=""
        />
      );
      expect(screen.queryByText(/ange/i)).toBeNull();
    });

    it('handles missing responsible person', () => {
      render(
        <EmergencyCards
          emergencyData={{ checklist: ['Item 1'] }}
          searchTerm=""
        />
      );
      expect(screen.queryByText('BAS-U')).toBeNull();
    });

    it('handles missing additional contacts', () => {
      render(
        <EmergencyCards
          emergencyData={{ emergency_number: '112' }}
          searchTerm=""
        />
      );
      expect(screen.queryByText('Övriga kontakter')).toBeNull();
    });
  });

  describe('Phone link formatting', () => {
    it('renders phone links for emergency number', () => {
      render(<EmergencyCards {...fullProps} />);
      const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
      expect(phoneLinks.length).toBeGreaterThan(0);
    });

    it('formats responsible person phone correctly', () => {
      render(<EmergencyCards {...fullProps} />);
      const phoneLink = document.querySelector('a[href^="tel:"]');
      expect(phoneLink).toBeTruthy();
    });
  });

  describe('Structure', () => {
    it('renders checklist with proper numbering', () => {
      render(<EmergencyCards {...fullProps} />);
      const numbers = screen.getAllByText(/^[1-4]$/);
      expect(numbers.length).toBe(4);
    });

    it('renders section headers', () => {
      render(<EmergencyCards {...fullProps} />);
      expect(screen.getByText('När du ringer – ange')).toBeTruthy();
      expect(screen.getByText('Arbetsplatsens adress')).toBeTruthy();
    });
  });
});
