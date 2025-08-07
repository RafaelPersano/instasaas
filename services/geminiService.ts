

import { GoogleGenAI, Type } from "@google/genai";
import type { RegionalityData, AdCopy, AdTrendAnalysis, BrandData, BrandConcept, FeatureDetails, LandingPageContent, BlogPostContent, PosterContent } from '@/types';
import { RateLimitError } from '@/lib/errors';

/**
 * Processes a caught API error, classifies it, and throws a new, user-friendly error.
 * This centralizes error handling for all Gemini API calls, making it robust against
 * various error shapes (Error object, JSON string, plain object).
 * @param e The caught error object.
 * @param context A string describing the operation that failed (e.g., 'gerar imagem').
 */
const processApiError = (e: unknown, context: string): never => {
    console.error(`Erro ao ${context} com a API Gemini:`, e);

    // Re-throw our specific custom errors if they've already been processed.
    if (e instanceof RateLimitError) {
        throw e;
    }

    // 1. Get a string representation of the error.
    let errorString: string;
    if (e instanceof Error) {
        errorString = e.message;
    } else if (typeof e === 'string') {
        errorString = e;
    } else {
        try {
            errorString = JSON.stringify(e);
        } catch {
            errorString = 'Ocorreu um erro não-serializável.';
        }
    }

    // 2. Check for the most critical errors first using robust string matching.
    const lowerCaseError = errorString.toLowerCase();
    if (lowerCaseError.includes('429') || lowerCaseError.includes('quota') || lowerCaseError.includes('resource_exhausted')) {
        throw new RateLimitError("Você excedeu sua cota de uso da API. Por favor, aguarde um momento e tente novamente.");
    }
    if (lowerCaseError.includes('safety') || lowerCaseError.includes('blocked') || lowerCaseError.includes("api não retornou uma imagem")) {
        throw new Error("Seu prompt foi bloqueado pelas políticas de segurança da IA. Por favor, reformule sua solicitação para ser mais neutra e evite termos que possam ser considerados sensíveis.");
    }
     if (lowerCaseError.includes('rpc failed due to xhr error')) {
        throw new Error("Ocorreu um erro de comunicação com a API. Verifique sua conexão e tente novamente.");
    }

    // 3. Try to parse for a more specific API message.
    try {
        const errorBody = JSON.parse(errorString);
        // Handle nested { error: { message: ... } } or flat { message: ... } structures.
        const apiMsg = errorBody?.error?.message || errorBody?.message;
        if (apiMsg && typeof apiMsg === 'string' && !apiMsg.trim().startsWith('{')) {
            throw new Error(apiMsg);
        }
    } catch {
        // Not a JSON string or parsing failed. The raw string might be the best message if it's not JSON.
        if (!errorString.trim().startsWith('{')) {
            throw new Error(errorString);
        }
    }

    // 4. Final fallback for unknown errors or JSON we couldn't parse.
    throw new Error("Ocorreu um erro desconhecido ao comunicar com a API.");
};


export async function generateImage(prompt: string, negativePrompt?: string, numberOfImages: number = 1): Promise<string[]> {
    if (!process.env.API_KEY) {
        throw new Error("A chave da API Gemini não está configurada. Defina a variável de ambiente API_KEY.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Safeguard: The API limit is 4 images per request. Clamp the value to be safe.
    const safeNumberOfImages = Math.max(1, Math.min(numberOfImages, 4));

    try {
        const params: any = {
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: safeNumberOfImages, // Use the clamped value
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1', // Square image for Instagram
            },
        };

        if (negativePrompt) {
            params.negativePrompt = negativePrompt;
        }
        
        const response = await ai.models.generateImages(params);

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages.map(img => img.image.imageBytes);
        } else {
            // This case is often a safety block. We create a specific error message for it.
            const blockReason = (response as any).promptFeedback?.blockReason;
            let errorMessage = "A API não retornou uma imagem";
            if (blockReason) {
                errorMessage += `, motivo: ${blockReason}.`;
            }
            throw new Error(errorMessage);
        }
    } catch (e) {
        processApiError(e, 'gerar imagem');
    }
}

