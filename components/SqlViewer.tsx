

import React, { useRef, useEffect, useState } from 'react';
import { AlertTriangleIcon, DownloadIcon, ImageIcon, PublishIcon, SparklesIcon, LoaderIcon, ClipboardIcon, CheckIcon, LightbulbIcon, GoogleIcon, EditIcon, MegaphoneIcon, TagIcon, ChevronLeftIcon, ChevronRightIcon, TextQuoteIcon, FileTextIcon, BookOpenIcon, PosterIcon } from '@/components/icons';
import { compositionPresets } from '@/lib/compositions';
import type { TextPosition, AdCopy, SubtitleOutlineStyle, CompositionPreset, BrandData, PriceData, FeatureDetails, LandingPageContent, BlogPostContent, BrandConcept, PosterContent, RegionalityData } from '@/types';
import { positionOptions, subtitleOutlineOptions, priceColorOptions, pricePositionOptions, priceStyleOptions } from '@/lib/options';


interface ImageCanvasProps {
    imagesB64: string[] | null;
    textOverlay: string;
    compositionId: string;
    textPosition: TextPosition;
    subtitleOutline: SubtitleOutlineStyle;
    artStyles: string[];
    isLoading: boolean;
    error: string | null;
    adCopy: AdCopy | null;
    isAdCopyLoading: boolean;
    adCopyError: string | null;
    onGenerateAds: () => void;
    brandData: BrandData;
    priceData: PriceData;
    regionalityData: RegionalityData;
    featureDetails: FeatureDetails[] | null;
    landingPageContent: LandingPageContent | null;
    blogPostContent: BlogPostContent | null;
    posterContent: PosterContent | null;
    isTextContentLoading: boolean;
    textContentError: string | null;
    onGenerateTextContent: (concept: BrandConcept, type: 'landingPage' | 'blogPost' | 'poster') => void;
    currentConcept: BrandConcept | null;
    isBlogImagesLoading: boolean;
    blogImagesError: string | null;
    isLandingPageImagesLoading: boolean;
    landingPageImagesError: string | null;
    isPosterImagesLoading: boolean;
    posterImagesError: string | null;
    // Setters for editing
    setTextOverlay: (value: string) => void;
    setCompositionId: (value: string) => void;
    setTextPosition: (value: TextPosition) => void;
    setSubtitleOutline: (value: SubtitleOutlineStyle) => void;
    setPriceData: (value: React.SetStateAction<PriceData>) => void;
    setFeatureDetails: (value: React.SetStateAction<FeatureDetails[] | null>) => void;
}

const CANVAS_SIZE = 1080; // For Instagram post resolution

// --- COLOR HELPER FUNCTIONS ---
type RGB = { r: number; g: number; b: number; };

// Heavily simplified color quantization
const getProminentColors = (image: HTMLImageElement, count = 5): RGB[] => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return [{ r: 255, g: 255, b: 255 }, {r: 0, g: 0, b: 0}];
    
    const scale = Math.min(100 / image.width, 100 / image.height);
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colorCounts: { [key: string]: { color: RGB; count: number } } = {};
    
    // Bucket colors to reduce dimensionality (8x8x8 cube)
    for (let i = 0; i < data.length; i += 4) {
        if(data[i+3] < 128) continue; // Skip transparent/semi-transparent pixels
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const key = `${Math.round(r/32)}_${Math.round(g/32)}_${Math.round(b/32)}`;
        if (!colorCounts[key]) {
            colorCounts[key] = { color: { r, g, b }, count: 0 };
        }
        colorCounts[key].count++;
    }

    const sortedColors = Object.values(colorCounts).sort((a, b) => b.count - a.count);
    return sortedColors.slice(0, count).map(c => c.color);
}


const rgbToHsl = ({r,g,b}: RGB): [number, number, number] => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, l];
};

const getPalette = (image: HTMLImageElement, paletteType: string) => {
    const prominentColors = getProminentColors(image);
    const sortedByLuminance = [...prominentColors].sort((a, b) => {
        const lumA = 0.2126 * a.r + 0.7152 * a.g + 0.0722 * a.b;
        const lumB = 0.2126 * b.r + 0.7152 * b.g + 0.0722 * b.b;
        return lumB - lumA;
    });

    const darkest = sortedByLuminance[sortedByLuminance.length - 1] || {r:0, g:0, b:0};
    const lightest = sortedByLuminance[0] || {r:255, g:255, b:255};
    
    const palette = { fill1: '#FFFFFF', fill2: '#E0E0E0', stroke: '#000000' };

    switch(paletteType) {
        case 'light':
            palette.fill1 = `rgb(${lightest.r}, ${lightest.g}, ${lightest.b})`;
            palette.fill2 = `rgba(${(lightest.r + 200)/2}, ${(lightest.g + 200)/2}, ${(lightest.b + 200)/2}, 1)`;
            palette.stroke = `rgb(${darkest.r}, ${darkest.g}, ${darkest.b})`;
            break;
        case 'dark':
            palette.fill1 = `rgb(${darkest.r}, ${darkest.g}, ${darkest.b})`;
            palette.fill2 = `rgba(${(darkest.r + 50)/2}, ${(darkest.g + 50)/2}, ${(darkest.b + 50)/2}, 1)`;
            palette.stroke = `rgb(${lightest.r}, ${lightest.g}, ${lightest.b})`;
            break;
        case 'complementary': {
            const primary = prominentColors[0] || {r:128, g:128, b:128};
            const [h, s, l] = rgbToHsl(primary);
            const compH = (h + 0.5) % 1;
            const compRgb = hslToRgb(compH, s, Math.max(0.5, l));
            palette.fill1 = `rgb(${primary.r}, ${primary.g}, ${primary.b})`;
            palette.fill2 = `rgb(${compRgb.r}, ${compRgb.g}, ${compRgb.b})`;
            palette.stroke = `rgb(${lightest.r}, ${lightest.g}, ${lightest.b})`;
            break;
        }
        case 'analogous': {
            const primary = prominentColors[0] || {r:128, g:128, b:128};
            const secondary = prominentColors[1] || primary;
            palette.fill1 = `rgb(${primary.r}, ${primary.g}, ${primary.b})`;
            palette.fill2 = `rgb(${secondary.r}, ${secondary.g}, ${secondary.b})`;
            palette.stroke = `rgb(${lightest.r}, ${lightest.g}, ${lightest.b})`;
            break;
        }
        default:
             palette.fill1 = `rgb(${lightest.r}, ${lightest.g}, ${lightest.b})`;
             palette.stroke = `rgb(${darkest.r}, ${darkest.g}, ${darkest.b})`;
    }

    // Ensure sufficient contrast for stroke
    const fillLum = 0.2126 * parseInt(palette.fill1.slice(1,3), 16) + 0.7152 * parseInt(palette.fill1.slice(3,5), 16) + 0.0722 * parseInt(palette.fill1.slice(5,7), 16);
    const strokeLum = 0.2126 * parseInt(palette.stroke.slice(1,3), 16) + 0.7152 * parseInt(palette.stroke.slice(3,5), 16) + 0.0722 * parseInt(palette.stroke.slice(5,7), 16);
    if(Math.abs(fillLum - strokeLum) < 50) {
        palette.stroke = strokeLum > 128 ? '#000000' : '#FFFFFF';
    }

    return palette;
}
const hslToRgb = (h: number, s: number, l: number): RGB => {
    let r, g, b;
    if (s === 0) { r = g = b = l; } 
    else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

// --- FONT HELPER ---
const FONT_MAP: { [key: string]: { titleFont: string; subtitleFont: string } } = {
    'default': { titleFont: "'Anton', sans-serif", subtitleFont: "'Poppins', sans-serif" },
    'Comic-book': { titleFont: "'Bangers', cursive", subtitleFont: "'Poppins', sans-serif" },
    'Meme': { titleFont: "'Bangers', cursive", subtitleFont: "'Poppins', sans-serif" },
    'Lobster': { titleFont: "'Lobster', cursive", subtitleFont: "'Poppins', sans-serif" },
    'Playfair Display': { titleFont: "'Playfair Display', serif", subtitleFont: "'Poppins', sans-serif" },
    'Old Money': { titleFont: "'Playfair Display', serif", subtitleFont: "'Poppins', sans-serif" },
    'Art Déco': { titleFont: "'Playfair Display', serif", subtitleFont: "'Poppins', sans-serif" },
    'Bauhaus': { titleFont: "'Poppins', sans-serif", subtitleFont: "'Poppins', sans-serif" },
    'Minimalista': { titleFont: "'Poppins', sans-serif", subtitleFont: "'Poppins', sans-serif" },
};

const getFontForStyle = (styles: string[]): { titleFont: string; subtitleFont: string } => {
    if (!styles || styles.length === 0) return FONT_MAP['default'];
    for (const style of styles) {
        for (const key in FONT_MAP) {
            if (style.includes(key)) {
                return FONT_MAP[key];
            }
        }
    }
    return FONT_MAP['default'];
};
// --- END FONT HELPER ---


const getWrappedLines = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const lines: string[] = [];
    if (!text) return lines;
    
    const paragraphs = text.split('\n');
    paragraphs.forEach(paragraph => {
      const words = paragraph.split(' ');
      let currentLine = '';
      for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          if (ctx.measureText(testLine).width > maxWidth && currentLine) {
              lines.push(currentLine);
              currentLine = word;
          } else {
              currentLine = testLine;
          }
      }
      if (currentLine) {
          lines.push(currentLine);
      }
    });
    return lines;
};

