import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon, BookOpenIcon } from '@/components/icons';
import { masterPromptText } from '@/lib/styles';

interface GuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(masterPromptText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-title"
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
                    <div className="flex items-center gap-3">
                        <BookOpenIcon className="w-6 h-6 text-purple-600"/>
                        <h2 id="guide-title" className="text-xl font-bold text-gray-800">
                           Guia de Prototipagem no AI Studio
                        </h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        aria-label="Fechar"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </header>

                <main className="p-6 text-gray-600 overflow-y-auto space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Instruções</h3>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>Acesse o Google AI Studio em <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline font-medium">aistudio.google.com</a>.</li>
                            <li>No menu, crie um novo "Freeform prompt".</li>
                            <li>Copie o "Prompt Mestre" abaixo e cole na área de texto principal.</li>
                            <li>Na área de chat, inicie a conversa com sua ideia para o post.</li>
                            <li>Analise o resultado: a IA irá gerar a imagem e o conteúdo em JSON.</li>
                        </ol>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">📝 Prompt Mestre para o AI Studio</h3>
                             <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-200 transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <CheckIcon className="w-4 h-4 text-green-600"/> 
                                        <span>Copiado!</span>
                                    </>
                                ) : (
                                    <>
                                        <ClipboardIcon className="w-4 h-4"/>
                                        <span>Copiar</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <pre className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap break-words max-h-60 overflow-y-auto">
                            <code>{masterPromptText}</code>
                        </pre>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">🚀 Exemplo de Uso</h3>
                        <p className="mb-2">Depois de colar o prompt, use o campo de chat para enviar sua solicitação. Por exemplo:</p>
                        <pre className="bg-gray-900 text-white p-4 rounded-lg text-sm whitespace-pre-wrap break-words">
                            <code>
                                Vamos criar um post.<br/><br/>
                                - <b>Descrição da Imagem:</b> "Um gato estiloso usando óculos de sol e uma jaqueta de couro, sentado em um café em Paris."<br/>
                                - <b>Estilos da Imagem:</b> "Fotorrealista (70%), Cinematico (30%)"<br/>
                                - <b>Estilo do Conteúdo:</b> "Descolado e Engraçado"
                            </code>
                        </pre>
                    </div>
                </main>
            </div>
        </div>
    );
};