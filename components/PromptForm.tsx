


import React, { useState, useMemo, useEffect } from 'react';
import { SparklesIcon, LoaderIcon, PlusIcon, XIcon, MegaphoneIcon, ChevronLeftIcon, ChevronRightIcon, AlertTriangleIcon, ProductIcon, UsersIcon, FamilyIcon, LayersIcon, DetailedViewIcon, PosterIcon, BlueprintIcon, FileTextIcon, BookOpenIcon } from '@/components/icons';
import { artStyles, professionalThemes } from '@/lib/styles';
import { generateSlogan } from '@/services/geminiService';
import type { BrandConcept, MixedStyle, RegionalityData, TextPosition, SubtitleOutlineStyle, BrandData, PriceData, PriceTagStyleId, PriceTagPosition, PriceTagColor, GenerateOptions } from '@/types';
import { RateLimitError } from '@/lib/errors';

interface CreationPanelProps {
    onGenerate: (options: GenerateOptions) => void;
    isLoading: boolean;
    cooldownUntil: Date | null;
    onCooldown: () => void;
    onGenerateConcepts: (basePrompt: string, theme: string, regionality: RegionalityData) => void;
    isConceptLoading: boolean;
    conceptError: string | null;
    brandConcepts: BrandConcept[] | null;
    isTextContentLoading: boolean;
    onSelectConcept: (concept: BrandConcept) => void;
    currentConcept: BrandConcept | null;
    regionalityData: RegionalityData;
    setRegionalityData: React.Dispatch<React.SetStateAction<RegionalityData>>;
}

const rebalancePercentages = (styles: Omit<MixedStyle, 'percentage'>[]): MixedStyle[] => {
    const count = styles.length;
    if (count === 0) return [];
    
    const basePercentage = Math.floor(100 / count);
    let remainder = 100 % count;
    
    return styles.map((style, i) => {
        const percentage = basePercentage + (remainder > 0 ? 1 : 0);
        if(remainder > 0) remainder--;
        return { ...style, percentage };
    });
};

