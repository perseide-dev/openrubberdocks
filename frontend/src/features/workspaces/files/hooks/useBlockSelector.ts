import { useState, useCallback } from 'react';
import type {
    BlockSelectorMode,
    BlockSelectorRequest,
} from '@features/workspaces/files/types/block.types';

/**
 * Holds the state of the floating block selector (anchor, target block, mode
 * and search query) shared by the inline button and the slash command.
 */
export function useBlockSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [targetBlockId, setTargetBlockId] = useState<string | null>(null);
    const [mode, setMode] = useState<BlockSelectorMode>('insert');
    const [query, setQuery] = useState('');

    const open = useCallback((request: BlockSelectorRequest) => {
        setAnchorEl(request.element);
        setTargetBlockId(request.blockId);
        setMode(request.mode);
        setQuery(request.query);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        setAnchorEl(null);
        setTargetBlockId(null);
        setQuery('');
    }, []);

    return {
        isOpen,
        anchorEl,
        targetBlockId,
        mode,
        query,
        open,
        close,
        setQuery,
    };
}

export type BlockSelectorController = ReturnType<typeof useBlockSelector>;
