// FullscreenWrapper.js

import React, { useEffect } from 'react';

const FullscreenWrapper = ({ children, isFullscreen}) => {
  const wrapperRef = React.useRef(null);

  useEffect(() => {
    const element = wrapperRef.current;

    if (isFullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen(); // Firefox
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen(); // Chrome and Safari
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen(); // IE/Edge
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, [isFullscreen]);

  return (
    <div ref={wrapperRef} className={isFullscreen ? 'fullscreen' : ''} style={{ width: '100%', height: '100%' }}
    >
      {children}
    </div>
  );
};

export default FullscreenWrapper;
