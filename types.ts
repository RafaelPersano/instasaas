

import type React from 'react';

export interface MixedStyle {
  name: string;
  percentage: number;
}

export interface RegionalityData {
  country: string;

  city: string;
  neighborhood: string;
  weight: number;
}

export interface BrandData {
  name: string;
  slogan: string;
  weight: number; // Percentage of influence
}

export type TextPosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-right';
export type SubtitleOutlineStyle = 'auto' | 'white' | 'black' | 'soft_shadow' | 'transparent_box';

export interface CompositionPreset {
  id: string;
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  config: {
    style: {
        name: 'fill' | 'stroke' | 'fill-stroke' | 'gradient-on-block' | 'vertical';
        palette: 'light' | 'dark' | 'complementary' | 'analogous';
        background?: {
            color: string;
            padding: number;
        };
        forcedStroke?: string;
    };
    rotation: boolean;
    subtitle: boolean;
  };
}

export type PriceTagPosition = 'none' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type PriceTagStyleId = 'circle' | 'tag' | 'burst';
export type PriceTagColor = 'red' | 'yellow' | 'blue' | 'black';

export interface PriceData {
  text: string;
  modelText: string;
  style: PriceTagStyleId;
  position: PriceTagPosition;
  color: PriceTagColor;
}

export interface GoogleAd {
  headlines: string[];
  descriptions: string[];
}
export interface FacebookAd {
  primaryText: string;
  headline: string;
  description: string;
}
export interface AdCopy {
  google: GoogleAd;
  facebook: FacebookAd;
  strategyTip: string;
}

export interface AdIdea {
    conceptName: string;
    headline: string;
    primaryText: string;
    replicabilityTip: string;
}

export interface AdTrendAnalysis {
    trendOverview: string;
    adIdeas: AdIdea[];
    hashtags: string[];
}

export interface BrandConcept {
    name: string;
    philosophy: string;
    visualStyle: string;
    keywords: string[];
}

export interface FeatureDetails {
    title: string;
    description: string;
}

export interface LandingPageContent {
    headline: string;
    subheadline: string;
    hero: {
        title: string;
        text: string;
        cta: string;
        imagePrompt?: string;
        imageBase64?: string;
    };
    features: {
        title: string;
        description: string;
        imagePrompt?: string;
        imageBase64?: string;
    }[];
    captureForm: {
        title: string;
        cta: string;
        placeholder: string;
    };
    socialProof: {
        title: string;
        testimonial: string;
        author: string;
    };
    finalCta: {
        title: string;
        cta: string;
    };
}

export interface BlogPostContent {
    title: string;
    introduction: string;
    sections: {
        title: string;
        content: string;
        imagePrompt?: string;
        imageBase64?: string;
    }[];
    conclusion: string;
    relatedConcepts: {
        name: string;
        philosophy: string;
    }[];
}

export interface PosterContent {
    headline: string;
    subheadline: string;
    cta: {
        text: string;
    };
    captureForm: {
        title: string;
        cta: string;
        placeholder: string;
    };
    images: {
        prompt: string;
        imageBase64?: string;
    }[];
}

export interface GenerateOptions {
    basePrompt: string;
    imagePrompt: string;
    textOverlay: string;
    compositionId: string;
    textPosition: TextPosition;
    subtitleOutline: SubtitleOutlineStyle;
    artStyles: string[];
    theme: string;
    brandData: BrandData;
    priceData: PriceData;
    regionalityData: RegionalityData;
    negativeImagePrompt?: string;
    numberOfImages: number;
    scenario?: 'product' | 'couple' | 'family' | 'isometric_details' | 'poster' | 'carousel_cta' | 'carousel_educational' | 'carousel_trend' | 'executive_project';
    concept?: BrandConcept;
}

// --- SAAS & HISTORY TYPES ---
export interface ProjectState {
    id: string | null;
    userId: string;
    projectName: string;
    conceptContext: { basePrompt: string; theme: string; regionalityData: RegionalityData } | null;
    brandConcepts: BrandConcept[] | null;
    currentConcept: BrandConcept | null;
    generatedImagesB64: string[] | null;
    textOverlay: string;
    compositionId: string;
    textPosition: TextPosition;
    subtitleOutline: SubtitleOutlineStyle;
    artStylesForFont: string[];
    brandData: BrandData;
    priceData: PriceData;
    regionalityData: RegionalityData;
    featureDetails: FeatureDetails[] | null;
    adCopy: AdCopy | null;
    landingPageContent: LandingPageContent | null;
    blogPostContent: BlogPostContent | null;
    posterContent: PosterContent | null;
}

export interface HistoryItem {
    id: string;
    user_id: string;
    project_name: string;
    project_state: ProjectState;
    created_at: string;
    updated_at: string;
}