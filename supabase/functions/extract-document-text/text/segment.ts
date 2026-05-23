import { Block } from "../_shared/types.ts";

export function segmentIntoBlocks(text: string): Block[] {
  const lines = text.split("\n");
  const blocks: Block[] = [];
  let current: string[] = [];
  let blockIndex = 0;

  for (const line of lines) {
    if (line.trim() === "") {
      if (current.length > 0) {
        blocks.push({ text: current.join("\n").trim(), index: blockIndex++ });
        current = [];
      }
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) {
    blocks.push({ text: current.join("\n").trim(), index: blockIndex });
  }
  return blocks;
}
