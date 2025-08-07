import type { CompositionPreset } from '@/types';
import { 
    LayoutRandomIcon,
    LayoutImpactoIcon,
    LayoutDegradeIcon,
    LayoutContornoIcon,
    LayoutLegivelIcon,
    LayoutVerticalIcon,
    OutlineWhiteIcon
} from '@/components/icons';

export const compositionPresets: CompositionPreset[] = [
    {
        id: 'random',
        name: 'Aleatório',
        icon: LayoutRandomIcon,
        config: { // Config is a placeholder, logic is handled in the component
            style: { name: 'fill-stroke', palette: 'light' }, 
            rotation: true, 
            subtitle: true 
        }
    },
    {
        id: 'impacto-light',
        name: 'Impacto (Claro)',
        icon: LayoutImpactoIcon,
        config: {
            style: { name: 'fill-stroke', palette: 'light' },
            rotation: true,
            subtitle: true
        }
    },
    {
        id: 'impacto-dark',
        name: 'Impacto (Escuro)',
        icon: LayoutImpactoIcon,
        config: {
            style: { name: 'fill-stroke', palette: 'dark' },
            rotation: true,
            subtitle: true
        }
    },
    {
        id: 'impacto-vibrant',
        name: 'Impacto (Vibrante)',
        icon: LayoutImpactoIcon,
        config: {
            style: { name: 'fill-stroke', palette: 'complementary' },
            rotation: true,
            subtitle: true
        }
    },
    {
        id: 'impacto-contorno-branco',
        name: 'Impacto (Contorno Branco)',
        icon: OutlineWhiteIcon,
        config: {
            style: {
                name: 'fill-stroke',
                palette: 'dark',
                forcedStroke: 'white',
            },
            rotation: true,
            subtitle: true
        }
    },
    {
        id: 'legivel-light',
        name: 'Legível (Fundo Escuro)',
        icon: LayoutLegivelIcon,
        config: {
            style: {
                name: 'fill',
                palette: 'light',
                background: { color: 'rgba(0, 0, 0, 0.5)', padding: 0.2 }
            },
            rotation: false,
            subtitle: true
        }
    },
    {
        id: 'legivel-dark',
        name: 'Legível (Fundo Claro)',
        icon: LayoutLegivelIcon,
        config: {
            style: {
                name: 'fill',
                palette: 'dark',
                background: { color: 'rgba(255, 255, 255, 0.6)', padding: 0.2 }
            },
            rotation: false,
            subtitle: true
        }
    },
    {
        id: 'degrade',
        name: 'Degradê',
        icon: LayoutDegradeIcon,
        config: {
            style: {
                name: 'gradient-on-block',
                palette: 'complementary',
                background: { color: 'rgba(0, 0, 0, 0.4)', padding: 0.15 }
            },
            rotation: false,
            subtitle: true
        }
    },
    {
        id: 'contorno',
        name: 'Contorno',
        icon: LayoutContornoIcon,
        config: {
            style: { name: 'stroke', palette: 'light' },
            rotation: false,
            subtitle: true
        }
    },
    {
        id: 'vertical',
        name: 'Vertical',
        icon: LayoutVerticalIcon,
        config: {
            style: { name: 'vertical', palette: 'light' },
            rotation: false,
            subtitle: false
        }
    },
];