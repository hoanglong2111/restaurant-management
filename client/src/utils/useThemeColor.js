// Hook to update theme-color meta tag for mobile notch/status bar
import { useEffect } from 'react';

const useThemeColor = (color) => {
    useEffect(() => {
        // Update meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', color);
        }

        // Update Apple status bar style
        const metaAppleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        if (metaAppleStatusBar) {
            // Use black-translucent for dark backgrounds, default for light
            const isDark = color === '#1a1a1a' || color === '#000000';
            metaAppleStatusBar.setAttribute('content', isDark ? 'black-translucent' : 'default');
        }

        // Cleanup on unmount - reset to default dark
        return () => {
            if (metaThemeColor) {
                metaThemeColor.setAttribute('content', '#1a1a1a');
            }
        };
    }, [color]);
};

export default useThemeColor;
