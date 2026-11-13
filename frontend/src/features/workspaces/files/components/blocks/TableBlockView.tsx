import { useState } from 'react';
import {
    Box,
    Button,
    Chip,
    InputBase,
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
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import {
    parseMarkdownTable,
    serializeTableToMarkdown,
} from '@features-workspaces/files/utils/table-markdown.utils';
import type {
    RichBlockSharedProps,
    TableBlockData,
} from '@features-workspaces/files/types/block.types';

export function TableBlockView({
    block,
    readOnly = false,
    onUpdateProperties,
}: RichBlockSharedProps) {
    const [rawMarkdownMode, setRawMarkdownMode] = useState(false);

    const tableData: TableBlockData =
        block.properties?.table &&
        Array.isArray((block.properties.table as TableBlockData).headers)
            ? (block.properties.table as TableBlockData)
            : parseMarkdownTable(block.content);

    const syncTable = (nextTable: TableBlockData) => {
        const nextMd = serializeTableToMarkdown(nextTable);
        onUpdateProperties?.({ table: nextTable }, nextMd);
    };

    const handleHeaderChange = (colIdx: number, value: string) => {
        const nextHeaders = tableData.headers.map((h, i) => (i === colIdx ? value : h));
        syncTable({ headers: nextHeaders, rows: tableData.rows });
    };

    const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
        const nextRows = tableData.rows.map((row, rIdx) =>
            rIdx === rowIdx
                ? row.map((cell, cIdx) => (cIdx === colIdx ? value : cell))
                : row,
        );
        syncTable({ headers: tableData.headers, rows: nextRows });
    };

    const handleAddColumn = () => {
        const nextColIndex = tableData.headers.length + 1;
        const nextHeaders = [...tableData.headers, `COL_${nextColIndex}`];
        const nextRows = tableData.rows.map((row) => [...row, '']);
        syncTable({ headers: nextHeaders, rows: nextRows });
    };

    const handleRemoveColumn = () => {
        if (tableData.headers.length <= 1) return;
        const nextHeaders = tableData.headers.slice(0, -1);
        const nextRows = tableData.rows.map((row) => row.slice(0, -1));
        syncTable({ headers: nextHeaders, rows: nextRows });
    };

    const handleAddRow = () => {
        const emptyRow = tableData.headers.map(() => '');
        syncTable({ headers: tableData.headers, rows: [...tableData.rows, emptyRow] });
    };

    const handleRemoveRow = () => {
        if (tableData.rows.length <= 1) return;
        syncTable({ headers: tableData.headers, rows: tableData.rows.slice(0, -1) });
    };

    const handleRawMarkdownChange = (rawMd: string) => {
        const parsed = parseMarkdownTable(rawMd);
        onUpdateProperties?.({ table: parsed }, rawMd);
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
                        icon={<TableChartOutlinedIcon fontSize="small" />}
                        label={`// BLOCK: TABLE (${tableData.rows.length}x${tableData.headers.length})`}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                        <Button size="small" variant="outlined" onClick={handleAddRow}>
                            + ROW
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            disabled={tableData.rows.length <= 1}
                            onClick={handleRemoveRow}
                        >
                            - ROW
                        </Button>
                        <Button size="small" variant="outlined" onClick={handleAddColumn}>
                            + COL
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            disabled={tableData.headers.length <= 1}
                            onClick={handleRemoveColumn}
                        >
                            - COL
                        </Button>
                        <Button
                            size="small"
                            variant={rawMarkdownMode ? 'contained' : 'outlined'}
                            onClick={() => setRawMarkdownMode((prev) => !prev)}
                        >
                            {rawMarkdownMode ? 'GRID VIEW' : 'MARKDOWN RAW'}
                        </Button>
                    </Box>
                </Box>
            )}

            {!readOnly && rawMarkdownMode ? (
                <TextField
                    multiline
                    minRows={4}
                    fullWidth
                    label="// GFM MARKDOWN TABLE"
                    value={block.content || serializeTableToMarkdown(tableData)}
                    onChange={(e) => handleRawMarkdownChange(e.target.value)}
                />
            ) : (
                <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                {tableData.headers.map((header, colIdx) => (
                                    <TableCell key={`h-${colIdx}`}>
                                        {readOnly ? (
                                            <Typography variant="subtitle2">{header}</Typography>
                                        ) : (
                                            <InputBase
                                                fullWidth
                                                value={header}
                                                placeholder={`HEADER ${colIdx + 1}`}
                                                onChange={(e) =>
                                                    handleHeaderChange(colIdx, e.target.value)
                                                }
                                            />
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tableData.rows.map((row, rowIdx) => (
                                <TableRow key={`r-${rowIdx}`}>
                                    {tableData.headers.map((_, colIdx) => (
                                        <TableCell key={`c-${rowIdx}-${colIdx}`}>
                                            {readOnly ? (
                                                <Typography variant="body2">
                                                    {row[colIdx] ?? ''}
                                                </Typography>
                                            ) : (
                                                <InputBase
                                                    fullWidth
                                                    value={row[colIdx] ?? ''}
                                                    placeholder="—"
                                                    onChange={(e) =>
                                                        handleCellChange(
                                                            rowIdx,
                                                            colIdx,
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
}
