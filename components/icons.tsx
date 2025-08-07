
import React from 'react';

// A helper type for component props
type IconProps = React.SVGProps<SVGSVGElement>;

export const LogoIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <path d="M21 15l-5-5L5 21"></path>
  </svg>
);

export const DownloadIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

export const SparklesIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9 1.9 5.8 1.9-5.8 5.8-1.9-5.8-1.9z"></path>
  </svg>
);

export const LoaderIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
  </svg>
);

export const AlertTriangleIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
      <path d="M12 9v4"></path>
      <path d="M12 17h.01"></path>
    </svg>
);

export const GoogleIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C14.03,4.73 15.69,5.36 16.95,6.55L19.05,4.44C17.22,2.77 15,2 12.19,2C6.92,2 2.71,6.6 2.71,12C2.71,17.4 6.92,22 12.19,22C17.6,22 21.7,18.35 21.7,12.33C21.7,11.72 21.55,11.1 21.35,11.1Z" />
  </svg>
);

export const LogoutIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);

export const BookOpenIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

export const ArchiveIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="20" height="5" x="2" y="3" rx="1"></rect>
        <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path>
        <path d="M10 12h4"></path>
    </svg>
);

export const DatabaseIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
        <path d="M3 12A9 3 0 0 0 21 12"></path>
    </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m6 9 6 6 6-6"></path>
    </svg>
);

export const FileZipIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <path d="M12 18v-1a2 2 0 0 1 2-2h1"></path>
        <path d="M12 12h2"></path><path d="M12 15h2"></path>
        <path d="M15 12v6"></path>
    </svg>
);

export const PlusIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M5 12h14"></path>
        <path d="M12 5v14"></path>
    </svg>
);

export const XIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M18 6 6 18"></path>
        <path d="m6 6 12 12"></path>
    </svg>
);

export const MegaphoneIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m3 11 18-5v12L3 14v-3z"></path>
        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path>
    </svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m15 18-6-6 6-6"></path>
    </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m9 18 6-6-6-6"></path>
    </svg>
);

export const ProductIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
      <path d="m3.3 7 8.7 5 8.7-5"></path>
      <path d="M12 22V12"></path>
    </svg>
);

export const UsersIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

export const FamilyIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
        <path d="M12 15c-2.5 0-4.5-2-4.5-4.5V9a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v1.5c0 .8-.3 1.6-.8 2.2"/>
        <path d="M17.5 22c-1.7 0-3-1.3-3-3v-2.5c0-.8.7-1.5 1.5-1.5h3c.8 0 1.5.7 1.5 1.5V19c0 1.7-1.3 3-3 3Z"/>
        <path d="M6.5 22c-1.7 0-3-1.3-3-3v-2.5c0-.8.7-1.5 1.5-1.5h3c.8 0 1.5.7 1.5 1.5V19c0 1.7-1.3 3-3 3Z"/>
        <path d="M12 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
    </svg>
);

export const LayersIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.84l8.57 3.9a2 2 0 0 0 1.66 0l8.57-3.9a1 1 0 0 0 0-1.84Z"></path>
        <path d="m22 17.92-8.57 3.9a2 2 0 0 1-1.66 0L3.2 17.92"></path>
        <path d="m22 12.08-8.57 3.9a2 2 0 0 1-1.66 0L3.2 12.08"></path>
    </svg>
);

export const DetailedViewIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M5 12s2.545-5 7-5c4.454 0 7 5 7 5s-2.546 5-7 5c-4.455 0-7-5-7-5z"></path>
        <path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path>
        <path d="M20.94 11A8.45 8.45 0 0 0 12 7.5a8.45 8.45 0 0 0-8.94 3.5"></path>
        <path d="M3.06 13A8.45 8.45 0 0 0 12 16.5a8.45 8.45 0 0 0 8.94-3.5"></path>
    </svg>
);

export const PosterIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M4.5 3H20v14a2 2 0 0 1-2 2H6.5a2.5 2.5 0 0 1 0-5H20"></path>
    </svg>
);

export const BlueprintIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M15 3h6v6"></path>
        <path d="M9 21H3v-6"></path>
        <path d="M21 3l-6 6"></path>
        <path d="M3 21l6-6"></path>
        <path d="M9 3h1.5a1.5 1.5 0 0 1 0 3H9v0"></path>
        <path d="M10.5 3v1.5a1.5 1.5 0 0 1-3 0V3v0"></path>
        <path d="M3 9h1.5a1.5 1.5 0 0 1 0 3H3v0"></path>
        <path d="M4.5 9v1.5a1.5 1.5 0 0 1-3 0V9v0"></path>
        <path d="M15 21h1.5a1.5 1.5 0 0 1 0-3H15v0"></path>
        <path d="M16.5 21v-1.5a1.5 1.5 0 0 1-3 0V21v0"></path>
        <path d="M21 15h-1.5a1.5 1.5 0 0 1 0-3H21v0"></path>
        <path d="M19.5 15v-1.5a1.5 1.5 0 0 1 3 0V15v0"></path>
    </svg>
);

