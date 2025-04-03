// components/unity/UnityPreview.tsx
'use client';

import { useEffect, useState } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';

interface UnityPreviewProps {
  buildUrl: string;
}

export default function UnityPreview({ buildUrl }: UnityPreviewProps) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const { unityProvider, isLoaded, loadingProgression, requestFullscreen } = useUnityContext({
    loaderUrl: `${buildUrl}/Build/webgl.loader.js`,
    dataUrl: `${buildUrl}/Build/webgl.data`,
    frameworkUrl: `${buildUrl}/Build/webgl.framework.js`,
    codeUrl: `${buildUrl}/Build/webgl.wasm`,
  });

  // Handle responsive resizing
  useEffect(() => {
    const updateSize = () => {
      const container = document.getElementById('unity-container');
      if (container) {
        setContainerSize({
          width: container.clientWidth,
          height: container.clientWidth * (9 / 16), // 16:9 aspect ratio
        });
      }
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div className="flex flex-col">
      <div id="unity-container" className="w-full relative">
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
            <div className="w-3/4 h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${loadingProgression * 100}%` }}
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