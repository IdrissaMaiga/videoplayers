import React, { useRef, useEffect, useState } from 'react';
import { Box, IconButton, Flex, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Tooltip, Spinner, Spacer,Text } from '@chakra-ui/react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaDownload, FaClosedCaptioning, FaExpand, FaCompress, FaFastForward, FaFastBackward } from 'react-icons/fa';
import FullscreenWrapper from './FullscreenWrapper';  // Import the FullscreenWrapper
import './UniversalVideoPlayer.css';



// Initialize FFmpeg

const UniversalVideoPlayer = ({ src, canDownload, width = "100%", height = "auto", controls = true,extension }) => {

  const timeoutId = useRef(null);
  const timeoutId1= useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subtitles, setSubtitles] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const[showcontrols,setShowControls]=useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  useEffect(() => {
    const preventContextMenu = (e) => e.preventDefault();
   const handleTouchStart = () => timeoutId1.current = setTimeout(preventContextMenu, 500);
   const handleTouchEnd = () => clearTimeout(timeoutId1.current);

    document.addEventListener('contextmenu', preventContextMenu);  // Prevent right-click
   document.addEventListener('touchstart', handleTouchStart);     // Handle long-press start
   document.addEventListener('touchend', handleTouchEnd);         // Handle long-press end

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  
  
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = isMuted;
      video.autoplay = true;
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    //console.log(src)
      const handleMetadataLoaded = () => {
        setDuration(video.duration);
        setProgress(0);
        setIsLoading(false);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime )
        setProgress((video.currentTime / video.duration) * 100);
        if (progress===100)
        {setBuffered(0)}
       
      };

      const handleCanPlay = () => setIsLoading(false);
      const handleWaiting = () => setIsLoading(true);

      const handleProgress = () => {
        const video = videoRef.current;
        if (video && video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          const bufferedPercent = Math.min((bufferedEnd / video.duration) * 100, 100);  // Clamping to 100
          setBuffered(bufferedPercent);
           }
      };
     

      video.addEventListener('loadedmetadata', handleMetadataLoaded);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('waiting', handleWaiting);
      video.addEventListener('progress', handleProgress);

      const hasSubtitles = video.textTracks && video.textTracks.length > 0;
      setSubtitles(hasSubtitles);

      return () => {
        video.removeEventListener('loadedmetadata', handleMetadataLoaded);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('waiting', handleWaiting);
        video.removeEventListener('progress', handleProgress);
      };
    }
    return () => {
        // Clean up event listeners...
        if (timeoutId.current) clearTimeout(timeoutId.current);
      };
  }, [src, volume, isMuted]);



  useEffect(() => {
    const handleKeyPress = (event) => {
      // Prevent default behavior for the handled keys
      if (event.key === 'ArrowDown' || event.keyCode === 40) {
        event.preventDefault();  // Prevent default scroll behavior
        toggleFullscreen();      // Call your custom logic
      } else if (event.key === 'Enter' || event.key === 'MediaPlayPause') {
        event.preventDefault();  // Prevent default behavior (e.g., form submit)
        togglePlayButon();      // Call your custom play/pause toggle
      } else if (event.key === 'MediaRewind') {
        event.preventDefault();  // Prevent default behavior
        skipTime(-20);           // Call your custom skipTime logic
      } else if (event.key === 'MediaFastForward') {
        event.preventDefault();  // Prevent default behavior
        skipTime(20);            // Call your custom skipTime logic
      }
    };

    // Attach the keydown event listener
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup the event listener when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);
  const togglePlay = () => {
    const video = videoRef.current;
    if ((video && !isMobile)) {  // Only toggle play on non-touch devices
      isPlaying ? video.pause() : video.play();
      setIsPlaying(!isPlaying);
    }
    if (isMobile) {
      // Show controls briefly on mobile when video is tapped
      setShowControls(false);
    }
  };
 
  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds}`;
    } else {
      return `${minutes}:${seconds}`;
    }
  };
 
  const handleClick = () => {
    setShowControls(true);
    if (timeoutId.current) clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(() => setShowControls(false), 3000);
  };
  const togglePlayButon = () => {
    const video = videoRef.current;
   
      isPlaying ? video.pause() : video.play();
      setIsPlaying(!isPlaying);
      setShowControls(!showcontrols);  
  };
  
  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value) => {
    const clampedValue = Math.min(1, Math.max(0, value)); // Clamp between 0 and 1
    const video = videoRef.current;
    setVolume(clampedValue);
    if (video) {
      video.volume = clampedValue;
      setIsMuted(clampedValue === 0);
    }
  };
  
  const handleProgressChange = (value) => {
    const clampedValue = Math.min(100, Math.max(0, value)); // Clamp between 0 and 100
    const video = videoRef.current;
    if (video) {
      video.currentTime = (clampedValue / 100) * duration;
      setProgress(clampedValue);
    }
  };

  const handleDownload = () => {
    if (canDownload) {
      const link = document.createElement('a');
      link.href = src;
      link.download = 'video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const skipTime = (seconds) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.min(video.duration, Math.max(0, video.currentTime + seconds));
    }
  };

  return (
    <FullscreenWrapper isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen}  
     >
      <Box className={`video-container ${isFullscreen ? 'fullscreen' : ''}`} position="relative" width={width} height={height} onClick={handleClick}
     
      >
        <video
          ref={videoRef}
          src={src}
          id="videoElement"
          height="100%"
          width={"100%"}
          style={{ borderRadius: '10px' }}
          onClick={togglePlay}
          
          
        />
        {isLoading && (
          <Flex
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            align="center"
            justify="center"
            bg="rgba(0, 0, 0, 0.7)"
            zIndex="0"
            borderRadius="10px"
          >
            <Spinner color="white" size="xl" />
          </Flex>
        )}

{(showcontrols) && (
          <Flex
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            align="center"
            justify="center"
            bg="rgba(0, 0, 0, 0.7)"
            zIndex="0"
            borderRadius="10px"
            onClick={togglePlayButon}
          >
            <IconButton
              icon={isPlaying ? <FaPause /> : <FaPlay />}
              onClick={togglePlay}
              variant="ghost"
              color="white"
              fontSize="30px"
              size={"lg"}
              zIndex={11}
              bg={"transparent"}
              aria-label="Play/Pause"
            />
          </Flex>
        )}
        
        <Box size={"md"} position="absolute"
        minWidth={isMobile?"0px":"200px"} minHeight={isMobile?"0px":"100px"}
        right="10px"
        bottom="-5px"
        m={0}
        width="100%"
        padding="10px"
        align="center"
        justify="space-between"
       
        borderRadius="10px"
        zIndex="19"
        
        bg="transparent"  
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        >
            <Spacer></Spacer>
        {(showcontrols||!isPlaying) && (
          <Flex
          position="absolute"
          bottom="10px"
          width="100%"
          padding="5px"
          align="center"
          justify="space-between"
          bg="rgba(0, 0, 0, 0.6)"
          borderRadius="10px"
          zIndex="0"
          _hover={{
            display: "flex",
            '.chakra-slider__thumb': {
              display: "block", // Show the thumb when hovering over the slider
            },
          }}
        >
          <IconButton
            icon={<FaFastBackward />}
            onClick={() => skipTime(-20)}
            variant="ghost"
            color="white"
            fontSize={{ base: "16px", md: "20px" }}
            aria-label="Rewind 20 seconds"
          />
          <IconButton
            icon={isPlaying ? <FaPause /> : <FaPlay />}
            onClick={togglePlayButon}
            variant="ghost"
            color="white"
            fontSize={{ base: "16px", md: "20px" }}
            aria-label="Play/Pause"
          />
          <IconButton
            icon={<FaFastForward />}
            onClick={() => skipTime(20)}
            variant="ghost"
            color="white"
            fontSize={{ base: "16px", md: "20px" }}
            aria-label="Forward 20 seconds"
          />
          <Text color="white" fontSize={{ base: "xs", md: "sm" }} mr="8px">
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
          <Slider
            flex="1"
            mx="10px"
            value={progress}
            onChange={(val) => {
              // Clamp the progress value to ensure it doesn’t go beyond 0-100 range
              handleProgressChange(Math.min(100, Math.max(0, val)));
            }}
          >
            <SliderTrack bg="gray.700">
              <Box
                position="absolute"
                top="0"
                left="0"
                width={`${buffered}%`}
                bg="green.500"
                height="100%"
                opacity="0.4"
              />
              <Box
                position="absolute"
                top="0"
                left="0"
                width={`${progress}%`}
                bg="red.700"
                height="100%"
              />
            </SliderTrack>
            <SliderThumb display="none" boxSize={2} />
          </Slider>
        
          <Tooltip label={`Volume: ${Math.round(volume * 100)}%`} placement="top">
            <IconButton
              icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              onClick={toggleMute}
              variant="ghost"
              color="white"
              fontSize={{ base: "16px", md: "20px" }}
              aria-label="Mute/Unmute"
            />
          </Tooltip>
          <Slider
            maxW="100px"
            value={volume}
            m={1}
            mr={3}
            onChange={(val) => {
              handleVolumeChange(Math.min(1, Math.max(0.01, val)));
            }}
            step={0.05}
            min={0}
            max={1}
            display={isMuted ? 'none' : 'block'}
          >
            <SliderTrack bg="gray.700">
              <SliderFilledTrack bg="red.700" />
            </SliderTrack>
            <SliderThumb boxSize={2} />
          </Slider>
        
          {subtitles && (
            <Tooltip label="Subtitles available" placement="top">
              <IconButton
                icon={<FaClosedCaptioning />}
                variant="ghost"
                color="white"
                fontSize={{ base: "16px", md: "20px" }}
                aria-label="Subtitles available"
              />
            </Tooltip>
          )}
          {canDownload && (
            <Tooltip label="Download video" placement="top">
              <IconButton
                icon={<FaDownload />}
                onClick={handleDownload}
                variant="ghost"
                color="white"
                fontSize={{ base: "16px", md: "20px" }}
                aria-label="Download video"
              />
            </Tooltip>
          )}
          <Tooltip label="Full screen" placement="top">
            <IconButton
              icon={isFullscreen ? <FaCompress /> : <FaExpand />}
              onClick={toggleFullscreen}
              variant="ghost"
              color="white"
              fontSize={{ base: "16px", md: "20px" }}
              aria-label="Toggle Fullscreen"
            />
          </Tooltip>
        </Flex>
        
        )}</Box>
      </Box>
    </FullscreenWrapper>
  );
};

export default UniversalVideoPlayer;
