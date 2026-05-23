import { describe, it, expect } from 'vitest';

const sectionRegex = /\[SECTION\s*(\d+)\]\s*\n\s*TITLE:\s*(.*?)\n\s*CONTENT:\s*\n([\s\S]*?)(?=\n\s*---|\n\s*\[SECTION|\n\s*===QUESTIONS===|$)/gi;
const qRegex = /\[QUESTION (\d+)\]\nTEXT:\s*(.*?)(?:\nOPTIONS:\s*(.*?))?(?=\n\n\[QUESTION|\n*$)/gs;

function parseSections(text: string) {
  const sections: { index: number; title: string; content: string[] }[] = [];
  const regex = /\[SECTION\s*(\d+)\]\s*\n\s*TITLE:\s*(.*?)\n\s*CONTENT:\s*\n([\s\S]*?)(?=\n\s*---|\n\s*\[SECTION|\n\s*===QUESTIONS===|$)/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    sections.push({
      index: parseInt(match[1]),
      title: match[2].trim(),
      content: match[3].trim().split('\n').filter(l => l.trim()),
    });
  }
  return sections;
}

function parseQuestions(text: string) {
  const questions: { index: number; text: string; options?: string[] }[] = [];
  const questionsPartIdx = text.indexOf('===QUESTIONS===');
  if (questionsPartIdx === -1) return questions;

  const questionsPart = text.substring(questionsPartIdx);
  const regex = /\[QUESTION (\d+)\]\nTEXT:\s*(.*?)(?:\nOPTIONS:\s*(.*?))?(?=\n\n\[QUESTION|\n*$)/gs;
  let match;
  while ((match = regex.exec(questionsPart)) !== null) {
    const q: { index: number; text: string; options?: string[] } = {
      index: parseInt(match[1]),
      text: match[2].trim(),
    };
    if (match[3]) {
      try {
        q.options = JSON.parse(match[3].trim());
      } catch { /* ignore */ }
    }
    questions.push(q);
  }
  return questions;
}

function parseJsonResponse(text: string): { sections: any[]; questions: any[] } {
  let translatedSections: any[] = [];
  let translatedQuestions: any[] = [];

  let jsonStr = text;
  if (text.includes('```json')) {
    jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
  } else if (text.includes('```')) {
    jsonStr = text.replace(/```\n?/g, '').replace(/```\n?$/g, '');
  }

  try {
    const parsed = JSON.parse(jsonStr);

    if (parsed.sections && Array.isArray(parsed.sections)) {
      translatedSections = parsed.sections.map((s: any) => ({
        title: s.title || 'Untitled',
        content: Array.isArray(s.content) ? s.content : [s.content || ''],
      }));
    }

    if (parsed.questions && Array.isArray(parsed.questions)) {
      translatedQuestions = parsed.questions.map((q: any, i: number) => ({
        index: q.index ?? i,
        question_text: q.question_text || '',
        options: q.options,
      }));
    }
  } catch {
    return { sections: [], questions: [] };
  }

  return { sections: translatedSections, questions: translatedQuestions };
}

describe('Translation parser', () => {
  describe('Section parsing', () => {
    it('parses nominal response correctly', () => {
      const input = `[SECTION 0]
TITLE: Safety Rules
CONTENT:
Line 1
Line 2
---
[SECTION 1]
TITLE: Emergency
CONTENT:
Contact 112`;

      const sections = parseSections(input);
      expect(sections).toHaveLength(2);
      expect(sections[0].index).toBe(0);
      expect(sections[0].title).toBe('Safety Rules');
      expect(sections[0].content).toEqual(['Line 1', 'Line 2']);
      expect(sections[1].index).toBe(1);
      expect(sections[1].title).toBe('Emergency');
      expect(sections[1].content).toEqual(['Contact 112']);
    });

    it('handles malformed JSON fallback', () => {
      const input = `TITLE: Safety Rules
CONTENT:
Just some text without proper markers`;

      const sections = parseSections(input);
      expect(sections).toHaveLength(0);
    });

    it('handles missing content gracefully', () => {
      const input = `[SECTION 0]
TITLE: Empty Section
CONTENT:`;

      const sections = parseSections(input);
      expect(sections).toHaveLength(1);
      expect(sections[0].title).toBe('Empty Section');
      expect(sections[0].content).toEqual([]);
    });

    it('handles content with multiple lines', () => {
      const input = `[SECTION 0]
TITLE: Multi-line Content
CONTENT:
First line
Second line
Third line
---
[SECTION 1]
TITLE: Next Section
CONTENT:
More content`;

      const sections = parseSections(input);
      expect(sections).toHaveLength(2);
      expect(sections[0].content).toEqual(['First line', 'Second line', 'Third line']);
    });

    it('handles questions section delimiter', () => {
      const input = `[SECTION 0]
TITLE: Document Content
CONTENT:
Some text here

===QUESTIONS===

[QUESTION 0]
TEXT: What is this?`;

      const sections = parseSections(input);
      expect(sections).toHaveLength(1);
      expect(sections[0].title).toBe('Document Content');
    });

    it('strips leading/trailing whitespace from content', () => {
      const input = `[SECTION 0]
TITLE: Test
CONTENT:
   Line with spaces
    indented line
`;

      const sections = parseSections(input);
      expect(sections[0].content).toEqual(['  Line with spaces', '   indented line']);
    });
  });

  describe('Question parsing', () => {
    it('parses questions with options', () => {
      const input = `===QUESTIONS===

[QUESTION 0]
TEXT: What is 2+2?
OPTIONS: ["3", "4", "5"]`;

      const questions = parseQuestions(input);
      expect(questions).toHaveLength(1);
      expect(questions[0].index).toBe(0);
      expect(questions[0].text).toBe('What is 2+2?');
      expect(questions[0].options).toEqual(['3', '4', '5']);
    });

    it('parses questions without options', () => {
      const input = `===QUESTIONS===

[QUESTION 0]
TEXT: What is 2+2?`;

      const questions = parseQuestions(input);
      expect(questions).toHaveLength(1);
      expect(questions[0].text).toBe('What is 2+2?');
      expect(questions[0].options).toBeUndefined();
    });

    it('parses multiple questions', () => {
      const input = `===QUESTIONS===

[QUESTION 0]
TEXT: First question?
OPTIONS: ["A", "B"]

[QUESTION 1]
TEXT: Second question?
OPTIONS: ["C", "D"]

[QUESTION 2]
TEXT: Third question?`;

      const questions = parseQuestions(input);
      expect(questions).toHaveLength(3);
      expect(questions[0].text).toBe('First question?');
      expect(questions[1].text).toBe('Second question?');
      expect(questions[2].text).toBe('Third question?');
    });

    it('handles JSON options parsing errors gracefully', () => {
      const input = `===QUESTIONS===

[QUESTION 0]
TEXT: Test question?
OPTIONS: not valid json`;

      const questions = parseQuestions(input);
      expect(questions).toHaveLength(1);
      expect(questions[0].text).toBe('Test question?');
      expect(questions[0].options).toBeUndefined();
    });
  });

  describe('Full document parsing', () => {
    it('parses complete translated document with sections and questions', () => {
      const input = `[SECTION 0]
TITLE: Introduction
CONTENT:
Welcome to the safety documentation.
Please read carefully.
---
[SECTION 1]
TITLE: Emergency Procedures
CONTENT:
In case of emergency, call 112.
Do not panic.

===QUESTIONS===

[QUESTION 0]
TEXT: What number do you call in an emergency?
OPTIONS: ["911", "112", "999"]

[QUESTION 1]
TEXT: Should you panic during an emergency?
OPTIONS: ["Yes", "No"]`;

      const sections = parseSections(input);
      expect(sections).toHaveLength(2);
      expect(sections[0].title).toBe('Introduction');
      expect(sections[1].title).toBe('Emergency Procedures');

      const questions = parseQuestions(input);
      expect(questions).toHaveLength(2);
      expect(questions[0].text).toContain('emergency');
      expect(questions[1].text).toContain('panic');
    });

    it('handles empty document', () => {
      const sections = parseSections('');
      expect(sections).toHaveLength(0);

      const questions = parseQuestions('');
      expect(questions).toHaveLength(0);
    });

    it('handles document with only sections', () => {
      const input = `[SECTION 0]
TITLE: Only Sections
CONTENT:
No questions here`;

      const sections = parseSections(input);
      const questions = parseQuestions(input);
      expect(sections).toHaveLength(1);
      expect(questions).toHaveLength(0);
    });

    it('handles document with only questions', () => {
      const input = `===QUESTIONS===

[QUESTION 0]
TEXT: Only questions here?`;

      const sections = parseSections(input);
      const questions = parseQuestions(input);
      expect(sections).toHaveLength(0);
      expect(questions).toHaveLength(1);
    });
  });

  describe('Edge cases', () => {
    it('handles section with numeric title', () => {
      const input = `[SECTION 0]
TITLE: 123
CONTENT:
Content`;

      const sections = parseSections(input);
      expect(sections).toHaveLength(1);
      expect(sections[0].title).toBe('123');
    });

    it('handles section with special characters in title', () => {
      const input = `[SECTION 0]
TITLE: Safety & Health (KMA)
CONTENT:
Content`;

      const sections = parseSections(input);
      expect(sections).toHaveLength(1);
      expect(sections[0].title).toBe('Safety & Health (KMA)');
    });

    it('handles question with Swedish special characters', () => {
      const input = `===QUESTIONS===

[QUESTION 0]
TEXT: Vad är 2+2?
OPTIONS: ["3", "4", "5"]`;

      const questions = parseQuestions(input);
      expect(questions).toHaveLength(1);
      expect(questions[0].text).toBe('Vad är 2+2?');
    });

    it('handles very long content lines', () => {
      const longLine = 'x'.repeat(500);
      const input = `[SECTION 0]
TITLE: Long Content
CONTENT:
${longLine}`;

      const sections = parseSections(input);
      expect(sections).toHaveLength(1);
      expect(sections[0].content[0]).toBe(longLine);
    });

    it('handles section with no separator before end', () => {
      const input = `[SECTION 0]
TITLE: End of Document
CONTENT:
Final content here`;

      const sections = parseSections(input);
      expect(sections).toHaveLength(1);
      expect(sections[0].title).toBe('End of Document');
      expect(sections[0].content).toEqual(['Final content here']);
    });
  });

  describe('JSON parsing', () => {
    it('parses nominal JSON response', () => {
      const input = JSON.stringify({
        sections: [
          { title: 'Safety Rules', content: ['Line 1', 'Line 2'] },
          { title: 'Emergency', content: ['Contact 112'] },
        ],
        questions: [
          { index: 0, question_text: 'What is 2+2?', options: ['3', '4', '5'] },
        ],
      });

      const result = parseJsonResponse(input);
      expect(result.sections).toHaveLength(2);
      expect(result.sections[0].title).toBe('Safety Rules');
      expect(result.sections[0].content).toEqual(['Line 1', 'Line 2']);
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].question_text).toBe('What is 2+2?');
      expect(result.questions[0].options).toEqual(['3', '4', '5']);
    });

    it('handles missing questions block', () => {
      const input = JSON.stringify({
        sections: [
          { title: 'Only Sections', content: ['Content here'] },
        ],
      });

      const result = parseJsonResponse(input);
      expect(result.sections).toHaveLength(1);
      expect(result.questions).toHaveLength(0);
    });

    it('handles malformed JSON', () => {
      const input = `{ sections: [ { title: "Broken" `;

      const result = parseJsonResponse(input);
      expect(result.sections).toHaveLength(0);
      expect(result.questions).toHaveLength(0);
    });

    it('handles half-truncated response', () => {
      const input = `{"sections": [{"title": "Partial"`;

      const result = parseJsonResponse(input);
      expect(result.sections).toHaveLength(0);
      expect(result.questions).toHaveLength(0);
    });

    it('parses response with markdown code blocks', () => {
      const input = `\`\`\`json
{
  "sections": [
    {
      "title": "Safety Rules",
      "content": ["Line 1", "Line 2"]
    }
  ],
  "questions": [
    {
      "index": 0,
      "question_text": "What is 2+2?",
      "options": ["3", "4", "5"]
    }
  ]
}
\`\`\``;

      const result = parseJsonResponse(input);
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].title).toBe('Safety Rules');
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].question_text).toBe('What is 2+2?');
    });

    it('handles content as string instead of array', () => {
      const input = JSON.stringify({
        sections: [
          { title: 'Single Line', content: 'Just a string' },
        ],
      });

      const result = parseJsonResponse(input);
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].content).toEqual(['Just a string']);
    });

    it('handles missing title with default', () => {
      const input = JSON.stringify({
        sections: [
          { content: ['Content without title'] },
        ],
      });

      const result = parseJsonResponse(input);
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].title).toBe('Untitled');
    });

    it('handles questions with inferred index', () => {
      const input = JSON.stringify({
        sections: [],
        questions: [
          { question_text: 'First question?' },
          { question_text: 'Second question?' },
        ],
      });

      const result = parseJsonResponse(input);
      expect(result.questions).toHaveLength(2);
      expect(result.questions[0].index).toBe(0);
      expect(result.questions[1].index).toBe(1);
    });
  });
});
