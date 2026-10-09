import { useState, useCallback, type FormEvent, type ChangeEvent } from 'react';
import { useCreateWorkspaceService } from '@features/workspaces/manager/services/workspace.service';
import {
    WORKSPACE_FORM_INITIAL_STATE,
    WORKSPACE_MESSAGES,
} from '@features/workspaces/manager/constants/workspace.constants';
import type { WorkspaceFormState } from '@features/workspaces/manager/types/workspace.types';
import type { AppError } from '@http-error/http-error.handler';

interface UseCreateWorkspaceFormParams {
    onSuccess?: () => void;
}

/**
 * Encapsulates the create-workspace form state, validation and submission flow.
 */
export function useCreateWorkspaceForm({ onSuccess }: UseCreateWorkspaceFormParams = {}) {
    const createWorkspaceMutation = useCreateWorkspaceService();

    const [formState, setFormState] = useState<WorkspaceFormState>(WORKSPACE_FORM_INITIAL_STATE);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormState((prev) => ({ ...prev, name: value }));
        setErrorMessage(null);
    }, []);

    const handleDescriptionChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormState((prev) => ({ ...prev, description: value }));
        setErrorMessage(null);
    }, []);

    const reset = useCallback(() => {
        setFormState(WORKSPACE_FORM_INITIAL_STATE);
        setErrorMessage(null);
    }, []);

    const handleSubmit = useCallback(
        async (e?: FormEvent) => {
            if (e) {
                e.preventDefault();
            }

            const name = formState.name.trim();
            const description = formState.description.trim();

            if (!name) {
                setErrorMessage(WORKSPACE_MESSAGES.NAME_REQUIRED);
                return;
            }

            setErrorMessage(null);

            try {
                await createWorkspaceMutation.mutateAsync({
                    name,
                    description: description || undefined,
                });

                reset();
                onSuccess?.();
            } catch (err) {
                const appError = err as AppError;
                const errorDetail =
                    appError?.errors?.[0]?.detail ||
                    appError?.errors?.[0]?.title ||
                    appError?.message ||
                    WORKSPACE_MESSAGES.CREATE_ERROR;

                setErrorMessage(errorDetail);
            }
        },
        [createWorkspaceMutation, formState.name, formState.description, onSuccess, reset]
    );

    return {
        formState,
        errorMessage,
        isSubmitting: createWorkspaceMutation.isPending,
        handleNameChange,
        handleDescriptionChange,
        handleSubmit,
        reset,
    };
}

export type CreateWorkspaceFormController = ReturnType<typeof useCreateWorkspaceForm>;
