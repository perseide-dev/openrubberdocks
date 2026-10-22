import type { BlockType, FileEditorBlock } from '@features/workspaces/files/types/block.types';

export interface ParsedBlock {
    type: BlockType;
    content: string;
    checked?: boolean;
}

/**
 * Parses raw text or markdown clipboard data into structured editor blocks.
 */
export function parseMarkdownToBlocks(text: string): ParsedBlock[] {
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n');
    const blocks: ParsedBlock[] = [];

    let inCodeBlock = false;
    const codeBuffer: string[] = [];

    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        const trimmed = line.trim();

        // Handle code block fences: ```
        if (trimmed.startsWith('```')) {
            if (inCodeBlock) {
                blocks.push({
                    type: 'code',
                    content: codeBuffer.join('\n'),
                });
                codeBuffer.length = 0;
                inCodeBlock = false;
            } else {
                inCodeBlock = true;
                codeBuffer.length = 0;
            }
            continue;
        }

        if (inCodeBlock) {
            codeBuffer.push(line);
            continue;
        }

        // Empty line handling: skip if adjacent to another empty line
        if (trimmed === '') {
            if (blocks.length > 0 && blocks[blocks.length - 1].type !== 'text') {
                continue;
            }
            if (blocks.length > 0 && blocks[blocks.length - 1].content === '') {
                continue;
            }
            blocks.push({ type: 'text', content: '' });
            continue;
        }

        // Divider: --- or *** or ___
        if (/^([-*_]){3,}$/.test(trimmed)) {
            blocks.push({ type: 'divider', content: '' });
            continue;
        }

        // Heading 1: # ...
        if (trimmed.startsWith('# ')) {
            blocks.push({ type: 'heading_1', content: trimmed.slice(2).trim() });
            continue;
        }

        // Heading 2: ## ...
        if (trimmed.startsWith('## ')) {
            blocks.push({ type: 'heading_2', content: trimmed.slice(3).trim() });
            continue;
        }

        // Heading 3: ### ...
        if (trimmed.startsWith('### ')) {
            blocks.push({ type: 'heading_3', content: trimmed.slice(4).trim() });
            continue;
        }

        // To-do checked: - [x] or * [x] or [x]
        const todoCheckedMatch = trimmed.match(/^[-*]?\s*\[[xX]\]\s*(.*)$/);
        if (todoCheckedMatch) {
            blocks.push({
                type: 'todo',
                content: todoCheckedMatch[1].trim(),
                checked: true,
            });
            continue;
        }

        // To-do unchecked: - [ ] or * [ ] or [ ] or []
        const todoUncheckedMatch = trimmed.match(/^[-*]?\s*\[\s*\]\s*(.*)$/);
        if (todoUncheckedMatch) {
            blocks.push({
                type: 'todo',
                content: todoUncheckedMatch[1].trim(),
                checked: false,
            });
            continue;
        }

        // Bullet list: - ... or * ... or + ...
        const bulletMatch = trimmed.match(/^[-*+]\s+(.*)$/);
        if (bulletMatch) {
            blocks.push({ type: 'bullet_list', content: bulletMatch[1].trim() });
            continue;
        }

        // Numbered list: 1. ... or 1) ...
        const numberedMatch = trimmed.match(/^\d+[.)]\s+(.*)$/);
        if (numberedMatch) {
            blocks.push({ type: 'numbered_list', content: numberedMatch[1].trim() });
            continue;
        }

        // Quote: > ...
        if (trimmed.startsWith('> ')) {
            blocks.push({ type: 'quote', content: trimmed.slice(2).trim() });
            continue;
        }

        // Image: ![alt](url)
        const imageMatch = trimmed.match(/^!\[.*?\]\((.*?)\)$/);
        if (imageMatch) {
            blocks.push({ type: 'image', content: imageMatch[1].trim() });
            continue;
        }

        // Standard text fallback
        blocks.push({ type: 'text', content: line });
    }

    // Flush any open code block
    if (inCodeBlock && codeBuffer.length > 0) {
        blocks.push({
            type: 'code',
            content: codeBuffer.join('\n'),
        });
    }

    return blocks.length > 0 ? blocks : [{ type: 'text', content: '' }];
}

/**
 * Serializes block list into clean Markdown string for clipboard copy operations.
 */
export function serializeBlocksToMarkdown(blocks: FileEditorBlock[]): string {
    let numberedIndex = 0;

    return blocks
        .map((block) => {
            if (block.type === 'numbered_list') {
                numberedIndex += 1;
            } else {
                numberedIndex = 0;
            }

            switch (block.type) {
                case 'heading_1':
                    return `# ${block.content}`;
                case 'heading_2':
                    return `## ${block.content}`;
                case 'heading_3':
                    return `### ${block.content}`;
                case 'bullet_list':
                    return `- ${block.content}`;
                case 'numbered_list':
                    return `${numberedIndex}. ${block.content}`;
                case 'todo':
                    return `- [${block.checked ? 'x' : ' '}] ${block.content}`;
                case 'quote':
                    return `> ${block.content}`;
                case 'code':
                    return `\`\`\`\n${block.content}\n\`\`\``;
                case 'divider':
                    return '---';
                case 'image':
                    return `![](${block.content})`;
                default:
                    return block.content;
            }
        })
        .join('\n\n');
}
