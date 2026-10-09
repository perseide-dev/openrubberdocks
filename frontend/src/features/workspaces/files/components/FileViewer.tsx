import { Box, Checkbox, Divider } from '@mui/material';
import type { WorkspaceBlock } from '@features/workspaces/files/types/block.types';

interface FileViewerProps {
    blocks: WorkspaceBlock[];
}

interface BlockProperties {
    text?: unknown;
    checked?: unknown;
}

function getTextFromProperties(props: Record<string, unknown> | null): string {
    if (!props) return '';
    const text = (props as BlockProperties).text;
    return typeof text === 'string' ? text : '';
}

function getCheckedFromProperties(props: Record<string, unknown> | null): boolean {
    if (!props) return false;
    const checked = (props as BlockProperties).checked;
    return typeof checked === 'boolean' ? checked : false;
}

export function FileViewer({ blocks }: FileViewerProps) {
    const sorted = [...blocks].sort((a, b) => a.orderIndex - b.orderIndex);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {sorted.map((block) => {
                if (block.type === 'divider') {
                    return <Divider key={block.uuid} sx={{ marginY: 1.5 }} />;
                }
                const text = getTextFromProperties(block.properties);
                if (block.type === 'todo') {
                    const checked = getCheckedFromProperties(block.properties);
                    return (
                        <Box key={block.uuid} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <Checkbox size="small" checked={checked} disabled />
                            <Box sx={{ textDecoration: checked ? 'line-through' : 'none', opacity: checked ? 0.6 : 1 }}>
                                {text}
                            </Box>
                        </Box>
                    );
                }
                return (
                    <Box key={block.uuid} sx={{ padding: 1 }}>
                        {text}
                    </Box>
                );
            })}
        </Box>
    );
}
