import { useEffect, useId, useState } from 'react';
import mermaid from 'mermaid';
import {
    Alert,
    Box,
    Button,
    Chip,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import { MERMAID_PRESETS } from '@features-workspaces/files/constants/block.constants';
import type { RichBlockSharedProps } from '@features-workspaces/files/types/block.types';

let mermaidInitialized = false;

function ensureMermaidInitialized() {
    if (mermaidInitialized) return;
    mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'neutral',
        fontFamily: '"Space Mono", monospace',
    });
    mermaidInitialized = true;
}

export function MermaidBlockView({
    block,
    readOnly = false,
    onChangeContent,
}: RichBlockSharedProps) {
    const reactId = useId().replace(/[^a-zA-Z0-9]/g, '');
    const [showSource, setShowSource] = useState(!readOnly);
    const [svgMarkup, setSvgMarkup] = useState<string>('');
    const [renderError, setRenderError] = useState<string | null>(null);

    const diagramSource = (block.content || '').trim() || MERMAID_PRESETS.architecture.code;

    useEffect(() => {
        ensureMermaidInitialized();
        let cancelled = false;

        const renderDiagram = async () => {
            try {
                const uniqueRenderId = `mermaid_${reactId}_${Date.now()}`;
                const { svg } = await mermaid.render(uniqueRenderId, diagramSource);
                if (!cancelled) {
                    setSvgMarkup(svg);
                    setRenderError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    setRenderError(
                        err instanceof Error
                            ? err.message
                            : 'Invalid Mermaid diagram syntax.',
                    );
                }
            }
        };

        void renderDiagram();
        return () => {
            cancelled = true;
        };
    }, [diagramSource, reactId]);

    return (
        <Paper
            variant="outlined"
            sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, padding: 1.5, width: '100%' }}
        >
            {!readOnly && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 1,
                    }}
                >
                    <Chip
                        size="small"
                        variant="outlined"
                        icon={<AccountTreeOutlinedIcon fontSize="small" />}
                        label="// BLOCK: MERMAID DIAGRAM"
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                        {Object.entries(MERMAID_PRESETS).map(([key, preset]) => (
                            <Button
                                key={key}
                                size="small"
                                variant="outlined"
                                onClick={() => onChangeContent?.(preset.code)}
                            >
                                + {preset.label.toUpperCase()}
                            </Button>
                        ))}
                        <Button
                            size="small"
                            variant={showSource ? 'contained' : 'outlined'}
                            onClick={() => setShowSource((prev) => !prev)}
                        >
                            {showSource ? 'HIDE SOURCE' : 'EDIT SOURCE'}
                        </Button>
                    </Box>
                </Box>
            )}

            {!readOnly && showSource && (
                <TextField
                    multiline
                    minRows={4}
                    fullWidth
                    label="// MERMAID DSL SOURCE"
                    placeholder={MERMAID_PRESETS.architecture.code}
                    value={block.content}
                    onChange={(e) => onChangeContent?.(e.target.value)}
                />
            )}

            {renderError ? (
                <Alert severity="warning" variant="outlined">
                    <Typography variant="caption">// MERMAID_SYNTAX_ERROR: {renderError}</Typography>
                </Alert>
            ) : svgMarkup ? (
                <Box
                    sx={{
                        width: '100%',
                        overflowX: 'auto',
                        display: 'flex',
                        justifyContent: 'center',
                        padding: 1,
                    }}
                    dangerouslySetInnerHTML={{ __html: svgMarkup }}
                />
            ) : (
                <Typography variant="caption" color="text.secondary">
                    // RENDERING_DIAGRAM...
                </Typography>
            )}
        </Paper>
    );
}
