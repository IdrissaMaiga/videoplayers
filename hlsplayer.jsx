import React, { useRef, useEffect } from 'react';
import Hls from 'hls.js';

const HLSPlayer = ({ src, width = "100%", height = "auto", controls = true }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    let hls;

    if (Hls.isSupported() && videoRef.current) {
      hls = new Hls({
        // Enable automatic quality adjustment based on bandwidth
        autoStartLoad: true,
        capLevelToPlayerSize: true,
        startLevel: -1, // start with the best quality
        maxLoadingDelay: 4,
        minAutoBitrate: 0,
      });

      hls.loadSource(src);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current.play();
      });

      // Listen to auto level switching based on user network conditions
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        const currentLevel = hls.levels[data.level];
       
      });

      // Error handling
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Network error encountered. Trying to recover...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Media error encountered. Attempting to recover...");
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (videoRef.current && videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = src;
      videoRef.current.addEventListener('loadedmetadata', () => {
        videoRef.current.play();
      });
    }

  }, [src]);

  return (
    <video
      ref={videoRef}
      width={width}
      height={height}
      controls={controls}
      style={{ width, height }}
    />
  );
};

export default HLSPlayer;
