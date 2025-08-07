
import React, { useState, useRef, useEffect } from 'react';
import type { Session } from '@supabase/gotrue-js';
import { LogoIcon, GoogleIcon, LogoutIcon, BookOpenIcon, ArchiveIcon, DatabaseIcon, ChevronDownIcon, FileZipIcon } from '@/components/icons';

interface HeaderProps {
    session: Session | null;
    onLogin: () => void;
    onLogout: () => void;
    isAuthEnabled: boolean;
    onOpenGuide: () => void;
    onDownloadStandaloneHtml: () => void;
    onDownloadSaaSProjectHtml: () => void;
    onDownloadStandaloneZip: () => void;
    onDownloadSaaSZip: () => void;
}

export const Header: React.FC<HeaderProps> = ({ session, onLogin, onLogout, isAuthEnabled, onOpenGuide, onDownloadStandaloneHtml, onDownloadSaaSProjectHtml, onDownloadStandaloneZip, onDownloadSaaSZip }) => {
    const userName = session?.user?.user_metadata?.full_name || session?.user?.email;
    const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
    const downloadMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
                setIsDownloadMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const renderAuthButton = () => {
        if (!isAuthEnabled) {
            return (
                <div className="relative group">
                    <button disabled className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-500 font-medium rounded-lg border border-gray-300 cursor-not-allowed">
                        <GoogleIcon className="w-5 h-5" />
                        <span>Login Indisponível</span>
                    </button>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Configuração ausente
                    </div>
                </div>
            );
        }

        if (session) {
            return (
                <>
                    <span className="text-sm text-gray-600 hidden sm:block">Olá, {userName}</span>
                    <button onClick={onLogout} className="flex items-center gap-2 p-2 text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors rounded-md" aria-label="Logout">
                        <LogoutIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Sair</span>
                    </button>
                </>
            );
        }

        return (
            <button onClick={onLogin} className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200 shadow-sm" aria-label="Login com Google">
                <GoogleIcon className="w-5 h-5" />
                <span>Login com Google</span>
            </button>
        );
    };

    return (
        <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-30 border-b border-gray-200">
            <div className="container mx-auto px-4 sm:px-6 md:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <LogoIcon className="w-8 h-8 text-purple-600" />
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
                            Insta<span className="text-purple-600">Style</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative" ref={downloadMenuRef}>
                            <button
                                onClick={() => setIsDownloadMenuOpen(prev => !prev)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                                aria-label="Baixar o Projeto"
                                aria-haspopup="true"
                                aria-expanded={isDownloadMenuOpen}
                            >
                               <ArchiveIcon className="w-5 h-5"/>
                               <span className="hidden sm:inline">Baixar Projeto</span>
                               <ChevronDownIcon className={`w-4 h-4 transition-transform ${isDownloadMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isDownloadMenuOpen && (
                                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-40">
                                     <div className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase">Standalone</div>
                                    <button
                                        onClick={() => { onDownloadStandaloneHtml(); setIsDownloadMenuOpen(false); }}
                                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <ArchiveIcon className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <p className="font-semibold">Arquivo (HTML)</p>
                                            <p className="text-xs text-gray-500">Versão simples, para visualização.</p>
                                        </div>
                                    </button>
                                     <button
                                        onClick={() => { onDownloadStandaloneZip(); setIsDownloadMenuOpen(false); }}
                                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <FileZipIcon className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <p className="font-semibold">Projeto (ZIP)</p>
                                            <p className="text-xs text-gray-500">Estrutura completa para deploy.</p>
                                        </div>
                                    </button>
                                    <div className="my-1 h-px bg-gray-200" />
                                    <div className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase">SaaS com Banco de Dados</div>
                                    <button
                                        onClick={() => { onDownloadSaaSProjectHtml(); setIsDownloadMenuOpen(false); }}
                                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <DatabaseIcon className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <p className="font-semibold">Arquivo (HTML)</p>
                                            <p className="text-xs text-gray-500">Versão para VPS com guia.</p>
                                        </div>
                                    </button>
                                     <button
                                        onClick={() => { onDownloadSaaSZip(); setIsDownloadMenuOpen(false); }}
                                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <FileZipIcon className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <p className="font-semibold">Projeto (ZIP)</p>
                                            <p className="text-xs text-gray-500">Estrutura completa para VPS.</p>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="h-6 w-px bg-gray-200" aria-hidden="true"></div>
                        <button onClick={onOpenGuide} className="flex items-center gap-2 p-2 text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors rounded-md" aria-label="Abrir Guia de Prototipagem">
                            <BookOpenIcon className="w-5 h-5"/>
                            <span className="hidden sm:inline">Guia</span>
                        </button>
                        <div className="h-6 w-px bg-gray-200" aria-hidden="true"></div>
                        {renderAuthButton()}
                    </div>
                </div>
            </div>
        </header>
    );
};