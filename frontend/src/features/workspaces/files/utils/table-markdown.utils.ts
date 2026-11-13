import { DEFAULT_TABLE_DATA } from '@features-workspaces/files/constants/block.constants';
import type { TableBlockData } from '@features-workspaces/files/types/block.types';

function splitMarkdownTableRow(rowLine: string): string[] {
    const trimmed = rowLine.trim().replace(/^\|/, '').replace(/\|$/, '');
    return trimmed.split('|').map((cell) => cell.trim());
}

function isSeparatorRow(rowLine: string): boolean {
    const cells = splitMarkdownTableRow(rowLine);
    return cells.length > 0 && cells.every((c) => /^:?-{2,}:?$/.test(c));
}

export function parseMarkdownTable(markdown: string): TableBlockData {
    const lines = markdown
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    if (lines.length === 0) {
        return {
            headers: [...DEFAULT_TABLE_DATA.headers],
            rows: DEFAULT_TABLE_DATA.rows.map((r) => [...r]),
        };
    }

    const headers = splitMarkdownTableRow(lines[0]);
    const colCount = Math.max(1, headers.length);
    const startIdx = lines.length > 1 && isSeparatorRow(lines[1]) ? 2 : 1;

    const rows: string[][] = [];
    for (let i = startIdx; i < lines.length; i += 1) {
        if (isSeparatorRow(lines[i])) continue;
        const parsedRow = splitMarkdownTableRow(lines[i]);
        const normalizedRow = Array.from({ length: colCount }, (_, colIdx) => parsedRow[colIdx] ?? '');
        rows.push(normalizedRow);
    }

    if (rows.length === 0) {
        rows.push(Array.from({ length: colCount }, () => ''));
    }

    return { headers, rows };
}

export function serializeTableToMarkdown(table: TableBlockData): string {
    const headers =
        table.headers.length > 0 ? table.headers : [...DEFAULT_TABLE_DATA.headers];
    const colCount = headers.length;
    const escapeCell = (val: string) => (val ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

    const headerLine = `| ${headers.map(escapeCell).join(' | ')} |`;
    const separatorLine = `| ${headers.map(() => '---').join(' | ')} |`;
    const bodyLines = (table.rows.length > 0 ? table.rows : [headers.map(() => '')]).map((row) => {
        const normalized = Array.from(
            { length: colCount },
            (_, idx) => escapeCell(row[idx] ?? ''),
        );
        return `| ${normalized.join(' | ')} |`;
    });

    return [headerLine, separatorLine, ...bodyLines].join('\n');
}

export function formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const exponent = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1,
    );
    const value = bytes / Math.pow(1024, exponent);
    return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}
