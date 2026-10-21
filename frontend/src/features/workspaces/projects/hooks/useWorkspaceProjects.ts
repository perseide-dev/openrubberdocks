import { useState, useMemo, useCallback } from 'react';
import {
    useWorkspaceProjectsService,
    useCreateProjectService,
    useDeleteProjectService,
} from '@features-workspaces/projects/services/project.service';
import type {
    Project,
    CreateProjectPayload,
} from '@features-workspaces/projects/types/project.types';

export function useWorkspaceProjects(workspaceUuid: string) {
    const { data: projects = [], isLoading, isError } = useWorkspaceProjectsService(workspaceUuid);
    const createProjectMutation = useCreateProjectService();
    const deleteProjectMutation = useDeleteProjectService(workspaceUuid);

    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

    const filteredProjects = useMemo(() => {
        if (!searchQuery.trim()) return projects;
        const q = searchQuery.toLowerCase();
        return projects.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                (p.description && p.description.toLowerCase().includes(q)),
        );
    }, [projects, searchQuery]);

    const handleCreateProject = useCallback(
        async (payload: CreateProjectPayload) => {
            await createProjectMutation.mutateAsync(payload);
            setIsCreateModalOpen(false);
        },
        [createProjectMutation],
    );

    const handleDeleteProject = useCallback(async () => {
        if (!projectToDelete) return;
        await deleteProjectMutation.mutateAsync(projectToDelete.uuid);
        setProjectToDelete(null);
    }, [projectToDelete, deleteProjectMutation]);

    return {
        projects: filteredProjects,
        totalCount: projects.length,
        isLoading,
        isError,
        searchQuery,
        setSearchQuery,
        isCreateModalOpen,
        setIsCreateModalOpen,
        projectToDelete,
        setProjectToDelete,
        handleCreateProject,
        handleDeleteProject,
        isCreating: createProjectMutation.isPending,
        isDeleting: deleteProjectMutation.isPending,
    };
}