const drawPriceTag = (ctx: CanvasRenderingContext2D, priceData: PriceData) => {
    if (!priceData || (!priceData.text.trim() && !priceData.modelText.trim()) || priceData.position === 'none') {
        return;
    }
    
    ctx.save();
    
    const colorOption = priceColorOptions.find(c => c.id === priceData.color) || priceColorOptions[0];
    ctx.fillStyle = colorOption.hex;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 6;
    
    const priceText = priceData.text.trim();
    const modelText = priceData.modelText.trim();
    
    const priceFontSize = CANVAS_SIZE * 0.06;
    const modelFontSize = CANVAS_SIZE * 0.035;

    ctx.font = `900 ${priceFontSize}px 'Poppins', sans-serif`;
    const priceMetrics = ctx.measureText(priceText);
    
    ctx.font = `500 ${modelFontSize}px 'Poppins', sans-serif`;
    const modelMetrics = ctx.measureText(modelText);

    const textWidth = Math.max(priceMetrics.width, modelMetrics.width);
    const priceHeight = priceText ? priceFontSize : 0;
    const modelHeight = modelText ? modelFontSize : 0;
    const verticalPadding = priceFontSize * 0.1;
    const totalTextHeight = priceHeight + modelHeight + (priceText && modelText ? verticalPadding : 0);
    
    const horizontalPadding = priceFontSize * 0.5;
    const verticalPaddingForShape = priceFontSize * 0.4;
    
    let tagWidth, tagHeight;
    
    if (priceData.style === 'circle' || priceData.style === 'burst') {
        const diameter = Math.max(textWidth, totalTextHeight) + horizontalPadding * 2;
        tagWidth = diameter;
        tagHeight = diameter;
    } else { // 'tag'
        tagWidth = textWidth + horizontalPadding * 2;
        tagHeight = totalTextHeight + verticalPaddingForShape * 2;
    }

    const radius = tagWidth / 2;
    const margin = CANVAS_SIZE * 0.05;
    let x = 0, y = 0; // Center of the tag

    switch(priceData.position) {
        case 'top-left': 
            x = margin + tagWidth / 2;
            y = margin + tagHeight / 2;
            break;
        case 'top-right': 
            x = CANVAS_SIZE - margin - tagWidth / 2;
            y = margin + tagHeight / 2;
            break;
        case 'bottom-left':
            x = margin + tagWidth / 2;
            y = CANVAS_SIZE - margin - tagHeight / 2;
            break;
        case 'bottom-right':
            x = CANVAS_SIZE - margin - tagHeight / 2;
            y = CANVAS_SIZE - margin - tagHeight / 2;
            break;
    }

    // Draw shape
    ctx.beginPath();
    switch(priceData.style) {
        case 'circle':
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            break;
        case 'tag':
            ctx.rect(x - tagWidth/2, y - tagHeight/2, tagWidth, tagHeight);
            break;
        case 'burst':
            const points = 12;
            const inset = 0.7;
            ctx.translate(x, y);
            ctx.moveTo(0, 0 - radius);
            for (let i = 0; i < points; i++) {
                ctx.rotate(Math.PI / points);
                ctx.lineTo(0, 0 - (radius * inset));
                ctx.rotate(Math.PI / points);
                ctx.lineTo(0, 0 - radius);
            }
            ctx.translate(-x, -y);
            break;
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    // Draw text
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (priceText && modelText) {
        const priceY = y - (totalTextHeight / 2) + (priceHeight / 2);
        const modelY = priceY + (priceHeight / 2) + verticalPadding + (modelHeight / 2);
        
        ctx.font = `900 ${priceFontSize}px 'Poppins', sans-serif`;
        ctx.fillText(priceText, x, priceY);

        ctx.font = `500 ${modelFontSize}px 'Poppins', sans-serif`;
        ctx.fillText(modelText, x, modelY);

    } else {
        // Only one line of text
        const singleText = priceText || modelText;
        const singleFontSize = priceText ? priceFontSize : modelFontSize;
        const fontWeight = priceText ? '900' : '500';
        
        ctx.font = `${fontWeight} ${singleFontSize}px 'Poppins', sans-serif`;
        ctx.fillText(singleText, x, y);
    }

    ctx.restore();
}

const drawFeatureDetails = (ctx: CanvasRenderingContext2D, details: FeatureDetails[]) => {
    if (!details || details.length === 0) return;

    ctx.save();

    const cornerPositions = [
        { x: CANVAS_SIZE * 0.05, y: CANVAS_SIZE * 0.05, align: 'left' as const, baseline: 'top' as const },
        { x: CANVAS_SIZE * 0.95, y: CANVAS_SIZE * 0.05, align: 'right' as const, baseline: 'top' as const },
        { x: CANVAS_SIZE * 0.95, y: CANVAS_SIZE * 0.95, align: 'right' as const, baseline: 'bottom' as const },
        { x: CANVAS_SIZE * 0.05, y: CANVAS_SIZE * 0.95, align: 'left' as const, baseline: 'bottom' as const },
    ];

    const maxWidth = CANVAS_SIZE * 0.4;
    
    details.slice(0, 4).forEach((detail, index) => {
        const pos = cornerPositions[index];
        if (!pos) return;

        ctx.textAlign = pos.align;
        ctx.textBaseline = pos.baseline;
        
        const titleFontSize = CANVAS_SIZE * 0.025;
        const descFontSize = CANVAS_SIZE * 0.02;
        const lineHeight = 1.25;

        // Get wrapped lines for both title and description
        ctx.font = `700 ${titleFontSize}px 'Poppins', sans-serif`;
        const titleLines = getWrappedLines(ctx, detail.title, maxWidth);
        
        ctx.font = `400 ${descFontSize}px 'Poppins', sans-serif`;
        const descLines = getWrappedLines(ctx, detail.description, maxWidth);
        
        // Calculate block dimensions
        const blockWidth = Math.max(
            ...titleLines.map(line => ctx.measureText(line).width),
            ...descLines.map(line => ctx.measureText(line).width)
        );
        const titleHeight = titleLines.length * titleFontSize;
        const descHeight = descLines.length * descFontSize * lineHeight;
        const spacing = titleFontSize * 0.25;
        const totalTextHeight = titleHeight + spacing + descHeight;
        
        const padding = titleFontSize * 0.75;
        const boxWidth = blockWidth + padding * 2;
        const boxHeight = totalTextHeight + padding * 2;

        let boxX = pos.align === 'left' ? pos.x : pos.x - boxWidth;
        let boxY = pos.baseline === 'top' ? pos.y : pos.y - boxHeight;

        // Draw the semi-transparent box
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, [8]);
        ctx.fill();
        ctx.stroke();
        
        // Draw the text
        ctx.fillStyle = '#FFFFFF';
        let currentY = boxY + padding;
        
        // Draw title
        ctx.font = `700 ${titleFontSize}px 'Poppins', sans-serif`;
        titleLines.forEach(line => {
            const lineX = pos.align === 'left' ? boxX + padding : boxX + boxWidth - padding;
            ctx.fillText(line, lineX, currentY);
            currentY += titleFontSize;
        });
        
        currentY += spacing;

        // Draw description
        ctx.font = `400 ${descFontSize}px 'Poppins', sans-serif`;
        ctx.fillStyle = '#E0E0E0';
        descLines.forEach(line => {
            const lineX = pos.align === 'left' ? boxX + padding : boxX + boxWidth - padding;
            ctx.fillText(line, lineX, currentY);
            currentY += descFontSize * lineHeight;
        });
    });

    ctx.restore();
};

