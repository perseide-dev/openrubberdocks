import { useCallback } from 'react';
import {
    useCreateProjectStatusService,
    useDeleteProjectStatusService,
    useCreateProjectTypeService,
    useDeleteProjectTypeService,
    useCreateProjectPropertyService,
    useDeleteProjectPropertyService,
} from '@features-workspaces/projects/services/project.service';
import type {
    CreateTaskStatusPayload,
    CreateTaskTypePayload,
    CreateTaskPropertyPayload,
} from '@features-workspaces/projects/types/project.types';

export function useProjectSettings(projectUuid: string) {
    const createStatusMutation = useCreateProjectStatusService();
    const deleteStatusMutation = useDeleteProjectStatusService();
    const createTypeMutation = useCreateProjectTypeService();
    const deleteTypeMutation = useDeleteProjectTypeService();
    const createPropertyMutation = useCreateProjectPropertyService();
    const deletePropertyMutation = useDeleteProjectPropertyService();

    const handleCreateStatus = useCallback(
        async (payload: CreateTaskStatusPayload) => {
            await createStatusMutation.mutateAsync({ projectUuid, payload });
        },
        [projectUuid, createStatusMutation],
    );

    const handleDeleteStatus = useCallback(
        async (statusUuid: string) => {
            await deleteStatusMutation.mutateAsync({ projectUuid, statusUuid });
        },
        [projectUuid, deleteStatusMutation],
    );

    const handleCreateType = useCallback(
        async (payload: CreateTaskTypePayload) => {
            await createTypeMutation.mutateAsync({ projectUuid, payload });
        },
        [projectUuid, createTypeMutation],
    );

    const handleDeleteType = useCallback(
        async (typeUuid: string) => {
            await deleteTypeMutation.mutateAsync({ projectUuid, typeUuid });
        },
        [projectUuid, deleteTypeMutation],
    );

    const handleCreateProperty = useCallback(
        async (payload: CreateTaskPropertyPayload) => {
            await createPropertyMutation.mutateAsync({ projectUuid, payload });
        },
        [projectUuid, createPropertyMutation],
    );

    const handleDeleteProperty = useCallback(
        async (propUuid: string) => {
            await deletePropertyMutation.mutateAsync({ projectUuid, propUuid });
        },
        [projectUuid, deletePropertyMutation],
    );

    return {
        handleCreateStatus,
        handleDeleteStatus,
        handleCreateType,
        handleDeleteType,
        handleCreateProperty,
        handleDeleteProperty,
        isSubmitting:
            createStatusMutation.isPending ||
            deleteStatusMutation.isPending ||
            createTypeMutation.isPending ||
            deleteTypeMutation.isPending ||
            createPropertyMutation.isPending ||
            deletePropertyMutation.isPending,
    };
}
