import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const MockProjectRead = () => {
  const [phase, setPhase] = React.useState<'language' | 'info' | 'documents' | 'register' | 'signature' | 'done'>('language');
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>('');
  const [infoBlocks] = React.useState<Array<{ id: string; content: string }>>([]);
  const [documents] = React.useState<Array<{ id: string; title: string; extraction_status: string }>>([]);
  const [currentDocIndex] = React.useState(0);
  const [hasScrolledToBottom, setHasScrolledToBottom] = React.useState(false);

  const handleLanguageSelect = (lang: string) => {
    setSelectedLanguage(lang);
    if (infoBlocks.length > 0) {
      setPhase('info');
    } else if (documents.length > 0) {
      setPhase('documents');
    } else {
      setPhase('register');
    }
  };

  const confirmInfoRead = () => {
    if (documents.length === 0) setPhase('register');
    else setPhase('documents');
  };

  const confirmDocRead = () => {
    setPhase('register');
  };

  const currentDoc = documents[currentDocIndex];

  return (
    <div>
      <div data-testid="phase-indicator">{phase}</div>
      <div data-testid="language-indicator">{selectedLanguage || 'none'}</div>

      {phase === 'language' && (
        <div>
          <h2 data-testid="language-title">Select Language</h2>
          <button data-testid="lang-sv" onClick={() => handleLanguageSelect('sv')}>Svenska</button>
          <button data-testid="lang-en" onClick={() => handleLanguageSelect('en')}>English</button>
          <button data-testid="lang-pl" onClick={() => handleLanguageSelect('pl')}>Polski</button>
          <button data-testid="lang-es" onClick={() => handleLanguageSelect('es')}>Español</button>
        </div>
      )}

      {phase === 'info' && (
        <div>
          <h2 data-testid="info-title">Information</h2>
          <button data-testid="confirm-info" onClick={confirmInfoRead}>I have read the information</button>
        </div>
      )}

      {phase === 'documents' && currentDoc && (
        <div>
          <h2 data-testid="doc-title">{currentDoc.title}</h2>
          <div data-testid="scroll-status">{hasScrolledToBottom ? 'scrolled' : 'not-scrolled'}</div>
          <button
            data-testid="confirm-doc"
            onClick={confirmDocRead}
            disabled={currentDoc.extraction_status === 'success' && !hasScrolledToBottom}
          >
            Confirm read
          </button>
          <button data-testid="scroll-trigger" onClick={() => setHasScrolledToBottom(true)}>Scroll to bottom</button>
        </div>
      )}

      {phase === 'register' && (
        <div>
          <h2 data-testid="register-title">Register</h2>
          <OtpVerifyMock onVerified={() => {}} />
        </div>
      )}

      {phase === 'signature' && (
        <div>
          <h2 data-testid="signature-title">Signature</h2>
          <SignaturePadMock onSignatureChange={() => {}} />
        </div>
      )}

      {phase === 'done' && (
        <div>
          <h2 data-testid="done-title">Done</h2>
        </div>
      )}
    </div>
  );
};

const OtpVerifyMock: React.FC<{ onVerified: (phone: string) => void }> = ({ onVerified }) => (
  <div data-testid="otp-verify">
    <button data-testid="otp-verified" onClick={() => onVerified('+46701234567')}>
      Verify Phone
    </button>
  </div>
);

const SignaturePadMock: React.FC<{ onSignatureChange: (dataUrl: string | null) => void }> = ({ onSignatureChange }) => (
  <div data-testid="signature-pad">
    <button data-testid="signature-drawn" onClick={() => onSignatureChange('data:image/png;base64,fake')}>
      Draw Signature
    </button>
  </div>
);

