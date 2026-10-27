import { useState, useCallback } from 'react';
import { useCreateWorkspaceForm } from '@features/workspaces/manager/hooks/useCreateWorkspaceForm';

/**
 * View controller hook for the create-workspace drawer.
 * Owns the open/close state and composes the form logic, closing the drawer on success.
 */
export function useCreateWorkspaceDrawer() {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = useCallback(() => {
        setIsOpen(true);
    }, []);

    const form = useCreateWorkspaceForm({ onSuccess: () => setIsOpen(false) });
    const { reset } = form;

    const handleClose = useCallback(() => {
        reset();
        setIsOpen(false);
    }, [reset]);

    return {
        isOpen,
        handleOpen,
        handleClose,
        form,
    };
}
