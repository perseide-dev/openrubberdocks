import { Box, Button, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import type { DocumentTabsBarProps } from '@features-workspaces/files/types/file.types';

export function DocumentTabsBar({
    tabs,
    activeTabUuid,
    onSelectTab,
    onCloseTab,
    onNewTab,
}: DocumentTabsBarProps) {
    if (tabs.length === 0) return null;

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                overflowX: 'auto',
                borderBottom: '2px solid',
                borderColor: 'divider',
                paddingBottom: 0.5,
                '&::-webkit-scrollbar': {
                    height: 4,
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'divider',
                },
            }}
        >
            {tabs.map((tab) => {
                const isActive = tab.uuid === activeTabUuid;

                return (
                    <Box
                        key={tab.uuid}
                        onClick={() => onSelectTab(tab)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            padding: '6px 10px',
                            cursor: 'pointer',
                            border: '1.5px solid',
                            borderColor: isActive ? 'primary.main' : 'divider',
                            backgroundColor: isActive ? 'action.selected' : 'background.paper',
                            color: isActive ? 'text.primary' : 'text.secondary',
                            userSelect: 'none',
                            maxWidth: 200,
                            minWidth: 100,
                            transition: 'all 0.12s ease',
                            '&:hover': {
                                borderColor: isActive ? 'primary.main' : 'text.secondary',
                                backgroundColor: isActive ? 'action.selected' : 'action.hover',
                            },
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '1rem', flexShrink: 0 }}>
                            {tab.icon ? (
                                <span>{tab.icon}</span>
                            ) : (
                                <DescriptionOutlinedIcon sx={{ fontSize: '1rem' }} />
                            )}
                        </Box>

                        <Typography
                            variant="body2"
                            noWrap
                            sx={{
                                fontFamily: '"Space Grotesk", sans-serif',
                                fontWeight: isActive ? 700 : 500,
                                fontSize: '0.85rem',
                                flexGrow: 1,
                            }}
                        >
                            {tab.title || (tab.isNew ? 'Untitled Draft' : 'Untitled')}
                            {tab.mode === 'edit' && !tab.isNew && ' [EDIT]'}
                            {tab.isDirty && ' *'}
                        </Typography>

                        <IconButton
                            size="small"
                            aria-label={`Close ${tab.title}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onCloseTab(tab.uuid);
                            }}
                            sx={{
                                padding: '2px',
                                borderRadius: 0,
                                color: 'text.secondary',
                                '&:hover': {
                                    color: 'error.main',
                                    backgroundColor: 'transparent',
                                },
                            }}
                        >
                            <CloseIcon sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                    </Box>
                );
            })}

            <Button
                size="small"
                variant="outlined"
                onClick={onNewTab}
                startIcon={<AddIcon sx={{ fontSize: '0.9rem' }} />}
                sx={{
                    flexShrink: 0,
                    padding: '4px 8px',
                    fontFamily: '"Space Mono", monospace',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    height: 36,
                }}
            >
                New
            </Button>
        </Box>
    );
}