export async function generateSlogan(brandName: string, theme: string): Promise<{slogan: string}> {
    if (!process.env.API_KEY) {
        throw new Error("API key not configured.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
        Aja como um especialista em branding de classe mundial.
        **Tarefa:** Crie um slogan curto, memorável e impactante.
        **Marca:** ${brandName}
        **Nicho/Tema:** ${theme}
        **Requisitos:**
        - O slogan deve ser em português do Brasil.
        - Deve ser conciso (idealmente entre 3 e 7 palavras).
        - Deve refletir o valor ou a personalidade da marca dentro do nicho.

        **Formato de Saída Obrigatório (JSON):**
        Responda APENAS com um objeto JSON contendo a chave "slogan".
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        slogan: {
                            type: Type.STRING,
                            description: "O slogan gerado para a marca."
                        }
                    },
                    required: ["slogan"]
                },
                temperature: 0.9,
            }
        });

        const jsonResponse = JSON.parse(response.text);
        if (jsonResponse.slogan) {
            return jsonResponse as {slogan: string};
        } else {
            throw new Error("A resposta da API para o slogan está malformada.");
        }
    } catch (e) {
        processApiError(e, 'gerar slogan');
    }
}

export async function generateAdCopy(concept: BrandConcept, theme: string, regionalityData: RegionalityData): Promise<AdCopy> {
    if (!process.env.API_KEY) {
        throw new Error("API key not configured.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const locationParts = [regionalityData.neighborhood, regionalityData.city, regionalityData.country].filter(Boolean);
    const locationClause = locationParts.length > 0 && regionalityData.weight > 10
        ? `com um foco cultural e linguístico para a região de ${locationParts.join(', ')} (influência de ${regionalityData.weight}%)`
        : 'com um apelo global';

    const prompt = `
        Aja como um copywriter de resposta direta de classe mundial, especialista em campanhas pagas para o tema "${theme}", ${locationClause}.

        **Contexto do Anúncio:**
        - **Conceito da Marca/Produto:** "${concept.name}"
        - **Filosofia/Slogan:** "${concept.philosophy}"
        - **Estilo Visual:** ${concept.visualStyle}

        **DIRETRIZ MESTRA E INEGOCIÁVEL:**
        Sua única tarefa é gerar textos para anúncios que sejam **cirurgicamente precisos e persuasivos** para este conceito.

        1.  **REVISÃO OBRIGATÓRIA:** Antes de responder, você DEVE revisar cada palavra para garantir:
            - **Coerência Absoluta:** O texto se conecta perfeitamente ao conceito da marca e à localização.
            - **Zero Nonsense:** Nenhuma palavra aleatória ou sem sentido. Clareza e lógica são inegociáveis.
            - **Gramática Impecável:** A escrita deve ser perfeita, pronta para publicação imediata.
        2.  **FOCO EM CONVERSÃO:** Use a fórmula AIDA (Atenção, Interesse, Desejo, Ação) para maximizar o impacto.

        **Formato de Saída Obrigatório (JSON):**
        Responda APENAS com um objeto JSON válido para Google e Facebook Ads.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        google: {
                            type: Type.OBJECT,
                            properties: {
                                headlines: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING },
                                    description: "3 headlines curtos e de alto impacto para Google Ads (máx 30 caracteres)."
                                },
                                descriptions: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING },
                                    description: "2 descrições persuasivas para Google Ads (máx 90 caracteres)."
                                }
                            }
                        },
                        facebook: {
                            type: Type.OBJECT,
                            properties: {
                                primaryText: {
                                    type: Type.STRING,
                                    description: "Texto principal para o Facebook Ad. Comece com um gancho forte. Use quebras de linha e emojis para legibilidade."
                                },
                                headline: {
                                    type: Type.STRING,
                                    description: "Headline para o Facebook Ad. Focado no benefício principal."
                                },
                                description: {
                                    type: Type.STRING,
                                    description: "Descrição/link para o Facebook Ad. Um CTA claro."
                                }
                            }
                        },
                        strategyTip: {
                            type: Type.STRING,
                            description: "Uma dica de estratégia de marketing acionável e inteligente relacionada a esta campanha específica."
                        }
                    },
                    required: ["google", "facebook", "strategyTip"]
                },
                temperature: 0.8,
            }
        });

        const jsonResponse = JSON.parse(response.text);
        // Basic validation
        if (jsonResponse.google && jsonResponse.facebook) {
            return jsonResponse as AdCopy;
        } else {
             throw new Error("A resposta da API está malformada.");
        }

    } catch (e) {
        processApiError(e, 'gerar textos de anúncio');
    }
}


export async function analyzeAdTrends(theme: string, regionality: RegionalityData, brandData: BrandData): Promise<AdTrendAnalysis> {
    if (!process.env.API_KEY) {
        throw new Error("API key not configured.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const locationParts = [regionality.neighborhood, regionality.city, regionality.country].filter(Boolean);
    const locationClause = locationParts.length > 0 && regionality.weight > 10
        ? `com foco na região de ${locationParts.join(', ')} (peso de influência: ${regionality.weight}%)`
        : 'com um foco global';
    
    const brandClause = brandData.name
        ? `A marca em questão é '${brandData.name}' e sua influência criativa deve ser considerada em ${brandData.weight}% das sugestões.`
        : 'As sugestões devem ser genéricas para o tema, sem uma marca específica.';

    const prompt = `
      Aja como um diretor de criação e copywriter sênior, especialista em campanhas virais para o tema "${theme}". Seu foco é ${locationClause}.

      **Contexto da Marca:**
      ${brandClause}
      
      **DIRETRIZ MESTRA E INEGOCIÁVEL:**
      Sua única tarefa é gerar 3 conceitos de anúncio que sejam **IMPECÁVEIS**. Cada palavra deve ser intencional, coerente e poderosa.

      1.  **REVISÃO OBRIGATÓRIA:** Antes de responder, você DEVE revisar cada palavra para garantir que:
          - O texto é 100% relevante para "${theme}".
          - Não existem palavras ou frases sem sentido, aleatórias, ou inventadas. A escrita é clara e lógica.
          - A gramática e ortografia são PERFEITAS, como se fossem para um cliente de altíssimo padrão.
      2.  **FOCO EM APLICAÇÃO REAL:** As ideias devem ser tão boas que um profissional de marketing as usaria imediatamente em uma campanha real.

      **Formato de Saída Obrigatório (JSON):**
      Responda APENAS com um objeto JSON válido, contendo uma análise de tendências, 3 ideias de anúncio e hashtags.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        trendOverview: {
                            type: Type.STRING,
                            description: "Análise concisa (2-3 frases) sobre as tendências de anúncios para este tema. Fale sobre formatos (vídeo, carrossel), ganchos e estéticas que estão funcionando AGORA."
                        },
                        adIdeas: {
                            type: Type.ARRAY,
                            description: "Uma lista com exatamente 3 ideias de anúncio.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    conceptName: {
                                        type: Type.STRING,
                                        description: "Nome do conceito do anúncio (Ex: 'O Segredo que Ninguém Conta', 'Sua Jornada em 15s')."
                                    },
                                    headline: {
                                        type: Type.STRING,
                                        description: "Um título de anúncio magnético e curto."
                                    },
                                    primaryText: {
                                        type: Type.STRING,
                                        description: "O texto principal do anúncio. Use quebras de linha e emojis para legibilidade. Deve ser atraente, claro e direto."
                                    },
                                    replicabilityTip: {
                                        type: Type.STRING,
                                        description: "Uma dica rápida sobre como replicar o visual deste anúncio (ex: 'Use um vídeo POV mostrando...', 'Crie um carrossel com fotos de clientes...')."
                                    }
                                }
                            }
                        },
                        hashtags: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "Uma lista de 5-7 hashtags relevantes, misturando hashtags de alto volume com nicho."
                        }
                    },
                    required: ["trendOverview", "adIdeas", "hashtags"]
                },
                temperature: 0.8,
            }
        });
        
        const jsonResponse = JSON.parse(response.text);
        if (jsonResponse.adIdeas) {
            return jsonResponse as AdTrendAnalysis;
        } else {
             throw new Error("A resposta da API está malformada.");
        }

    } catch (e) {
        processApiError(e, 'analisar tendências');
    }
}

