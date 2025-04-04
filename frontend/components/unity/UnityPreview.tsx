// components/unity/UnityPreview.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';

interface UnityPreviewProps {
  buildUrl: string;
}

export default function UnityPreview({ buildUrl }: UnityPreviewProps) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Check if buildUrl is valid
  const validBuildUrl = buildUrl && typeof buildUrl === 'string' && buildUrl.startsWith('http');
  
  // Only initialize Unity context if we have a valid URL
  const { unityProvider, isLoaded, loadingProgression, requestFullscreen } = useUnityContext(
    validBuildUrl ? {
      loaderUrl: `${buildUrl}/Build/webgl.loader.js`,
      dataUrl: `${buildUrl}/Build/webgl.data`,
      frameworkUrl: `${buildUrl}/Build/webgl.framework.js`,
      codeUrl: `${buildUrl}/Build/webgl.wasm`,
    } : {
      loaderUrl: '',
      dataUrl: '',
      frameworkUrl: '',
      codeUrl: '',
    }
  );

  // Handle Unity loading errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Check if error is related to Unity WebGL files
      if ((event.message && event.message.includes('webgl')) || 
          (event.filename && event.filename.includes(buildUrl))) {
        setLoadError('Failed to load the game preview. Please try again later.');
        console.error('Unity WebGL error:', event);
      }
    };

    if (validBuildUrl) {
      window.addEventListener('error', handleError);
      
      return () => {
        window.removeEventListener('error', handleError);
      };
    }
  }, [buildUrl, validBuildUrl]);

  // Handle responsive resizing
  useEffect(() => {
    if (!validBuildUrl) return;
    
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setContainerSize({
          width,
          height: width * (9 / 16), // 16:9 aspect ratio
        });
      }
    };

    window.addEventListener('resize', updateSize);
    updateSize(); // Initial size

    return () => window.removeEventListener('resize', updateSize);
  }, [validBuildUrl]);

  // If no valid buildUrl provided
  if (!validBuildUrl) {
    return (
      <div className="w-full aspect-[16/9] bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">No preview available</p>
      </div>
    );
  }

  // If there was an error loading Unity
  if (loadError) {
    return (
      <div className="w-full aspect-[16/9] bg-gray-100 flex flex-col items-center justify-center">
        <div className="text-red-500 mb-2">⚠️ {loadError}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1 bg-indigo-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div id="unity-container" ref={containerRef} className="w-full relative">
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
            <div className="w-3/4 h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-200"
                style={{ width: `${Math.round(loadingProgression * 100)}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-700">
              Loading game: {Math.round(loadingProgression * 100)}%
            </p>
          </div>
        )}
        
        <Unity
          unityProvider={unityProvider}
          style={{
            width: containerSize.width,
            height: containerSize.height,
            visibility: isLoaded ? 'visible' : 'hidden',
          }}
        />
      </div>
      
      {isLoaded && (
        <div className="mt-2 flex justify-end">
          <button
            onClick={() => requestFullscreen(true)}
            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Fullscreen
          </button>
        </div>
      )}
    </div>
  );
}