const drawCanvas = (
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    text: string,
    compositionId: string,
    textPosition: TextPosition,
    subtitleOutline: SubtitleOutlineStyle,
    artStyles: string[],
    brandData: BrandData,
    priceData: PriceData,
    featureDetails: FeatureDetails[] | null,
) => {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.drawImage(image, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const isIsometricDetailsView = featureDetails && featureDetails.length > 0;
    const palette = getPalette(image, 'light'); // Use a default palette for brand name

    if (isIsometricDetailsView && text.trim()) {
        // Special drawing logic for the product name in "Details" view
        ctx.save();
        const productName = text.split('\n')[0].toUpperCase();
        const titleSize = CANVAS_SIZE * 0.03; // A bit larger for a title
        ctx.font = `700 ${titleSize}px 'Poppins', sans-serif`;

        const textPalette = getPalette(image, 'dark');
        ctx.fillStyle = textPalette.fill1;
        ctx.strokeStyle = textPalette.stroke;
        ctx.lineWidth = titleSize * 0.1;
        ctx.lineJoin = 'round';
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        const margin = CANVAS_SIZE * 0.05;
        const x = CANVAS_SIZE / 2;
        const y = margin;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        ctx.strokeText(productName, x, y);
        ctx.fillText(productName, x, y);
        ctx.restore();

    } else if (text.trim()) {
        // Existing logic for all other text drawing
        let selectedPreset = compositionPresets.find(p => p.id === compositionId);
        if (!selectedPreset || compositionId === 'random') {
            const availablePresets = compositionPresets.filter(p => p.id !== 'random');
            selectedPreset = availablePresets[Math.floor(Math.random() * availablePresets.length)];
        }
        const preset = selectedPreset.config;
        const margin = CANVAS_SIZE * 0.07;
        
        const textPalette = getPalette(image, preset.style.palette);
        const { titleFont, subtitleFont } = getFontForStyle(artStyles);

        const textLines = text.split('\n');
        const titleText = (textLines[0] || '').toUpperCase();
        const subtitleText = preset.subtitle ? textLines.slice(1).join('\n') : '';

        const maxTextWidth = (textPosition === 'left' || textPosition === 'right') 
            ? CANVAS_SIZE * 0.4 
            : CANVAS_SIZE * 0.8;

        // --- Robust Font Size Calculation ---
        let optimalSize = 10;
        const maxTextHeight = CANVAS_SIZE * 0.8;
        for (let currentSize = 250; currentSize >= 10; currentSize -= 5) {
            // Check width constraints first for both title and subtitle
            ctx.font = `900 ${currentSize}px ${titleFont}`;
            const titleLinesForWidthCheck = getWrappedLines(ctx, titleText, maxTextWidth);
            const isTitleWidthOk = titleLinesForWidthCheck.every(line => ctx.measureText(line).width <= maxTextWidth);

            ctx.font = `500 ${currentSize * 0.4}px ${subtitleFont}`;
            const subtitleLinesForWidthCheck = getWrappedLines(ctx, subtitleText, maxTextWidth);
            const isSubtitleWidthOk = subtitleLinesForWidthCheck.every(line => ctx.measureText(line).width <= maxTextWidth);

            if (!isTitleWidthOk || !isSubtitleWidthOk) {
                continue; // Font size too large for width, try smaller
            }

            // If width is OK, check height
            const titleHeight = titleLinesForWidthCheck.length * currentSize * 1.1;
            const subtitleHeight = subtitleText ? subtitleLinesForWidthCheck.length * (currentSize * 0.4) * 1.2 : 0;
            const totalHeight = titleHeight + (subtitleHeight > 0 ? subtitleHeight + (currentSize * 0.2) : 0);

            if (totalHeight <= maxTextHeight) {
                optimalSize = currentSize; // This size fits both width and height
                break;
            }
        }
        // --- End Font Size Calculation ---
        
        ctx.save();
        
        const titleSize = optimalSize;
        const subtitleSize = optimalSize * 0.4;
        
        if (preset.rotation) {
            const angle = (Math.random() * 4 - 2) * (Math.PI / 180);
            ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
            ctx.rotate(angle);
            ctx.translate(-CANVAS_SIZE / 2, -CANVAS_SIZE / 2);
        }
        
        ctx.font = `900 ${titleSize}px ${titleFont}`;
        const titleLines = getWrappedLines(ctx, titleText, maxTextWidth);
        const titleBlockHeight = titleLines.length * titleSize * 1.1;
        
        ctx.font = `500 ${subtitleSize}px ${subtitleFont}`;
        const subtitleLines = getWrappedLines(ctx, subtitleText, maxTextWidth);
        const subtitleBlockHeight = subtitleText ? subtitleLines.length * subtitleSize * 1.2 : 0;
        
        const totalBlockHeight = titleBlockHeight + (subtitleBlockHeight > 0 ? subtitleBlockHeight + (titleSize * 0.2) : 0);

        let startX = 0, startY = 0;
        ctx.textBaseline = 'top';

        switch (textPosition) {
            case 'top':
                startX = CANVAS_SIZE / 2;
                startY = margin;
                ctx.textAlign = 'center';
                break;
            case 'top-right':
                startX = CANVAS_SIZE - margin;
                startY = margin;
                ctx.textAlign = 'right';
                // Offset to avoid overlap with feature detail box in the same corner
                if (featureDetails && featureDetails.length > 0) {
                    startY += CANVAS_SIZE * 0.15;
                }
                break;
            case 'bottom':
                startX = CANVAS_SIZE / 2;
                startY = CANVAS_SIZE - margin - totalBlockHeight;
                ctx.textAlign = 'center';
                break;
            case 'left':
                startX = margin;
                startY = (CANVAS_SIZE / 2) - (totalBlockHeight / 2);
                ctx.textAlign = 'left';
                break;
            case 'right':
                startX = CANVAS_SIZE - margin;
                startY = (CANVAS_SIZE / 2) - (totalBlockHeight / 2);
                ctx.textAlign = 'right';
                break;
            case 'center':
            default:
                startX = CANVAS_SIZE / 2;
                startY = (CANVAS_SIZE / 2) - (totalBlockHeight / 2);
                ctx.textAlign = 'center';
                break;
        }


        let currentY = startY;

        // Draw Title
        ctx.font = `900 ${titleSize}px ${titleFont}`;
        titleLines.forEach(line => {
            const textMetrics = ctx.measureText(line);
            let xPos = startX;
            if(ctx.textAlign === 'left') xPos = startX;
            if(ctx.textAlign === 'center') xPos = startX - textMetrics.width / 2;
            if(ctx.textAlign === 'right') xPos = startX - textMetrics.width;

            const drawX = ctx.textAlign === 'center' ? startX : startX;

            if (preset.style.background) {
                ctx.fillStyle = preset.style.background.color;
                const blockPadding = titleSize * (preset.style.background.padding || 0.1);
                ctx.fillRect(
                    xPos - blockPadding, 
                    currentY - blockPadding, 
                    textMetrics.width + blockPadding * 2, 
                    titleSize * 1.1 + blockPadding * 2
                );
            }

            if (preset.style.name === 'gradient-on-block') {
                const gradient = ctx.createLinearGradient(xPos, currentY, xPos + textMetrics.width, currentY);
                gradient.addColorStop(0, textPalette.fill1);
                gradient.addColorStop(1, textPalette.fill2);
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = textPalette.fill1;
            }
            ctx.strokeStyle = textPalette.stroke;
            if (preset.style.forcedStroke) {
                ctx.strokeStyle = preset.style.forcedStroke;
            }
            
            if (preset.style.name === 'gradient-on-block') {
                ctx.lineWidth = titleSize * 0.04;
            } else {
                ctx.lineWidth = titleSize * 0.05;
            }

            const needsFill = ['fill', 'fill-stroke', 'gradient-on-block', 'vertical'].includes(preset.style.name);
            const needsStroke = ['stroke', 'fill-stroke', 'gradient-on-block'].includes(preset.style.name);

            if (needsFill) {
                 ctx.fillText(line, drawX, currentY);
            }
            if (needsStroke) {
                ctx.strokeText(line, drawX, currentY);
            }
            currentY += titleSize * 1.1;
        });

        // Draw Subtitle
        if (subtitleText) {
            currentY += titleSize * 0.2;
            ctx.font = `500 ${subtitleSize}px ${subtitleFont}`;
            
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.strokeStyle = 'transparent';
            ctx.lineWidth = 0;
            ctx.fillStyle = textPalette.fill1;
            ctx.lineJoin = 'round';

            switch (subtitleOutline) {
                case 'white':
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = subtitleSize * 0.2;
                    ctx.fillStyle = textPalette.stroke;
                    break;
                case 'black':
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = subtitleSize * 0.2;
                    ctx.fillStyle = textPalette.fill1;
                    break;
                case 'soft_shadow':
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                    ctx.shadowBlur = subtitleSize * 0.1;
                    ctx.shadowOffsetX = subtitleSize * 0.05;
                    ctx.shadowOffsetY = subtitleSize * 0.05;
                    ctx.fillStyle = textPalette.fill1;
                    break;
                case 'transparent_box':
                    ctx.fillStyle = textPalette.fill1;
                    break;
                case 'auto':
                default:
                    ctx.fillStyle = textPalette.fill1;
                    ctx.strokeStyle = textPalette.stroke;
                    ctx.lineWidth = subtitleSize * 0.15;
                    break;
            }

            subtitleLines.forEach(line => {
                const drawX = ctx.textAlign === 'center' ? startX : startX;
                if (subtitleOutline === 'transparent_box') {
                    const textMetrics = ctx.measureText(line);
                    const textWidth = textMetrics.width;
                    const textHeight = subtitleSize;
                    const padding = subtitleSize * 0.25;
                    
                    let boxX;
                    switch (ctx.textAlign) {
                        case 'left': boxX = startX; break;
                        case 'right': boxX = startX - textWidth; break;
                        default: boxX = startX - textWidth / 2; break;
                    }
                    
                    const boxRgb = textPalette.stroke.match(/\d+/g)?.map(Number) || [0, 0, 0];
                    ctx.fillStyle = `rgba(${boxRgb[0]}, ${boxRgb[1]}, ${boxRgb[2]}, 0.6)`;
                    
                    ctx.fillRect(boxX - padding, currentY - (padding / 2), textWidth + (padding * 2), textHeight + padding);
                    
                    ctx.fillStyle = textPalette.fill1;
                    ctx.fillText(line, drawX, currentY);

                } else if (subtitleOutline === 'soft_shadow') {
                    ctx.fillText(line, drawX, currentY);
                } else {
                    ctx.strokeText(line, drawX, currentY);
                    ctx.fillText(line, drawX, currentY);
                }
                currentY += subtitleSize * 1.2;
            });
        }
        
        ctx.restore();
    }
    
    // Draw Feature Details
    drawFeatureDetails(ctx, featureDetails || []);

    // Draw Price Tag
    drawPriceTag(ctx, priceData);

    // Draw brand name watermark
    if (brandData && brandData.name.trim()) {
        ctx.save();
        const brandName = brandData.name.trim();
        const brandSize = CANVAS_SIZE * 0.02;
        ctx.font = `600 ${brandSize}px 'Poppins', sans-serif`;
        
        // Use a semi-transparent version of the stroke color from the main palette
        const brandColor = palette.stroke.startsWith('#') 
            ? `${palette.stroke}B3` // Append 70% opacity in hex
            : `rgba(0,0,0,0.7)`; // Default fallback

        ctx.fillStyle = brandColor;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';

        const brandMargin = CANVAS_SIZE * 0.03;
        ctx.fillText(brandName, CANVAS_SIZE - brandMargin, CANVAS_SIZE - brandMargin);
        
        ctx.restore();
    }
};

const CopyButton: React.FC<{textToCopy: string}> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            className="p-1.5 rounded-md text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
            aria-label={copied ? "Copiado!" : "Copiar"}
        >
            {copied ? <CheckIcon className="w-4 h-4 text-green-600" /> : <ClipboardIcon className="w-4 h-4" />}
        </button>
    );
};