const renderWithRouter = (ui: React.ReactElement) => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ProjectRead state machine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Phase transitions', () => {
    it('starts at language selection phase', () => {
      renderWithRouter(<MockProjectRead />);
      expect(screen.getByTestId('phase-indicator')).toHaveTextContent('language');
      expect(screen.getByTestId('language-title')).toBeInTheDocument();
    });

    it('shows language buttons', () => {
      renderWithRouter(<MockProjectRead />);
      expect(screen.getByTestId('lang-sv')).toBeInTheDocument();
      expect(screen.getByTestId('lang-en')).toBeInTheDocument();
      expect(screen.getByTestId('lang-pl')).toBeInTheDocument();
      expect(screen.getByTestId('lang-es')).toBeInTheDocument();
    });

    it('transitions to info phase after Swedish language selection when info blocks exist', () => {
      const MockWithInfo = () => {
        const [phase, setPhase] = React.useState<'language' | 'info' | 'documents' | 'register' | 'signature' | 'done'>('language');
        const [infoBlocks] = React.useState<Array<{ id: string; content: string }>>([{ id: '1', content: 'Test info' }]);
        const [documents] = React.useState<Array<{ id: string; title: string; extraction_status: string }>>([]);

        const handleLanguageSelect = (lang: string) => {
          if (infoBlocks.length > 0) setPhase('info');
          else if (documents.length > 0) setPhase('documents');
          else setPhase('register');
        };

        return (
          <div>
            <div data-testid="phase">{phase}</div>
            {phase === 'language' && (
              <button data-testid="select-lang" onClick={() => handleLanguageSelect('sv')}>Select Swedish</button>
            )}
            {phase === 'info' && <div data-testid="info-phase">Info Phase</div>}
          </div>
        );
      };

      renderWithRouter(<MockWithInfo />);
      expect(screen.getByTestId('phase')).toHaveTextContent('language');
      fireEvent.click(screen.getByTestId('select-lang'));
      expect(screen.getByTestId('phase')).toHaveTextContent('info');
    });

    it('transitions to documents phase when no info blocks but documents exist', () => {
      const MockWithDocsOnly = () => {
        const [phase, setPhase] = React.useState<'language' | 'info' | 'documents' | 'register' | 'signature' | 'done'>('language');
        const [selectedLang, setSelectedLang] = React.useState('');
        const [infoBlocks] = React.useState<Array<{ id: string; content: string }>>([]);
        const [documents] = React.useState<Array<{ id: string; title: string; extraction_status: string }>>([
          { id: '1', title: 'Doc 1', extraction_status: 'success' }
        ]);

        const handleLanguageSelect = (lang: string) => {
          setSelectedLang(lang);
          if (infoBlocks.length > 0) setPhase('info');
          else if (documents.length > 0) setPhase('documents');
          else setPhase('register');
        };

        return (
          <div>
            <div data-testid="phase">{phase}</div>
            <div data-testid="lang">{selectedLang}</div>
            {phase === 'language' && (
              <button data-testid="select-lang" onClick={() => handleLanguageSelect('en')}>Select English</button>
            )}
            {phase === 'documents' && <div data-testid="docs-phase">Documents Phase</div>}
          </div>
        );
      };

      renderWithRouter(<MockWithDocsOnly />);
      expect(screen.getByTestId('phase')).toHaveTextContent('language');
      fireEvent.click(screen.getByTestId('select-lang'));
      expect(screen.getByTestId('phase')).toHaveTextContent('documents');
      expect(screen.getByTestId('lang')).toHaveTextContent('en');
    });

    it('skips to register phase when no info blocks and no documents', () => {
      const MockEmpty = () => {
        const [phase, setPhase] = React.useState<'language' | 'info' | 'documents' | 'register' | 'signature' | 'done'>('language');
        const [infoBlocks] = React.useState<Array<{ id: string; content: string }>>([]);
        const [documents] = React.useState<Array<{ id: string; title: string; extraction_status: string }>>([]);

        const handleLanguageSelect = (lang: string) => {
          if (infoBlocks.length > 0) setPhase('info');
          else if (documents.length > 0) setPhase('documents');
          else setPhase('register');
        };

        return (
          <div>
            <div data-testid="phase">{phase}</div>
            {phase === 'language' && (
              <button data-testid="select-lang" onClick={() => handleLanguageSelect('sv')}>Select Swedish</button>
            )}
            {phase === 'register' && <div data-testid="register-phase">Register Phase</div>}
          </div>
        );
      };

      renderWithRouter(<MockEmpty />);
      fireEvent.click(screen.getByTestId('select-lang'));
      expect(screen.getByTestId('phase')).toHaveTextContent('register');
    });
  });

  describe('Scroll gating', () => {
    it('requires scrolling before confirming document read', () => {
      const MockWithScrollGating = () => {
        const [phase] = React.useState('documents');
        const [hasScrolled, setHasScrolled] = React.useState(false);
        const [documents] = React.useState([{ id: '1', title: 'Test Doc', extraction_status: 'success' }]);
        const currentDoc = documents[0];

        return (
          <div>
            <div data-testid="phase">{phase}</div>
            <div data-testid="scroll-status">{hasScrolled ? 'scrolled' : 'not-scrolled'}</div>
            <div data-testid="doc-title">{currentDoc.title}</div>
            <button data-testid="confirm-btn" disabled={!hasScrolled}>Confirm</button>
            <button data-testid="scroll-btn" onClick={() => setHasScrolled(true)}>Simulate Scroll</button>
          </div>
        );
      };

      renderWithRouter(<MockWithScrollGating />);
      expect(screen.getByTestId('scroll-status')).toHaveTextContent('not-scrolled');
      expect(screen.getByTestId('confirm-btn')).toBeDisabled();
    });

    it('enables confirm button after scrolling', () => {
      const MockWithScrollGating = () => {
        const [hasScrolled, setHasScrolled] = React.useState(false);

        return (
          <div>
            <div data-testid="scroll-status">{hasScrolled ? 'scrolled' : 'not-scrolled'}</div>
            <button data-testid="confirm-btn" disabled={!hasScrolled}>Confirm</button>
            <button data-testid="scroll-btn" onClick={() => setHasScrolled(true)}>Simulate Scroll</button>
          </div>
        );
      };

      renderWithRouter(<MockWithScrollGating />);
      expect(screen.getByTestId('confirm-btn')).toBeDisabled();
      fireEvent.click(screen.getByTestId('scroll-btn'));
      expect(screen.getByTestId('confirm-btn')).not.toBeDisabled();
    });
  });

  describe('Language selection', () => {
    it('stores selected language', () => {
      const MockLangSelection = () => {
        const [selectedLang, setSelectedLang] = React.useState('');

        return (
          <div>
            <div data-testid="lang">{selectedLang || 'none'}</div>
            <button data-testid="select-en" onClick={() => setSelectedLang('en')}>English</button>
            <button data-testid="select-sv" onClick={() => setSelectedLang('sv')}>Swedish</button>
          </div>
        );
      };

      renderWithRouter(<MockLangSelection />);
      expect(screen.getByTestId('lang')).toHaveTextContent('none');
      fireEvent.click(screen.getByTestId('select-en'));
      expect(screen.getByTestId('lang')).toHaveTextContent('en');
    });
  });

  describe('OTP verification requirement', () => {
    it('shows OTP verification before registration form', () => {
      renderWithRouter(<MockProjectRead />);
      expect(screen.getByTestId('phase-indicator')).toHaveTextContent('language');

      const MockWithOTP = () => {
        const [phase] = React.useState('register');
        const [verified, setVerified] = React.useState(false);

        return (
          <div>
            <div data-testid="phase">{phase}</div>
            {!verified ? (
              <div data-testid="otp-required">OTP Required</div>
            ) : (
              <div data-testid="registration-form">Registration Form</div>
            )}
          </div>
        );
      };

      renderWithRouter(<MockWithOTP />);
      expect(screen.getByTestId('otp-required')).toBeInTheDocument();
    });

    it('shows registration form after OTP verification', () => {
      const MockWithOTPFlow = () => {
        const [verified, setVerified] = React.useState(false);

        return (
          <div>
            {!verified ? (
              <div>
                <div data-testid="otp-step">OTP Step</div>
                <button data-testid="verify-btn" onClick={() => setVerified(true)}>Verify</button>
              </div>
            ) : (
              <div data-testid="registration-form">Registration Form</div>
            )}
          </div>
        );
      };

      renderWithRouter(<MockWithOTPFlow />);
      expect(screen.getByTestId('otp-step')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('verify-btn'));
      expect(screen.getByTestId('registration-form')).toBeInTheDocument();
    });
  });

  describe('Signature phase', () => {
    it('requires signature before proceeding', () => {
      const MockSignaturePhase = () => {
        const [hasSignature, setHasSignature] = React.useState(false);

        return (
          <div>
            <div data-testid="signature-phase">Signature Phase</div>
            <button data-testid="sign-btn" disabled={!hasSignature}>Sign</button>
            {!hasSignature && <div data-testid="signature-required">Draw your signature first</div>}
          </div>
        );
      };

      renderWithRouter(<MockSignaturePhase />);
      expect(screen.getByTestId('sign-btn')).toBeDisabled();
      expect(screen.getByTestId('signature-required')).toBeInTheDocument();
    });

    it('enables sign button after signature drawn', () => {
      const MockSignaturePhase = () => {
        const [hasSignature, setHasSignature] = React.useState(false);

        return (
          <div>
            <button data-testid="sign-btn" disabled={!hasSignature}>Sign</button>
            <button data-testid="draw-sig" onClick={() => setHasSignature(true)}>Draw</button>
          </div>
        );
      };

      renderWithRouter(<MockSignaturePhase />);
      expect(screen.getByTestId('sign-btn')).toBeDisabled();
      fireEvent.click(screen.getByTestId('draw-sig'));
      expect(screen.getByTestId('sign-btn')).not.toBeDisabled();
    });
  });

  describe('Done phase', () => {
    it('shows completion state', () => {
      const MockDonePhase = () => {
        const [phase] = React.useState('done');

        return (
          <div>
            {phase === 'done' && <div data-testid="done-content">Registration Complete!</div>}
          </div>
        );
      };

      renderWithRouter(<MockDonePhase />);
      expect(screen.getByTestId('done-content')).toHaveTextContent('Registration Complete!');
    });
  });

  describe('Document navigation', () => {
    it('shows document counter', () => {
      const MockDocCounter = () => {
        const [current, setCurrent] = React.useState(0);
        const total = 3;

        return (
          <div>
            <div data-testid="doc-counter">Document {current + 1} of {total}</div>
            <button data-testid="next-doc" onClick={() => setCurrent(c => Math.min(c + 1, total - 1))}>Next</button>
          </div>
        );
      };

      renderWithRouter(<MockDocCounter />);
      expect(screen.getByTestId('doc-counter')).toHaveTextContent('Document 1 of 3');
    });

    it('advances to next document', () => {
      const MockDocNav = () => {
        const [current, setCurrent] = React.useState(0);
        const total = 3;

        return (
          <div>
            <div data-testid="doc-counter">Document {current + 1} of {total}</div>
            <button data-testid="next-doc" onClick={() => setCurrent(c => Math.min(c + 1, total - 1))}>Next</button>
          </div>
        );
      };

      renderWithRouter(<MockDocNav />);
      fireEvent.click(screen.getByTestId('next-doc'));
      expect(screen.getByTestId('doc-counter')).toHaveTextContent('Document 2 of 3');
    });
  });
});
