import {
    Alert,
    AlertTitle,
    Box,
    Button,
    InputBase,
    Typography,
} from '@mui/material';
import { CALLOUT_VARIANTS } from '@features-workspaces/files/constants/block.constants';
import type {
    CalloutVariant,
    RichBlockSharedProps,
} from '@features-workspaces/files/types/block.types';

function mapCalloutVariantToSeverity(
    variant: CalloutVariant,
): 'info' | 'warning' | 'error' | 'success' {
    switch (variant) {
        case 'WARNING':
            return 'warning';
        case 'DANGER':
            return 'error';
        case 'SUCCESS':
            return 'success';
        case 'INFO':
        default:
            return 'info';
    }
}

export function CalloutBlockView({
    block,
    readOnly = false,
    onChangeContent,
    onUpdateProperties,
}: RichBlockSharedProps) {
    const activeVariant =
        (block.properties?.calloutVariant as CalloutVariant | undefined) ?? 'INFO';
    const severity = mapCalloutVariantToSeverity(activeVariant);

    const handleSelectVariant = (variant: CalloutVariant) => {
        onUpdateProperties?.({ calloutVariant: variant });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
            {!readOnly && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                    {CALLOUT_VARIANTS.map((variant) => (
                        <Button
                            key={variant}
                            size="small"
                            variant={activeVariant === variant ? 'contained' : 'outlined'}
                            onClick={() => handleSelectVariant(variant)}
                        >
                            // {variant}
                        </Button>
                    ))}
                </Box>
            )}

            <Alert severity={severity} variant="outlined" sx={{ width: '100%' }}>
                <AlertTitle>// {activeVariant}</AlertTitle>
                {readOnly ? (
                    <Typography variant="body2">{block.content}</Typography>
                ) : (
                    <InputBase
                        multiline
                        fullWidth
                        value={block.content}
                        placeholder="Write semantic callout alert details..."
                        onChange={(e) => onChangeContent?.(e.target.value)}
                    />
                )}
            </Alert>
        </Box>
    );
}
