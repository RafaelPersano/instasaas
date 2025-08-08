


import React, { useState, useCallback, useEffect } from 'react';
import type { Session } from '@supabase/gotrue-js';
import JSZip from 'jszip';
import { Header } from '@/components/Header';
import { PromptForm } from '@/components/PromptForm'; 
import { SqlViewer } from '@/components/SqlViewer'; 
import { HistorySidebar } from '@/components/HistorySidebar';
import { GuideModal } from '@/components/GuideModal';
import { Notification } from '@/components/Notification';
import { generateImage, generateAdCopy, generateFeatureDescriptions, generateProductConcepts, generateDesignConcepts, generateLandingPageContent, generateBlogPostContent, generatePosterContent } from '@/services/geminiService';
import { saveProject, getHistory, deleteProject } from '@/services/databaseService';
import { supabase } from '@/services/supabaseClient';
import type { GenerateOptions, AdCopy, BrandConcept, PriceData, FeatureDetails, LandingPageContent, BlogPostContent, PosterContent, RegionalityData, ProjectState, HistoryItem } from '@/types';
import { RateLimitError } from '@/lib/errors';


const App: React.FC = () => {
    // --- AUTH & CORE APP STATE ---
    const [session, setSession] = useState<Session | null>(null);
    const [cooldownUntil, setCooldownUntil] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    // --- PROJECT & HISTORY STATE (FOR SAAS) ---
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
    
    // --- GENERATION & CONTENT STATE ---
    const [generatedImagesB64, setGeneratedImagesB64] = useState<string[] | null>(null);
    const [textOverlay, setTextOverlay] = useState<string>('');
    const [compositionId, setCompositionId] = useState<string>('random');
    const [textPosition, setTextPosition] = useState<GenerateOptions['textPosition']>('center');
    const [subtitleOutline, setSubtitleOutline] = useState<GenerateOptions['subtitleOutline']>('auto');
    const [artStylesForFont, setArtStylesForFont] = useState<string[]>([]);
    
    const [currentBasePrompt, setCurrentBasePrompt] = useState<string>('');
    const [currentTheme, setCurrentTheme] = useState<string>('');
    const [brandData, setBrandData] = useState<GenerateOptions['brandData']>({ name: '', slogan: '', weight: 25 });
    const [priceData, setPriceData] = useState<PriceData>({ text: '', modelText: '', style: 'circle', position: 'none', color: 'red'});
    const [regionalityData, setRegionalityData] = useState<RegionalityData>({ country: '', city: '', neighborhood: '', weight: 25 });
    
    const [isConceptLoading, setIsConceptLoading] = useState<boolean>(false);
    const [conceptError, setConceptError] = useState<string | null>(null);
    const [brandConcepts, setBrandConcepts] = useState<BrandConcept[] | null>(null);
    const [currentConcept, setCurrentConcept] = useState<BrandConcept | null>(null);
    const [conceptContext, setConceptContext] = useState<{ basePrompt: string; theme: string; regionalityData: RegionalityData } | null>(null);

    const [featureDetails, setFeatureDetails] = useState<FeatureDetails[] | null>(null);
    const [adCopy, setAdCopy] = useState<AdCopy | null>(null);
    const [isAdCopyLoading, setIsAdCopyLoading] = useState<boolean>(false);
    const [adCopyError, setAdCopyError] = useState<string | null>(null);
    
    const [landingPageContent, setLandingPageContent] = useState<LandingPageContent | null>(null);
    const [blogPostContent, setBlogPostContent] = useState<BlogPostContent | null>(null);
    const [posterContent, setPosterContent] = useState<PosterContent | null>(null);
    const [isTextContentLoading, setIsTextContentLoading] = useState<boolean>(false);
    const [textContentError, setTextContentError] = useState<string | null>(null);
    
    const [isBlogImagesLoading, setIsBlogImagesLoading] = useState<boolean>(false);
    const [blogImagesError, setBlogImagesError] = useState<string | null>(null);
    const [isLandingPageImagesLoading, setIsLandingPageImagesLoading] = useState<boolean>(false);
    const [landingPageImagesError, setLandingPageImagesError] = useState<string | null>(null);
    const [isPosterImagesLoading, setIsPosterImagesLoading] = useState<boolean>(false);
    const [posterImagesError, setPosterImagesError] = useState<string | null>(null);
    
    const isAuthEnabled = !!supabase;
    const triggerCooldown = useCallback((durationMs: number = 60000) => setCooldownUntil(new Date(Date.now() + durationMs)), []);

    // --- AUTH & HISTORY FETCHING ---
    useEffect(() => {
        if (!isAuthEnabled) return;
        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            if (session) {
                setIsHistoryLoading(true);
                try {
                    const userHistory = await getHistory(session.user.id);
                    setHistory(userHistory);
                } catch (err) {
                    console.error("Failed to fetch history:", err);
                    setNotification({ message: "Não foi possível carregar seu histórico de projetos.", type: 'error' });
                } finally {
                    setIsHistoryLoading(false);
                }
            } else {
                setHistory([]);
                setCurrentProjectId(null);
                // Optional: clear workspace when logging out
            }
        });
        return () => authListener.subscription?.unsubscribe();
    }, [isAuthEnabled]);

    // --- LOGIN/LOGOUT HANDLERS ---
    const handleLogin = async () => {
        if (!supabase) return;
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
        if (error) setNotification({ message: 'Falha ao fazer login com o Google.', type: 'error' });
    };
    const handleLogout = async () => {
        if (supabase) await supabase.auth.signOut();
    };

    // --- CORE APP LOGIC ---

    const saveCurrentProject = useCallback(async () => {
        if (!session) return; // Don't save if not logged in

        const projectState: ProjectState = {
            id: currentProjectId, // Can be null for a new project
            userId: session.user.id,
            projectName: currentConcept?.name || conceptContext?.basePrompt || "Novo Projeto",
            // Core generation context
            conceptContext,
            // Main content
            brandConcepts,
            currentConcept,
            generatedImagesB64,
            // Configuration
            textOverlay,
            compositionId,
            textPosition,
            subtitleOutline,
            artStylesForFont,
            brandData,
            priceData,
            regionalityData,
            // Marketing content
            featureDetails,
            adCopy,
            landingPageContent,
            blogPostContent,
            posterContent,
        };
        
        try {
            const savedProjectId = await saveProject(projectState);
            if (savedProjectId) {
                // Update the current project ID if it was a new project
                if (!currentProjectId) {
                    setCurrentProjectId(savedProjectId);
                }
                // Refresh history to show the new/updated project
                const userHistory = await getHistory(session.user.id);
                setHistory(userHistory);
            }
        } catch (err) {
            console.error("Failed to save project:", err);
            setNotification({ message: "Não foi possível salvar seu projeto.", type: 'error' });
        }
    }, [session, currentProjectId, conceptContext, brandConcepts, currentConcept, generatedImagesB64, textOverlay, compositionId, textPosition, subtitleOutline, artStylesForFont, brandData, priceData, regionalityData, featureDetails, adCopy, landingPageContent, blogPostContent, posterContent]);
    
    const handleLoadProject = (project: HistoryItem) => {
        if (!project.project_state) return;
        const state = project.project_state;
        
        setCurrentProjectId(project.id);
        
        // Restore state from loaded project
        setConceptContext(state.conceptContext || null);
        setBrandConcepts(state.brandConcepts || null);
        setCurrentConcept(state.currentConcept || null);
        setGeneratedImagesB64(state.generatedImagesB64 || null);
        setTextOverlay(state.textOverlay || '');
        setCompositionId(state.compositionId || 'random');
        setTextPosition(state.textPosition || 'center');
        setSubtitleOutline(state.subtitleOutline || 'auto');
        setArtStylesForFont(state.artStylesForFont || []);
        
        // Restore context from the project if available
        setCurrentBasePrompt(state.conceptContext?.basePrompt || '');
        setCurrentTheme(state.conceptContext?.theme || '');
        setRegionalityData(state.regionalityData || state.conceptContext?.regionalityData || { country: '', city: '', neighborhood: '', weight: 25 });
        
        setBrandData(state.brandData || { name: '', slogan: '', weight: 25 });
        setPriceData(state.priceData || { text: '', modelText: '', style: 'circle', position: 'none', color: 'red'});
        
        setFeatureDetails(state.featureDetails || null);
        setAdCopy(state.adCopy || null);
        setLandingPageContent(state.landingPageContent || null);
        setBlogPostContent(state.blogPostContent || null);
        setPosterContent(state.posterContent || null);

        // Clear loading/error states
        setError(null);
        setConceptError(null);
        setTextContentError(null);
        setIsLoading(false);
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!session) return;
        try {
            await deleteProject(projectId, session.user.id);
            setHistory(prev => prev.filter(p => p.id !== projectId));
            if (currentProjectId === projectId) {
                setCurrentProjectId(null); // Clear workspace if active project is deleted
                // Optional: clear all content states
            }
            setNotification({ message: "Projeto excluído com sucesso.", type: 'success' });
        } catch (err) {
            console.error("Failed to delete project:", err);
            setNotification({ message: "Não foi possível excluir o projeto.", type: 'error' });
        }
    };

    const clearWorkspaceForNewGeneration = () => {
        setCurrentProjectId(null);
        setGeneratedImagesB64(null);
        setTextOverlay('');
        setAdCopy(null);
        setAdCopyError(null);
        setFeatureDetails(null);
        setLandingPageContent(null);
        setBlogPostContent(null);
        setPosterContent(null);
        setTextContentError(null);
        setBrandConcepts(null);
        setConceptError(null);
        setCurrentConcept(null);
        setConceptContext(null);
    }
    
    const handleSelectConcept = (concept: BrandConcept | null) => {
        setCurrentConcept(concept);
        setAdCopy(null);
        setLandingPageContent(null);
        setBlogPostContent(null);
        setPosterContent(null);
    };

    const handleGenerate = useCallback(async (options: GenerateOptions) => {
        setIsLoading(true);
        setError(null);

        // If it's a completely new generation (not from a concept), clear project state
        if (!options.concept) {
            clearWorkspaceForNewGeneration();
        } else {
             setCurrentConcept(options.concept);
        }

        setGeneratedImagesB64(null);
        setTextOverlay('');
        setCompositionId(options.compositionId);
        setTextPosition(options.textPosition);
        setSubtitleOutline(options.subtitleOutline);
        setArtStylesForFont(options.artStyles);
        setCurrentBasePrompt(options.basePrompt);
        setCurrentTheme(options.theme);
        setBrandData(options.brandData);
        setPriceData(options.priceData);
        setRegionalityData(options.regionalityData);

        try {
            if (options.scenario === 'isometric_details' && options.concept) {
                const [imageResults, descriptionResults] = await Promise.all([
                    generateImage(options.imagePrompt, options.negativeImagePrompt, 1),
                    generateFeatureDescriptions(options.basePrompt, options.concept)
                ]);
                setGeneratedImagesB64(imageResults);
                setFeatureDetails(descriptionResults);
            } else {
                const safeNumberOfImages = Math.max(1, Math.min(options.numberOfImages, 4));
                const imageResults = await generateImage(options.imagePrompt, options.negativeImagePrompt, safeNumberOfImages);
                setGeneratedImagesB64(imageResults);
                setTextOverlay(options.textOverlay);
            }
        } catch (e) {
            if (e instanceof RateLimitError) triggerCooldown();
            const errorMessage = (e as Error).message;
            setError(errorMessage);
            setNotification({ message: errorMessage, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [triggerCooldown]);

    // This effect runs after a generation is complete to save the project
    useEffect(() => {
        if (!isAuthEnabled) return;
        if (!isLoading && (generatedImagesB64 || featureDetails)) {
            saveCurrentProject();
        }
    }, [isLoading, generatedImagesB64, featureDetails, saveCurrentProject, isAuthEnabled]);


    const handleGenerateConcepts = useCallback(async (basePrompt: string, theme: string, regionality: RegionalityData) => {
        if (!basePrompt.trim()) return;
        setIsConceptLoading(true);
        setConceptError(null);
        clearWorkspaceForNewGeneration(); // This is a new project starting point
        setCurrentBasePrompt(basePrompt);
        setCurrentTheme(theme);
        setRegionalityData(regionality);
        setConceptContext({ basePrompt, theme, regionalityData: regionality });
        
        try {
            const isProductConceptTheme = ['Nova Marca de:', 'Nova Loja de:'].some(keyword => theme.startsWith(keyword));
            const isDesignConceptTheme = ['Design de Interiores', 'Design de Arquitetura de Prédios', 'Design de Fachadas de Prédios', 'Design de Casas', 'Design de Lojas de Rua', 'Design de Lojas de Shopping', 'Design de Lojas de Galeria', 'Design de Iluminação', 'Design de Paisagismo', 'Design de Planejados'].some(keyword => theme.includes(keyword));

            let concepts;
            if (isProductConceptTheme) {
                const productType = theme.split(': ').pop()?.split('(')[0].trim() || 'produto';
                concepts = await generateProductConcepts(basePrompt, productType, regionality);
            } else if (isDesignConceptTheme) {
                const designType = theme.includes('(') ? theme.match(/\((.*?)\)/)?.[1] || '' : theme.split(': ').pop() || '';
                concepts = await generateDesignConcepts(basePrompt, designType, regionality);
            } else {
                // For other themes, maybe just generate one concept or handle differently
                return;
            }
            setBrandConcepts(concepts);
            if (concepts && concepts.length > 0) {
                handleSelectConcept(concepts[0]);
            }
        } catch (e) {
            if (e instanceof RateLimitError) triggerCooldown();
            const errorMessage = (e as Error).message;
            setConceptError(errorMessage);
            setNotification({ message: errorMessage, type: 'error' });
        } finally {
            setIsConceptLoading(false);
        }
    }, [triggerCooldown]);

    // Effect to save after concept generation
    useEffect(() => {
        if (!isAuthEnabled) return;
        if (!isConceptLoading && brandConcepts) {
            saveCurrentProject();
        }
    }, [isConceptLoading, brandConcepts, saveCurrentProject, isAuthEnabled]);


    const handleGenerateTextContent = useCallback(async (concept: BrandConcept, type: 'landingPage' | 'blogPost' | 'poster') => {
        if (!conceptContext) {
            setNotification({ message: "Contexto de geração não encontrado. Por favor, gere os conceitos novamente.", type: 'error' });
            return;
        }
        setIsTextContentLoading(true);
        setTextContentError(null);
        setLandingPageContent(null);
        setBlogPostContent(null);
        setPosterContent(null);
        setIsLandingPageImagesLoading(false);
        setIsBlogImagesLoading(false);
        setIsPosterImagesLoading(false);
        setCurrentConcept(concept);
        setAdCopy(null);
        
        try {
            if (type === 'landingPage') {
                const lpStructure = await generateLandingPageContent(concept, conceptContext.basePrompt, conceptContext.theme, conceptContext.regionalityData);
                setLandingPageContent(lpStructure);
                setIsLandingPageImagesLoading(true);
                const updatedFeatures = [];
                const heroImage = lpStructure.hero.imagePrompt ? (await generateImage(lpStructure.hero.imagePrompt, "texto, palavras, logos", 1))[0] : undefined;
                let finalLp = { ...lpStructure, hero: { ...lpStructure.hero, imageBase64: heroImage } };
                setLandingPageContent(finalLp);

                for (const feature of lpStructure.features) {
                    if (feature.imagePrompt) {
                        const featureImage = (await generateImage(feature.imagePrompt, "texto, palavras, logos", 1))[0];
                        updatedFeatures.push({ ...feature, imageBase64: featureImage });
                        finalLp = { ...finalLp, features: updatedFeatures };
                        setLandingPageContent(finalLp);
                    } else {
                        updatedFeatures.push(feature);
                    }
                }
            } else if (type === 'blogPost') {
                const bpStructure = await generateBlogPostContent(concept, conceptContext.basePrompt, conceptContext.theme, brandConcepts, conceptContext.regionalityData);
                setBlogPostContent(bpStructure);
                setIsBlogImagesLoading(true);
                const updatedSections = [];
                 for (const section of bpStructure.sections) {
                    if (section.imagePrompt) {
                        const sectionImage = (await generateImage(section.imagePrompt, "texto, palavras, logos", 1))[0];
                        updatedSections.push({ ...section, imageBase64: sectionImage });
                        const finalBp = { ...bpStructure, sections: updatedSections };
                        setBlogPostContent(finalBp);
                    } else {
                        updatedSections.push(section);
                    }
                }
            } else if (type === 'poster') {
                const posterStructure = await generatePosterContent(concept, conceptContext.basePrompt, conceptContext.theme, conceptContext.regionalityData);
                setPosterContent(posterStructure);
                setIsPosterImagesLoading(true);
                const updatedImages = [];
                for (const img of posterStructure.images) {
                     const posterImage = (await generateImage(img.prompt, "texto, palavras, logos", 1))[0];
                     updatedImages.push({ ...img, imageBase64: posterImage });
                     const finalPoster = {...posterStructure, images: updatedImages };
                     setPosterContent(finalPoster);
                }
            }
        } catch (e) {
            if (e instanceof RateLimitError) triggerCooldown();
            const errorMessage = (e as Error).message;
            setTextContentError(errorMessage);
            setNotification({ message: errorMessage, type: 'error' });
        } finally {
            setIsTextContentLoading(false);
            setIsLandingPageImagesLoading(false);
            setIsBlogImagesLoading(false);
            setIsPosterImagesLoading(false);
        }
    }, [conceptContext, triggerCooldown, brandConcepts]);
    
    // Effect to save after text content generation
    useEffect(() => {
        if (!isAuthEnabled) return;
        if (!isTextContentLoading && (landingPageContent || blogPostContent || posterContent)) {
             saveCurrentProject();
        }
    }, [isTextContentLoading, landingPageContent, blogPostContent, posterContent, saveCurrentProject, isAuthEnabled]);


    const handleGenerateAds = useCallback(async () => {
        if (!currentConcept || !conceptContext) return;
        setIsAdCopyLoading(true);
        setAdCopyError(null);
        try {
            const result = await generateAdCopy(currentConcept, conceptContext.theme, conceptContext.regionalityData);
            setAdCopy(result);
        } catch (e) {
             if (e instanceof RateLimitError) triggerCooldown();
            const errorMessage = (e as Error).message;
            setAdCopyError(errorMessage);
            setNotification({ message: errorMessage, type: 'error' });
        } finally {
            setIsAdCopyLoading(false);
        }
    }, [currentConcept, conceptContext, triggerCooldown]);
    
    // Effect to save after ad copy generation
    useEffect(() => {
        if (!isAuthEnabled) return;
        if (!isAdCopyLoading && adCopy) {
             saveCurrentProject();
        }
    }, [isAdCopyLoading, adCopy, saveCurrentProject, isAuthEnabled]);

    // --- PROJECT DOWNLOAD LOGIC ---

    const getAllProjectFiles = async (): Promise<Record<string, string>> => {
        const filePaths = [
            'index.html', 'index.tsx', 'metadata.json', 'App.tsx', 'types.ts',
            'components/Header.tsx', 'components/PromptForm.tsx', 'components/SqlViewer.tsx', 'components/icons.tsx',
            'components/HistorySidebar.tsx', 'components/GuideModal.tsx', 'components/Notification.tsx',
            'services/supabaseClient.ts', 'services/geminiService.ts', 'services/databaseService.ts',
            'lib/styles.ts', 'lib/ctas.ts', 'lib/compositions.ts', 'lib/options.ts', 'lib/errors.ts',
        ];
        const fileContents: Record<string, string> = {};
        for (const path of filePaths) {
            try {
                const response = await fetch(`/${path}`);
                if (!response.ok) throw new Error(`Failed to fetch ${path}`);
                fileContents[path] = await response.text();
            } catch (error) {
                console.error(`Error fetching file ${path}:`, error);
                fileContents[path] = `// Failed to fetch content for ${path}`;
            }
        }
        return fileContents;
    };

    const generateDeploymentFiles = (isSaaS: boolean): Record<string, string> => {
        const files: Record<string, string> = {};
        
        files['package.json'] = `
{
  "name": "instastyle-project",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "esbuild index.tsx --bundle --outfile=bundle.js --servedir=. --watch",
    "build": "esbuild index.tsx --bundle --outfile=bundle.js --minify"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "@supabase/supabase-js": "^2.50.5",
    "@google/genai": "^1.9.0",
    "@supabase/gotrue-js": "^2.71.1",
    "jszip": "^3.10.1"
  },
  "devDependencies": {
    "esbuild": "^0.20.2"
  }
}
`;

        files['README.md'] = `
# InstaStyle Project

This is a generated project from the InstaStyle AI application.

## Setup

1.  Create a file named \`.env\` in the root of the project.
2.  Add your Google Gemini API key to it:
    \`\`\`
    API_KEY=your_gemini_api_key_here
    \`\`\`
${isSaaS ? `
3.  Add your Supabase credentials to the \`.env\` file:
    \`\`\`
    SUPABASE_URL=your_supabase_project_url_here
    SUPABASE_ANON_KEY=your_supabase_anon_key_here
    \`\`\`
` : ''}
## Running Locally

To run this project locally, you'll need Node.js and npm.

1.  **Install dependencies:**
    \`\`\`bash
    npm install
    \`\`\`

2.  **Run the development server:**
    \`\`\`bash
    npm start
    \`\`\`
    This will start a local server and watch for changes. Open your browser to the address provided (usually http://localhost:8000).

## Deployment

For detailed instructions on how to deploy this project to Vercel, Hugging Face (Docker), or a VPS, please refer to the comprehensive guide inside the downloaded HTML file.
`;

        files['vercel.json'] = `
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
`;

        files['app.py'] = `
from flask import Flask, send_from_directory, jsonify
import os

app = Flask(__name__, static_folder='.', static_url_path='')

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 7860))
    app.run(host='0.0.0.0', port=port)
`;
        
        files['requirements.txt'] = `
Flask==2.2.3
gunicorn==20.1.0
`;

        files['Dockerfile'] = `
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 7860

CMD ["gunicorn", "--bind", "0.0.0.0:7860", "app:app"]
`;

        files['.dockerignore'] = `
node_modules
.git
.env
bundle.js
bundle.js.map
`;
        if (isSaaS) {
            files['docker-compose.yml'] = `
version: '3.8'
services:
  web:
    build: .
    ports:
      - "7860:7860"
    environment:
      - API_KEY=\${API_KEY}
      - SUPABASE_URL=\${SUPABASE_URL}
      - SUPABASE_ANON_KEY=\${SUPABASE_ANON_KEY}
    env_file:
      - .env
`;

            files['db_schema.sql'] = `
-- Create the projects table
CREATE TABLE projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  project_name TEXT NOT NULL,
  project_state JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can insert their own projects." ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own projects." ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects." ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects." ON projects FOR DELETE USING (auth.uid() = user_id);
`;
        }
        return files;
    };

    const downloadFile = (blob: Blob, filename: string) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    const handleDownloadHtmlProject = async (isSaaS: boolean) => {
        setNotification({ message: `Preparando ${isSaaS ? 'SaaS' : 'Standalone'} HTML...`, type: 'success' });
        try {
            const projectFiles = await getAllProjectFiles();
            const deploymentFiles = generateDeploymentFiles(isSaaS);
            
            let fileTree = '<ul>';
            const allFiles = {...projectFiles, ...deploymentFiles};
            Object.keys(allFiles).sort().forEach(path => {
                fileTree += `<li><a href="#file-${path.replace(/[/.]/g, '-')}">${path}</a></li>`;
            });
            fileTree += '</ul>';

            let fileContents = '';
            for (const path in allFiles) {
                const escapedContent = allFiles[path].replace(/</g, "&lt;").replace(/>/g, "&gt;");
                fileContents += `<h3 id="file-${path.replace(/[/.]/g, '-')}">${path}</h3><pre><code>${escapedContent}</code></pre>`;
            }
            
            const guide = isSaaS ? `
                <h2>Guia de Implantação (SaaS com VPS)</h2>
                <ol>
                    <li><strong>Servidor:</strong> Obtenha uma VPS (ex: DigitalOcean, Vultr, AWS).</li>
                    <li><strong>Docker:</strong> Instale Docker e Docker Compose na sua VPS.</li>
                    <li><strong>Supabase:</strong> Crie um projeto no Supabase. Vá para 'SQL Editor', cole o conteúdo de <code>db_schema.sql</code> e execute.</li>
                    <li><strong>Credenciais:</strong> No Supabase, vá em 'Project Settings' > 'API' e copie sua URL e a chave 'anon public'.</li>
                    <li><strong>Código:</strong> Clone o projeto ZIP para sua VPS.</li>
                    <li><strong>Variáveis de Ambiente:</strong> Crie um arquivo <code>.env</code> na raiz do projeto com suas chaves:
                        <pre><code>API_KEY=sua_chave_gemini\nSUPABASE_URL=sua_url_supabase\nSUPABASE_ANON_KEY=sua_chave_anon_supabase</code></pre>
                    </li>
                    <li><strong>Execute:</strong> Rode <code>docker-compose up --build -d</code>. A aplicação estará rodando na porta 7860.</li>
                </ol>
            ` : `
                <h2>Guia de Implantação (Standalone)</h2>
                <h3>Opção 1: Vercel (Recomendado)</h3>
                <ol>
                    <li>Faça upload do projeto ZIP para um repositório no GitHub.</li>
                    <li>Conecte seu repositório ao Vercel.</li>
                    <li>Adicione sua <code>API_KEY</code> como uma variável de ambiente nas configurações do projeto Vercel.</li>
                    <li>O deploy será feito automaticamente. O Vercel usará o script 'build' do <code>package.json</code>.</li>
                </ol>
                <h3>Opção 2: Hugging Face (Docker)</h3>
                 <ol>
                    <li>Faça upload do projeto ZIP para um novo 'Space' no Hugging Face, escolhendo o SDK 'Docker'.</li>
                    <li>Adicione sua <code>API_KEY</code> como um 'Secret' nas configurações do Space.</li>
                    <li>O Space irá construir e iniciar a aplicação.</li>
                </ol>
            `;

            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>InstaStyle Project Export</title>
                    <style>body{font-family:sans-serif;line-height:1.6;padding:2em} pre{background:#f4f4f4;padding:1em;border-radius:5px;overflow-x:auto;} h2{border-bottom:2px solid #ccc;padding-bottom:5px;} h3{background:#e9e9e9;padding:0.5em;margin-top:2em;}</style>
                </head>
                <body>
                    <h1>Projeto InstaStyle Exportado</h1>
                    ${guide}
                    <h2>Árvore de Arquivos</h2>
                    ${fileTree}
                    <h2>Conteúdo dos Arquivos</h2>
                    ${fileContents}
                </body>
                </html>`;

            const blob = new Blob([html], { type: 'text/html' });
            const filename = isSaaS ? 'instastyle_saas_project.html' : 'instastyle_standalone_project.html';
            downloadFile(blob, filename);
            setNotification({ message: `Download do HTML ${isSaaS ? 'SaaS' : 'Standalone'} iniciado!`, type: 'success' });
        } catch (error) {
            console.error("Failed to generate HTML file:", error);
            setNotification({ message: 'Falha ao gerar o arquivo HTML.', type: 'error' });
        }
    };

    const handleDownloadZipProject = async (isSaaS: boolean) => {
        setNotification({ message: `Preparando o arquivo ZIP ${isSaaS ? 'SaaS' : 'Standalone'}...`, type: 'success' });
        try {
            const zip = new JSZip();
            const projectFiles = await getAllProjectFiles();
            const deploymentFiles = generateDeploymentFiles(isSaaS);

            for (const path in projectFiles) {
                const dirs = path.split('/');
                if (dirs.length > 1) {
                    let folder = zip;
                    for (let i = 0; i < dirs.length - 1; i++) {
                        folder = folder.folder(dirs[i])!;
                    }
                    folder.file(dirs[dirs.length - 1], projectFiles[path]);
                } else {
                    zip.file(path, projectFiles[path]);
                }
            }

            for (const path in deploymentFiles) {
                 zip.file(path, deploymentFiles[path]);
            }
            
            const content = await zip.generateAsync({ type: "blob" });
            const filename = isSaaS ? 'instastyle_saas_project.zip' : 'instastyle_standalone_project.zip';
            downloadFile(content, filename);
            setNotification({ message: `Download do ZIP ${isSaaS ? 'SaaS' : 'Standalone'} iniciado!`, type: 'success' });

        } catch (error) {
            console.error("Failed to generate ZIP:", error);
            setNotification({ message: 'Falha ao gerar o arquivo ZIP.', type: 'error' });
        }
    };


    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header
                session={session}
                onLogin={handleLogin}
                onLogout={handleLogout}
                isAuthEnabled={isAuthEnabled}
                onOpenGuide={() => setIsGuideOpen(true)}
                onDownloadStandaloneHtml={() => handleDownloadHtmlProject(false)}
                onDownloadSaaSProjectHtml={() => handleDownloadHtmlProject(true)}
                onDownloadStandaloneZip={() => handleDownloadZipProject(false)}
                onDownloadSaaSZip={() => handleDownloadZipProject(true)}
            />

            <main className={`container mx-auto p-4 sm:p-6 md:p-8 grid gap-6 flex-grow ${session ? 'grid-cols-1 lg:grid-cols-[280px_1fr_2fr]' : 'grid-cols-1 lg:grid-cols-[1fr_2fr]'}`}>
                {session && (
                    <HistorySidebar 
                        history={history}
                        isLoading={isHistoryLoading}
                        currentProjectId={currentProjectId}
                        onLoadProject={handleLoadProject}
                        onDeleteProject={handleDeleteProject}
                    />
                )}
                <div className="lg:col-span-1 h-full">
                    <PromptForm
                        onGenerate={handleGenerate}
                        isLoading={isLoading}
                        cooldownUntil={cooldownUntil}
                        onCooldown={triggerCooldown}
                        onGenerateConcepts={handleGenerateConcepts}
                        isConceptLoading={isConceptLoading}
                        conceptError={conceptError}
                        brandConcepts={brandConcepts}
                        isTextContentLoading={isTextContentLoading}
                        onSelectConcept={handleSelectConcept}
                        currentConcept={currentConcept}
                        regionalityData={regionalityData}
                        setRegionalityData={setRegionalityData}
                    />
                </div>
                <div className={session ? "lg:col-span-1" : "lg:col-span-1 h-full"}>
                    <SqlViewer
                        imagesB64={generatedImagesB64}
                        textOverlay={textOverlay}
                        compositionId={compositionId}
                        textPosition={textPosition}
                        subtitleOutline={subtitleOutline}
                        artStyles={artStylesForFont}
                        isLoading={isLoading}
                        error={error}
                        adCopy={adCopy}
                        isAdCopyLoading={isAdCopyLoading}
                        onGenerateAds={handleGenerateAds}
                        adCopyError={adCopyError}
                        brandData={brandData}
                        priceData={priceData}
                        regionalityData={regionalityData}
                        featureDetails={featureDetails}
                        landingPageContent={landingPageContent}
                        blogPostContent={blogPostContent}
                        posterContent={posterContent}
                        isTextContentLoading={isTextContentLoading}
                        textContentError={textContentError}
                        onGenerateTextContent={handleGenerateTextContent}
                        currentConcept={currentConcept}
                        isBlogImagesLoading={isBlogImagesLoading}
                        blogImagesError={blogImagesError}
                        isLandingPageImagesLoading={isLandingPageImagesLoading}
                        landingPageImagesError={landingPageImagesError}
                        isPosterImagesLoading={isPosterImagesLoading}
                        posterImagesError={posterImagesError}
                        setTextOverlay={setTextOverlay}
                        setCompositionId={setCompositionId}
                        setTextPosition={setTextPosition}
                        setSubtitleOutline={setSubtitleOutline}
                        setPriceData={setPriceData}
                        setFeatureDetails={setFeatureDetails}
                    />
                </div>
            </main>
            <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
            {notification && (
                <Notification 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
};

export default App;