export const FileTextIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <line x1="10" y1="9" x2="8" y2="9"></line>
    </svg>
);

export const ImageIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
        <circle cx="9" cy="9" r="2"></circle>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
    </svg>
);

export const PublishIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
);

export const ClipboardIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    </svg>
);

export const CheckIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20 6 9 17l-5-5"></path>
    </svg>
);

export const LightbulbIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5C17.7 10.2 18 9 18 7c0-2.2-1.8-4-4-4S10 4.8 10 7c0 2 1.3 4.3 2.5 5.5.7.7 1.3 1.5 1.5 2.5"></path>
        <path d="M9 18h6"></path><path d="M10 22h4"></path>
    </svg>
);

export const EditIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
    </svg>
);

export const TagIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
        <path d="M7 7h.01"></path>
    </svg>
);

export const TextQuoteIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M17 6H3"></path><path d="M21 12H8"></path>
        <path d="M21 18H8"></path><path d="M3 12v6"></path>
    </svg>
);

export const HistoryIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
        <path d="M3 3v5h5"></path><path d="M12 7v5l4 2"></path>
    </svg>
);

export const TrashIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

// --- Layout Icons ---
export const LayoutRandomIcon: React.FC<IconProps> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M14.5 9.5L9.5 14.5M14.5 14.5L9.5 9.5M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
export const LayoutImpactoIcon: React.FC<IconProps> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
export const LayoutDegradeIcon: React.FC<IconProps> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><rect x="4" y="9" width="16" height="6" fill="url(#paint0_linear_10_2)"/><defs><linearGradient id="paint0_linear_10_2" x1="4" y1="12" x2="20" y2="12" gradientUnits="userSpaceOnUse"><stop stopColor="white"/><stop offset="1" stopColor="gray"/></linearGradient></defs></svg>
);
export const LayoutContornoIcon: React.FC<IconProps> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M4 8H20M4 16H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
export const LayoutLegivelIcon: React.FC<IconProps> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><rect x="2" y="7" width="20" height="10" rx="2" fill="currentColor" fillOpacity="0.5"/><path d="M6 12h12" stroke="white" strokeWidth="2"/></svg>
);
export const LayoutVerticalIcon: React.FC<IconProps> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M12 4v16M16 8h-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
export const OutlineWhiteIcon: React.FC<IconProps> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M7 5L17 5M7 12L17 12M7 19L17 19" stroke="white" strokeWidth="4" strokeLinecap="round"/><path d="M7 5L17 5M7 12L17 12M7 19L17 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
);

// --- Position Icons ---
export const PositionCenterIcon: React.FC<IconProps> = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M4 12H20M12 4V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
export const PositionTopIcon: React.FC<IconProps> = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M4 6H20M12 4V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
export const PositionBottomIcon: React.FC<IconProps> = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M4 18H20M12 16V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
export const PositionLeftIcon: React.FC<IconProps> = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M6 4V20M4 12H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
export const PositionRightIcon: React.FC<IconProps> = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M18 4V20M16 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
export const PositionTopLeftIcon: React.FC<IconProps> = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><rect x="4" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/></svg>);
export const PositionTopRightIcon: React.FC<IconProps> = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><rect x="14" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/></svg>);
export const PositionBottomLeftIcon: React.FC<IconProps> = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><rect x="4" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/></svg>);
export const PositionBottomRightIcon: React.FC<IconProps> = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><rect x="14" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/></svg>);

// --- Outline Icons ---
export const OutlineBlackIcon: React.FC<IconProps> = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M7 5L17 5M7 12L17 12M7 19L17 19" stroke="black" strokeWidth="4" strokeLinecap="round"/><path d="M7 5L17 5M7 12L17 12M7 19L17 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);
export const OutlineShadowIcon: React.FC<IconProps> = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M8 13L18 13" stroke="black" strokeOpacity="0.5" strokeWidth="4" strokeLinecap="round"/><path d="M6 11L16 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);
export const OutlineBoxIcon: React.FC<IconProps> = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><rect x="4" y="8" width="16" height="8" rx="1" fill="currentColor" fillOpacity="0.7"/><path d="M6 12h12" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>);

// --- Price Tag Icons ---
export const PriceTagCircleIcon: React.FC<IconProps> = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2"/></svg>);
export const PriceTagRectIcon: React.FC<IconProps> = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="2"/></svg>);
export const PriceTagBurstIcon: React.FC<IconProps> = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M12 2L13.89 8.09L20 9.27L15.18 13.91L16.78 20L12 16.54L7.22 20L8.82 13.91L4 9.27L10.11 8.09L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);

export const XCircleIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"></circle>
      <path d="m15 9-6 6"></path>
      <path d="m9 9 6 6"></path>
    </svg>
);
