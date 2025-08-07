import React, { useState } from 'react';
import { HistoryIcon, LoaderIcon, TrashIcon } from '@/components/icons';
import type { HistoryItem } from '@/types';

interface HistorySidebarProps {
    history: HistoryItem[];
    isLoading: boolean;
    currentProjectId: string | null;
    onLoadProject: (project: HistoryItem) => void;
    onDeleteProject: (projectId: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, isLoading, currentProjectId, onLoadProject, onDeleteProject }) => {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDeleteClick = (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation();
        if (window.confirm('Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.')) {
            setDeletingId(projectId);
            onDeleteProject(projectId);
        }
    };

    const sortedHistory = [...history].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return (
        <aside className="bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col h-full max-h-[calc(100vh-10rem)] animate-slide-in-left">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200 mb-3">
                <HistoryIcon className="w-6 h-6 text-purple-600" />
                <h2 className="text-lg font-bold text-gray-800">Histórico de Projetos</h2>
            </div>
            {isLoading ? (
                <div className="flex-grow flex items-center justify-center">
                    <LoaderIcon className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
            ) : sortedHistory.length === 0 ? (
                <div className="flex-grow flex items-center justify-center text-center">
                    <p className="text-sm text-gray-500">Seus projetos salvos aparecerão aqui.</p>
                </div>
            ) : (
                <ul className="space-y-2 overflow-y-auto flex-grow -mr-2 pr-2">
                    {sortedHistory.map(item => (
                        <li key={item.id}>
                            <button
                                onClick={() => onLoadProject(item)}
                                disabled={deletingId === item.id}
                                className={`w-full text-left p-3 rounded-lg transition-colors group relative ${
                                    currentProjectId === item.id 
                                        ? 'bg-purple-100 text-purple-800' 
                                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                }`}
                            >
                                <p className="font-semibold text-sm truncate">{item.project_name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {new Date(item.updated_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <button
                                    onClick={(e) => handleDeleteClick(e, item.id)}
                                    disabled={deletingId === item.id}
                                    className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 rounded-md text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all"
                                    aria-label="Excluir projeto"
                                >
                                    {deletingId === item.id ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <TrashIcon className="w-4 h-4" />}
                                </button>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    );
};
