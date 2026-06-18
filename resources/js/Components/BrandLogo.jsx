import React from 'react';

const BrandLogo = ({ name, className = "" }) => {
    const n = name.toLowerCase();
    
    let iconName = null;
    let color = '0f172a'; // slate-900
    let darkColor = 'f8fafc'; // slate-50

    if (n.includes('apple')) {
        iconName = 'apple';
    } else if (n.includes('samsung')) {
        iconName = 'samsung';
    } else if (n.includes('google')) {
        iconName = 'google';
    } else if (n.includes('oneplus') || n.includes('one plus')) {
        iconName = 'oneplus';
    } else if (n.includes('xiaomi')) {
        iconName = 'xiaomi';
    } else if (n.includes('huawei')) {
        iconName = 'huawei';
    } else if (n.includes('sony')) {
        iconName = 'sony';
    } else if (n.includes('motorola')) {
        iconName = 'motorola';
    } else if (n.includes('nokia')) {
        iconName = 'nokia';
    } else if (n.includes('oppo')) {
        iconName = 'oppo';
    } else if (n.includes('vivo')) {
        iconName = 'vivo';
    } else if (n.includes('realme')) {
        iconName = 'realme';
    } else if (n.includes('infinix')) {
        iconName = 'infinix';
    } else if (n.includes('tecno')) {
        iconName = 'tecno';
    }

    if (iconName) {
        // Use default brand colors. 
        // In dark mode, we use brightness-0 and invert to turn the colored logos into pure white.
        const localLogos = ['sony', 'motorola', 'nokia', 'oppo', 'vivo', 'realme', 'infinix', 'tecno'];
        const url = localLogos.includes(iconName) 
            ? `/images/logos/${iconName}.svg` 
            : `https://cdn.simpleicons.org/${iconName}`;
            
        return (
            <img 
                src={url} 
                alt={`${name} logo`} 
                className={`${className} object-contain dark:brightness-0 dark:invert`}
            />
        );
    }

    // Fallback if no logo
    return (
        <div className={`${className} flex items-center justify-center font-black text-slate-800 dark:text-slate-200 tracking-tighter uppercase`}>
            {name}
        </div>
    );
};

export default BrandLogo;
