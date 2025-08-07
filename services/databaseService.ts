import { supabase } from './supabaseClient';
import type { ProjectState, HistoryItem } from '@/types';

/**
 * Saves or updates a project in the database.
 * If projectState.id is null, it creates a new project.
 * If projectState.id exists, it updates the existing project.
 * @param projectState - The complete state of the project to save.
 * @returns The ID of the saved or updated project.
 */
export async function saveProject(projectState: ProjectState): Promise<string | null> {
    if (!supabase || !projectState.userId) {
        console.warn("Database service not available or user not logged in. Skipping save.");
        return null;
    }

    const { id, userId, projectName, ...stateToSave } = projectState;

    const projectData = {
        user_id: userId,
        project_name: projectName,
        project_state: stateToSave,
        updated_at: new Date().toISOString(), // Manually set for upsert
    };

    if (id) {
        // --- UPDATE existing project ---
        const { data, error } = await supabase
            .from('projects')
            .update({ 
                project_name: projectData.project_name,
                project_state: projectData.project_state,
                updated_at: projectData.updated_at,
             })
            .eq('id', id)
            .eq('user_id', userId)
            .select('id')
            .single();

        if (error) {
            console.error('Error updating project:', error);
            throw new Error('Falha ao atualizar o projeto no banco de dados.');
        }
        return data?.id || null;

    } else {
        // --- INSERT new project ---
        const { data, error } = await supabase
            .from('projects')
            .insert(projectData)
            .select('id')
            .single();
        
        if (error) {
            console.error('Error creating project:', error);
            throw new Error('Falha ao criar o projeto no banco de dados.');
        }
        return data?.id || null;
    }
}

/**
 * Fetches the project history for a given user.
 * @param userId - The UUID of the user.
 * @returns An array of HistoryItem objects.
 */
export async function getHistory(userId: string): Promise<HistoryItem[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching history:', error);
        throw new Error('Falha ao buscar o histórico de projetos.');
    }

    return data as HistoryItem[];
}

/**
 * Deletes a project from the database.
 * @param projectId - The UUID of the project to delete.
 * @param userId - The UUID of the user, for security verification via RLS.
 */
export async function deleteProject(projectId: string, userId: string): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', userId); // RLS handles this, but explicit check doesn't hurt

    if (error) {
        console.error('Error deleting project:', error);
        throw new Error('Falha ao deletar o projeto.');
    }
}
