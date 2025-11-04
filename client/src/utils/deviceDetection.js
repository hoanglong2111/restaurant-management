// Utility hooks and functions for device detection and responsive design

import { useState, useEffect } from 'react';

/**
 * Hook to detect current device type
 * @returns {Object} { isMobile, isTablet, isDesktop, deviceType, screenSize }
 */
export const useDeviceDetect = () => {
    const [deviceInfo, setDeviceInfo] = useState({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        deviceType: 'desktop',
        screenSize: {
            width: window.innerWidth,
            height: window.innerHeight
        }
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            let isMobile = width < 768;
            let isTablet = width >= 768 && width < 1024;
            let isDesktop = width >= 1024;

            let deviceType = 'desktop';
            if (isMobile) deviceType = 'mobile';
            else if (isTablet) deviceType = 'tablet';

            setDeviceInfo({
                isMobile,
                isTablet,
                isDesktop,
                deviceType,
                screenSize: { width, height }
            });
        };

        // Initial check
        handleResize();

        // Listen for resize events
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return deviceInfo;
};

/**
 * Get detailed device information
 * @returns {Object} Device details including OS, browser, etc.
 */
export const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isAndroid = /Android/.test(ua);
    const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    
    let deviceModel = 'Unknown';
    let osVersion = 'Unknown';
    
    // Detect iOS device
    if (isIOS) {
        const match = ua.match(/iPhone|iPad|iPod/);
        deviceModel = match ? match[0] : 'iOS Device';
        
        const versionMatch = ua.match(/OS (\d+)_(\d+)_?(\d+)?/);
        if (versionMatch) {
            osVersion = `iOS ${versionMatch[1]}.${versionMatch[2]}`;
        }
    }
    
    // Detect Android device
    if (isAndroid) {
        deviceModel = 'Android Device';
        const versionMatch = ua.match(/Android (\d+(\.\d+)?)/);
        if (versionMatch) {
            osVersion = `Android ${versionMatch[1]}`;
        }
        
        // Try to get specific model
        const modelMatch = ua.match(/;\s*([^;)]+)\s+Build/);
        if (modelMatch) {
            deviceModel = modelMatch[1].trim();
        }
    }
    
    return {
        isMobile,
        isIOS,
        isAndroid,
        isTablet: /iPad|Android(?!.*Mobile)/.test(ua),
        deviceModel,
        osVersion,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        pixelRatio: window.devicePixelRatio || 1,
        userAgent: ua
    };
};

/**
 * Hook to track screen orientation
 * @returns {string} 'portrait' or 'landscape'
 */
export const useOrientation = () => {
    const [orientation, setOrientation] = useState(
        window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    );

    useEffect(() => {
        const handleOrientationChange = () => {
            setOrientation(
                window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
            );
        };

        window.addEventListener('resize', handleOrientationChange);
        window.addEventListener('orientationchange', handleOrientationChange);

        return () => {
            window.removeEventListener('resize', handleOrientationChange);
            window.removeEventListener('orientationchange', handleOrientationChange);
        };
    }, []);

    return orientation;
};

/**
 * Log device information to console (for debugging)
 */
export const logDeviceInfo = () => {
    const info = getDeviceInfo();
    console.group('📱 Device Information');
    console.log('Device Model:', info.deviceModel);
    console.log('OS Version:', info.osVersion);
    console.log('Screen Size:', `${info.screenWidth}x${info.screenHeight}`);
    console.log('Pixel Ratio:', info.pixelRatio);
    console.log('Is Mobile:', info.isMobile);
    console.log('Is iOS:', info.isIOS);
    console.log('Is Android:', info.isAndroid);
    console.log('Is Tablet:', info.isTablet);
    console.groupEnd();
    
    return info;
};
