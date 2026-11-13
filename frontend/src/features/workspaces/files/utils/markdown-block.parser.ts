import type {
    CalloutVariant,
    FileEditorBlock,
    ParsedBlock,
} from '@features-workspaces/files/types/block.types';
import {
    parseMarkdownTable,
    serializeTableToMarkdown,
} from '@features-workspaces/files/utils/table-markdown.utils';

export type { ParsedBlock };

/**
 * Parses raw text or markdown clipboard data into structured editor blocks,
 * supporting rich technical blocks (tables, callouts, mermaid, openapi, links, attachments).
 */
export function parseMarkdownToBlocks(text: string): ParsedBlock[] {
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n');
    const blocks: ParsedBlock[] = [];

    let inCodeBlock = false;
    let fenceLanguage = '';
    const codeBuffer: string[] = [];

    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        const trimmed = line.trim();

        // Handle code block fences: ```, ```mermaid, ```openapi, ```swagger
        if (trimmed.startsWith('```')) {
            if (inCodeBlock) {
                const body = codeBuffer.join('\n');
                if (fenceLanguage === 'mermaid') {
                    blocks.push({ type: 'mermaid', content: body });
                } else if (fenceLanguage === 'openapi' || fenceLanguage === 'swagger') {
                    blocks.push({ type: 'openapi_spec', content: body });
                } else {
                    blocks.push({ type: 'code', content: body });
                }
                codeBuffer.length = 0;
                fenceLanguage = '';
                inCodeBlock = false;
            } else {
                inCodeBlock = true;
                fenceLanguage = trimmed.slice(3).trim().toLowerCase();
                codeBuffer.length = 0;
            }
            continue;
        }

        if (inCodeBlock) {
            codeBuffer.push(line);
            continue;
        }

        // Markdown Table detection: consecutive lines starting and ending with |
        if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2) {
            const tableLines: string[] = [trimmed];
            while (
                i + 1 < lines.length &&
                lines[i + 1].trim().startsWith('|') &&
                lines[i + 1].trim().endsWith('|')
            ) {
                i += 1;
                tableLines.push(lines[i].trim());
            }
            if (tableLines.length >= 2) {
                const tableMd = tableLines.join('\n');
                const tableData = parseMarkdownTable(tableMd);
                blocks.push({
                    type: 'table',
                    content: serializeTableToMarkdown(tableData),
                    properties: { table: tableData },
                });
                continue;
            }
        }

        // Empty line handling
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

        // Callout block: > [!INFO|WARNING|DANGER|SUCCESS|NOTE|TIP|CAUTION] message
        const calloutMatch = trimmed.match(
            /^>\s*\[!(INFO|WARNING|DANGER|SUCCESS|NOTE|TIP|CAUTION|IMPORTANT)\]\s*(.*)$/i,
        );
        if (calloutMatch) {
            const rawTag = calloutMatch[1].toUpperCase();
            const variantMap: Record<string, CalloutVariant> = {
                INFO: 'INFO',
                NOTE: 'INFO',
                IMPORTANT: 'INFO',
                WARNING: 'WARNING',
                DANGER: 'DANGER',
                CAUTION: 'DANGER',
                SUCCESS: 'SUCCESS',
                TIP: 'SUCCESS',
            };
            const calloutVariant = variantMap[rawTag] ?? 'INFO';
            blocks.push({
                type: 'callout',
                content: calloutMatch[2].trim(),
                properties: { calloutVariant },
            });
            continue;
        }

        // Internal link: [[document:uuid|Title]] or [[task:uuid|Title]]
        const internalLinkMatch = trimmed.match(/^\[\[(document|task):([^|\]]+)\|([^\]]+)\]\]$/);
        if (internalLinkMatch) {
            const targetType = internalLinkMatch[1] as 'document' | 'task';
            const targetUuid = internalLinkMatch[2].trim();
            const targetTitle = internalLinkMatch[3].trim();
            blocks.push({
                type: 'internal_link',
                content: targetTitle,
                properties: {
                    internalLink: {
                        targetType,
                        targetUuid,
                        targetTitle,
                    },
                },
            });
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
        const imageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imageMatch) {
            blocks.push({
                type: 'image',
                content: imageMatch[2].trim(),
                properties: imageMatch[1]
                    ? { attachment: { caption: imageMatch[1].trim(), url: imageMatch[2].trim() } }
                    : undefined,
            });
            continue;
        }

        // File attachment: [attachment:name](url)
        const attachmentMatch = trimmed.match(/^\[attachment:(.*?)\]\((.*?)\)$/);
        if (attachmentMatch) {
            blocks.push({
                type: 'file_attachment',
                content: attachmentMatch[2].trim(),
                properties: {
                    attachment: {
                        originalName: attachmentMatch[1].trim(),
                        url: attachmentMatch[2].trim(),
                    },
                },
            });
            continue;
        }

        // Standard text fallback
        blocks.push({ type: 'text', content: line });
    }

    // Flush any open code block
    if (inCodeBlock && codeBuffer.length > 0) {
        const body = codeBuffer.join('\n');
        if (fenceLanguage === 'mermaid') {
            blocks.push({ type: 'mermaid', content: body });
        } else if (fenceLanguage === 'openapi' || fenceLanguage === 'swagger') {
            blocks.push({ type: 'openapi_spec', content: body });
        } else {
            blocks.push({ type: 'code', content: body });
        }
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
                case 'callout': {
                    const variant =
                        (block.properties?.calloutVariant as CalloutVariant | undefined) ?? 'INFO';
                    return `> [!${variant}] ${block.content}`;
                }
                case 'table': {
                    const tableProp = block.properties?.table as
                        | { headers: string[]; rows: string[][] }
                        | undefined;
                    if (tableProp && Array.isArray(tableProp.headers)) {
                        return serializeTableToMarkdown(tableProp);
                    }
                    return block.content;
                }
                case 'mermaid':
                    return `\`\`\`mermaid\n${block.content}\n\`\`\``;
                case 'openapi_spec':
                    return `\`\`\`openapi\n${block.content}\n\`\`\``;
                case 'code':
                    return `\`\`\`\n${block.content}\n\`\`\``;
                case 'divider':
                    return '---';
                case 'image':
                    return `![](${block.content})`;
                case 'file_attachment': {
                    const att = block.properties?.attachment as
                        | { originalName?: string }
                        | undefined;
                    const label = att?.originalName || 'file';
                    return `[attachment:${label}](${block.content})`;
                }
                case 'internal_link': {
                    const link = block.properties?.internalLink as
                        | { targetType?: string; targetUuid?: string; targetTitle?: string }
                        | undefined;
                    if (link?.targetUuid) {
                        return `[[${link.targetType || 'document'}:${link.targetUuid}|${
                            link.targetTitle || block.content
                        }]]`;
                    }
                    return `[[${block.content}]]`;
                }
                default:
                    return block.content;
            }
        })
        .join('\n\n');
}