export async function generateProductConcepts(basePrompt: string, productType: string, regionalityData: RegionalityData): Promise<BrandConcept[]> {
    if (!process.env.API_KEY) throw new Error("API key not configured.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const locationParts = [regionalityData.neighborhood, regionalityData.city, regionalityData.country].filter(Boolean);
    const locationClause = locationParts.length > 0 && regionalityData.weight > 10
        ? `Os conceitos devem ser culturalmente relevantes para a região de ${locationParts.join(', ')} (influência de ${regionalityData.weight}%). Incorpore referências locais, estilos ou valores no nome, filosofia e estilo visual, quando apropriado.`
        : 'Os conceitos devem ter um apelo global.';

    const prompt = `
        Aja como um estúdio de design e branding de renome mundial (pense em Pentagram, IDEO).
        **Tarefa:** Gerar 3 conceitos de marca distintos e criativos para um novo produto.
        **Ideia Central do Usuário:** "${basePrompt}"
        **Tipo de Produto:** ${productType}
        **Diretriz Geográfica:** ${locationClause}
        
        **Diretrizes Rígidas:**
        1.  **Originalidade:** Crie nomes e filosofias que se destaquem. Evite o clichê.
        2.  **Clareza:** O 'visualStyle' deve ser descritivo e evocativo, pintando um quadro claro para um designer.
        3.  **Ação:** As 'keywords' devem ser termos de busca poderosos que um IA de imagem pode usar.

        **Formato de Saída Obrigatório (JSON Array):**
        Responda APENAS com um array JSON contendo exatamente 3 objetos.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "Nome da marca/produto. Curto, forte e único." },
                            philosophy: { type: Type.STRING, description: "O 'porquê' da marca. Um slogan ou frase de missão curta e inspiradora." },
                            visualStyle: { type: Type.STRING, description: "Descrição do design do produto, materiais, cores e estética geral." },
                            keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5-7 palavras-chave para guiar a geração de imagem (ex: 'couro vegano, costura contrastante, minimalista')." }
                        },
                        required: ["name", "philosophy", "visualStyle", "keywords"]
                    }
                },
                temperature: 0.9
            }
        });
        const jsonResponse = JSON.parse(response.text);
        if (Array.isArray(jsonResponse) && jsonResponse.length > 0) {
            return jsonResponse as BrandConcept[];
        } else {
            throw new Error("A resposta da API para conceitos de produto está malformada.");
        }
    } catch(e) {
        processApiError(e, 'gerar conceitos de produto');
    }
}

export async function generateDesignConcepts(basePrompt: string, designType: string, regionalityData: RegionalityData): Promise<BrandConcept[]> {
    if (!process.env.API_KEY) throw new Error("API key not configured.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const locationParts = [regionalityData.neighborhood, regionalityData.city, regionalityData.country].filter(Boolean);
    const locationClause = locationParts.length > 0 && regionalityData.weight > 10
        ? `Os conceitos devem ser culturalmente e arquitetonicamente relevantes para a região de ${locationParts.join(', ')} (influência de ${regionalityData.weight}%). Considere materiais locais, estilos de construção, clima e modo de vida.`
        : 'Os conceitos devem ter um apelo global e atemporal.';

    const prompt = `
        Aja como um arquiteto e designer de interiores de classe mundial (pense em Kelly Wearstler, Philippe Starck).
        **Tarefa:** Gerar 3 conceitos de design distintos para um espaço ou móvel.
        **Ideia Central do Usuário:** "${basePrompt}"
        **Tipo de Design:** ${designType}
        **Diretriz Geográfica:** ${locationClause}
        
        **Diretrizes Rígidas:**
        1.  **Conceituação Forte:** O 'name' deve ser evocativo, como o nome de uma coleção ou projeto.
        2.  **Narrativa:** A 'philosophy' deve contar uma história sobre a experiência de estar no espaço.
        3.  **Especificidade:** O 'visualStyle' deve detalhar materiais, paleta de cores, iluminação e mobiliário chave.

        **Formato de Saída Obrigatório (JSON Array):**
        Responda APENAS com um array JSON contendo exatamente 3 objetos.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "Nome do conceito de design (ex: 'Refúgio Urbano', 'Oásis Moderno')." },
                            philosophy: { type: Type.STRING, description: "A narrativa ou sentimento que o design evoca (ex: 'Um santuário de calma na cidade agitada')." },
                            visualStyle: { type: Type.STRING, description: "Descrição detalhada de materiais (madeira, concreto), texturas, cores, iluminação e formas." },
                            keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5-7 palavras-chave para guiar uma IA de imagem (ex: 'luz natural, madeira de carvalho, linho, minimalista, brutalismo suave')." }
                        },
                        required: ["name", "philosophy", "visualStyle", "keywords"]
                    }
                },
                temperature: 0.9
            }
        });
        const jsonResponse = JSON.parse(response.text);
        if (Array.isArray(jsonResponse) && jsonResponse.length > 0) {
            return jsonResponse as BrandConcept[];
        } else {
            throw new Error("A resposta da API para conceitos de design está malformada.");
        }
    } catch(e) {
        processApiError(e, 'gerar conceitos de design');
    }
}