export const PromptForm = ({ onGenerate, isLoading, cooldownUntil, onCooldown, onGenerateConcepts, isConceptLoading, conceptError, brandConcepts, isTextContentLoading, onSelectConcept, currentConcept, regionalityData, setRegionalityData }: CreationPanelProps): React.JSX.Element => {
    const [basePrompt, setBasePrompt] = useState<string>('');
    const [textOverlay, setTextOverlay] = useState<string>('');
    const [mixedStyles, setMixedStyles] = useState<MixedStyle[]>([]);
    const [styleToAdd, setStyleToAdd] = useState<string>(artStyles[0]);
    
    const [brandName, setBrandName] = useState('');
    const [brandSlogan, setBrandSlogan] = useState('');
    const [brandWeight, setBrandWeight] = useState(25);
    const [isSloganLoading, setIsSloganLoading] = useState(false);
    const [sloganError, setSloganError] = useState<string | null>(null);
    
    // Price Tag State
    const [priceText, setPriceText] = useState('');
    const [priceModelText, setPriceModelText] = useState('');
    const [priceStyle, setPriceStyle] = useState<PriceTagStyleId>('circle');
    const [pricePosition, setPricePosition] = useState<PriceTagPosition>('none');
    const [priceColor, setPriceColor] = useState<PriceTagColor>('red');

    const [selectedTheme, setSelectedTheme] = useState<string>(professionalThemes[0]);
    
    const [carouselOptionsVisible, setCarouselOptionsVisible] = useState<{ [key: number]: boolean }>({});
    
    // Cooldown state
    const [countdown, setCountdown] = useState(0);

    const isInteractionDisabled = isLoading || countdown > 0 || isSloganLoading || isConceptLoading || isTextContentLoading;

    const isProductConceptTheme = useMemo(() => ['Nova Marca de:', 'Nova Loja de:'].some(keyword => selectedTheme.startsWith(keyword)), [selectedTheme]);
    const isDesignConceptTheme = useMemo(() => selectedTheme.startsWith('Design de Interiores'), [selectedTheme]);
    const isConceptGeneratorVisible = isProductConceptTheme || isDesignConceptTheme;

    useEffect(() => {
        if (!cooldownUntil) {
            setCountdown(0);
            return;
        }

        const intervalId = setInterval(() => {
            const now = Date.now();
            const remaining = Math.ceil((cooldownUntil.getTime() - now) / 1000);
            if (remaining > 0) {
                setCountdown(remaining);
            } else {
                setCountdown(0);
                clearInterval(intervalId);
            }
        }, 1000);

        // Set initial value
        const now = Date.now();
        const remaining = Math.ceil((cooldownUntil.getTime() - now) / 1000);
        setCountdown(remaining > 0 ? remaining : 0);

        return () => clearInterval(intervalId);
    }, [cooldownUntil]);

    const handleGenerateSlogan = async () => {
        if (!brandName.trim() || !selectedTheme.trim() || isInteractionDisabled) {
            setSloganError("Preencha o nome da marca e selecione um tema profissional.");
            return;
        }
        setIsSloganLoading(true);
        setSloganError(null);
        try {
            const result = await generateSlogan(brandName, selectedTheme);
            setBrandSlogan(result.slogan);
        } catch (e) {
            if (e instanceof RateLimitError) onCooldown();
            setSloganError((e as Error).message);
        } finally {
            setIsSloganLoading(false);
        }
    };

    const availableStyles = useMemo(() => {
        const selectedNames = new Set(mixedStyles.map(s => s.name));
        return artStyles.filter(s => !selectedNames.has(s));
    }, [mixedStyles]);

    const handleAddStyle = () => {
        if (styleToAdd && mixedStyles.length < 3 && !mixedStyles.some(s => s.name === styleToAdd)) {
            const newStyles = [...mixedStyles, { name: styleToAdd, percentage: 0 }];
            setMixedStyles(rebalancePercentages(newStyles));
            if(availableStyles.length > 1) {
                const nextStyle = availableStyles.find(s => s !== styleToAdd) || '';
                setStyleToAdd(nextStyle);
            } else {
                setStyleToAdd('');
            }
        }
    };

    const handleRemoveStyle = (indexToRemove: number) => {
        const newStyles = mixedStyles.filter((_, i) => i !== indexToRemove);
        setMixedStyles(rebalancePercentages(newStyles));
    };

    const handleSliderChange = (indexToUpdate: number, newPercentageValue: number) => {
        let styles = [...mixedStyles];
        if (styles.length <= 1) {
            setMixedStyles([{...styles[0], percentage: 100}]);
            return;
        }
        
        const oldValue = styles[indexToUpdate].percentage;
        styles[indexToUpdate].percentage = newPercentageValue;
        let otherTotal = 100 - oldValue;
        let newOtherTotal = 100 - newPercentageValue;

        if (otherTotal > 0) {
            for(let i = 0; i < styles.length; i++) {
                if (i !== indexToUpdate) styles[i].percentage *= (newOtherTotal / otherTotal);
            }
        } else {
            const share = newOtherTotal / (styles.length - 1);
            for(let i = 0; i < styles.length; i++) {
                if (i !== indexToUpdate) styles[i].percentage = share;
            }
        }

        let finalStyles = styles.map(s => ({...s, percentage: Math.round(s.percentage)}));
        let roundedTotal = finalStyles.reduce((sum, s) => sum + s.percentage, 0);
        let diffToDistribute = 100 - roundedTotal;
        if(diffToDistribute !== 0 && finalStyles.length > 0) {
            let targetIndex = finalStyles.findIndex((s, i) => i !== indexToUpdate && s.percentage >= Math.max(...finalStyles.filter((_, j) => j !== indexToUpdate).map(st => st.percentage)));
            if(targetIndex !== -1) finalStyles[targetIndex].percentage += diffToDistribute;
            else finalStyles[0].percentage += diffToDistribute;
        }
        setMixedStyles(finalStyles);
    };
    
    const handleRegionalityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRegionalityData(prev => ({ ...prev, [name]: name === 'weight' ? parseInt(value, 10) : value }));
    };

    const handleGenerateConceptsClick = () => {
        onGenerateConcepts(basePrompt, selectedTheme, regionalityData);
        setCarouselOptionsVisible({});
    };
    
    const handleToggleCarouselOptions = (conceptIndex: number) => {
        setCarouselOptionsVisible(prev => ({...prev, [conceptIndex]: !prev[conceptIndex]}));
    };
    
    const handleGenerateFromConcept = (concept: BrandConcept, scenario: 'product' | 'couple' | 'family' | 'isometric_details' | 'poster' | 'executive_project') => {
        onSelectConcept(concept);
        const styleKeywords = mixedStyles.map(s => `${s.name} (${s.percentage}%)`);
        let finalPrompt = '';
        let textForOverlay = `${concept.name}\n${concept.philosophy}`;
        let negativePrompt = '';

        if (isProductConceptTheme) {
            const productType = selectedTheme.split(': ').pop()?.split('(')[0].trim() || 'produto';
            const baseConceptPrompt = `**Conceito do Produto (${productType}):**\n- **Nome:** ${concept.name}\n- **Filosofia:** "${concept.philosophy}"\n- **Design:** ${concept.visualStyle}\n- **Estilos Adicionais:** ${styleKeywords.join(', ')}.`;
            negativePrompt = "logotipos, logos, marcas comerciais, texto, palavras, imitação, plágio";

            switch(scenario) {
                case 'product':
                    finalPrompt = `Fotografia de produto de alta qualidade para e-commerce. ${baseConceptPrompt}\n**Diretivas Visuais:** Foco absoluto no produto (${productType}) isolado, em um fundo neutro de estúdio (branco ou cinza claro). Iluminação profissional que realça texturas e a forma do produto. Ângulo de 3/4. Imagem limpa e premium para catálogo.`;
                    textForOverlay = `${concept.name}`;
                    break;
                case 'couple':
                     finalPrompt = `Fotografia de lifestyle com um casal estiloso. ${baseConceptPrompt}\n**Diretivas Visuais:** Um casal jovem interagindo autenticamente em um ambiente urbano. **O produto (${productType}) DEVE estar em evidência**, sendo usado ou interagindo com ele de forma natural. A composição guia o olhar para o produto. Estética natural, momento espontâneo.`;
                    break;
                case 'family':
                     finalPrompt = `Fotografia de lifestyle com uma família moderna. ${baseConceptPrompt}\n**Diretivas Visuais:** Uma família feliz em um momento de lazer (parque, passeio). **O produto (${productType}) DEVE estar em evidência**, sendo usado por um ou mais membros, mostrando conforto e estilo para o dia a dia. Estética vibrante, clara e cheia de vida. Posicionar o produto como a escolha da família.`;
                    textForOverlay = `${concept.name}\nPara toda a família`;
                    break;
                case 'isometric_details':
                    finalPrompt = `Criação de arte técnica e de marketing de alta qualidade. ${baseConceptPrompt}\n**Diretivas Visuais:** Gere UMA ÚNICA imagem no formato de um diagrama isométrico que mostra o produto (${productType}) de forma detalhada. A imagem NÃO deve ter texto. Em vez de texto, use 4 SETAS ou LINHAS DE CHAMADA (callouts) que apontam de características importantes do produto para os 4 cantos da imagem (canto superior esquerdo, superior direito, inferior esquerdo, inferior direito), deixando essas áreas livres para anotações posteriores. A estética deve ser limpa, técnica, mas estilizada para se alinhar ao conceito da marca. Fundo branco ou de cor neutra.`;
                    textForOverlay = concept.name;
                    negativePrompt = "pessoas, paisagens, cenários complexos, desordem, texto, palavras, logos, marcas comerciais, plágio";
                    break;
                 case 'poster':
                    finalPrompt = `Criação de um cartaz de marketing ou mood board de alta qualidade. ${baseConceptPrompt}\n**Diretivas Visuais:** Gere UMA ÚNICA imagem que seja um pôster ou cartaz. O layout deve ser uma composição limpa e moderna com MÚLTIPLAS imagens de lifestyle menores no estilo "photo dump" ou "trend", mostrando o produto (${productType}) em diferentes contextos autênticos. A estética deve ser de revista de design, com espaço negativo para texto.`;
                    textForOverlay = `${concept.name}`;
                    negativePrompt = "imagem única, uma foto só, desordem, texto, palavras, logos";
                    break;
                case 'executive_project':
                    finalPrompt = `Criação de uma folha de projeto técnico (blueprint) de alta qualidade. ${baseConceptPrompt}\n**Diretivas Visuais:** Gere UMA ÚNICA imagem que funciona como uma folha de desenho técnico. O layout deve conter as seguintes vistas do produto (${productType}): uma VISTA ISOMÉTRICA grande e proeminente, e quatro vistas ortográficas menores e alinhadas: VISTA DE TOPO, VISTA FRONTAL, VISTA LATERAL e VISTA DE COSTAS. A estética deve ser limpa, minimalista e profissional, como um desenho de engenharia ou patente, com linhas finas e precisas sobre um fundo branco. A imagem deve ser totalmente livre de textos, números ou dimensões.`;
                    textForOverlay = concept.name;
                    negativePrompt = "texto, palavras, números, dimensões, logos, marcas, pessoas, paisagens, cenários complexos, desordem, cores vibrantes, sombras, fotorrealismo";
                    break;
            }
        } else { // Interior Design Theme
            const designType = selectedTheme.split(': ').pop() || '';
            const baseConceptPrompt = `**Conceito de Design para ${designType}:**\n- **Nome:** ${concept.name}\n- **Filosofia:** "${concept.philosophy}"\n- **Estilo Visual e Materiais:** ${concept.visualStyle}\n- **Estilos Adicionais:** ${styleKeywords.join(', ')}.`;
            negativePrompt = "desordem, bagunça, má qualidade de renderização, deformado, irrealista, feio, desfocado";

            switch(scenario) {
                case 'product':
                    finalPrompt = `Renderização 3D fotorrealista e cinematográfica de um(a) ${designType} com base no conceito a seguir. ${baseConceptPrompt}\n**Diretivas Visuais:** Foco absoluto no móvel/ambiente. Apresentar em um cenário de estúdio minimalista ou com um fundo sutil que complemente o design. Iluminação profissional que destaca materiais, texturas e formas. Qualidade de imagem de revista de arquitetura de luxo.`;
                    textForOverlay = `${concept.name}`;
                    break;
                case 'couple':
                     finalPrompt = `Fotografia de lifestyle fotorrealista. ${baseConceptPrompt}\n**Diretivas Visuais:** Um casal interagindo de forma autêntica e elegante no ambiente projetado (${designType}). Ex: cozinhando juntos, relaxando na sala. A arquitetura e o design do mobiliário são o pano de fundo aspiracional. A atmosfera é de conforto, sofisticação e felicidade. Luz natural invasora.`;
                    break;
                case 'family':
                     finalPrompt = `Fotografia de lifestyle fotorrealista e calorosa. ${baseConceptPrompt}\n**Diretivas Visuais:** Uma família interagindo em um momento feliz e descontraído no ambiente projetado (${designType}). Ex: pais e filhos lendo na sala, preparando uma refeição na cozinha. A cena deve transmitir a funcionalidade e a beleza do espaço no dia a dia. O design serve como um lar acolhedor.`;
                    textForOverlay = `${concept.name}\nPara toda a família`;
                    break;
                case 'isometric_details':
                     finalPrompt = `Renderização 3D fotorrealista técnica de um(a) ${designType}. ${baseConceptPrompt}\n**Diretivas Visuais:** Gere UMA ÚNICA imagem no formato de uma planta isométrica ou vista de corte (cutaway view) do ambiente (${designType}). A imagem NÃO deve ter texto. Em vez de texto, use 4 SETAS ou LINHAS DE CHAMADA (callouts) para destacar 4 áreas ou detalhes de design chave (ex: um móvel, fluxo de layout, um material) para os 4 cantos da imagem. A estética deve ser limpa e informativa, como de uma revista de arquitetura.`;
                    textForOverlay = concept.name;
                    negativePrompt = "desordem, má qualidade de renderização, deformado, irrealista, feio, desfocado, texto, palavras";
                    break;
                case 'poster':
                    finalPrompt = `Criação de um cartaz de marketing ou mood board de design de interiores. ${baseConceptPrompt}\n**Diretivas Visuais:** Gere UMA ÚNICA imagem que seja um pôster ou um mood board. O layout deve conter MÚLTIPLAS imagens menores mostrando diferentes ângulos, detalhes e texturas do ambiente (${designType}). A composição deve ser limpa, profissional, como em uma revista de arquitetura, com espaço negativo para texto.`;
                    textForOverlay = `${concept.name}`;
                    negativePrompt = "uma foto só, desordem, texto, palavras";
                    break;
                case 'executive_project':
                    finalPrompt = `Criação de uma folha de projeto de arquitetura de alta qualidade. ${baseConceptPrompt}\n**Diretivas Visuais:** Gere UMA ÚNICA imagem que funciona como uma prancha de apresentação de arquitetura. O layout deve conter as seguintes vistas do ambiente (${designType}): uma VISTA ISOMÉTRICA grande e renderizada de forma limpa, e quatro vistas técnicas menores e alinhadas: PLANTA BAIXA, ELEVAÇÃO FRONTAL, ELEVAÇÃO LATERAL e uma VISTA DE CORTE (cross-section) revelando o interior. A estética deve ser de uma revista de arquitetura de ponta: minimalista, profissional, com linhas finas e precisas sobre um fundo branco. A imagem deve ser totalmente livre de textos, cotas ou anotações.`;
                    textForOverlay = concept.name;
                    negativePrompt = "texto, palavras, cotas, números, anotações, logos, pessoas, desordem, bagunça, cores excessivas, renderização de má qualidade";
                    break;
            }
        }
        
         const options: GenerateOptions = {
            basePrompt,
            imagePrompt: finalPrompt,
            textOverlay: textForOverlay,
            compositionId: 'impacto-light',
            textPosition: scenario === 'isometric_details' ? 'top-right' : 'center',
            subtitleOutline: 'auto',
            artStyles: styleKeywords,
            theme: selectedTheme,
            brandData: { name: brandName, slogan: brandSlogan, weight: brandWeight },
            priceData: { text: priceText, modelText: priceModelText, style: priceStyle, position: pricePosition, color: priceColor },
            regionalityData,
            negativeImagePrompt: negativePrompt,
            numberOfImages: 1,
            scenario,
            concept
        };
        onGenerate(options);
    };

    const handleGenerateCarousel = (concept: BrandConcept, type: 'cta' | 'educational' | 'trend') => {
        onSelectConcept(concept);
        const styleKeywords = mixedStyles.map(s => `${s.name} (${s.percentage}%)`);
        let finalPrompt = '';
        const numberOfImagesToGenerate = 4; // API LIMIT: Max is 4
        let negativePrompt = '';
        let scenario: GenerateOptions['scenario'];

        if (isProductConceptTheme) {
            const productType = selectedTheme.split(': ').pop()?.split('(')[0].trim() || 'produto';
            const baseConceptPrompt = `**Conceito Base do Produto (${productType}):**\n- **Nome:** ${concept.name}\n- **Filosofia:** "${concept.philosophy}"\n- **Design:** ${concept.visualStyle}\n- **Estilos Adicionais:** ${styleKeywords.join(', ')}.`;
            negativePrompt = "logotipos, logos, marcas, texto, palavras, imitação, plágio";

            switch (type) {
                case 'cta':
                    scenario = 'carousel_cta';
                    finalPrompt = `Gere um carrossel de ${numberOfImagesToGenerate} imagens de anúncio de alta conversão. ${baseConceptPrompt}\n**Diretriz:** Cada imagem deve ser uma variação de um 'hero shot' do produto (${productType}), com foco em criar desejo imediato. Imagem 1: Produto em close-up extremo, mostrando um detalhe de material premium. Imagem 2: Produto em um ângulo de 3/4 dinâmico com iluminação de estúdio dramática. Imagem 3: O produto flutuando em um fundo de cor vibrante. Imagem 4: O produto em movimento ou em uso, com um leve desfoque para indicar ação. O produto é o herói absoluto em todas as ${numberOfImagesToGenerate} imagens.`;
                    break;
                case 'educational':
                    scenario = 'carousel_educational';
                    finalPrompt = `Gere um carrossel de ${numberOfImagesToGenerate} imagens educativas. ${baseConceptPrompt}\n**Diretriz:** Cada imagem deve destacar um detalhe técnico ou de design diferente do produto (${productType}). Use um estilo limpo, quase diagramático. Imagem 1: Close na textura de um material inovador. Imagem 2: Close em uma característica tecnológica. Imagem 3: Close em um detalhe de design único. Imagem 4: Uma visão explodida dos componentes chave, mostrando como eles se encaixam.`;
                    break;
                case 'trend':
                    scenario = 'carousel_trend';
                    finalPrompt = `Gere um carrossel de ${numberOfImagesToGenerate} imagens de lifestyle no estilo 'photo dump' para redes sociais. ${baseConceptPrompt}\n**Diretriz:** Capture o produto (${productType}) em contextos autênticos e da moda, com estética de filme granulado. Imagem 1: 'Fit check' ou 'setup check' em um espelho, com o look/ambiente completo em foco. Imagem 2: Close no produto em uso, em um local interessante. Imagem 3: 'Unboxing' estético em uma superfície bem composta. Imagem 4: O produto como parte de um 'flat lay' com objetos que complementam seu universo.`;
                    break;
            }
        } else { // Interior Design Theme
            const designType = selectedTheme.split(': ').pop() || '';
            const baseConceptPrompt = `**Conceito de Design para ${designType}:**\n- **Nome:** ${concept.name}\n- **Filosofia:** "${concept.philosophy}"\n- **Estilo Visual e Materiais:** ${concept.visualStyle}\n- **Estilos Adicionais:** ${styleKeywords.join(', ')}.`;
            negativePrompt = "desordem, bagunça, má qualidade de renderização, deformado, irrealista, feio, desfocado, texto, palavras";

            switch (type) {
                case 'cta':
                    scenario = 'carousel_cta';
                    finalPrompt = `Gere um carrossel fotorrealista de ${numberOfImagesToGenerate} imagens de anúncio para um(a) ${designType}. ${baseConceptPrompt}\n**Diretriz:** Foco em desejo e luxo. Imagem 1: Ângulo amplo mostrando o ambiente completo. Imagem 2: Close-up em um detalhe de material nobre (ex: veio de mármore, textura da madeira). Imagem 3: Close-up em uma solução de design inteligente (ex: gaveta oculta, sistema de iluminação). Imagem 4: O ambiente visto de uma perspectiva humana, como se o espectador estivesse prestes a entrar.`;
                    break;
                case 'educational':
                    scenario = 'carousel_educational';
                    finalPrompt = `Gere um carrossel fotorrealista de ${numberOfImagesToGenerate} imagens educativas sobre um(a) ${designType}. ${baseConceptPrompt}\n**Diretriz:** Foco em funcionalidade e inovação. Imagem 1: Visão geral do design. Imagem 2: Detalhe mostrando a durabilidade ou facilidade de limpeza de um material. Imagem 3: Detalhe mostrando a capacidade de armazenamento ou organização. Imagem 4: Detalhe mostrando a ergonomia ou o conforto do design em uso.`;
                    break;
                case 'trend':
                    scenario = 'carousel_trend';
                    finalPrompt = `Gere um carrossel de ${numberOfImagesToGenerate} imagens de lifestyle para redes sociais, com estética 'clean' e orgânica, para um(a) ${designType}. ${baseConceptPrompt}\n**Diretriz:** Capture momentos autênticos no espaço. Imagem 1: Mãos preparando um café na bancada da cozinha. Imagem 2: Um livro e uma manta sobre uma poltrona na sala. Imagem 3: Um canto do ambiente com uma planta e luz natural. Imagem 4: Detalhe da organização de um armário ou closet. O ambiente é o protagonista silencioso.`;
                    break;
            }
        }

        const options: GenerateOptions = {
            basePrompt,
            imagePrompt: finalPrompt,
            textOverlay: "",
            compositionId: 'impacto-light',
            textPosition: 'center',
            subtitleOutline: 'auto',
            artStyles: styleKeywords,
            theme: selectedTheme,
            brandData: { name: concept.name, slogan: concept.philosophy, weight: 100 },
            priceData: { text: '', modelText: '', style: 'circle', position: 'none', color: 'red' },
            regionalityData,
            negativeImagePrompt: negativePrompt,
            numberOfImages: numberOfImagesToGenerate,
            scenario,
            concept,
        };
        onGenerate(options);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isInteractionDisabled || !basePrompt.trim()) return;

        const artStyleKeywords = mixedStyles.map(style => `${style.name} (${style.percentage}%)`);
        
        let imagePrompt = `${basePrompt}, tema: ${selectedTheme}.`;
        if (artStyleKeywords.length > 0) {
            imagePrompt += ` Estilos visuais: ${artStyleKeywords.join(', ')}.`;
        }
        
        const regionalityKeywords = [regionalityData.country, regionalityData.city, regionalityData.neighborhood].filter(Boolean).join(', ');
        if (regionalityKeywords && regionalityData.weight > 10) {
            imagePrompt += ` Influência regional de ${regionalityKeywords} (${regionalityData.weight}%).`;
        }
         if (brandName && brandWeight > 10) {
            imagePrompt += ` Associado à marca ${brandName} (${brandWeight}%).`;
        }

        const options: GenerateOptions = {
            basePrompt,
            imagePrompt,
            textOverlay,
            compositionId: 'random',
            textPosition: 'center',
            subtitleOutline: 'auto',
            artStyles: artStyleKeywords,
            theme: selectedTheme,
            brandData: { name: brandName, slogan: brandSlogan, weight: brandWeight },
            priceData: { text: priceText, modelText: priceModelText, style: priceStyle, position: pricePosition, color: priceColor },
            regionalityData,
            numberOfImages: 1
        };

        onGenerate(options);
    };
    
    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 flex flex-col h-full overflow-y-auto">
            <div className="space-y-4 flex-grow">
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">Painel de Criação</h2>
                
                {/* --- SEÇÃO 1: IDEIA CENTRAL --- */}
                <div className="space-y-3">
                    <label htmlFor="basePrompt" className="block text-sm font-bold text-gray-700">1. Qual é a sua ideia?</label>
                    <textarea 
                        id="basePrompt"
                        value={basePrompt} 
                        onChange={(e) => setBasePrompt(e.target.value)} 
                        placeholder="Ex: um tênis futurista para corrida noturna, uma cozinha com ilha central em estilo industrial..." 
                        className="w-full h-20 p-2 bg-gray-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow duration-200"
                        required
                    />
                </div>

                {/* --- SEÇÃO 2: TEMA PROFISSIONAL --- */}
                <div className="space-y-3">
                    <label htmlFor="selectedTheme" className="block text-sm font-bold text-gray-700">2. Qual é o seu nicho profissional?</label>
                    <select 
                        id="selectedTheme" 
                        value={selectedTheme} 
                        onChange={(e) => setSelectedTheme(e.target.value)} 
                        className="w-full p-2 bg-gray-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                        {professionalThemes.map(theme => <option key={theme} value={theme}>{theme}</option>)}
                    </select>
                </div>
                
                 {/* --- SEÇÃO 3: ESTILOS VISUAIS --- */}
                 <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">3. Misture até 3 estilos visuais</label>
                    {mixedStyles.map((style, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600 w-1/3 truncate" title={style.name}>{style.name}</span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={style.percentage}
                                onChange={(e) => handleSliderChange(i, parseInt(e.target.value, 10))}
                                className="w-2/3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                disabled={isInteractionDisabled}
                            />
                            <span className="text-sm font-semibold w-12 text-right">{style.percentage}%</span>
                            <button type="button" onClick={() => handleRemoveStyle(i)} className="p-1 text-gray-400 hover:text-red-500" disabled={isInteractionDisabled}>
                                <XIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    ))}
                    {mixedStyles.length < 3 && (
                        <div className="flex items-center gap-2">
                            <select value={styleToAdd} onChange={(e) => setStyleToAdd(e.target.value)} className="w-full p-2 bg-gray-50 rounded-md border border-gray-300 text-sm" disabled={!availableStyles.length || isInteractionDisabled}>
                                {availableStyles.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <button type="button" onClick={handleAddStyle} className="flex-shrink-0 p-2 bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200 disabled:opacity-50" disabled={!styleToAdd || isInteractionDisabled}>
                                <PlusIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    )}
                 </div>

                 {/* --- SEÇÃO 4: TEXTO DA ARTE --- */}
                 <div className="space-y-3">
                     <label htmlFor="textOverlay" className="block text-sm font-bold text-gray-700">4. Texto para a Imagem (opcional)</label>
                     <textarea 
                        id="textOverlay"
                        value={textOverlay} 
                        onChange={(e) => setTextOverlay(e.target.value)} 
                        placeholder="Título (primeira linha)&#10;Subtítulo (opcional)" 
                        className="w-full h-20 p-2 bg-gray-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow duration-200"
                        maxLength={280}
                    />
                 </div>
                 
                 {/* --- FERRAMENTAS DE IA --- */}
                 {isConceptGeneratorVisible && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-3">
                        <h3 className="font-bold text-purple-800">{isProductConceptTheme ? 'Protótipo de Nova Marca' : 'Laboratório de Conceitos de Design'}</h3>
                        <p className="text-sm text-purple-700">Use a sua ideia do passo 1 para gerar conceitos completos e depois gerar a imagem.</p>
                        <button type="button" onClick={handleGenerateConceptsClick} disabled={isInteractionDisabled || !basePrompt.trim()} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300">
                           {isConceptLoading ? <LoaderIcon className="animate-spin w-5 h-5"/> : <SparklesIcon className="w-5 h-5"/>}
                           <span>{isProductConceptTheme ? 'Gerar Conceitos de Marca' : 'Gerar Conceitos de Design'}</span>
                        </button>
                        {conceptError && <p className="text-xs text-red-600 text-center">{conceptError}</p>}
                        {brandConcepts && (
                            <div className="space-y-4 pt-2">
                                {brandConcepts.map((concept, i) => (
                                    <div 
                                      key={i} 
                                      onClick={() => onSelectConcept(concept)}
                                      className={`p-3 bg-white rounded-md border-2 space-y-3 cursor-pointer transition-all duration-200 ${currentConcept?.name === concept.name ? 'border-purple-500 shadow-lg' : 'border-purple-200 hover:border-purple-400 hover:shadow-md'}`}
                                    >
                                        <div>
                                            <h4 className="font-bold text-gray-800">{concept.name}</h4>
                                            <p className="text-xs text-gray-500 italic">"{concept.philosophy}"</p>
                                            <p className="text-sm text-gray-700 mt-1">{concept.visualStyle}</p>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            <button type="button" onClick={(e) => { e.stopPropagation(); handleGenerateFromConcept(concept, 'product'); }} disabled={isInteractionDisabled} className="flex items-center justify-center gap-1.5 px-2 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition-colors disabled:bg-green-300">
                                                <ProductIcon className="w-4 h-4" /><span>Produto</span>
                                            </button>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); handleGenerateFromConcept(concept, 'couple'); }} disabled={isInteractionDisabled} className="flex items-center justify-center gap-1.5 px-2 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300">
                                                <UsersIcon className="w-4 h-4" /><span>Casal</span>
                                            </button>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); handleGenerateFromConcept(concept, 'family'); }} disabled={isInteractionDisabled} className="flex items-center justify-center gap-1.5 px-2 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors disabled:bg-orange-300">
                                                <FamilyIcon className="w-4 h-4" /><span>Família</span>
                                            </button>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); handleGenerateFromConcept(concept, 'isometric_details'); }} disabled={isInteractionDisabled} className="flex items-center justify-center gap-1.5 px-2 py-2 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600 transition-colors disabled:bg-teal-300">
                                                <DetailedViewIcon className="w-4 h-4" /><span>Detalhes</span>
                                            </button>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); handleGenerateFromConcept(concept, 'executive_project'); }} disabled={isInteractionDisabled} className="flex items-center justify-center gap-1.5 px-2 py-2 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400">
                                                <BlueprintIcon className="w-4 h-4" /><span>Executivo</span>
                                            </button>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); handleGenerateFromConcept(concept, 'poster'); }} disabled={isInteractionDisabled} className="flex items-center justify-center gap-1.5 px-2 py-2 bg-indigo-500 text-white font-semibold rounded-md hover:bg-indigo-600 transition-colors disabled:bg-indigo-300">
                                                <PosterIcon className="w-4 h-4" /><span>Cartaz</span>
                                            </button>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); handleToggleCarouselOptions(i); }} disabled={isInteractionDisabled} className={`col-span-3 flex items-center justify-center gap-1.5 px-2 py-2 font-semibold rounded-md border-2 transition-colors disabled:opacity-50 ${carouselOptionsVisible[i] ? 'bg-purple-500 text-white border-purple-500' : 'bg-transparent text-gray-600 border-gray-400 hover:bg-gray-100'}`}>
                                                <LayersIcon className="w-4 h-4" /><span>Gerar Carrossel</span>
                                            </button>
                                        </div>

                                        {carouselOptionsVisible[i] && (
                                            <div className="pt-2">
                                                <div className="p-3 bg-purple-100/50 rounded-lg border border-purple-200">
                                                    <h5 className="text-xs font-bold text-center text-purple-800 mb-2">Gerar Carrossel de 4 Imagens</h5>
                                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                                        <button onClick={(e) => { e.stopPropagation(); handleGenerateCarousel(concept, 'cta'); }} disabled={isInteractionDisabled} className="px-2 py-1.5 bg-purple-600 text-white font-semibold rounded hover:bg-purple-700 disabled:bg-purple-300">CTA</button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleGenerateCarousel(concept, 'educational'); }} disabled={isInteractionDisabled} className="px-2 py-1.5 bg-purple-600 text-white font-semibold rounded hover:bg-purple-700 disabled:bg-purple-300">Educativo</button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleGenerateCarousel(concept, 'trend'); }} disabled={isInteractionDisabled} className="px-2 py-1.5 bg-purple-600 text-white font-semibold rounded hover:bg-purple-700 disabled:bg-purple-300">Trend</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                 )}
            </div>

            <div className="flex-shrink-0 pt-4 border-t border-gray-200">
                <button type="submit" disabled={isInteractionDisabled || !basePrompt.trim()} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white text-lg font-bold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-200 disabled:bg-purple-300 disabled:cursor-not-allowed">
                    {isLoading ? (
                        <LoaderIcon className="w-6 h-6 animate-spin" />
                    ) : (
                        <SparklesIcon className="w-6 h-6" />
                    )}
                    <span>{countdown > 0 ? `Aguarde (${countdown}s)` : 'Gerar Arte Principal'}</span>
                </button>
            </div>
        </form>
    );
};