const MarketingSuite: React.FC<Pick<ImageCanvasProps, 'adCopy' | 'isAdCopyLoading' | 'onGenerateAds' | 'adCopyError' | 'currentConcept'>> = ({ adCopy, isAdCopyLoading, onGenerateAds, adCopyError, currentConcept }) => {
    if (isAdCopyLoading) {
        return (
            <div className="text-center p-8">
                <LoaderIcon className="w-8 h-8 mx-auto animate-spin text-purple-600"/>
                <p className="mt-2 text-sm text-gray-500 font-medium">Gerando textos de marketing...</p>
            </div>
        );
    }

    if (adCopyError) {
        // Check for rate limit by looking for the specific phrase from our custom error.
        const isRateLimitError = adCopyError.includes("excedeu sua cota");

        if (isRateLimitError) {
            return (
                 <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertTriangleIcon className="w-8 h-8 mx-auto text-yellow-500 mb-3" />
                    <h4 className="font-semibold text-yellow-900">Limite Atingido</h4>
                    <p className="mt-1 text-sm text-yellow-800 max-w-sm mx-auto">{adCopyError}</p>
                    <p className="text-xs text-yellow-700 mt-2">Aguarde o contador no botão principal zerar para tentar novamente.</p>
                </div>
            );
        }

        return (
            <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangleIcon className="w-8 h-8 mx-auto text-red-500 mb-3" />
                <h4 className="font-semibold text-red-700">Erro ao Gerar Anúncios</h4>
                <p className="mt-1 text-sm text-red-600 max-w-sm mx-auto">{adCopyError}</p>
                <button
                    onClick={onGenerateAds}
                    className="mt-4 flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                    <SparklesIcon className="w-5 h-5" />
                    <span>Tentar Novamente</span>
                </button>
            </div>
        );
    }
    
    if (adCopy) {
        return (
            <div className="space-y-6">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="flex items-center gap-2 font-semibold text-purple-800 text-base">
                        <LightbulbIcon className="w-5 h-5"/>
                        Dica de Estratégia
                    </h4>
                    <p className="mt-2 text-sm text-purple-700">{adCopy.strategyTip}</p>
                </div>

                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700 text-base">Google Ads</h4>
                    <div className="space-y-2 text-sm">
                        {adCopy.google.headlines.map((text, i) => (
                            <div key={i} className="flex items-center justify-between gap-2 p-2 bg-gray-100 rounded-md">
                                <span className="text-gray-800"><span className="font-bold text-gray-500">T{i+1}:</span> {text}</span>
                                <CopyButton textToCopy={text} />
                            </div>
                        ))}
                        {adCopy.google.descriptions.map((text, i) => (
                             <div key={i} className="flex items-start justify-between gap-2 p-2 bg-gray-100 rounded-md">
                                <p className="text-gray-800"><span className="font-bold text-gray-500">D{i+1}:</span> {text}</p>
                                <CopyButton textToCopy={text} />
                            </div>
                        ))}
                    </div>
                </div>

                 <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700 text-base">Facebook Ads</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-start justify-between gap-2 p-2 bg-gray-100 rounded-md">
                            <p className="text-gray-800 whitespace-pre-wrap"><span className="font-bold text-gray-500">Texto Principal:</span><br/>{adCopy.facebook.primaryText}</p>
                            <CopyButton textToCopy={adCopy.facebook.primaryText} />
                        </div>
                         <div className="flex items-center justify-between gap-2 p-2 bg-gray-100 rounded-md">
                            <span className="text-gray-800"><span className="font-bold text-gray-500">Título:</span> {adCopy.facebook.headline}</span>
                            <CopyButton textToCopy={adCopy.facebook.headline} />
                        </div>
                         <div className="flex items-center justify-between gap-2 p-2 bg-gray-100 rounded-md">
                            <span className="text-gray-800"><span className="font-bold text-gray-500">Descrição:</span> {adCopy.facebook.description}</span>
                            <CopyButton textToCopy={adCopy.facebook.description} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!currentConcept) {
         return (
             <div className="text-center p-8">
                <div className="mx-auto w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full mb-3">
                    <MegaphoneIcon className="w-6 h-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-700">Gere textos para anúncios</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">Primeiro, gere e/ou selecione um conceito de marca no painel à esquerda para ativar esta funcionalidade.</p>
            </div>
        );
    }

    return (
        <div className="text-center p-8">
            <h3 className="text-lg font-bold text-gray-700">Transforme seu Conceito em Anúncios</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">Gere textos de marketing para Google e Facebook baseados no conceito <span className="font-bold text-purple-600">"{currentConcept.name}"</span>, otimizados para conversão.</p>
            <button
                onClick={onGenerateAds}
                className="mt-4 flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
                <SparklesIcon className="w-5 h-5" />
                <span>Gerar Anúncios</span>
            </button>
        </div>
    )
};

const FeatureDetailEditor: React.FC<{
    details: FeatureDetails[] | null;
    setDetails: (value: React.SetStateAction<FeatureDetails[] | null>) => void;
}> = ({ details, setDetails }) => {
    if (!details) return null;

    const handleDetailChange = (index: number, field: keyof FeatureDetails, value: string) => {
        setDetails(currentDetails => {
            if (!currentDetails) return null;
            const newDetails = [...currentDetails];
            newDetails[index] = { ...newDetails[index], [field]: value };
            return newDetails;
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <TextQuoteIcon className="w-5 h-5 text-gray-600" />
                <h3 className="text-base font-semibold text-gray-800">Detalhes do Produto</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {details.map((detail, index) => (
                    <div key={index} className="space-y-2">
                        <input
                            type="text"
                            value={detail.title}
                            onChange={(e) => handleDetailChange(index, 'title', e.target.value)}
                            placeholder={`Título do Detalhe ${index + 1}`}
                            className="w-full p-2 bg-gray-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm font-semibold"
                        />
                        <textarea
                            value={detail.description}
                            onChange={(e) => handleDetailChange(index, 'description', e.target.value)}
                            placeholder={`Descrição do detalhe ${index + 1}...`}
                            className="w-full h-20 p-2 bg-gray-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm resize-none"
                            rows={3}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const EditingPanel: React.FC<Pick<ImageCanvasProps, 'textOverlay' | 'compositionId' | 'textPosition' | 'subtitleOutline' | 'priceData' | 'featureDetails' | 'setTextOverlay' | 'setCompositionId' | 'setTextPosition' | 'setSubtitleOutline' | 'setPriceData' | 'setFeatureDetails' >> = (props) => {
    const { textOverlay, compositionId, textPosition, subtitleOutline, priceData, featureDetails, setTextOverlay, setCompositionId, setTextPosition, setSubtitleOutline, setPriceData, setFeatureDetails } = props;
    
    // If feature details are present, show the specialized editor. Otherwise, show the standard editor.
    if (featureDetails) {
        return <FeatureDetailEditor details={featureDetails} setDetails={setFeatureDetails} />;
    }

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="text-editor-overlay" className="block text-sm font-medium text-gray-700 mb-1">Texto da Arte</label>
                <div className="relative">
                    <textarea 
                        id="text-editor-overlay"
                        value={textOverlay} 
                        onChange={(e) => setTextOverlay(e.target.value)} 
                        placeholder="Título (primeira linha)&#10;Subtítulo (linhas seguintes)" 
                        className="w-full h-24 p-2 bg-gray-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow duration-200 resize-none text-gray-800 placeholder-gray-400"
                        maxLength={280}
                    />
                    <span className="absolute bottom-2 right-3 text-xs text-gray-400">{textOverlay.length} / 280</span>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estilo do Texto</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {compositionPresets.map(preset => (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => setCompositionId(preset.id)}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 ${compositionId === preset.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                            title={preset.name}
                        >
                            <preset.icon className={`w-10 h-10 mb-1 ${compositionId === preset.id ? 'text-purple-600' : 'text-gray-500'}`} />
                            <span className={`text-xs text-center font-medium ${compositionId === preset.id ? 'text-purple-700' : 'text-gray-500'}`}>{preset.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Posição do Texto</label>
                 <div className="grid grid-cols-5 gap-2">
                    {positionOptions.map(option => (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => setTextPosition(option.id)}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 ${textPosition === option.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                            title={option.name}
                            aria-label={`Posicionar texto: ${option.name}`}
                        >
                            <option.icon className={`w-8 h-8 mb-1 ${textPosition === option.id ? 'text-purple-600' : 'text-gray-400'}`} />
                            <span className={`text-xs font-medium ${textPosition === option.id ? 'text-purple-700' : 'text-gray-500'}`}>{option.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estilo do Subtítulo</label>
                <div className="grid grid-cols-5 gap-2">
                    {subtitleOutlineOptions.map(option => (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => setSubtitleOutline(option.id)}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 ${subtitleOutline === option.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                            title={option.name}
                            aria-label={`Estilo do subtítulo: ${option.name}`}
                        >
                            <option.icon className={`w-8 h-8 mb-1 ${subtitleOutline === option.id ? 'text-purple-600' : 'text-gray-500'}`} />
                            <span className={`text-xs text-center font-medium ${subtitleOutline === option.id ? 'text-purple-700' : 'text-gray-500'}`}>{option.name}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <TagIcon className="w-4 h-4" />
                    Etiqueta de Preço
                </label>
                 <div className="space-y-4 mt-2">
                    <input name="priceText" value={priceData.text} onChange={(e) => setPriceData(p => ({ ...p, text: e.target.value }))} placeholder="Ex: R$ 99,90" className="w-full p-2 bg-gray-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                    <input name="modelText" value={priceData.modelText} onChange={(e) => setPriceData(p => ({ ...p, modelText: e.target.value }))} placeholder="Modelo do produto/serviço" className="w-full p-2 bg-gray-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                    <div>
                        <label className="text-xs text-gray-500 mb-2 block">Estilo da Etiqueta</label>
                        <div className="grid grid-cols-3 gap-2">
                            {priceStyleOptions.map(option => (
                                <button key={option.id} type="button" onClick={() => setPriceData(p => ({ ...p, style: option.id }))} className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 ${priceData.style === option.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'}`} title={option.name}>
                                    <option.icon className={`w-8 h-8 mb-1 ${priceData.style === option.id ? 'text-purple-600' : 'text-gray-500'}`} />
                                    <span className={`text-xs font-medium ${priceData.style === option.id ? 'text-purple-700' : 'text-gray-500'}`}>{option.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <label className="text-xs text-gray-500 mb-2 block">Cor</label>
                        <div className="grid grid-cols-4 gap-2">
                            {priceColorOptions.map(option => (
                                <button key={option.id} type="button" onClick={() => setPriceData(p => ({ ...p, color: option.id }))} className={`flex items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 ${priceData.color === option.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'}`} title={option.name}>
                                    <span className="w-6 h-6 rounded-full border border-gray-300" style={{ backgroundColor: option.hex }}></span>
                                </button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <label className="text-xs text-gray-500 mb-2 block">Posição</label>
                        <div className="grid grid-cols-5 gap-2">
                            {pricePositionOptions.map(option => (
                                <button key={option.id} type="button" onClick={() => setPriceData(p => ({ ...p, position: option.id }))} className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 ${priceData.position === option.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'}`} title={option.name}>
                                    <option.icon className={`w-8 h-8 mb-1 ${priceData.position === option.id ? 'text-purple-600' : 'text-gray-400'}`} />
                                    <span className={`text-xs font-medium ${priceData.position === option.id ? 'text-purple-700' : 'text-gray-500'}`}>{option.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const SqlViewer: React.FC<ImageCanvasProps> = (props) => {
    const { imagesB64, textOverlay, compositionId, textPosition, subtitleOutline, artStyles, isLoading, error, adCopy, isAdCopyLoading, onGenerateAds, adCopyError, brandData, priceData, featureDetails, landingPageContent, blogPostContent, posterContent, isTextContentLoading, textContentError, onGenerateTextContent, currentConcept, isBlogImagesLoading, blogImagesError, isLandingPageImagesLoading, landingPageImagesError, isPosterImagesLoading, posterImagesError, setTextOverlay, setCompositionId, setTextPosition, setSubtitleOutline, setPriceData, setFeatureDetails } = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [activeTab, setActiveTab] = useState<'edit' | 'marketing'>('edit');
    const [activeMarketingTab, setActiveMarketingTab] = useState<'ads' | 'landingPage' | 'blog' | 'poster'>('ads');
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        // Reset to first image when a new set is generated
        setActiveImageIndex(0);
    }, [imagesB64]);
    
    // Automatically switch tabs based on generated content
    useEffect(() => {
        if (featureDetails) setActiveTab('edit');
    }, [featureDetails]);

    useEffect(() => {
        if (landingPageContent) {
            setActiveTab('marketing');
            setActiveMarketingTab('landingPage');
        }
    }, [landingPageContent]);

     useEffect(() => {
        if (blogPostContent) {
            setActiveTab('marketing');
            setActiveMarketingTab('blog');
        }
    }, [blogPostContent]);

    useEffect(() => {
        if (posterContent) {
            setActiveTab('marketing');
            setActiveMarketingTab('poster');
        }
    }, [posterContent]);
    
    // Automatically switch to edit tab if new images are generated
    useEffect(() => {
        if (imagesB64 && imagesB64.length > 0) {
            setActiveTab('edit');
        }
    }, [imagesB64]);
    
    // Switch to marketing tab if a concept is selected but no image is present
    useEffect(() => {
        if (currentConcept && (!imagesB64 || imagesB64.length === 0)) {
            setActiveTab('marketing');
            setActiveMarketingTab('ads');
        }
    }, [currentConcept, imagesB64]);


    const currentImageB64 = imagesB64 ? imagesB64[activeImageIndex] : null;
    
    useEffect(() => {
        if (currentImageB64 && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const image = new Image();
            image.crossOrigin = 'anonymous';
            image.src = `data:image/jpeg;base64,${currentImageB64}`;
            image.onload = () => {
                drawCanvas(ctx, image, textOverlay, compositionId, textPosition, subtitleOutline, artStyles, brandData, priceData, featureDetails);
            };
            image.onerror = () => console.error("Failed to load the generated image.");
        }
    }, [currentImageB64, textOverlay, compositionId, textPosition, subtitleOutline, artStyles, brandData, priceData, featureDetails]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `instastyle-post-${activeImageIndex + 1}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
    };

    const generateLandingPageHtml = (lp: LandingPageContent) => {
        const featuresHtml = lp.features.map(f => `
            <div class="bg-white p-6 rounded-lg shadow-md">
                ${f.imageBase64 ? `<img src="data:image/jpeg;base64,${f.imageBase64}" alt="${f.title}" class="w-full h-48 object-cover rounded-md mb-4">` : ''}
                <h3 class="text-2xl font-bold text-gray-800">${f.title}</h3>
                <p class="mt-2 text-gray-600">${f.description}</p>
            </div>
        `).join('');

        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${lp.headline}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;900&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Poppins', sans-serif; }
        h1, h2, h3 { font-family: 'Playfair Display', serif; }
    </style>
</head>
<body class="bg-gray-50 text-gray-700">
    <header class="text-center py-16 px-4 bg-gray-100">
        <h1 class="text-5xl md:text-7xl font-bold text-purple-800">${lp.headline}</h1>
        <p class="mt-4 text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto">${lp.subheadline}</p>
    </header>

    <main class="container mx-auto px-6 py-12">
        <section id="hero" class="bg-white p-8 rounded-lg shadow-xl mb-16 text-center">
            ${lp.hero.imageBase64 ? `<img src="data:image/jpeg;base64,${lp.hero.imageBase64}" alt="${lp.hero.title}" class="w-full max-w-4xl mx-auto h-auto aspect-video object-cover rounded-lg mb-6 shadow-md">` : ''}
            <h2 class="text-4xl font-bold text-gray-900">${lp.hero.title}</h2>
            <p class="mt-4 text-lg max-w-2xl mx-auto whitespace-pre-wrap">${lp.hero.text}</p>
            <a href="#" class="mt-8 inline-block px-8 py-4 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-transform transform hover:scale-105">${lp.hero.cta}</a>
        </section>

        <section id="features" class="mb-16">
            <div class="grid md:grid-cols-2 lg:grid-cols-${lp.features.length > 2 ? '3' : '2'} gap-8">
                ${featuresHtml}
            </div>
        </section>

        <section id="capture" class="py-16 px-8 bg-purple-700 text-white rounded-lg shadow-xl mb-16">
            <div class="text-center max-w-2xl mx-auto">
                <h2 class="text-4xl font-bold">${lp.captureForm.title}</h2>
                <form class="mt-6 flex flex-col sm:flex-row gap-3">
                    <input type="email" placeholder="${lp.captureForm.placeholder}" class="flex-grow w-full px-5 py-3 rounded-md border border-purple-400 bg-purple-50 text-purple-900 placeholder-purple-400 focus:ring-4 focus:ring-white/50 focus:outline-none transition-shadow" required>
                    <button type="submit" class="flex-shrink-0 px-8 py-3 bg-white text-purple-700 font-bold rounded-lg hover:bg-gray-200 transition-colors">${lp.captureForm.cta}</button>
                </form>
            </div>
        </section>

        <section id="social-proof" class="text-center mb-16">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">${lp.socialProof.title}</h2>
            <div class="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <p class="text-xl italic">"${lp.socialProof.testimonial}"</p>
                <p class="mt-4 font-semibold text-purple-600">- ${lp.socialProof.author}</p>
            </div>
        </section>

        <section id="final-cta" class="text-center py-16 px-4 bg-gray-800 text-white rounded-lg">
            <h2 class="text-5xl font-bold">${lp.finalCta.title}</h2>
            <a href="#" class="mt-8 inline-block px-10 py-5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-500 transition-transform transform hover:scale-105">${lp.finalCta.cta}</a>
        </section>
    </main>
    <footer class="text-center py-6 text-gray-500 text-sm">
        <p>&copy; ${new Date().getFullYear()} ${currentConcept?.name || 'Sua Marca'}. Todos os direitos reservados.</p>
    </footer>
</body>
</html>`;
    };

    const generateBlogPostHtml = (bp: BlogPostContent) => {
        const sectionsHtml = bp.sections.map(s => `
            <article class="mb-12">
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">${s.title}</h2>
                ${s.imageBase64 ? `<img src="data:image/jpeg;base64,${s.imageBase64}" alt="${s.title}" class="w-full h-auto aspect-video object-cover rounded-lg mb-6 shadow-lg border border-gray-200">` : ''}
                <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">${s.content.replace(/\n/g, '<br>')}</div>
            </article>
        `).join('');

        const relatedConceptsHtml = bp.relatedConcepts && bp.relatedConcepts.length > 0 ? `
            <aside class="mt-16 p-6 bg-gray-100 rounded-lg">
                <h3 class="text-2xl font-bold text-gray-800">Conceitos Relacionados</h3>
                <ul class="mt-4 space-y-3 list-disc list-inside">
                    ${bp.relatedConcepts.map(c => `<li><strong class="font-semibold">${c.name}:</strong> <em class="text-gray-600">"${c.philosophy}"</em></li>`).join('')}
                </ul>
            </aside>
        ` : '';

        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${bp.title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tailwindcss/typography@0.5.x/dist/typography.min.css"/>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Lato:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Lato', sans-serif; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Merriweather', serif; }
    </style>
</head>
<body class="bg-white text-gray-800">
    <div class="max-w-4xl mx-auto px-4 py-8 md:py-16">
        <header class="text-center mb-12">
            <h1 class="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">${bp.title}</h1>
        </header>
        
        <main>
            <div class="prose prose-lg max-w-none text-gray-600 mb-12 whitespace-pre-wrap">${bp.introduction.replace(/\n/g, '<br>')}</div>
            ${sectionsHtml}
            <section class="mt-12 pt-8 border-t border-gray-200">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Conclusão</h2>
                <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">${bp.conclusion.replace(/\n/g, '<br>')}</div>
            </section>
            ${relatedConceptsHtml}
        </main>
        
         <footer class="text-center mt-16 pt-8 border-t border-gray-200 text-gray-500 text-sm">
            <p>Publicado por ${currentConcept?.name || 'Sua Marca'}.</p>
        </footer>
    </div>
</body>
</html>`;
    };

    const generatePosterHtml = (p: PosterContent) => {
        const imagesHtml = p.images.map((img, index) => {
            const gridClass = [
                'col-span-2 row-span-2', // Main image
                'col-span-1 row-span-1',
                'col-span-1 row-span-1',
                'col-span-1 row-span-1',
                'col-span-1 row-span-1',
            ][index % 5] || 'col-span-1 row-span-1';

            return `
                <div class="bg-gray-200 rounded-lg overflow-hidden shadow-md ${gridClass}">
                    ${img.imageBase64 ? `<img src="data:image/jpeg;base64,${img.imageBase64}" alt="Imagem do moodboard ${index+1}" class="w-full h-full object-cover">` : '<div class="w-full h-full bg-gray-300 animate-pulse"></div>'}
                </div>
            `;
        }).join('');

        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cartaz: ${p.headline}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Anton&family=Poppins:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Poppins', sans-serif; background-color: #f3f4f6; }
        .title-font { font-family: 'Anton', sans-serif; }
        .poster-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(2, 1fr);
            gap: 1rem;
            height: 80vh;
        }
    </style>
</head>
<body class="p-8">
    <div class="max-w-7xl mx-auto">
        <header class="text-center mb-8">
            <h1 class="text-6xl md:text-8xl font-bold text-gray-800 uppercase title-font">${p.headline}</h1>
            <p class="mt-2 text-xl text-gray-500">${p.subheadline}</p>
        </header>
        <main class="poster-grid">
            ${imagesHtml}
        </main>
        
        <section id="cta" class="text-center py-12">
            <a href="#" class="inline-block px-12 py-5 bg-purple-600 text-white text-xl font-bold rounded-lg hover:bg-purple-700 transition-transform transform hover:scale-105">${p.cta.text}</a>
        </section>

        <section id="capture" class="py-12 px-8 bg-gray-200 rounded-lg">
            <div class="text-center max-w-2xl mx-auto">
                <h2 class="text-3xl font-bold text-gray-800">${p.captureForm.title}</h2>
                <form class="mt-6 flex flex-col sm:flex-row gap-3">
                    <input type="email" placeholder="${p.captureForm.placeholder}" class="flex-grow w-full px-5 py-3 rounded-md border border-gray-400 bg-white text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-purple-500/50 focus:outline-none transition-shadow" required>
                    <button type="submit" class="flex-shrink-0 px-8 py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition-colors">${p.captureForm.cta}</button>
                </form>
            </div>
        </section>

        <footer class="text-center mt-8 text-gray-500 text-sm">
            <p>Gerado por InstaStyle para ${currentConcept?.name || 'Sua Marca'}.</p>
        </footer>
    </div>
</body>
</html>`;
    };

    const handleDownloadTextContent = (type: 'landingPage' | 'blogPost' | 'poster') => {
        let htmlContent = '';
        let fileName = 'download.html';

        if (type === 'landingPage' && landingPageContent) {
            htmlContent = generateLandingPageHtml(landingPageContent);
            fileName = `landing-page-${currentConcept?.name.toLowerCase().replace(/\s+/g, '-') || 'concept'}.html`;
        } else if (type === 'blogPost' && blogPostContent) {
            htmlContent = generateBlogPostHtml(blogPostContent);
            fileName = `blog-post-${currentConcept?.name.toLowerCase().replace(/\s+/g, '-') || 'concept'}.html`;
        } else if (type === 'poster' && posterContent) {
            htmlContent = generatePosterHtml(posterContent);
            fileName = `cartaz-${currentConcept?.name.toLowerCase().replace(/\s+/g, '-') || 'concept'}.html`;
        }

        if (htmlContent) {
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }
    };
    
    const renderContent = () => {
        if (isLoading) {
            return (
                 <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-purple-500 mx-auto"></div>
                        <p className="mt-4 text-lg font-medium">Gerando sua arte...</p>
                        <p className="text-sm">Isso pode levar alguns segundos.</p>
                    </div>
                </div>
            )
        }

        if (error) {
            const isRateLimitError = error.includes("excedeu sua cota");
            if (isRateLimitError) {
                 return (
                    <div className="flex items-center justify-center h-full text-yellow-800">
                        <div className="text-center bg-yellow-50 p-6 rounded-lg border border-yellow-200 max-w-md">
                            <AlertTriangleIcon className="w-12 h-12 mx-auto mb-4 text-yellow-500"/>
                            <h3 className="font-semibold text-lg text-yellow-900">Limite de Requisições Atingido</h3>
                            <p className="text-sm text-yellow-800 mt-2">{error}</p>
                            <p className="text-xs text-yellow-700 mt-3">Aguarde o contador no botão de geração zerar para tentar novamente.</p>
                        </div>
                    </div>
                );
            }
            return (
                 <div className="flex items-center justify-center h-full text-red-600">
                    <div className="text-center bg-red-50 p-6 rounded-lg border border-red-200 max-w-md">
                        <AlertTriangleIcon className="w-12 h-12 mx-auto mb-4 text-red-500"/>
                        <p className="font-semibold text-red-700">Ocorreu um Erro</p>
                        <p className="text-sm text-red-600 mt-2">{error}</p>
                    </div>
                </div>
            )
        }

        if ((!imagesB64 || imagesB64.length === 0) && !currentConcept) {
             return (
                <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center p-4">
                         <ImageIcon className="w-16 h-16 mx-auto mb-4" />
                        <p className="font-bold text-lg text-gray-600">Sua arte aparecerá aqui</p>
                        <p className="text-sm">Preencha o painel ao lado para começar.</p>
                    </div>
                </div>
            );
        }

        // Main content view with tabs
        return (
            <div className="relative h-full w-full flex flex-col items-center justify-center gap-4">
                {imagesB64 && imagesB64.length > 0 && (
                    <div className="relative w-full max-w-[500px]">
                        <canvas
                            ref={canvasRef}
                            width={CANVAS_SIZE}
                            height={CANVAS_SIZE}
                            className="w-full h-auto aspect-square object-contain rounded-lg bg-gray-50 border border-gray-200 shadow-md"
                        />
                         {imagesB64.length > 1 && (
                            <>
                                <button onClick={() => setActiveImageIndex(i => Math.max(0, i - 1))} disabled={activeImageIndex === 0} className="absolute top-1/2 -translate-y-1/2 -left-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg border border-gray-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Imagem anterior"><ChevronLeftIcon className="w-6 h-6 text-gray-800" /></button>
                                <button onClick={() => setActiveImageIndex(i => Math.min(imagesB64.length - 1, i + 1))} disabled={activeImageIndex === imagesB64.length - 1} className="absolute top-1/2 -translate-y-1/2 -right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg border border-gray-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Próxima imagem"><ChevronRightIcon className="w-6 h-6 text-gray-800" /></button>
                            </>
                        )}
                    </div>
                )}
                 {imagesB64 && imagesB64.length > 1 && (
                    <div className="flex justify-center items-center gap-2">
                        {imagesB64.map((_, index) => (
                            <button key={index} onClick={() => setActiveImageIndex(index)} className={`w-2.5 h-2.5 rounded-full transition-colors ${activeImageIndex === index ? 'bg-purple-600' : 'bg-gray-300 hover:bg-gray-400'}`} aria-label={`Ir para imagem ${index + 1}`} />
                        ))}
                    </div>
                )}
                 {imagesB64 && imagesB64.length > 0 && (
                     <div className="flex items-center gap-3">
                         <button onClick={handleDownload} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors duration-200" aria-label="Baixar arte gerada"><DownloadIcon className="w-5 h-5" /><span>Baixar {imagesB64.length > 1 ? `(${activeImageIndex + 1}/${imagesB64.length})` : ''}</span></button>
                         <div className="relative group">
                            <button disabled className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-300 text-gray-500 font-bold rounded-lg cursor-not-allowed" aria-label="Publicar no Instagram (em breve)"><PublishIcon className="w-5 h-5" /><span>Publicar</span></button>
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Em breve!</div>
                        </div>
                    </div>
                )}
                
                <div className="w-full max-w-2xl mt-4 p-4 sm:p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="border-b border-gray-200 mb-4">
                        <nav className="-mb-px flex gap-6" aria-label="Tabs">
                            <button onClick={() => setActiveTab('edit')} className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'edit' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} disabled={!imagesB64 || imagesB64.length === 0}><EditIcon className="w-5 h-5" />Editar Arte</button>
                            <button onClick={() => setActiveTab('marketing')} className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'marketing' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} disabled={!currentConcept}><MegaphoneIcon className="w-5 h-5" />Marketing e Conteúdo</button>
                        </nav>
                    </div>
                    
                    {activeTab === 'edit' && <EditingPanel {...props} />}

                    {activeTab === 'marketing' && (
                        <div>
                            <div className="border-b border-gray-200 mb-4">
                                <nav className="flex gap-1" aria-label="Marketing Tabs">
                                    <button onClick={() => setActiveMarketingTab('ads')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeMarketingTab === 'ads' ? 'bg-gray-100 text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>Anúncios</button>
                                    <button onClick={() => setActiveMarketingTab('landingPage')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeMarketingTab === 'landingPage' ? 'bg-gray-100 text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>Landing Page</button>
                                    <button onClick={() => setActiveMarketingTab('blog')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeMarketingTab === 'blog' ? 'bg-gray-100 text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>Blog</button>
                                    <button onClick={() => setActiveMarketingTab('poster')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeMarketingTab === 'poster' ? 'bg-gray-100 text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>Cartaz</button>
                                </nav>
                            </div>
                            <div className="p-1">
                                {activeMarketingTab === 'ads' && <MarketingSuite adCopy={adCopy} isAdCopyLoading={isAdCopyLoading} adCopyError={adCopyError} onGenerateAds={onGenerateAds} currentConcept={currentConcept} />}
                                {activeMarketingTab === 'landingPage' && <TextContentViewer type="landingPage" content={landingPageContent} isLoading={isTextContentLoading} error={textContentError} onGenerate={() => currentConcept && onGenerateTextContent(currentConcept, 'landingPage')} onDownload={() => handleDownloadTextContent('landingPage')} currentConcept={currentConcept} isImagesLoading={isLandingPageImagesLoading} imagesError={landingPageImagesError} />}
                                {activeMarketingTab === 'blog' && <TextContentViewer type="blogPost" content={blogPostContent} isLoading={isTextContentLoading} error={textContentError} onGenerate={() => currentConcept && onGenerateTextContent(currentConcept, 'blogPost')} onDownload={() => handleDownloadTextContent('blogPost')} currentConcept={currentConcept} isImagesLoading={isBlogImagesLoading} imagesError={blogImagesError} />}
                                {activeMarketingTab === 'poster' && <TextContentViewer type="poster" content={posterContent} isLoading={isTextContentLoading} error={textContentError} onGenerate={() => currentConcept && onGenerateTextContent(currentConcept, 'poster')} onDownload={() => handleDownloadTextContent('poster')} currentConcept={currentConcept} isImagesLoading={isPosterImagesLoading} imagesError={posterImagesError} />}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center flex-grow min-h-[500px] lg:min-h-0 overflow-y-auto">
            {renderContent()}
        </div>
    );
};


const TextContentViewer: React.FC<{
    type: 'landingPage' | 'blogPost' | 'poster';
    content: LandingPageContent | BlogPostContent | PosterContent | null;
    isLoading: boolean;
    error: string | null;
    onGenerate: () => void;
    onDownload: () => void;
    currentConcept: BrandConcept | null;
    isImagesLoading?: boolean;
    imagesError?: string | null;
}> = ({ type, content, isLoading, error, onGenerate, onDownload, currentConcept, isImagesLoading, imagesError }) => {
    
    const renderInitialState = () => {
        const icons = {
            landingPage: <FileTextIcon className="w-6 h-6 text-gray-500" />,
            blogPost: <BookOpenIcon className="w-6 h-6 text-gray-500" />,
            poster: <PosterIcon className="w-6 h-6 text-gray-500" />,
        };
        const titles = {
            landingPage: 'Landing Page',
            blogPost: 'Página de Blog',
            poster: 'Cartaz HTML',
        };
        return (
            <div className="text-center p-8">
                <div className="mx-auto w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full mb-3">
                    {icons[type]}
                </div>
                <h3 className="text-lg font-bold text-gray-700">Gere conteúdo para sua {titles[type]}</h3>
                 <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                    {currentConcept
                        ? `Pronto para gerar conteúdo para o conceito "${currentConcept.name}".`
                        : "Selecione um conceito no painel à esquerda para começar."
                    }
                </p>
                {currentConcept && (
                     <button
                        onClick={onGenerate}
                        disabled={isLoading}
                        className="mt-4 flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                    >
                        {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
                        <span>Gerar {titles[type]}</span>
                    </button>
                )}
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="text-center p-8">
                <LoaderIcon className="w-8 h-8 mx-auto animate-spin text-purple-600"/>
                <p className="mt-2 text-sm text-gray-500 font-medium">Gerando conteúdo textual...</p>
                <p className="text-xs text-gray-400">Isso pode levar um momento.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangleIcon className="w-8 h-8 mx-auto text-red-500 mb-3" />
                <h4 className="font-semibold text-red-700">Erro ao Gerar Conteúdo</h4>
                <p className="mt-1 text-sm text-red-600 max-w-sm mx-auto">{error}</p>
                <button onClick={onGenerate} className="mt-4 flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all"><SparklesIcon className="w-5 h-5" /><span>Tentar Novamente</span></button>
            </div>
        );
    }
    
    if (!content) {
        return renderInitialState();
    }

    const commonWrapper = ({children}: {children: React.ReactNode}) => (
        <div className="relative">
            <button onClick={onDownload} className="absolute top-0 right-0 flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-bl-lg rounded-tr-lg hover:bg-gray-200 transition-colors z-10">
                <DownloadIcon className="w-4 h-4"/>
                <span>Baixar HTML</span>
            </button>
            {children}
        </div>
    )

    if (type === 'landingPage' && 'hero' in content) {
        const lp = content as LandingPageContent;
        return commonWrapper({ children: (
            <div className="space-y-8 text-gray-800">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight">{lp.headline}</h2>
                    <p className="mt-2 text-lg text-gray-500">{lp.subheadline}</p>
                </div>

                <div className="p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-bold">{lp.hero.title}</h3>
                     {lp.hero.imageBase64 ? (
                        <img src={`data:image/jpeg;base64,${lp.hero.imageBase64}`} alt={lp.hero.title} className="w-full h-auto aspect-video object-cover rounded-lg my-4 shadow-md border border-gray-200" />
                    ) : isImagesLoading ? (
                        <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center my-4 animate-pulse"><LoaderIcon className="w-8 h-8 text-gray-400 animate-spin" /></div>
                    ) : null}
                    <p className="mt-2 whitespace-pre-wrap">{lp.hero.text}</p>
                    <button className="mt-4 px-5 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700">{lp.hero.cta}</button>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-center mb-6">Diferenciais</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        {lp.features.map((f, i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-lg">
                                 {f.imageBase64 ? (
                                    <img src={`data:image/jpeg;base64,${f.imageBase64}`} alt={f.title} className="w-full h-40 object-cover rounded-md mb-4 shadow-md border border-gray-200" />
                                ) : isImagesLoading ? (
                                    <div className="w-full h-40 bg-gray-200 rounded-md flex items-center justify-center mb-4 animate-pulse"><LoaderIcon className="w-6 h-6 text-gray-400 animate-spin" /></div>
                                ) : null}
                                <h4 className="font-bold">{f.title}</h4>
                                <p className="mt-1 text-sm text-gray-600">{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                 {imagesError && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                        <p><span className="font-bold">Erro de Imagem:</span> {imagesError}</p>
                    </div>
                 )}

                <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                    <h3 className="text-xl font-bold text-center">{lp.captureForm.title}</h3>
                    <div className="mt-4 max-w-md mx-auto flex flex-col sm:flex-row gap-2">
                        <input type="email" placeholder={lp.captureForm.placeholder} className="flex-grow w-full px-4 py-2 bg-white rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow duration-200" aria-label="Email para inscrição" />
                        <button className="flex-shrink-0 px-5 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700">{lp.captureForm.cta}</button>
                    </div>
                </div>

                 <div className="p-6 bg-gray-50 rounded-lg text-center">
                    <h3 className="text-xl font-bold">{lp.socialProof.title}</h3>
                    <blockquote className="mt-2 italic text-gray-600">"{lp.socialProof.testimonial}"</blockquote>
                    <p className="mt-2 font-semibold text-sm">{lp.socialProof.author}</p>
                </div>

                 <div className="p-6 bg-purple-600 text-white rounded-lg text-center">
                    <h3 className="text-2xl font-bold">{lp.finalCta.title}</h3>
                    <button className="mt-4 px-6 py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100">{lp.finalCta.cta}</button>
                </div>
            </div>
        )});
    }

    if (type === 'blogPost' && 'introduction' in content) {
        const bp = content as BlogPostContent;
        return commonWrapper({ children: (
            <div className="space-y-8 text-gray-800">
                 <h2 className="text-3xl font-extrabold tracking-tight">{bp.title}</h2>
                 <p className="text-lg text-gray-600 whitespace-pre-wrap">{bp.introduction}</p>
                 <div className="space-y-8">
                    {bp.sections.map((s,i) => (
                        <div key={i}>
                            <h3 className="text-2xl font-bold mb-3">{s.title}</h3>
                            {s.imageBase64 ? (
                                <img src={`data:image/jpeg;base64,${s.imageBase64}`} alt={s.title} className="w-full h-auto aspect-video object-cover rounded-lg mb-4 shadow-md border border-gray-200" />
                            ) : isImagesLoading ? (
                                <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-4 animate-pulse">
                                    <LoaderIcon className="w-8 h-8 text-gray-400 animate-spin" />
                                </div>
                            ) : null }
                            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{s.content}</p>
                        </div>
                    ))}
                 </div>
                 {imagesError && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                        <p><span className="font-bold">Erro de Imagem:</span> {imagesError}</p>
                    </div>
                 )}
                 <div>
                    <h3 className="text-xl font-bold mb-2">Conclusão</h3>
                    <p className="whitespace-pre-wrap">{bp.conclusion}</p>
                 </div>
                 {bp.relatedConcepts && bp.relatedConcepts.length > 0 && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-bold text-lg">Conceitos Relacionados</h4>
                        <ul className="mt-2 space-y-2 list-disc list-inside">
                           {bp.relatedConcepts.map((c, i) => <li key={i}><span className="font-semibold">{c.name}:</span> <span className="text-sm italic text-gray-600">"{c.philosophy}"</span></li>)}
                        </ul>
                    </div>
                 )}
            </div>
        )});
    }

    if (type === 'poster' && 'images' in content) {
        const p = content as PosterContent;
        return commonWrapper({ children: (
            <div className="space-y-6 text-gray-800">
                <div className="text-center">
                    <h2 className="text-4xl font-extrabold tracking-tight uppercase" style={{fontFamily: "'Anton', sans-serif"}}>{p.headline}</h2>
                    <p className="mt-1 text-lg text-gray-500">{p.subheadline}</p>
                </div>
                <div className="grid grid-cols-3 grid-rows-2 gap-4 h-[500px]">
                    {p.images.map((img, i) => {
                        const gridClass = [
                            'col-span-2 row-span-2', // Main image
                            'col-span-1 row-span-1',
                            'col-span-1 row-span-1',
                            'col-span-1 row-span-1',
                            'col-span-1 row-span-1',
                        ][i % 5] || 'col-span-1 row-span-1';
                        
                        return (
                             <div key={i} className={`bg-gray-200 rounded-lg shadow-inner flex items-center justify-center ${gridClass}`}>
                                {img.imageBase64 ? (
                                    <img src={`data:image/jpeg;base64,${img.imageBase64}`} alt={`Imagem do cartaz ${i+1}`} className="w-full h-full object-cover rounded-lg" />
                                ) : isImagesLoading ? (
                                     <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center animate-pulse">
                                        <LoaderIcon className="w-8 h-8 text-gray-400 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-gray-400"/>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="pt-6 border-t border-gray-200 text-center">
                    <a href="#" className="inline-block px-8 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-transform transform hover:scale-105">{p.cta.text}</a>
                </div>

                <div className="p-6 bg-gray-100 rounded-lg border border-gray-200">
                    <h3 className="text-xl font-bold text-center">{p.captureForm.title}</h3>
                    <div className="mt-4 max-w-md mx-auto flex flex-col sm:flex-row gap-2">
                        <input type="email" placeholder={p.captureForm.placeholder} className="flex-grow w-full px-4 py-2 bg-white rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none" aria-label="Email para inscrição" />
                        <button className="flex-shrink-0 px-5 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700">{p.captureForm.cta}</button>
                    </div>
                </div>
                
                {imagesError && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                        <p><span className="font-bold">Erro de Imagem:</span> {imagesError}</p>
                    </div>
                 )}
            </div>
        )});
    }

    return renderInitialState();
};