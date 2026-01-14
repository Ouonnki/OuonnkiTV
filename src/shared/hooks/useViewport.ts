import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface ViewportInfo {
  width: number;
  height: number;
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface ViewportBreakpoints {
  mobile?: number;
  tablet?: number;
}

const DEFAULT_BREAKPOINTS: Required<ViewportBreakpoints> = {
  mobile: 640,
  tablet: 1024,
};

/**
 * Hook to detect viewport size and device type
 * @param breakpoints - Custom breakpoints for device types
 * @returns ViewportInfo object containing width, height, device type and boolean flags
 */
export const useViewport = (
  breakpoints: ViewportBreakpoints = {}
): ViewportInfo => {
  const bp = { ...DEFAULT_BREAKPOINTS, ...breakpoints };

  const getDeviceType = (width: number): DeviceType => {
    if (width < bp.mobile) return 'mobile';
    if (width < bp.tablet) return 'tablet';
    return 'desktop';
  };

  const getInitialState = (): ViewportInfo => {
    if (typeof window === 'undefined') {
      return {
        width: 0,
        height: 0,
        deviceType: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const deviceType = getDeviceType(width);

    return {
      width,
      height,
      deviceType,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
    };
  };

  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>(getInitialState);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const deviceType = getDeviceType(width);

      setViewportInfo({
        width,
        height,
        deviceType,
        isMobile: deviceType === 'mobile',
        isTablet: deviceType === 'tablet',
        isDesktop: deviceType === 'desktop',
      });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bp.mobile, bp.tablet]);

  return viewportInfo;
};

/**
 * Simple hook to check if the viewport is mobile
 * @param breakpoint - The width breakpoint in pixels (default: 640)
 * @returns boolean indicating if the current viewport is mobile
 */
export const useIsMobile = (breakpoint: number = 640): boolean => {
  const { width } = useViewport();
  return width < breakpoint;
};
