import { useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import ApiOutlinedIcon from '@mui/icons-material/ApiOutlined';
import { DEFAULT_OPENAPI_SPEC_SAMPLE } from '@features-workspaces/files/constants/block.constants';
import { parseOpenApiSpec } from '@features-workspaces/files/utils/openapi-parser.utils';
import type { RichBlockSharedProps } from '@features-workspaces/files/types/block.types';

function getMethodChipColor(
    method: string,
): 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default' {
    switch (method.toUpperCase()) {
        case 'GET':
            return 'info';
        case 'POST':
            return 'success';
        case 'PUT':
        case 'PATCH':
            return 'warning';
        case 'DELETE':
            return 'error';
        default:
            return 'default';
    }
}

export function OpenApiBlockView({
    block,
    readOnly = false,
    onChangeContent,
}: RichBlockSharedProps) {
    const [showEditor, setShowEditor] = useState(!readOnly && !block.content.trim());
    const [expandedEndpoints, setExpandedEndpoints] = useState<Record<string, boolean>>({});

    const effectiveContent = block.content.trim() || DEFAULT_OPENAPI_SPEC_SAMPLE;
    const { spec, error } = useMemo(
        () => parseOpenApiSpec(effectiveContent),
        [effectiveContent],
    );

    const toggleEndpoint = (endpointId: string) => {
        setExpandedEndpoints((prev) => ({
            ...prev,
            [endpointId]: !prev[endpointId],
        }));
    };

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
                        icon={<ApiOutlinedIcon fontSize="small" />}
                        label="// BLOCK: OPENAPI / JSON:API SPEC"
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onChangeContent?.(DEFAULT_OPENAPI_SPEC_SAMPLE)}
                        >
                            LOAD SAMPLE SPEC
                        </Button>
                        <Button
                            size="small"
                            variant={showEditor ? 'contained' : 'outlined'}
                            onClick={() => setShowEditor((prev) => !prev)}
                        >
                            {showEditor ? 'HIDE YAML/JSON' : 'EDIT YAML/JSON'}
                        </Button>
                    </Box>
                </Box>
            )}

            {!readOnly && showEditor && (
                <TextField
                    multiline
                    minRows={8}
                    fullWidth
                    label="// OPENAPI 3.X SCHEMA (YAML OR JSON)"
                    placeholder={DEFAULT_OPENAPI_SPEC_SAMPLE}
                    value={block.content}
                    onChange={(e) => onChangeContent?.(e.target.value)}
                />
            )}

            {error && (
                <Alert severity="error" variant="outlined">
                    <Typography variant="caption">// OPENAPI_PARSE_ERROR: {error}</Typography>
                </Alert>
            )}

            {spec && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 1,
                        }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                            <Typography variant="subtitle1">{spec.title}</Typography>
                            {spec.description && (
                                <Typography variant="caption" color="text.secondary">
                                    {spec.description}
                                </Typography>
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip size="small" variant="outlined" label={`v${spec.version}`} />
                            {spec.servers[0] && (
                                <Chip size="small" variant="outlined" label={spec.servers[0]} />
                            )}
                        </Box>
                    </Box>

                    <Divider />

                    {spec.endpoints.length === 0 ? (
                        <Typography variant="caption" color="text.secondary">
                            // NO_PATHS_DEFINED_IN_SPEC
                        </Typography>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {spec.endpoints.map((ep) => {
                                const isExpanded = Boolean(expandedEndpoints[ep.id]);
                                return (
                                    <Paper
                                        key={ep.id}
                                        variant="outlined"
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1,
                                            padding: 1.25,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                flexWrap: 'wrap',
                                                gap: 1,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    flexWrap: 'wrap',
                                                }}
                                            >
                                                <Chip
                                                    size="small"
                                                    color={getMethodChipColor(ep.method)}
                                                    label={ep.method}
                                                />
                                                <Typography variant="subtitle2">
                                                    {ep.path}
                                                </Typography>
                                                {ep.summary && (
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        — {ep.summary}
                                                    </Typography>
                                                )}
                                            </Box>

                                            <Button
                                                size="small"
                                                variant="text"
                                                onClick={() => toggleEndpoint(ep.id)}
                                            >
                                                {isExpanded ? 'COLLAPSE' : 'INSPECT CONTRACT'}
                                            </Button>
                                        </Box>

                                        {isExpanded && (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 1.25,
                                                    paddingTop: 0.5,
                                                }}
                                            >
                                                {ep.description && (
                                                    <Typography variant="body2">
                                                        {ep.description}
                                                    </Typography>
                                                )}

                                                {ep.parameters.length > 0 && (
                                                    <TableContainer>
                                                        <Table size="small">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell>PARAM</TableCell>
                                                                    <TableCell>IN</TableCell>
                                                                    <TableCell>TYPE</TableCell>
                                                                    <TableCell>REQUIRED</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {ep.parameters.map((param) => (
                                                                    <TableRow
                                                                        key={`${ep.id}-${param.in}-${param.name}`}
                                                                    >
                                                                        <TableCell>
                                                                            {param.name}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {param.in}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {param.type}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {param.required
                                                                                ? 'YES'
                                                                                : 'NO'}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                )}

                                                {ep.requestBodyPreview && (
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: 0.5,
                                                        }}
                                                    >
                                                        <Typography variant="caption">
                                                            // REQUEST_BODY_SCHEMA:
                                                        </Typography>
                                                        <Paper
                                                            variant="outlined"
                                                            sx={{ padding: 1, overflowX: 'auto' }}
                                                        >
                                                            <Typography
                                                                component="pre"
                                                                variant="caption"
                                                                sx={{ margin: 0 }}
                                                            >
                                                                {ep.requestBodyPreview}
                                                            </Typography>
                                                        </Paper>
                                                    </Box>
                                                )}

                                                {ep.responses.length > 0 && (
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: 0.5,
                                                        }}
                                                    >
                                                        <Typography variant="caption">
                                                            // RESPONSES:
                                                        </Typography>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                flexWrap: 'wrap',
                                                                gap: 1,
                                                            }}
                                                        >
                                                            {ep.responses.map((resp) => (
                                                                <Chip
                                                                    key={`${ep.id}-resp-${resp.statusCode}`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    label={`HTTP ${resp.statusCode}: ${
                                                                        resp.description || 'OK'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Box>
                                        )}
                                    </Paper>
                                );
                            })}
                        </Box>
                    )}
                </Box>
            )}
        </Paper>
    );
}
