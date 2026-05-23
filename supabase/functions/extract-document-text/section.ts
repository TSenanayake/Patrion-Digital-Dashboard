import { Section, Block, Contact } from "../_shared/types.ts";
import { isHeading } from "./headings.ts";
import { isTocBlock } from "./toc.ts";

export function buildSections(blocks: Block[]): { sections: Section[]; removedToc: boolean } {
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let removedToc = false;

  for (let bi = 0; bi < blocks.length; bi++) {
    const block = blocks[bi];
    if (isTocBlock(block.text)) { removedToc = true; continue; }

    const lines = block.text.split("\n");
    const firstLine = lines[0]?.trim() || "";
    const hasFollowingContent = lines.length > 1 || bi < blocks.length - 1;

    if (isHeading(firstLine, hasFollowingContent, true)) {
      if (currentSection) sections.push(currentSection);
      const contentLines = lines.slice(1).join("\n").trim();
      currentSection = { title: firstLine, content: contentLines ? [contentLines] : [] };
    } else if (lines.length === 1 && isHeading(firstLine, bi < blocks.length - 1, true)) {
      if (currentSection) sections.push(currentSection);
      currentSection = { title: firstLine, content: [] };
    } else {
      if (!currentSection) currentSection = { title: "", content: [] };
      currentSection.content.push(block.text);
    }
  }
  if (currentSection) sections.push(currentSection);

  const merged: Section[] = [];
  for (const section of sections) {
    if (section.title === "" && merged.length > 0) {
      merged[merged.length - 1].content.push(...section.content);
    } else {
      merged.push(section);
    }
  }

  const final: Section[] = [];
  for (let i = 0; i < merged.length; i++) {
    const section = merged[i];
    if (section.content.length === 0 && section.title && i + 1 < merged.length) {
      const next = merged[i + 1];
      next.content = [section.title, ...next.content];
      if (!next.title) {
        next.title = section.title;
        next.content = next.content.slice(1);
      }
    } else {
      final.push(section);
    }
  }

  const nodutgangarIdx = final.findIndex(s => /nödutgångar\s+och\s+återsamlingsplats/i.test(s.title));
  if (nodutgangarIdx >= 0) {
    for (let i = 0; i < final.length; i++) {
      if (i === nodutgangarIdx) continue;
      const moved: string[] = [];
      final[i].content = final[i].content.filter(c => {
        if (/återsamlingsplats\s+för\s+denna\s+arbetsplats/i.test(c)) {
          moved.push(c);
          return false;
        }
        return true;
      });
      if (moved.length > 0) {
        final[nodutgangarIdx].content.push(...moved);
      }
    }
  }

  return { sections: final, removedToc };
}
