import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SafetyOrgCards from '@/components/project/SafetyOrgCards';

describe('SafetyOrgCards', () => {
  const minimalProps = {
    safetyOrg: {
      larmnummer: '112',
      company: {
        name: 'Test Company',
        address: 'Test Address 123',
        phone: '08-123 456',
        email: 'test@company.se',
        website: 'https://company.se',
      },
      arbetsplats: {
        address: 'Construction Site Address',
      },
      byggherre: {
        name: 'Test Builder',
        address: 'Builder Address',
      },
      arbetsledning: [
        { role: 'BAS-P', name: 'John Smith', phone: '070-123 4567', email: 'john@company.se' },
        { role: 'BAS-U', name: 'Jane Doe', phone: '070-765 4321' },
      ],
      skyddsombud: [
        { role: 'Skyddsombud', name: 'Bob Wilson', phone: '070-111 2222' },
      ],
      ovriga_kontakter: [
        { role: 'Technical Support', name: 'Support Team', phone: '08-555 5555' },
      ],
      forsta_hjalpen: [
        { name: 'Alice Medic', company: 'MediCorp', phone: '070-333 4444' },
      ],
      myndigheter: [
        { label: 'Arbetsmiljöverket', phone: '010-730 90 00' },
        { label: 'MSB', phone: '0771-240 240' },
      ],
      guidance_text: 'Follow all safety guidelines.',
    },
    searchTerm: '',
  };

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<SafetyOrgCards {...minimalProps} />);
      expect(screen.getByTestId || screen.getByText('112')).toBeTruthy();
    });

    it('displays larmnummer (emergency number)', () => {
      render(<SafetyOrgCards {...minimalProps} />);
      expect(screen.getByText('112')).toBeTruthy();
      expect(screen.getByText('Larmnummer')).toBeTruthy();
    });

    it('displays company information', () => {
      render(<SafetyOrgCards {...minimalProps} />);
      expect(screen.getByText('Test Company')).toBeTruthy();
    });

    it('displays workplace address', () => {
      render(<SafetyOrgCards {...minimalProps} />);
      expect(screen.getByText('Construction Site Address')).toBeTruthy();
    });

    it('displays arbetsledning contacts', () => {
      render(<SafetyOrgCards {...minimalProps} />);
      expect(screen.getByText('BAS-P')).toBeTruthy();
      expect(screen.getByText('John Smith')).toBeTruthy();
    });

    it('displays skyddsombud contacts', () => {
      render(<SafetyOrgCards {...minimalProps} />);
      expect(screen.getByText('Skyddsombud')).toBeTruthy();
      expect(screen.getByText('Bob Wilson')).toBeTruthy();
    });

    it('displays myndigheter contacts', () => {
      render(<SafetyOrgCards {...minimalProps} />);
      expect(screen.getByText('Arbetsmiljöverket')).toBeTruthy();
      expect(screen.getByText('MSB')).toBeTruthy();
    });

    it('displays guidance text when present', () => {
      render(<SafetyOrgCards {...minimalProps} />);
      expect(screen.getByText('Follow all safety guidelines.')).toBeTruthy();
    });

    it('displays first aid contacts', () => {
      render(<SafetyOrgCards {...minimalProps} />);
      expect(screen.getByText('Alice Medic')).toBeTruthy();
    });
  });

  describe('Search filtering', () => {
    it('filters contacts by search term', () => {
      const { rerender } = render(<SafetyOrgCards {...minimalProps} searchTerm="John" />);
      expect(screen.getByText('John Smith')).toBeTruthy();
    });

    it('hides non-matching contacts when searching', () => {
      render(<SafetyOrgCards {...minimalProps} searchTerm="John" />);
      expect(screen.queryByText('Jane Doe')).toBeNull();
    });

    it('shows all contacts when search term is empty', () => {
      render(<SafetyOrgCards {...minimalProps} searchTerm="" />);
      expect(screen.getByText('John Smith')).toBeTruthy();
      expect(screen.getByText('Jane Doe')).toBeTruthy();
    });
  });

  describe('Empty data handling', () => {
    it('handles empty safetyOrg gracefully', () => {
      render(<SafetyOrgCards safetyOrg={{}} searchTerm="" />);
      expect(screen.queryByText('Larmnummer')).toBeNull();
    });

    it('handles missing optional fields', () => {
      render(
        <SafetyOrgCards
          safetyOrg={{
            company: { name: 'Only Company Name' },
          }}
          searchTerm=""
        />
      );
      expect(screen.getByText('Only Company Name')).toBeTruthy();
    });

    it('handles empty contact arrays', () => {
      render(
        <SafetyOrgCards
          safetyOrg={{
            arbetsledning: [],
            skyddsombud: [],
            ovriga_kontakter: [],
          }}
          searchTerm=""
        />
      );
      expect(screen.queryByText('BAS-P')).toBeNull();
    });

    it('handles undefined phone and email', () => {
      render(
        <SafetyOrgCards
          safetyOrg={{
            arbetsledning: [{ role: 'No Contact Info', name: 'Lonely Worker' }],
          }}
          searchTerm=""
        />
      );
      expect(screen.getByText('No Contact Info')).toBeTruthy();
      expect(screen.getByText('Kontaktuppgifter saknas')).toBeTruthy();
    });
  });

  describe('Phone link formatting', () => {
    it('renders phone links correctly', () => {
      render(<SafetyOrgCards {...minimalProps} />);
      const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
      expect(phoneLinks.length).toBeGreaterThan(0);
    });

    it('formats phone numbers without spaces for tel: links', () => {
      render(<SafetyOrgCards {...minimalProps} />);
      const telLink = document.querySelector('a[href="tel:070-1234567"]');
      expect(telLink).toBeTruthy();
    });
  });

  describe('Section visibility', () => {
    it('shows section headers for non-empty sections', () => {
      render(<SafetyOrgCards {...minimalProps} />);
      expect(screen.getAllByText(/Företag \/ Entreprenör/).length).toBeGreaterThan(0);
    });

    it('hides empty sections', () => {
      render(<SafetyOrgCards safetyOrg={{}} searchTerm="" />);
      expect(screen.queryByText(/Arbetsledning/)).toBeNull();
    });
  });
});
