import type React from 'react';
import type { TextPosition, SubtitleOutlineStyle, PriceTagStyleId, PriceTagPosition, PriceTagColor } from '@/types';
import { 
    PositionCenterIcon, PositionTopIcon, PositionBottomIcon, PositionLeftIcon, PositionRightIcon,
    SparklesIcon, OutlineWhiteIcon, OutlineBlackIcon, OutlineShadowIcon, OutlineBoxIcon,
    PriceTagCircleIcon, PriceTagRectIcon, PriceTagBurstIcon,
    PositionTopLeftIcon, PositionTopRightIcon, PositionBottomLeftIcon, PositionBottomRightIcon, XCircleIcon
} from '@/components/icons';
import type { IconProps } from '@/components/icons';

export const positionOptions: { id: TextPosition; name: string; icon: React.FC<IconProps> }[] = [
    { id: 'left', name: 'Esquerda', icon: PositionLeftIcon },
    { id: 'center', name: 'Centro', icon: PositionCenterIcon },
    { id: 'right', name: 'Direita', icon: PositionRightIcon },
    { id: 'top', name: 'Topo', icon: PositionTopIcon },
    { id: 'bottom', name: 'Base', icon: PositionBottomIcon },
];

export const subtitleOutlineOptions: { id: SubtitleOutlineStyle; name: string; icon: React.FC<IconProps> }[] = [
    { id: 'auto', name: 'Automático', icon: SparklesIcon },
    { id: 'white', name: 'Contorno Branco', icon: OutlineWhiteIcon },
    { id: 'black', name: 'Contorno Preto', icon: OutlineBlackIcon },
    { id: 'soft_shadow', name: 'Sombra Suave', icon: OutlineShadowIcon },
    { id: 'transparent_box', name: 'Caixa de Fundo', icon: OutlineBoxIcon },
];

// --- Price Tag Options ---
export const priceStyleOptions: { id: PriceTagStyleId; name: string; icon: React.FC<IconProps> }[] = [
    { id: 'circle', name: 'Círculo', icon: PriceTagCircleIcon },
    { id: 'tag', name: 'Tag', icon: PriceTagRectIcon },
    { id: 'burst', name: 'Explosão', icon: PriceTagBurstIcon },
];

export const pricePositionOptions: { id: PriceTagPosition; name: string; icon: React.FC<IconProps> }[] = [
    { id: 'none', name: 'Nenhum', icon: XCircleIcon },
    { id: 'top-left', name: 'Sup. Esquerdo', icon: PositionTopLeftIcon },
    { id: 'top-right', name: 'Sup. Direito', icon: PositionTopRightIcon },
    { id: 'bottom-left', name: 'Inf. Esquerdo', icon: PositionBottomLeftIcon },
    { id: 'bottom-right', name: 'Inf. Direito', icon: PositionBottomRightIcon },
];

export const priceColorOptions: { id: PriceTagColor; name: string; hex: string }[] = [
    { id: 'red', name: 'Vermelho', hex: '#ef4444' }, // red-500
    { id: 'yellow', name: 'Amarelo', hex: '#f59e0b' }, // amber-500
    { id: 'blue', name: 'Azul', hex: '#3b82f6' }, // blue-500
    { id: 'black', name: 'Preto', hex: '#1f2937' }, // gray-800
];
