
import type { RegionalityData, AdCopy, BrandConcept, FeatureDetails, LandingPageContent, BlogPostContent, PosterContent } from '@/types';
import { RateLimitError } from '@/lib/errors';

/**
 * Generic handler to call our backend API proxy.
 * @param type - The type of generation to perform (e.g., 'generateImage').
 * @param payload - The data required for the generation.
 */
async function callApiProxy(type: string, payload: any): Promise<any> {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, payload })
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.error || `Falha ao executar a operação: ${type}`;
            if (response.status === 429) {
                // Throw our specific error type so the UI can handle cooldowns
                throw new RateLimitError(errorMessage);
            }
            throw new Error(errorMessage);
        }
        
        return data;
    } catch (error) {
        if (error instanceof RateLimitError) {
            throw error;
        }
        console.error(`Error calling API proxy for type ${type}:`, error);
        throw new Error(`Ocorreu um erro de comunicação com o nosso servidor. Por favor, verifique sua conexão e tente novamente.`);
    }
}

export async function generateImage(prompt: string, negativePrompt?: string, numberOfImages: number = 1): Promise<string[]> {
    const data = await callApiProxy('generateImage', { prompt, negativePrompt, numberOfImages });
    return data.images;
}

export async function generateSlogan(brandName: string, theme: string): Promise<{slogan: string}> {
    return callApiProxy('generateSlogan', { brandName, theme });
}

export async function generateAdCopy(concept: BrandConcept, theme: string, regionalityData: RegionalityData): Promise<AdCopy> {
    return callApiProxy('generateAdCopy', { concept, theme, regionalityData });
}

export async function generateProductConcepts(basePrompt: string, productType: string, regionalityData: RegionalityData): Promise<BrandConcept[]> {
    return callApiProxy('generateProductConcepts', { basePrompt, productType, regionalityData });
}

export async function generateDesignConcepts(basePrompt: string, designType: string, regionalityData: RegionalityData): Promise<BrandConcept[]> {
    return callApiProxy('generateDesignConcepts', { basePrompt, designType, regionalityData });
}

export async function generateFeatureDescriptions(basePrompt: string, concept: BrandConcept): Promise<FeatureDetails[]> {
    return callApiProxy('generateFeatureDescriptions', { basePrompt, concept });
}

export async function generateLandingPageContent(concept: BrandConcept, basePrompt: string, theme: string, regionalityData: RegionalityData): Promise<LandingPageContent> {
    return callApiProxy('generateLandingPageContent', { concept, basePrompt, theme, regionalityData });
}

export async function generateBlogPostContent(concept: BrandConcept, basePrompt: string, theme: string, allConcepts: BrandConcept[] | null, regionalityData: RegionalityData): Promise<BlogPostContent> {
    return callApiProxy('generateBlogPostContent', { concept, basePrompt, theme, allConcepts, regionalityData });
}

export async function generatePosterContent(concept: BrandConcept, basePrompt: string, theme: string, regionalityData: RegionalityData): Promise<PosterContent> {
    return callApiProxy('generatePosterContent', { concept, basePrompt, theme, regionalityData });
}