export async function generateFeatureDescriptions(basePrompt: string, concept: BrandConcept): Promise<FeatureDetails[]> {
    if (!process.env.API_KEY) throw new Error("API key not configured.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
        Aja como um copywriter técnico e de marketing, especialista em traduzir características de produtos em benefícios claros para o consumidor.
        **Produto:** ${concept.name}
        **Filosofia/Conceito:** "${concept.philosophy}"
        **Descrição do Design:** "${concept.visualStyle}"
        **Ideia Original do Usuário:** "${basePrompt}"

        **Tarefa Principal:**
        Identifique as 4 características mais importantes, inovadoras ou atraentes do produto descrito. Para cada uma, crie um título curto e uma descrição persuasiva.

        **Diretrizes Rígidas:**
        1.  **Foco no Benefício:** Não liste apenas a característica. Explique por que ela é importante para o cliente. (Ex: Em vez de "Sola de borracha", use "Aderência Inabalável" com a descrição "Nossa sola de composto duplo garante segurança em qualquer superfície, do asfalto molhado à trilha de terra.")
        2.  **Linguagem da Marca:** O tom deve ser consistente com a filosofia da marca.
        3.  **Precisão:** As descrições devem ser plausíveis e baseadas no conceito fornecido.

        **Formato de Saída Obrigatório (JSON Array):**
        Responda APENAS com um array JSON contendo exatamente 4 objetos.
    `;
     try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: {
                                type: Type.STRING,
                                description: "O título da característica (2-4 palavras). Ex: 'Design Ergonômico'."
                            },
                            description: {
                                type: Type.STRING,
                                description: "A descrição do benefício (1-2 frases). Ex: 'Criado para se adaptar perfeitamente, oferecendo conforto o dia todo.'"
                            }
                        },
                        required: ["title", "description"]
                    }
                },
                temperature: 0.7
            }
        });
        const jsonResponse = JSON.parse(response.text);
        if (Array.isArray(jsonResponse) && jsonResponse.length > 0) {
            return jsonResponse as FeatureDetails[];
        } else {
            throw new Error("A resposta da API para detalhes de features está malformada.");
        }
    } catch(e) {
        processApiError(e, 'gerar descrições de detalhes');
    }
}

export async function generateLandingPageContent(concept: BrandConcept, basePrompt: string, theme: string, regionalityData: RegionalityData): Promise<LandingPageContent> {
    if (!process.env.API_KEY) throw new Error("API key not configured.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const locationParts = [regionalityData.neighborhood, regionalityData.city, regionalityData.country].filter(Boolean);
    const locationClause = locationParts.length > 0 && regionalityData.weight > 10
        ? `O conteúdo deve ser adaptado culturalmente para a região de ${locationParts.join(', ')} (influência de ${regionalityData.weight}%). Use linguagem, referências e um tom que ressoe com este público.`
        : 'O conteúdo deve ter um apelo global.';

    const prompt = `
        Aja como um especialista em copywriting, UX e direção de arte, focado em criar landing pages de alta conversão.
        **Tarefa:** Gerar o conteúdo textual e os prompts de imagem para uma landing page completa.
        **Conceito do Produto/Marca:**
        - **Nome:** ${concept.name}
        - **Filosofia:** "${concept.philosophy}"
        - **Estilo Visual:** ${concept.visualStyle}
        - **Ideia Original:** "${basePrompt}"
        - **Nicho:** ${theme}
        **Diretriz Geográfica:** ${locationClause}

        **Diretrizes Rígidas:**
        1.  **Estrutura de Conversão:** Siga a estrutura clássica: Headline, Hero, Features/Benefits, Formulário de Captura, Prova Social, CTA Final.
        2.  **Linguagem Persuasiva:** Use verbos de ação, foque nos benefícios, crie desejo. O tom deve ser 100% alinhado com a filosofia do conceito.
        3.  **Prompts de Imagem Criativos:** PARA a seção 'hero' e PARA CADA 'feature', crie um \`imagePrompt\` que seja uma descrição visual detalhada, cinematográfica e evocativa para uma IA de geração de imagem. Este prompt deve ser uma obra de arte em si.

        **Formato de Saída Obrigatório (JSON):**
        Responda APENAS com um objeto JSON válido seguindo o schema.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        headline: { type: Type.STRING, description: "Headline principal da página. Curta, poderosa e que captura a atenção." },
                        subheadline: { type: Type.STRING, description: "Sub-headline que complementa a headline, explicando o valor principal." },
                        hero: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING, description: "Título da primeira seção (Hero)." },
                                text: { type: Type.STRING, description: "Texto principal do Hero, explicando o produto/serviço em mais detalhes." },
                                cta: { type: Type.STRING, description: "Texto para o botão de Call-to-Action principal." },
                                imagePrompt: { type: Type.STRING, description: "Prompt detalhado e criativo para uma imagem hero, de tirar o fôlego." }
                            },
                             required: ["title", "text", "cta", "imagePrompt"]
                        },
                        features: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING, description: "Título de uma característica/benefício." },
                                    description: { type: Type.STRING, description: "Descrição que explica o benefício para o cliente." },
                                    imagePrompt: { type: Type.STRING, description: "Prompt de imagem criativo e específico para esta característica." }
                                },
                                required: ["title", "description", "imagePrompt"]
                            },
                            description: "Uma lista de 3 características e benefícios, cada uma com seu próprio prompt de imagem."
                        },
                        captureForm: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING, description: "Título para a seção do formulário de captura." },
                                cta: { type: Type.STRING, description: "Texto para o botão do formulário." },
                                placeholder: { type: Type.STRING, description: "Texto de placeholder para o campo de e-mail." }
                            },
                             required: ["title", "cta", "placeholder"]
                        },
                        socialProof: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING, description: "Título para a seção de prova social." },
                                testimonial: { type: Type.STRING, description: "Um depoimento fictício, mas realista e poderoso." },
                                author: { type: Type.STRING, description: "Nome e cidade/profissão do autor do depoimento." }
                            },
                            required: ["title", "testimonial", "author"]
                        },
                        finalCta: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING, description: "Título para a seção final de CTA." },
                                cta: { type: Type.STRING, description: "Texto para o botão de CTA final." }
                            },
                            required: ["title", "cta"]
                        }
                    },
                    required: ["headline", "subheadline", "hero", "features", "captureForm", "socialProof", "finalCta"]
                },
                temperature: 0.8
            }
        });
        const jsonResponse = JSON.parse(response.text);
        if (jsonResponse.hero) {
            return jsonResponse as LandingPageContent;
        } else {
            throw new Error("A resposta da API para landing page está malformada.");
        }
    } catch(e) {
        processApiError(e, 'gerar conteúdo de landing page');
    }
}

export async function generateBlogPostContent(concept: BrandConcept, basePrompt: string, theme: string, allConcepts: BrandConcept[] | null, regionalityData: RegionalityData): Promise<BlogPostContent> {
    if (!process.env.API_KEY) throw new Error("API key not configured.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const locationParts = [regionalityData.neighborhood, regionalityData.city, regionalityData.country].filter(Boolean);
    const locationClause = locationParts.length > 0 && regionalityData.weight > 10
        ? `O post deve ser relevante para leitores na região de ${locationParts.join(', ')} (influência de ${regionalityData.weight}%). Use exemplos, linguagem ou referências que se conectem com o público local.`
        : 'O post deve ter um apelo global.';

    const relatedConceptsText = allConcepts && allConcepts.length > 1 
        ? `Este post faz parte de uma família de conceitos, que também inclui: ${allConcepts.filter(c => c.name !== concept.name).map(c => `'${c.name}'`).join(', ')}. Você pode fazer referência a esses outros conceitos se for relevante.`
        : '';

    const prompt = `
        Aja como um especialista em marketing de conteúdo e SEO.
        **Tarefa:** Escrever um post de blog informativo e envolvente.
        **Conceito Principal:**
        - **Nome:** ${concept.name}
        - **Filosofia:** "${concept.philosophy}"
        - **Estilo Visual:** ${concept.visualStyle}
        - **Ideia Original:** "${basePrompt}"
        - **Nicho:** ${theme}
        **Diretriz Geográfica:** ${locationClause}
        **Contexto Adicional:** ${relatedConceptsText}

        **Diretrizes Rígidas:**
        1.  **Valor para o Leitor:** O post deve ser genuinamente útil, educacional ou inspirador para alguém interessado no nicho.
        2.  **Estrutura Lógica:** Deve ter uma introdução clara, seções bem definidas com títulos e uma conclusão forte.
        3.  **Prompt de Imagem:** PARA CADA SEÇÃO, crie um \`imagePrompt\` que seja uma descrição visual detalhada e evocativa para uma IA de geração de imagem. Este prompt deve capturar a essência do conteúdo da seção.
        4.  **Tom de Especialista:** Escreva com autoridade, mas de forma acessível. O tom deve refletir a filosofia do conceito principal.

        **Formato de Saída Obrigatório (JSON):**
        Responda APENAS com um objeto JSON válido seguindo o schema.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "Um título de blog otimizado para SEO e que desperte curiosidade." },
                        introduction: { type: Type.STRING, description: "Parágrafo de introdução que apresenta o tema e prende o leitor." },
                        sections: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING, description: "O subtítulo de uma seção do post." },
                                    content: { type: Type.STRING, description: "O conteúdo da seção, com múltiplos parágrafos. Use quebras de linha (\\n) para separar parágrafos." },
                                    imagePrompt: { type: Type.STRING, description: "Um prompt detalhado e criativo para uma IA de geração de imagem, ilustrando esta seção."}
                                },
                                required: ["title", "content", "imagePrompt"]
                            },
                             description: "Uma lista de 2 a 3 seções que desenvolvem o corpo do post."
                        },
                        conclusion: { type: Type.STRING, description: "Parágrafo de conclusão que resume os pontos principais e talvez inclua um call-to-action sutil." },
                        relatedConcepts: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    philosophy: { type: Type.STRING }
                                }
                            },
                            description: "Lista dos outros conceitos da família, se houver."
                        }
                    },
                    required: ["title", "introduction", "sections", "conclusion", "relatedConcepts"]
                },
                temperature: 0.7
            }
        });
        const jsonResponse = JSON.parse(response.text);
        if (jsonResponse.sections) {
            return jsonResponse as BlogPostContent;
        } else {
            throw new Error("A resposta da API para o post de blog está malformada.");
        }
    } catch(e) {
        processApiError(e, 'gerar conteúdo de post de blog');
    }
}

export async function generatePosterContent(concept: BrandConcept, basePrompt: string, theme: string, regionalityData: RegionalityData): Promise<PosterContent> {
    if (!process.env.API_KEY) throw new Error("API key not configured.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const locationParts = [regionalityData.neighborhood, regionalityData.city, regionalityData.country].filter(Boolean);
    const locationClause = locationParts.length > 0 && regionalityData.weight > 10
        ? `O cartaz deve ter uma sensibilidade cultural para a região de ${locationParts.join(', ')} (influência de ${regionalityData.weight}%). Isso pode se refletir na estética das imagens, na linguagem do CTA ou no tom geral.`
        : 'O cartaz deve ter um apelo global.';

    const prompt = `
        Aja como um diretor de arte e estrategista de marca de classe mundial.
        **Tarefa:** Gerar o conteúdo para um "mood board" ou cartaz de marketing digital em HTML, completo com um Call-to-Action e um formulário de captura.
        **Conceito Principal:**
        - **Nome:** ${concept.name}
        - **Filosofia:** "${concept.philosophy}"
        - **Estilo Visual:** ${concept.visualStyle}
        - **Ideia Original:** "${basePrompt}"
        - **Nicho:** ${theme}
        **Diretriz Geográfica:** ${locationClause}

        **Diretrizes Rígidas:**
        1.  **Narrativa Visual:** O conjunto de imagens deve contar uma história coesa sobre a marca. Pense em textura, ambiente, emoção e detalhes do produto/serviço.
        2.  **Prompts de Imagem de Alta Qualidade:** Crie 5 prompts de imagem. Cada prompt deve ser uma obra de arte em si: detalhado, cinematográfico, evocativo e pronto para ser usado por uma IA de geração de imagem. Varie os tipos de cena (ex: close-up de material, cena de lifestyle, detalhe abstrato, ambiente).
        3.  **Texto Impactante:** O título, subtítulo, CTA e texto do formulário devem ser curtos, poderosos e capturar a essência do conceito.
        4.  **Foco na Ação:** O CTA e o formulário devem ser convidativos e direcionados para uma ação clara (ex: "Saiba Mais", "Receba Ofertas").

        **Formato de Saída Obrigatório (JSON):**
        Responda APENAS com um objeto JSON válido seguindo o schema.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        headline: { type: Type.STRING, description: "Um título para o cartaz. Curto, em caixa alta, impactante." },
                        subheadline: { type: Type.STRING, description: "Um subtítulo que complementa o título com a filosofia da marca." },
                        cta: {
                            type: Type.OBJECT,
                            properties: {
                                text: { type: Type.STRING, description: "Texto para um botão de Call-to-Action principal. Ex: 'Compre Agora', 'Descubra a Coleção'." }
                            },
                            required: ["text"]
                        },
                        captureForm: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING, description: "Título para a seção do formulário de captura. Ex: 'Seja o primeiro a saber'." },
                                cta: { type: Type.STRING, description: "Texto para o botão do formulário. Ex: 'Inscrever-se'." },
                                placeholder: { type: Type.STRING, description: "Texto de placeholder para o campo de e-mail. Ex: 'seu-email@exemplo.com'." }
                            },
                            required: ["title", "cta", "placeholder"]
                        },
                        images: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    prompt: { type: Type.STRING, description: "O prompt de imagem detalhado e criativo." }
                                },
                                required: ["prompt"]
                            },
                             description: "Uma lista de exatamente 5 prompts de imagem para compor o mood board."
                        }
                    },
                    required: ["headline", "subheadline", "cta", "captureForm", "images"]
                },
                temperature: 0.8
            }
        });
        const jsonResponse = JSON.parse(response.text);
        if (jsonResponse.images && jsonResponse.cta && jsonResponse.captureForm) {
            return jsonResponse as PosterContent;
        } else {
            throw new Error("A resposta da API para o conteúdo do cartaz está malformada.");
        }
    } catch(e) {
        processApiError(e, 'gerar conteúdo de cartaz');
    }
}