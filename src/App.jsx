import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Circle, Ellipse, RegularPolygon, Star, Transformer, Image as KonvaImage, Text as KonvaText, Arrow, Path, Group } from 'react-konva';
import Konva from 'konva';
import { 
  Palette, Pen, Eraser, Circle as CircleIcon, Square, 
  Undo, Redo, Plus, Trash2, MousePointer2, Type, Shapes, 
  Grid, FileText, MoreHorizontal, Copy, ClipboardPaste, 
  Scissors, Files, Bold, Italic, Underline,
  Minus, ArrowUpRight, Triangle, Diamond, Hexagon, Star as StarIcon,
  Pentagon, Octagon, Heart, Cloud, Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize, Minimize,
  Paintbrush, PaintBucket, Highlighter, Sparkles, PenTool,
  ImagePlus, Image as ImageIcon, Video, Volume2 as VolIcon, Smile, Box, StickyNote,
  Trophy, Sun, Moon, Ghost, Bug, Link, LineChart, Calculator, Ruler, FileUp,
  Save, Share2, LocateFixed, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useStore } from './store';
import toast, { Toaster } from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const VECTOR_SHAPES = ['rectangle', 'circle', 'line', 'arrow', 'triangle', 'diamond', 'hexagon', 'star', 'pentagon', 'octagon', 'star4', 'star6', 'right-triangle', 'cross', 'heart', 'cloud'];

const CLIPART_PATHS = {
  Trophy: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6 M18 9h1.5a2.5 2.5 0 0 0 0-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0 0 12 0V2Z",
  Sun: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M4.93 19.07l1.41-1.41 M17.66 6.34l1.41-1.41",
  Moon: "M12 3a6.364 6.364 0 0 0 9 9 9 9 0 1 1-9-9Z",
  Star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  Cloud: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z",
  Ghost: "M9 10h.01 M15 10h.01 M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z",
  Bug: "M8 2v4 M16 2v4 M2 12h2 M20 12h2 M4 18l2-2 M20 18l-2-2 M6 10a6 6 0 0 1 12 0v8a6 6 0 0 1-12 0z M12 6v14",
  Computer: "M4 6h16v10H4z M8 16v4 M16 16v4 M2 20h20",
  Heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  Flag: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7",
  Map: "M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z M9 3v15 M15 6v15",
  Car: "M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H9.3a2 2 0 0 0-1.6.8L5 11l-5.16.86a1 1 0 0 0-.84.99V16h3m10 0a2 2 0 1 1-4 0m-8 0a2 2 0 1 1-4 0",
};

const EXTENDED_EMOJIS = [
  '😀','😃','😄','😁','😆','😅','😂','🤣','🥲','☺️','😊','😇','🙂','🙃','😉','😌',
  '😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥸',
  '🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢',
  '😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔',
  '🫣','🤭','🤫','🤥','😶','🫥','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱',
  '😴','🤤','😪','😮‍💨','😵','😵‍💫','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠',
  '😈','👿','👹','👺','🤡','💩','👻','💀','☠️','👽','👾','🤖','🎃','😺','😸','😹',
  '😻','😼','😽','🙀','😿','😾','🙈','🙉','🙊','💋','💌','💘','💝','💖','💗','💓',
  '💞','💕','💟','❣️','💔','❤️','🧡','💛','💚','💙','💜','🤎','🖤','🤍','💯','💢',
  '💬','👁️‍🗨️','🗨️','🗯️','💭','💤','🖐️','✋','🖖','👋','🤙','🫲','🫱','🫳','🫴','👈',
  '👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝',
  '🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🦼','🧠','🫀','🫁'
];

// Helper component for loading images from data URLs
const URLImage = ({ el, commonProps }) => {
  const [image, setImage] = useState(null);
  
  useEffect(() => {
    const img = new window.Image();
    img.src = el.src || el.dataUrl;
    img.onload = () => setImage(img);
  }, [el.src, el.dataUrl]);
  
  return (
    <KonvaImage 
      {...commonProps} 
      image={image} 
      width={el.width} 
      height={el.height} 
      x={el.isTransformed ? el.x : el.x} 
      y={el.isTransformed ? el.y : el.y} 
    />
  );
};

const AudioPlayerNode = ({ el, commonProps }) => {
  const [audio] = useState(() => new window.Audio(el.src));
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [duration, setDuration] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  useEffect(() => {
    const onTimeUpdate = () => {
      if (audio.duration) setProgress(audio.currentTime);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onLoadedMetadata = () => setDuration(audio.duration || 1);
    
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.load();
    
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.pause();
    };
  }, [audio]);

  const togglePlay = (e) => {
    e.cancelBubble = true;
    if (audio.paused) audio.play().catch(console.error);
    else audio.pause();
  };

  const skip = (sec, e) => {
    e.cancelBubble = true;
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + sec));
  };

  const toggleMute = (e) => {
    e.cancelBubble = true;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  const handleSeek = (e) => {
    e.cancelBubble = true;
    const node = e.target;
    const padding = 16;
    const trackWidth = (el.width || 360) - padding * 2 - 150;
    const stage = node.getStage();
    const pointerPos = stage.getPointerPosition();
    const transform = node.getAbsoluteTransform().copy();
    transform.invert();
    const localPos = transform.point(pointerPos);
    
    const pct = Math.max(0, Math.min(1, localPos.x / trackWidth));
    audio.currentTime = pct * (audio.duration || 1);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const padding = 16;
  const w = el.width || 360;
  const h = el.height || 104;
  const trackWidth = w - padding * 2 - 150;
  const progressRatio = duration > 0 ? progress / duration : 0;

  return (
    <Group 
      x={el.isTransformed ? el.x : el.x} 
      y={el.isTransformed ? el.y : el.y}
      scaleX={el.scaleX || 1}
      scaleY={el.scaleY || 1}
      rotation={el.rotation || 0}
      draggable={commonProps.draggable}
      onClick={commonProps.onClick}
      onTap={commonProps.onTap}
      onDragStart={commonProps.onDragStart}
      onDragEnd={commonProps.onDragEnd}
      onTransform={commonProps.onTransform}
      onTransformEnd={commonProps.onTransformEnd}
      id={el.id}
      name={commonProps.name}
    >
      <Rect x={0} y={0} width={w} height={h} fill="#f8fafc" stroke="#6366f1" strokeWidth={3} cornerRadius={8} shadowColor="rgba(0,0,0,0.1)" shadowBlur={10} shadowOffset={{ x: 0, y: 4 }} />
      <Rect x={padding} y={padding} width={w - padding * 2} height={28} fill="transparent" stroke="#cbd5e1" strokeWidth={2} cornerRadius={4} />
      <KonvaText x={padding + 8} y={padding + 6} text={el.fileName || "Audio File"} fontSize={14} fontFamily="Inter, Arial" fill="#1e293b" width={w - padding * 2 - 16} wrap="none" ellipsis={true} />
      
      <Group x={padding} y={padding + 44}>
        <Group x={0} y={0} onClick={(e) => skip(-10, e)} onTap={(e) => skip(-10, e)} onMouseEnter={(e) => { e.target.getStage().container().style.cursor = 'pointer'; }} onMouseLeave={(e) => { e.target.getStage().container().style.cursor = 'default'; }}>
           <Rect width={28} height={28} cornerRadius={4} stroke="#94a3b8" strokeWidth={1.5} fill="transparent" />
           <KonvaText x={0} y={9} width={28} text="-10" fontSize={10} align="center" fill="#475569" />
        </Group>

        <Group x={36} y={0} onClick={togglePlay} onTap={togglePlay} onMouseEnter={(e) => { e.target.getStage().container().style.cursor = 'pointer'; }} onMouseLeave={(e) => { e.target.getStage().container().style.cursor = 'default'; }}>
           <Rect width={28} height={28} cornerRadius={4} stroke="#6366f1" strokeWidth={1.5} fill="rgba(99, 102, 241, 0.1)" />
           {isPlaying ? (
              <Path data="M 10 9 L 10 19 M 18 9 L 18 19" stroke="#6366f1" strokeWidth={3} strokeLineCap="round" />
           ) : (
              <Path data="M 11 8 L 21 14 L 11 20 Z" fill="#6366f1" />
           )}
        </Group>

        <Group x={72} y={0} onClick={(e) => skip(10, e)} onTap={(e) => skip(10, e)} onMouseEnter={(e) => { e.target.getStage().container().style.cursor = 'pointer'; }} onMouseLeave={(e) => { e.target.getStage().container().style.cursor = 'default'; }}>
           <Rect width={28} height={28} cornerRadius={4} stroke="#94a3b8" strokeWidth={1.5} fill="transparent" />
           <KonvaText x={0} y={9} width={28} text="+10" fontSize={10} align="center" fill="#475569" />
        </Group>

        <Group x={110} y={14}>
          <Line points={[0, 0, trackWidth, 0]} stroke="#cbd5e1" strokeWidth={6} lineCap="round" />
          <Line points={[0, 0, progressRatio * trackWidth, 0]} stroke="#1e293b" strokeWidth={6} lineCap="round" />
          <Circle x={progressRatio * trackWidth} y={0} radius={7} fill="#ef4444" stroke="#fff" strokeWidth={2} shadowColor="rgba(0,0,0,0.3)" shadowBlur={4} />
          <Rect x={0} y={-14} width={trackWidth} height={28} onClick={handleSeek} onTap={handleSeek} onMouseEnter={(e) => { e.target.getStage().container().style.cursor = 'pointer'; }} onMouseLeave={(e) => { e.target.getStage().container().style.cursor = 'default'; }} />
        </Group>

        <KonvaText x={110} y={22} text={`${formatTime(progress)} / ${formatTime(duration)}`} fontSize={10} fill="#64748b" />

        <Group x={110 + trackWidth + 12} y={0} onClick={toggleMute} onTap={toggleMute} onMouseEnter={(e) => { e.target.getStage().container().style.cursor = 'pointer'; }} onMouseLeave={(e) => { e.target.getStage().container().style.cursor = 'default'; }}>
           <Rect width={28} height={28} cornerRadius={4} stroke="#94a3b8" strokeWidth={1.5} fill="transparent" />
           <Path data="M 8 10 L 12 10 L 16 6 L 16 22 L 12 18 L 8 18 Z" fill="#64748b" />
           {isMuted && <Path data="M 18 10 L 24 18 M 24 10 L 18 18" stroke="#ef4444" strokeWidth={2} strokeLineCap="round" />}
        </Group>
      </Group>
    </Group>
  );
};

const URLVideo = ({ el, commonProps, onRegister }) => {
  const [videoElement, setVideoElement] = useState(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (!el.src) return;
    const video = document.createElement('video');
    video.src = el.src;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    
    const handleLoadedMetadata = () => {
      video.play().catch(err => console.log("Video auto-play blocked or failed", err));
      setVideoElement(video);
      if (onRegister) onRegister(el.id, video);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.pause();
      video.src = "";
      video.load();
      if (onRegister) onRegister(el.id, null);
    };
  }, [el.src]);

  // Sync frames with Konva
  useEffect(() => {
    if (!videoElement || !imageRef.current) return;
    
    const layer = imageRef.current.getLayer();
    const anim = new Konva.Animation(() => {
      // Redraw layer on every frame to show video progress
    }, layer);
    
    anim.start();
    return () => anim.stop();
  }, [videoElement]);

  return (
    <KonvaImage
      {...commonProps}
      ref={imageRef}
      image={videoElement}
      width={el.width}
      height={el.height}
      x={el.isTransformed ? el.x : el.x}
      y={el.isTransformed ? el.y : el.y}
    />
  );
};

const VideoPlayerOverlay = ({ el, scale: appScale, stagePos, selectedIds }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isSelected = selectedIds.includes(el.id);
  const elScale = el.scaleX || 1; // Element's own scale from transformation
  const combinedScale = appScale * elScale;

  useEffect(() => {
    if (videoRef.current) {
      const vid = videoRef.current;
      setIsPlaying(!vid.paused);
      setIsMuted(vid.muted);
      setDuration(vid.duration || 0);
      
      const onTimeUpdate = () => {
        if (vid.duration) {
          setProgress((vid.currentTime / vid.duration) * 100);
        }
      };
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      const onLoadedMetadata = () => setDuration(vid.duration);
      const onVolumeChange = () => setIsMuted(vid.muted);
      const onFullscreenChange = () => {
        const isFS = !!document.fullscreenElement;
        setIsFullscreen(isFS);
        if (!isFS && vid.parentNode === document.body) {
          document.body.removeChild(vid);
          vid.controls = false;
        }
      };

      vid.addEventListener('timeupdate', onTimeUpdate);
      vid.addEventListener('play', onPlay);
      vid.addEventListener('pause', onPause);
      vid.addEventListener('loadedmetadata', onLoadedMetadata);
      vid.addEventListener('volumechange', onVolumeChange);
      document.addEventListener('fullscreenchange', onFullscreenChange);

      return () => {
        vid.removeEventListener('timeupdate', onTimeUpdate);
        vid.removeEventListener('play', onPlay);
        vid.removeEventListener('pause', onPause);
        vid.removeEventListener('loadedmetadata', onLoadedMetadata);
        vid.removeEventListener('volumechange', onVolumeChange);
        document.removeEventListener('fullscreenchange', onFullscreenChange);
      };
    }
  }, []);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Keyboard Shortcuts
  useEffect(() => {
    if (!isSelected || !videoRef.current) return;

    const handleKeyDown = (e) => {
      // Ignore if typing in a textarea/input
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

      switch(e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay(e);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'KeyM':
          toggleMute(e);
          break;
        case 'KeyF':
          toggleFullscreen(e);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, isPlaying, isMuted]);

  const togglePlay = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(console.error);
    } else {
      videoRef.current.pause();
    }
  };

  const skip = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds));
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
  };

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (!document.fullscreenElement) {
      const video = videoRef.current;
      
      if (!video.parentNode) {
        document.body.appendChild(video);
        video.style.position = 'fixed';
        video.style.background = 'black';
        video.style.width = '100vw';
        video.style.height = '100vh';
        video.style.top = '0';
        video.style.left = '0';
        video.style.zIndex = '9999';
        video.controls = true;
      }

      const enterFullscreen = video.requestFullscreen || video.webkitRequestFullscreen || video.msRequestFullscreen;
      if (enterFullscreen) {
        enterFullscreen.call(video).catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
          if (video.parentNode === document.body) {
            document.body.removeChild(video);
            video.controls = false;
          }
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const newProgress = Number(e.target.value);
    videoRef.current.currentTime = (newProgress / 100) * videoRef.current.duration;
    setProgress(newProgress);
  };

  const handleReplay = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(console.error);
  };

  // Overlay wrapper hosts both actual video element and interaction controls
  return (
    <div style={{
      position: 'absolute',
      left: el.x * appScale + stagePos.x,
      top: el.y * appScale + stagePos.y,
      width: el.width * combinedScale,
      height: el.height * combinedScale,
      zIndex: isSelected ? 50 : 10,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      transformOrigin: 'top left'
    }}>
      <video ref={videoRef} src={el.src ? el.src + "#t=0.001" : el.url} controls={false} preload="metadata" playsInline style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'black', borderRadius: 8, pointerEvents: 'none' }} />
      
      {isSelected && (
      <div style={{ position: 'absolute', top: '100%', left: '0', width: '100%', display: 'flex', justifyContent: 'center', marginTop: 10, pointerEvents: 'auto' }}>
      <div className="glass-panel" style={{
        padding: `${10 * combinedScale}px ${16 * combinedScale}px`,
        display: 'flex',
        alignItems: 'center',
        gap: `${14 * combinedScale}px`,
        borderRadius: `${16 * combinedScale}px`,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(12px)',
        background: 'rgba(255, 255, 255, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        width: '100%',
        maxWidth: `${500 * combinedScale}px`
      }}>
        <div style={{ display: 'flex', gap: `${8 * combinedScale}px` }}>
          <button className="tool-btn" onClick={() => skip(-10)} title="-10s" style={{ padding: `${4 * combinedScale}px` }}>
            <RotateCcw size={18 * combinedScale} />
          </button>
          <button className="tool-btn" onClick={togglePlay} style={{ padding: `${6 * combinedScale}px`, background: 'var(--primary-color)', color: 'white', borderRadius: '50%' }}>
            {isPlaying ? <Pause size={20 * combinedScale} fill="white" /> : <Play size={20 * combinedScale} fill="white" />}
          </button>
          <button className="tool-btn" onClick={() => skip(10)} title="+10s" style={{ padding: `${4 * combinedScale}px` }}>
            <RotateCw size={18 * combinedScale} />
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: `${4 * combinedScale}px` }}>
          <div 
            onClick={(e) => {
              e.stopPropagation();
              if (!videoRef.current) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const clickedProgress = x / rect.width;
              videoRef.current.currentTime = clickedProgress * videoRef.current.duration;
            }}
            style={{ 
              position: 'relative', 
              height: `${6 * combinedScale}px`, 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              background: 'rgba(0,0,0,0.1)',
              borderRadius: '3px'
            }}
          >
            <div style={{ 
              position: 'absolute', 
              left: 0, 
              top: 0, 
              height: '100%', 
              width: `${progress}%`, 
              background: '#ef4444', 
              borderRadius: '3px 0 0 3px' 
            }} />
            <div style={{ 
              position: 'absolute', 
              left: `${progress}%`, 
              top: '50%', 
              transform: 'translate(-50%, -50%)',
              width: `${12 * combinedScale}px`,
              height: `${12 * combinedScale}px`,
              background: '#ef4444',
              borderRadius: '50%',
              boxShadow: '0 0 4px rgba(0,0,0,0.3)',
              border: '2px solid white'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: `${9 * combinedScale}px`, fontWeight: 'bold', color: 'var(--text-secondary)' }}>
            <span>{formatTime(videoRef.current?.currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: `${8 * combinedScale}px` }}>
          <button className="tool-btn" onClick={toggleMute} style={{ padding: `${4 * combinedScale}px` }}>
            {isMuted ? <VolumeX size={18 * combinedScale} /> : <Volume2 size={18 * combinedScale} />}
          </button>
          <button className="tool-btn" onClick={toggleFullscreen} style={{ padding: `${4 * combinedScale}px` }}>
            {isFullscreen ? <Minimize size={18 * combinedScale} /> : <Maximize size={18 * combinedScale} />}
          </button>
        </div>
      </div>
      </div>
      )}
    </div>
  );
};

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const GraphingCalculatorOverlay = ({ el, scale, stagePos, selectedIds }) => {
  const isSelected = selectedIds.includes(el.id);
  const PAD = 16 * scale; // Expose Konva handles
  const left = el.x * scale + stagePos.x + PAD;
  const top = el.y * scale + stagePos.y + PAD;
  const width = el.width * scale - PAD * 2;
  const height = el.height * scale - PAD * 2;

  return (
    <div 
      className={`glass-panel active-text-popover ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'absolute', left, top, width, height,
        padding: 0, overflow: 'hidden', zIndex: isSelected ? 50 : 10,
        boxShadow: isSelected ? '0 0 0 2px var(--primary-color)' : '0 4px 6px -1px rgba(0,0,0,0.1)',
        pointerEvents: isSelected ? 'auto' : 'none', 
        display: 'flex', flexDirection: 'column'
      }}
    >
      <div style={{ width: '100%', height: '30px', background: 'var(--panel-bg)', display: 'flex', alignItems: 'center', padding: '0 10px', fontWeight: 'bold', fontSize: '12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--panel-border)' }}>
        <LineChart size={14} style={{ marginRight: '6px' }}/> Graphing Calculator
      </div>
      <iframe src="https://www.desmos.com/calculator" style={{ width: '100%', height: 'calc(100% - 30px)', border: 'none', pointerEvents: isSelected ? 'auto' : 'none' }} title="Desmos Graphing" />
    </div>
  );
};

const ScientificCalculatorOverlay = ({ el, scale, stagePos, selectedIds }) => {
  const isSelected = selectedIds.includes(el.id);
  const PAD = 16 * scale; // Expose Konva handles
  const left = el.x * scale + stagePos.x + PAD;
  const top = el.y * scale + stagePos.y + PAD;
  const width = el.width * scale - PAD * 2;
  const height = el.height * scale - PAD * 2;

  return (
    <div 
      className={`glass-panel active-text-popover ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'absolute', left, top, width, height,
        padding: 0, overflow: 'hidden', zIndex: isSelected ? 50 : 10,
        boxShadow: isSelected ? '0 0 0 2px var(--primary-color)' : '0 4px 6px -1px rgba(0,0,0,0.1)',
        pointerEvents: isSelected ? 'auto' : 'none', 
        display: 'flex', flexDirection: 'column'
      }}
    >
      <div style={{ width: '100%', height: '30px', background: 'var(--panel-bg)', display: 'flex', alignItems: 'center', padding: '0 10px', fontWeight: 'bold', fontSize: '12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--panel-border)' }}>
        <Calculator size={14} style={{ marginRight: '6px' }}/> Scientific Calculator
      </div>
      <iframe src="https://www.desmos.com/scientific" style={{ width: '100%', height: 'calc(100% - 30px)', border: 'none', pointerEvents: isSelected ? 'auto' : 'none' }} title="Desmos Scientific" />
    </div>
  );
};

function App() {
  const store = useStore();
  const stageRef = useRef(null);
  const trRef = useRef(null);
  const docTrRef = useRef(null);
  const isDrawing = useRef(false);
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [workspaceId, setWorkspaceId] = useState(null);
  const [workspaceName, setWorkspaceName] = useState('Untitled Workspace');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [workspaceNameInput, setWorkspaceNameInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // PDF Mode State
  const [showPdfSidebar, setShowPdfSidebar] = useState(true);
  
  const [showPenProps, setShowPenProps] = useState(false);
  const [showShapesProps, setShowShapesProps] = useState(false);
  const [showTextProps, setShowTextProps] = useState(false);
  const [showEraserProps, setShowEraserProps] = useState(false);
  const [showInsertProps, setShowInsertProps] = useState(false);
  const [activeInsertSubmenu, setActiveInsertSubmenu] = useState(null);
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [clipboard, setClipboard] = useState([]);
  const [lassoLine, setLassoLine] = useState(null); // array of points
  const [menuPos, setMenuPos] = useState(null);
  const [textMenuPos, setTextMenuPos] = useState(null);
  const [videoURLInput, setVideoURLInput] = useState('');
  const [showVideoURLModal, setShowVideoURLModal] = useState(false);
  const [videoElements, setVideoElements] = useState({}); // { elementId: videoElement }
  const [editingText, setEditingText] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingChunks, setRecordingChunks] = useState([]);
  const [recorder, setRecorder] = useState(null);
  const [activeAudioStreams, setActiveAudioStreams] = useState([]);
  const shiftUiLeftEdge = (store.isPdfMode && showPdfSidebar) ? '200px' : '24px';
  const currentPage = store.getCurrentPage();
  const elements = currentPage.elements;

  let selectedTextEl = null;
  if (selectedIds.length === 1) {
    const el = elements.find(e => e.id === selectedIds[0]);
    if (el && (el.type === 'text' || el.type === 'sticky_note')) {
      selectedTextEl = el;
    }
  }

  const getRelativePointerPosition = (stage) => {
    const pointer = stage.getPointerPosition();
    return {
      x: (pointer.x - stage.x()) / stage.scaleX(),
      y: (pointer.y - stage.y()) / stage.scaleY(),
    };
  };

  const updateMenuPos = () => {
    if (selectedIds.length > 0 && trRef.current) {
      const box = trRef.current.getClientRect();
      setMenuPos({ x: box.x + box.width / 2, y: box.y + box.height });
      setTextMenuPos({ x: box.x + box.width / 2, y: box.y });
    } else {
      setMenuPos(null);
      setTextMenuPos(null);
    }
  };

  const commitEditingText = () => {
    if (!editingText) return;
    const el = elements.find(e => e.id === editingText.id);
    
    if (!el) {
      if (editingText.text.trim()) {
        const newElement = {
          id: editingText.id,
          type: 'text',
          text: editingText.text,
          x: editingText.originalX,
          y: editingText.originalY,
          width: 300,
          fontSize: store.fontSize,
          fontFamily: store.fontFamily,
          color: store.color,
          isBold: store.isBold,
          isItalic: store.isItalic,
          isUnderline: store.isUnderline,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          isTransformed: false
        };
        store.setElements([...elements, newElement], false);
      }
      setEditingText(null);
      store.setTool('select');
      setShowTextProps(false);
      return;
    }

    if (editingText.text.trim()) {
      const newElement = {
        ...el,
        text: editingText.text,
        isTransformed: false
      };
      // If it was a regular 'text' type, we might want to update style props from store
      if (el.type === 'text') {
        Object.assign(newElement, {
          color: store.color,
          fontFamily: store.fontFamily,
          fontSize: store.fontSize,
          isBold: store.isBold,
          isItalic: store.isItalic,
          isUnderline: store.isUnderline,
        });
      }
      store.setElements([...elements.filter(el => el.id !== editingText.id), newElement], false);
    } else if (el.type === 'text') {
      store.deleteElements([editingText.id]);
    }
    setEditingText(null);
    store.setTool('select');
    setShowTextProps(false);
  };

  const handleUpdateSelectedText = (updates) => {
    store.updateElements(selectedIds.map(id => ({ id, newProps: updates })));
    
    // update store defaults so next text uses it
    if (updates.fontSize !== undefined) store.setFontSize(updates.fontSize);
    if (updates.fontFamily !== undefined) store.setFontFamily(updates.fontFamily);
    if (updates.color !== undefined) store.setColor(updates.color);
    if (updates.isBold !== undefined && updates.isBold !== store.isBold) store.toggleBold();
    if (updates.isItalic !== undefined && updates.isItalic !== store.isItalic) store.toggleItalic();
    if (updates.isUnderline !== undefined && updates.isUnderline !== store.isUnderline) store.toggleUnderline();
    setTimeout(updateMenuPos, 10);
  };

  useEffect(() => {
    if (store.tool !== 'select') {
      setSelectedIds([]);
      setLassoLine(null);
    }
  }, [store.tool]);

  useEffect(() => {
    if (selectedIds.length > 0 && trRef.current && docTrRef.current && stageRef.current) {
      const allNodes = selectedIds.map(id => stageRef.current.findOne('#' + id)).filter(Boolean);
      
      const docNodes = allNodes.filter(n => n.getLayer().attrs.id === 'document-layer');
      const drawingNodes = allNodes.filter(n => n.getLayer().attrs.id === 'drawing-layer');

      docTrRef.current.nodes(docNodes);
      docTrRef.current.getLayer().batchDraw();

      trRef.current.nodes(drawingNodes);
      trRef.current.getLayer().batchDraw();

      setTimeout(updateMenuPos, 10);
    } else if (trRef.current && docTrRef.current) {
      trRef.current.nodes([]);
      trRef.current.getLayer().batchDraw();
      docTrRef.current.nodes([]);
      docTrRef.current.getLayer().batchDraw();
      setMenuPos(null);
      setTextMenuPos(null);
    }
  }, [selectedIds, elements, scale, position]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const boardId = params.get('board');
    // Sanitize: Ignore if it looks like a JSON object, contains invalid chars, or is literally "null"
    if (boardId && boardId !== 'null' && /^[a-zA-Z0-9_-]+$/.test(boardId)) {
      setWorkspaceId(boardId);
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/load/${boardId}`)
        .then(res => res.json())
        .then(data => {
          if (data.pages) {
            const restoredPages = data.pages.map(p => ({
              id: p.id,
              elements: p.elements || [],
              history: [[...(p.elements || [])]],
              historyStep: 0
            }));
            store.setPages(restoredPages);
            store.setCurrentPageIndex(data.currentPageIndex || 0);
          }
          if (typeof data.isPdfMode === 'boolean') {
            store.setIsPdfMode(data.isPdfMode);
          }
          if (data.name) {
             setWorkspaceName(data.name);
          }
        })
        .catch(err => console.error("Failed to load workspace:", err));
    }
  }, []);

  const handleSaveClick = () => {
    setWorkspaceNameInput(workspaceName === 'Untitled Workspace' ? '' : workspaceName);
    setShowSaveModal(true);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    const finalName = workspaceNameInput.trim() || 'Untitled Workspace';
    setWorkspaceName(finalName);
    setShowSaveModal(false);
    
    try {
      const data = {
        name: finalName,
        pages: store.pages.map(p => ({
          id: p.id,
          elements: p.elements
        })),
        currentPageIndex: store.currentPageIndex,
        isPdfMode: store.isPdfMode
      };
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: (typeof workspaceId === 'string' && workspaceId !== 'null' ? workspaceId : null), 
          data 
        })
      });
      const json = await res.json();
      if (json.success && json.id && json.id !== 'null') {
        setWorkspaceId(json.id);
        const url = new URL(window.location.href);
        url.searchParams.set('board', json.id);
        window.history.replaceState({}, '', url.toString());
        toast.success('Workspace saved successfully!');
      } else {
        console.error("[SAVE] Server returned error:", json);
        toast.error(`Failed to save: ${json.message || json.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("[SAVE] Fetch error:", err);
      toast.error('Failed to save. Network error or server is down.');
    }
    setIsSaving(false);
  };

  const handleShare = () => {
    if (!workspaceId) {
      toast.error('Please save the workspace first!');
      return;
    }
    setShowShareModal(true);
  };
  const getShareUrl = () => {
    if (!workspaceId) return '';
    const url = new URL(window.location.href);
    url.searchParams.set('board', workspaceId);
    return url.toString();
  };

  const copyShareLink = () => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleRelocate = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleDuplicatePage = () => {
    store.duplicatePage();
    setPosition({ x: 0, y: 0 });
  };

  const handleDeletePage = () => {
    if (confirm("Are you sure you want to delete this page?")) {
      store.deletePage();
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleCopy = () => {
    if (selectedIds.length > 0) {
      const copied = elements.filter(el => selectedIds.includes(el.id));
      setClipboard(copied);
    }
  };

  const handleCut = () => {
    if (selectedIds.length > 0) {
      const copied = elements.filter(el => selectedIds.includes(el.id));
      setClipboard(copied);
      store.deleteElements(selectedIds);
      setSelectedIds([]);
    }
  };

  const handlePaste = () => {
    if (clipboard.length > 0) {
      const pasted = clipboard.map(el => ({
        ...el,
        id: "node_" + Date.now().toString() + Math.random().toString().slice(2, 6),
        x: (el.x || 0) + 20,
        y: (el.y || 0) + 20
      }));
      store.setElements([...elements, ...pasted], false);
      setSelectedIds(pasted.map(p => p.id));
    }
  };

  const handleDuplicate = () => {
    if (selectedIds.length > 0) {
      const grabbed = elements.filter(el => selectedIds.includes(el.id));
      const pasted = grabbed.map(el => ({
        ...el,
        id: "node_" + Date.now().toString() + Math.random().toString().slice(2, 6),
        x: (el.x || 0) + 20,
        y: (el.y || 0) + 20
      }));
      store.setElements([...elements, ...pasted], false);
      setSelectedIds(pasted.map(p => p.id));
    }
  };

  const handleDelete = () => {
    if (selectedIds.length > 0) {
      store.deleteElements(selectedIds);
      setSelectedIds([]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in the textarea
      if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') {
        return;
      }

      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedIds.length > 0) {
        handleDelete();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') handleCopy();
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') handleCut();
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') handlePaste();
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        handleDuplicate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, store, elements, clipboard]);

  const [activeEmoji, setActiveEmoji] = useState('😀');
  const [activeClipartData, setActiveClipartData] = useState(CLIPART_PATHS['Trophy'] || '');
  const [activeStickyColor, setActiveStickyColor] = useState('#fef08a');
  const [boardBackground, setBoardBackground] = useState('#ffffff');

  // Handle Theme Changes
  useEffect(() => {
    if (store.isDarkMode) {
      setBoardBackground('#0f172a'); // Deep Slate/Blue
      document.body.classList.add('dark');
    } else {
      setBoardBackground('#ffffff');
      document.body.classList.remove('dark');
    }
  }, [store.isDarkMode]);

  const insertGraphingCalculator = () => {
    const id = "node_" + Date.now().toString();
    const newElement = {
      id,
      type: 'graphing_calc',
      x: 100,
      y: 100,
      width: 800,
      height: 600,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      isTransformed: false
    };
    store.setElements([...elements, newElement], true);
    setSelectedIds([id]);
    store.setTool('select');
    setShowInsertProps(false);
    setActiveInsertSubmenu(null);
  };

  const insertScientificCalculator = () => {
    const id = "node_" + Date.now().toString();
    const newElement = {
      id,
      type: 'scientific_calc',
      x: 100,
      y: 100,
      width: 480,
      height: 640,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      isTransformed: false
    };
    store.setElements([...elements, newElement], true);
    setSelectedIds([id]);
    store.setTool('select');
    setShowInsertProps(false);
    setActiveInsertSubmenu(null);
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      setIsLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        const newPages = [];
        const padding = 50;

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: context, viewport }).promise;
          const dataUrl = canvas.toDataURL('image/png');

          // Center the page horizontally
          const xPos = Math.max((window.innerWidth - viewport.width) / 2, 50);

          const pdfImageElement = {
              id: "doc_" + Date.now().toString() + "_" + i,
              type: 'image',
              src: dataUrl,
              x: xPos,
              y: padding,
              width: viewport.width,
              height: viewport.height,
              rotation: 0,
              scaleX: 1,
              scaleY: 1,
              isTransformed: false,
              isDocument: true
          };

          newPages.push({
            id: `Page ${i}`,
            elements: [pdfImageElement],
            history: [[pdfImageElement]],
            historyStep: 0
          });
        }

        store.setIsPdfMode(true);
        store.setPages(newPages);
        store.setCurrentPageIndex(0);
        setPosition({ x: 0, y: 0 }); // reset view
        setScale(1);
      } catch (err) {
        console.error("PDF Upload Error:", err);
        toast.error("Failed to load PDF: " + err.message);
      } finally {
        setIsLoading(false);
      }

    } else if (file.type === 'text/plain') {
      const text = await file.text();
      const newElement = {
        id: "doc_" + Date.now().toString(),
        type: 'text',
        text: text,
        x: 100,
        y: 100,
        width: 800,
        fontSize: store.fontSize,
        fontFamily: store.fontFamily,
        color: store.color,
        isTransformed: false,
        isDocument: true
      };
      store.setElements([...elements, newElement], true);
    }
    e.target.value = null;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const id = "node_" + Date.now().toString();
        const img = new window.Image();
        img.onload = () => {
          const newElement = {
            id,
            type: 'image',
            src: event.target.result,
            x: 150,
            y: 150,
            width: img.width,
            height: img.height,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            isTransformed: false
          };
          store.setElements([...elements, newElement], true);
          setSelectedIds([id]);
          store.setTool('select');
          setShowInsertProps(false);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const id = "node_" + Date.now().toString();
      const newElement = {
        id,
        type: 'video',
        src: URL.createObjectURL(file), // Generate instant blob URL natively
        fileName: file.name,
        x: 200,
        y: 200,
        width: 480,
        height: 270,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isTransformed: false
      };
      store.setElements([...elements, newElement], true);
      setSelectedIds([id]);
      store.setTool('select');
      setShowInsertProps(false);
    }
  };

  const handleVideoURL = (url) => {
    if (url) {
      const id = "node_" + Date.now().toString();
      const newElement = {
        id,
        type: 'video',
        src: url,
        fileName: 'URL Video',
        x: 200,
        y: 200,
        width: 480,
        height: 270,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isTransformed: false
      };
      store.setElements([...elements, newElement], true);
      setSelectedIds([id]);
      store.setTool('select');
      setShowInsertProps(false);
      setShowVideoURLModal(false);
      setVideoURLInput('');
    }
  };

  // Recording Logic
  const startRecording = async () => {
    try {
      // 1. Capture System Audio + Video (for audio source)
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // 2. Capture Microphone
      const micStream = await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      });

      // 3. Audio Mixing
      const audioCtx = new AudioContext();
      const dest = audioCtx.createMediaStreamDestination();
      
      const micSource = audioCtx.createMediaStreamSource(micStream);
      const systemSource = audioCtx.createMediaStreamSource(displayStream);
      
      // Check if displayStream actually has audio
      if (displayStream.getAudioTracks().length > 0) {
        systemSource.connect(dest);
      } else {
        toast.error("System audio not captured. Make sure to check 'Share Audio'.");
      }
      micSource.connect(dest);

      // 4. Capture Video from displayStream (captures calc iframes, menus, etc.)
      const videoTrack = displayStream.getVideoTracks()[0];

      // 5. Combine Video + Mixed Audio
      const combinedStream = new MediaStream([
        videoTrack,
        ...dest.stream.getAudioTracks()
      ]);

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Trace-Recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
        a.click();
        
        // Cleanup
        [displayStream, micStream, canvasStream, combinedStream].forEach(s => 
          s.getTracks().forEach(t => t.stop())
        );
        audioCtx.close();
        setIsRecording(false);
        setRecordingTime(0);
        toast.success("Recording saved to your computer!");
      };

      mediaRecorder.start(1000);
      setRecorder(mediaRecorder);
      setIsRecording(true);
      setRecordingTime(0);
      toast.success("Recording started!");
      
      // Save streams for cleanup
      setActiveAudioStreams([displayStream, micStream]);

    } catch (err) {
      console.error("Recording failed:", err);
      toast.error("Recording failed: " + err.message);
    }
  };

  const stopRecording = () => {
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      activeAudioStreams.forEach(s => s.getTracks().forEach(t => t.stop()));
      setActiveAudioStreams([]);
    }
  };

  // Recording Timer Effect
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const id = "node_" + Date.now().toString();
        const newElement = {
          id,
          type: 'audio',
          src: event.target.result,
          fileName: file.name,
          x: 200,
          y: 200,
          width: 360,
          height: 104,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          isTransformed: false
        };
        store.setElements([...elements, newElement], true);
        setSelectedIds([id]);
        store.setTool('select');
        setShowInsertProps(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const insertEmoji = (emoji) => {
    setActiveEmoji(emoji);
    store.setTool('emoji');
    setShowInsertProps(false);
    setActiveInsertSubmenu(null);
  };

  const insertClipart = (pathData) => {
    setActiveClipartData(pathData);
    store.setTool('clipart');
    setShowInsertProps(false);
    setActiveInsertSubmenu(null);
  };

  const insertStickyNote = (color) => {
    setActiveStickyColor(color);
    store.setTool('sticky_note');
    setShowInsertProps(false);
    setActiveInsertSubmenu(null);
  };

  const handleStageMouseDown = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.getClassName() === 'Layer';
    
    // If we click while editing text, we want to blur the text box (handled natively by onBlur on the textarea)
    // and stop drawing immediately.
    if (editingText) return; 

    if (store.tool === null) return;
    
    if (store.tool === 'insert') {
      store.setTool('select');
      setShowInsertProps(false);
      setActiveInsertSubmenu(null);
      return;
    }

    if (store.tool === 'select') {
      if (clickedOnEmpty) {
        const pos = getRelativePointerPosition(stageRef.current);
        setLassoLine([pos.x, pos.y]);
        setSelectedIds([]);
        setMenuPos(null);
        setShowInsertProps(false);
        setActiveInsertSubmenu(null);
      } else if (!e.evt.shiftKey && !e.evt.ctrlKey && !e.evt.metaKey) {
        setShowInsertProps(false);
        setActiveInsertSubmenu(null);
        const id = e.target.id();
        if (id && !selectedIds.includes(id)) {
           setSelectedIds([id]);
        }
      }
      return;
    }

    if (store.tool === 'text') {
      // Defer text spawning to onClick to prevent the canvas from stealing focus on mouse up
      return;
    }

    if (store.tool === 'pen' && store.penType === 'bucket') {
      const stage = stageRef.current;
      const pos = getRelativePointerPosition(stage);
      let targetId = e.target.id();
      
      // Fallback: search for intersections if target id is missing or Stage/Layer was hit
      if (!targetId || targetId === "") {
        const intersection = stage.getIntersection(pos);
        if (intersection) targetId = intersection.id();
      }

      // Final sweep: iterate all elements and find the one whose bounding box contains the click
      if (!targetId) {
        // Find the "youngest" element (last drawn) that contains the point
        const hit = [...elements].reverse().find(el => {
          if (!el.points || el.points.length < 2) return false;
          // Rough bounding box check
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          if (el.type === 'pen' || el.type === 'eraser') {
            for (let i = 0; i < el.points.length; i += 2) {
              minX = Math.min(minX, el.points[i]); minY = Math.min(minY, el.points[i+1]);
              maxX = Math.max(maxX, el.points[i]); maxY = Math.max(maxY, el.points[i+1]);
            }
          } else if (VECTOR_SHAPES.includes(el.type)) {
            minX = Math.min(el.points[0], el.endX); minY = Math.min(el.points[1], el.endY);
            maxX = Math.max(el.points[0], el.endX); maxY = Math.max(el.points[1], el.endY);
          }
          const margin = 20;
          return pos.x >= minX - margin && pos.x <= maxX + margin && pos.y >= minY - margin && pos.y <= maxY + margin;
        });
        if (hit) targetId = hit.id;
      }

      if (targetId) {
        const newElements = elements.map(el => {
          if (el.id === targetId) {
            return { ...el, fill: store.color, closed: true };
          }
          return el;
        });
        store.setElements(newElements, true);
      }
      return;
    }

    setShowPenProps(false);
    setShowShapesProps(false);
    setShowEraserProps(false);
    setShowInsertProps(false);
    setSelectedIds([]);

    isDrawing.current = true;
    const stage = stageRef.current;
    const pos = getRelativePointerPosition(stage);
    
    const newElement = {
      type: store.tool,
      points: [pos.x, pos.y],
      color: store.color,
      strokeWidth: store.strokeWidth,
      dash: store.dash,
      penType: store.penType,
      id: "node_" + Date.now().toString(),
      x: 0,
      y: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      isTransformed: false
    };

    if (store.tool === 'emoji') newElement.emojiChar = activeEmoji;
    if (store.tool === 'clipart') newElement.clipartData = activeClipartData;
    if (store.tool === 'sticky_note') {
      newElement.text = 'Type here...';
      newElement.fontFamily = 'Arial';
      newElement.fontSize = 24;
      newElement.color = '#333333';
      newElement.fill = activeStickyColor;
    }
    
    store.setElements([...elements, newElement], true);
  };

  const handleStageMouseMove = (e) => {
    const stage = stageRef.current;

    if (store.tool === 'select' && lassoLine) {
      const pos = getRelativePointerPosition(stage);
      setLassoLine(prev => [...prev, pos.x, pos.y]);
      return;
    }

    if (!isDrawing.current || store.tool === 'select' || store.tool === null || store.tool === 'text') return;
    
    const pos = getRelativePointerPosition(stage);
    const lastElement = elements[elements.length - 1];
    
    if (store.tool === 'pen' || store.tool === 'eraser') {
      lastElement.points = lastElement.points.concat([pos.x, pos.y]);
    } else if (VECTOR_SHAPES.includes(store.tool) || store.tool === 'emoji' || store.tool === 'clipart' || store.tool === 'sticky_note') {
      lastElement.endX = pos.x;
      lastElement.endY = pos.y;
    }
    
    const updatedElements = elements.slice(0, -1).concat(lastElement);
    store.setElements(updatedElements, true); 
  };

  const handleStageMouseUp = () => {
    if (store.tool === 'select' && lassoLine) {
      const stage = stageRef.current;
      
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (let i = 0; i < lassoLine.length; i += 2) {
        minX = Math.min(minX, lassoLine[i]);
        maxX = Math.max(maxX, lassoLine[i]);
        minY = Math.min(minY, lassoLine[i+1]);
        maxY = Math.max(maxY, lassoLine[i+1]);
      }
      const lassoRelBox = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
      
      // Treat as a slice if it's a complex path (> 10 points), otherwise regular select
      let isLassoSlice = (lassoLine.length > 20);

      const lassoNode = stage.findOne('#activeLassoLine');

      if (isLassoSlice) {
        if (lassoNode) lassoNode.hide(); 
        const absX = lassoRelBox.x * scale + position.x;
        const absY = lassoRelBox.y * scale + position.y;
        const absWidth = lassoRelBox.width * scale;
        const absHeight = lassoRelBox.height * scale;

        // Take snapshot of everything (both layers)
        const dataURL = stage.toDataURL({ 
          x: absX, 
          y: absY, 
          width: absWidth, 
          height: absHeight,
          pixelRatio: 1 // Keep it 1 for simplicity in canvas mapping
        });

        if (lassoNode) lassoNode.show();

        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = absWidth * (window.devicePixelRatio || 1);
          canvas.height = absHeight * (window.devicePixelRatio || 1);
          const ctx = canvas.getContext('2d');
          
          const s = scale * (window.devicePixelRatio || 1);
          ctx.beginPath();
          ctx.moveTo((lassoLine[0] - lassoRelBox.x) * s, (lassoLine[1] - lassoRelBox.y) * s);
          for (let i = 2; i < lassoLine.length; i += 2) {
              ctx.lineTo((lassoLine[i] - lassoRelBox.x) * s, (lassoLine[i+1] - lassoRelBox.y) * s);
          }
          ctx.closePath();
          ctx.clip(); 
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const finalDataUrl = canvas.toDataURL();
          
          const eraserId = "node_" + Date.now().toString() + "_eraser";
          const snippetId = "node_" + Date.now().toString() + "_snippet";
          
          const eraserEl = { type: 'eraser_polygon', points: [...lassoLine], id: eraserId };
          const snippetEl = {
            type: 'image',
            dataUrl: finalDataUrl,
            x: lassoRelBox.x,
            y: lassoRelBox.y,
            width: lassoRelBox.width,
            height: lassoRelBox.height,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            id: snippetId,
            isTransformed: true 
          };
          
          store.setElements([...elements, eraserEl, snippetEl], false);
          setSelectedIds([snippetId]);
          setLassoLine(null);
        };
        img.src = dataURL;
        return;
      } else {
        const absLassoBox = {
          x: lassoRelBox.x * scale + position.x,
          y: lassoRelBox.y * scale + position.y,
          width: lassoRelBox.width * scale,
          height: lassoRelBox.height * scale
        };

        const selectedArr = elements.filter(el => {
          const shape = stage.findOne('#' + el.id);
          if (!shape || el.type === 'eraser_polygon') return false; 
          return Konva.Util.haveIntersection(absLassoBox, shape.getClientRect());
        }).map(el => el.id);
          
        setSelectedIds(selectedArr);
        setLassoLine(null);
        return;
      }
    }

    if (!isDrawing.current) return;
    isDrawing.current = false;
    store.setElements([...elements], false);

    if (VECTOR_SHAPES.includes(store.tool) || ['emoji', 'clipart', 'sticky_note'].includes(store.tool)) {
      const lastEl = elements[elements.length - 1];
      if (lastEl.endX === undefined || (Math.abs(lastEl.endX - lastEl.points[0]) < 2 && Math.abs(lastEl.endY - lastEl.points[1]) < 2)) {
        // Did not draw a valid shape (0 size), cleanup to avoid scale NaN explosion
        store.setElements(elements.slice(0, -1), false);
        return;
      }
      store.setTool('select');
      setShowShapesProps(false);
      setSelectedIds([lastEl?.id]);
    }
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const scaleBy = 1.05;
    const oldScale = stage.scaleX();

    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setScale(newScale);

    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };


  useEffect(() => {
    const handleResize = () => setPosition(p => ({...p})); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToolClick = (tool) => {
    if (store.tool === tool) {
      if (tool === 'pen') {
        setShowPenProps(true);
        return;
      }
      store.setTool(null);
      setShowPenProps(false);
      setShowShapesProps(false);
      setShowTextProps(false);
      return;
    }

    store.setTool(tool);
    setShowPenProps(tool === 'pen');
    setShowShapesProps(VECTOR_SHAPES.includes(tool));
    setShowTextProps(tool === 'text');
    setShowEraserProps(tool === 'eraser');
    setShowInsertProps(tool === 'insert');
    if (tool !== 'insert') setActiveInsertSubmenu(null);
  };

  const shapeProps = (el) => ({
    id: el.id,
    name: "shape "+el.id, 
    scaleX: el.scaleX || 1,
    scaleY: el.scaleY || 1,
    rotation: el.rotation || 0,
    dash: el.dash || [],
    fill: el.fill || 'transparent',
    lineCap: (el.dash && el.dash.length > 0) ? 'square' : 'round',
    lineJoin: (el.dash && el.dash.length > 0) ? 'miter' : 'round',
    draggable: store.tool === 'select' && selectedIds.includes(el.id),
    onClick: (e) => {
      if (store.tool === 'select' && el.type !== 'eraser_polygon') {
        e.cancelBubble = true;
        const id = el.id;
        if (e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey) {
          setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        } else {
          setSelectedIds([id]);
        }
      }
    },
    onTap: (e) => {
      if (store.tool === 'select' && el.type !== 'eraser_polygon') {
        e.cancelBubble = true;
        setSelectedIds([el.id]);
      }
    },
    onDblClick: (e) => {
      if (store.tool === 'select' && el.type === 'text') {
        e.cancelBubble = true;
        setEditingText({
          id: el.id,
          x: el.isTransformed ? el.x : el.x,
          y: el.isTransformed ? el.y : el.y,
          originalX: el.isTransformed ? el.x : el.x,
          originalY: el.isTransformed ? el.y : el.y,
          text: el.text
        });
        
        store.setColor(el.color);
        store.setFontFamily(el.fontFamily);
        store.setFontSize(el.fontSize);
        if (store.isBold !== el.isBold) store.toggleBold();
        if (store.isItalic !== el.isItalic) store.toggleItalic();
        if (store.isUnderline !== el.isUnderline) store.toggleUnderline();
        
        setShowTextProps(false);
        store.setTool('text');
      }
    },
    onDragStart: (e) => {
      if (!selectedIds.includes(el.id)) {
        setSelectedIds([el.id]);
      }
      setMenuPos(null);
      setTextMenuPos(null);
    },
    onDragEnd: (e) => {
      store.updateElement(el.id, { x: e.target.x(), y: e.target.y(), isTransformed: true });
      setTimeout(updateMenuPos, 10);
    },
    onTransform: (e) => {
      if (el.type === 'text' || el.type === 'sticky_note') {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        let newWidth = Math.max(node.width() * scaleX, 40);
        let newHeight = Math.max(node.height() * scaleY, 40);
        node.width(newWidth);
        if (el.type === 'sticky_note') node.height(newHeight);
        node.scaleX(1);
        node.scaleY(1);
      }
    },
    onTransformEnd: (e) => {
      const node = stageRef.current.findOne('#' + el.id);
      if(node) {
        store.updateElement(el.id, {
          x: node.x(),
          y: node.y(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
          width: (el.type === 'text' || el.type === 'sticky_note') ? node.width() : el.width,
          height: el.type === 'sticky_note' ? node.height() : el.height,
          rotation: node.rotation(),
          isTransformed: true
        });
      }
      setTimeout(updateMenuPos, 10);
    }
  });

  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { background: 'var(--panel-bg)', color: 'var(--text-primary)', backdropFilter: 'blur(12px)', border: '1px solid var(--panel-border)' } }} />
      {editingText && (
        <div className="glass-panel text-popover active-text-popover" style={{ position: 'absolute', left: editingText.x * scale + position.x, top: editingText.y * scale + position.y - 10, transform: 'translateY(-100%)', flexDirection: 'row', minWidth: 'auto', gap: '8px', padding: '8px', zIndex: 101 }}>
          <select 
            className="font-select" 
            value={store.fontFamily} 
            onChange={(e) => { store.setFontFamily(e.target.value); setTimeout(() => document.getElementById('active-textarea')?.focus(), 0); }}
            style={{ padding: '4px 8px', margin: 0 }}
          >
            <option value="Arial">Arial</option>
            <option value="'Inter', sans-serif">Inter</option>
            <option value="'Times New Roman', serif">Times New Roman</option>
            <option value="'Comic Neue', cursive">Comic Sans</option>
            <option value="'Courier New', monospace">Courier</option>
            <option value="'Playfair Display', serif">Playfair</option>
          </select>
          <input 
            type="number" 
            style={{ width: '60px', padding: '4px', borderRadius: '6px', border: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0.7)', outline: 'none' }} 
            value={store.fontSize} 
            onChange={(e) => store.setFontSize(Number(e.target.value))}
            onBlur={() => document.getElementById('active-textarea')?.focus()}
            min="8" max="144"
          />
          <button className={`format-btn ${store.isBold ? 'active' : ''}`} style={{ padding: '4px' }} onMouseDown={(e) => { e.preventDefault(); store.toggleBold(); }}><Bold size={16} /></button>
          <button className={`format-btn ${store.isItalic ? 'active' : ''}`} style={{ padding: '4px' }} onMouseDown={(e) => { e.preventDefault(); store.toggleItalic(); }}><Italic size={16} /></button>
          <button className={`format-btn ${store.isUnderline ? 'active' : ''}`} style={{ padding: '4px' }} onMouseDown={(e) => { e.preventDefault(); store.toggleUnderline(); }}><Underline size={16} /></button>
          
          <div style={{ width: '1px', background: 'var(--panel-border)' }}></div>
          
          <div className="color-picker" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#1e293b'].map(c => (
              <div key={c} className={`color-circle ${store.color === c ? 'active' : ''}`} style={{ backgroundColor: c, width: '24px', height: '24px', flexShrink: 0 }} onMouseDown={(e) => { e.preventDefault(); store.setColor(c); }} />
            ))}
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative', width: '24px', height: '24px', paddingLeft: '4px' }} title="Custom Color">
              <Palette size={20} color={store.color} />
              <input type="color" value={store.color} onChange={(e) => { store.setColor(e.target.value); setTimeout(() => document.getElementById('active-textarea')?.focus(), 0); }} style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
            </label>
          </div>
        </div>
      )}

      {editingText && (
        <textarea
          id="active-textarea"
          autoFocus
          className="text-overlay-input"
          value={editingText.text}
          onChange={(e) => setEditingText({ ...editingText, text: e.target.value })}
          onBlur={(e) => {
            if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.active-text-popover')) {
              return;
            }
            commitEditingText();
          }}
          style={{
            position: 'absolute',
            top: editingText.y * scale + position.y,
            left: editingText.x * scale + position.x,
            fontFamily: elements.find(el => el.id === editingText.id)?.fontFamily || 'Comic Sans MS',
            fontSize: (elements.find(el => el.id === editingText.id)?.fontSize || store.fontSize) * scale,
            fontWeight: elements.find(el => el.id === editingText.id)?.isBold ? 'bold' : (store.isBold ? 'bold' : 'normal'),
            fontStyle: elements.find(el => el.id === editingText.id)?.isItalic ? 'italic' : (store.isItalic ? 'italic' : 'normal'),
            textDecoration: elements.find(el => el.id === editingText.id)?.isUnderline ? 'underline' : (store.isUnderline ? 'underline' : 'none'),
            color: elements.find(el => el.id === editingText.id)?.color || store.color,
            background: 'transparent',
            border: (elements.find(el => el.id === editingText.id)?.type === 'sticky_note' ? 'none' : '2px dashed var(--primary-color)'),
            outline: 'none',
            padding: '4px',
            margin: 0,
            overflow: 'hidden',
            minHeight: (elements.find(el => el.id === editingText.id)?.type === 'sticky_note' ? 150 : store.fontSize) * scale,
            width: (elements.find(el => el.id === editingText.id)?.type === 'sticky_note' ? 180 : (elements.find(el => el.id === editingText.id)?.width || 300)) * scale,
            textAlign: (elements.find(el => el.id === editingText.id)?.type === 'sticky_note' ? 'center' : 'left'),
            whiteSpace: 'pre-wrap',
            zIndex: 100,
            transformOrigin: 'top left'
          }}
        />
      )}

      {elements.filter(el => el.type === 'video').map(el => (
        <VideoPlayerOverlay 
          key={`overlay-${el.id}`} 
          el={el} 
          scale={scale} 
          stagePos={position} 
          selectedIds={selectedIds}
          videoElement={videoElements[el.id]}
          onUpdate={(updates) => store.updateElement(el.id, updates)} 
        />
      ))}

      {elements.filter(el => el.type === 'graphing_calc').map(el => (
        <GraphingCalculatorOverlay 
          key={`overlay-${el.id}`} 
          el={el} 
          scale={scale} 
          stagePos={position} 
          selectedIds={selectedIds}
        />
      ))}

      {elements.filter(el => el.type === 'scientific_calc').map(el => (
        <ScientificCalculatorOverlay 
          key={`overlay-${el.id}`} 
          el={el} 
          scale={scale} 
          stagePos={position} 
          selectedIds={selectedIds}
        />
      ))}

      {/* PDF Sidebar */}
      {isLoading && (
        <div style={{
          position: 'fixed', inset: 0, background: store.isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px'
        }}>
          <div className="loader" style={{ 
            width: '40px', height: '40px', border: '4px solid ' + (store.isDarkMode ? '#1e293b' : '#f3f3f3'), borderTop: '4px solid #6366f1', 
            borderRadius: '50%', animation: 'spin 2s linear infinite' 
          }}></div>
          <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '18px' }}>Processing PDF...</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>This may take a moment for large files.</div>
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}

      {store.isPdfMode && showPdfSidebar && (
        <div className="glass-panel pdf-sidebar" style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '200px', 
          height: '100vh', 
          zIndex: 90, 
          borderRadius: 0,
          borderRight: '1px solid var(--panel-border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 10px',
          background: store.isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          animation: 'slideInLeft 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Document</div>
            <button 
              className="tool-btn" 
              onClick={() => setShowPdfSidebar(false)}
              style={{ padding: '4px 8px', width: 'auto', height: '28px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 'bold' }}
              title="Hide Sidebar"
            >
              <ChevronLeft size={14} />
              <span>Collapse</span>
            </button>
          </div>
          <div className="pdf-thumbs" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            {store.pages.map((page, index) => {
                const pdfImg = page.elements.find(el => el.isDocument && el.type === 'image')?.src;
                const isActive = store.currentPageIndex === index;
                return (
                  <div 
                    key={index} 
                    className={`pdf-thumb-wrapper ${isActive ? 'active' : ''}`}
                    style={{ marginBottom: '12px' }}
                  >
                    <div 
                      className="pdf-thumb"
                      onClick={() => {
                        store.setPageIndex(index);
                        setPosition({ x: 0, y: 0 });
                        setScale(1);
                      }}
                    >
                      {pdfImg && <img src={pdfImg} alt={`Page ${index + 1}`} />}
                      <div className="pdf-page-num">{index + 1}</div>
                    </div>
                    
                    <div className="pdf-thumb-actions">
                      <button 
                        className="thumb-action-btn" 
                        onClick={(e) => { e.stopPropagation(); store.addPage(index + 1); }}
                        title="Insert Page After"
                      >
                        <Plus size={14} />
                      </button>
                      <button 
                        className="thumb-action-btn danger" 
                        onClick={(e) => { e.stopPropagation(); if(confirm("Delete this page?")) store.deletePage(index); }}
                        title="Delete Page"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
            })}
          </div>
        </div>
      )}

      {store.isPdfMode && !showPdfSidebar && (
        <button 
          className="glass-panel" 
          onClick={() => setShowPdfSidebar(true)}
          style={{ 
            position: 'fixed', 
            top: '50%', 
            left: 0, 
            transform: 'translateY(-50%)',
            zIndex: 100,
            padding: '16px 6px',
            borderRadius: '0 12px 12px 0',
            border: '1px solid var(--panel-border)',
            borderLeft: 'none',
            background: store.isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            cursor: 'pointer',
            boxShadow: '4px 0 15px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          title="Show Pages Sidebar"
        >
          <ChevronRight size={20} color="var(--primary-color)" />
          <span style={{ 
            writingMode: 'vertical-rl', 
            fontSize: '12px', 
            fontWeight: '600', 
            color: 'var(--text-secondary)',
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>Pages</span>
        </button>
      )}

      <div className="glass-panel left-sidebar" style={{ left: shiftUiLeftEdge, transition: 'left 0.3s' }}>
        <button className={`tool-btn ${store.tool === 'select' ? 'active' : ''}`} onClick={() => handleToolClick('select')} data-tooltip="Lasso Select">
          <MousePointer2 size={24} />
        </button>
        <button className={`tool-btn ${store.tool === 'text' ? 'active' : ''}`} onClick={() => handleToolClick('text')} data-tooltip="Text Box">
          <Type size={24} />
        </button>
        <button className={`tool-btn ${VECTOR_SHAPES.includes(store.tool) ? 'active' : ''}`} onClick={() => handleToolClick(VECTOR_SHAPES.includes(store.tool) ? store.tool : 'rectangle')} data-tooltip="Shapes">
          <Shapes size={24} />
        </button>
        <button 
          className={`tool-btn ${store.tool === 'pen' ? 'active' : ''}`} 
          onClick={() => handleToolClick('pen')} 
          onDoubleClick={() => { store.setTool(null); setShowPenProps(false); }}
          data-tooltip="Pen"
        >
          <Pen size={24} />
        </button>
        <button 
          className={`tool-btn ${store.tool === 'eraser' ? 'active' : ''}`} 
          onClick={() => handleToolClick('eraser')} 
          onDoubleClick={() => { store.setTool(null); setShowEraserProps(false); }}
          data-tooltip="Eraser"
        >
          <Eraser size={24} />
        </button>

        {showEraserProps && (
          <div className="glass-panel properties-popover" style={{ width: '200px', gap: '12px', padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button 
                className={`tool-btn ${store.tool === 'eraser' ? 'active' : ''}`} 
                onClick={() => store.setTool('eraser')} 
                style={{ width: '100%', height: '60px', borderRadius: '8px', flexDirection: 'column', fontSize: '10px', gap: '4px' }}
                title="Standard Eraser"
              >
                <Eraser size={24} />
                <span>Eraser</span>
              </button>
              <button 
                className="tool-btn danger" 
                onClick={() => { store.clear(); setShowEraserProps(false); }} 
                style={{ width: '100%', height: '60px', borderRadius: '8px', flexDirection: 'column', fontSize: '10px', gap: '4px' }}
                title="Erase Whole Page"
              >
                <Trash2 size={24} />
                <span>Clear All</span>
              </button>
            </div>
            
            <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', textAlign: 'center' }}>Thickness of eraser</div>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px' }}>
                <input 
                  type="range" 
                  min="4" 
                  max="100" 
                  value={store.strokeWidth} 
                  onChange={(e) => store.setStrokeWidth(Number(e.target.value))} 
                  style={{ width: '100%' }} 
                />
              </div>
            </div>
          </div>
        )}
        <button 
          className={`tool-btn ${store.tool === 'insert' ? 'active' : ''}`} 
          onClick={() => handleToolClick('insert')} 
          data-tooltip="Insert"
        >
          <ImagePlus size={24} />
        </button>

        {showInsertProps && (
          <div className="glass-panel properties-popover" style={{ width: '280px', gap: '16px', padding: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px' }}>Insert</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <button className="tool-btn" onClick={() => document.getElementById('image-upload').click()} style={{ width: '100%', height: '70px', flexDirection: 'column', gap: '4px', fontSize: '10px', border: '1px solid var(--panel-border)', borderRadius: '8px' }}>
                <ImagePlus size={24} style={{ color: '#6366f1' }} />
                <span>IMAGE</span>
              </button>
              <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '4px' }}>
                <button className="tool-btn" onClick={() => document.getElementById('video-upload').click()} style={{ width: '100%', height: '33px', gap: '4px', fontSize: '10px', border: '1px solid var(--panel-border)', borderRadius: '6px' }} title="Upload Local Video">
                  <Video size={16} style={{ color: '#f59e0b' }} />
                  <span>Local Video</span>
                </button>
                <button className="tool-btn" onClick={() => setShowVideoURLModal(!showVideoURLModal)} style={{ width: '100%', height: '33px', gap: '4px', fontSize: '10px', border: '1px solid var(--panel-border)', borderRadius: '6px' }} title="Embed Video URL">
                  <Link size={16} style={{ color: '#f59e0b' }} />
                  <span>Video URL</span>
                </button>
              </div>
              {showVideoURLModal && (
                <div style={{ position: 'absolute', top: '100%', left: '0', background: 'var(--panel-bg)', padding: '8px', borderRadius: '8px', border: '1px solid var(--panel-border)', marginTop: '8px', display: 'flex', gap: '8px', width: '250px', zIndex: 10 }}>
                  <input 
                    type="text" 
                    placeholder="Enter Video URL..." 
                    value={videoURLInput}
                    onChange={(e) => setVideoURLInput(e.target.value)}
                    style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--panel-border)', fontSize: '11px', outline: 'none' }}
                  />
                  <button 
                    className="tool-btn" 
                    onClick={() => handleVideoURL(videoURLInput)}
                    style={{ padding: '6px', borderRadius: '6px', background: 'var(--primary-color)', color: 'white' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
              <button className="tool-btn" onClick={() => document.getElementById('audio-upload').click()} style={{ width: '100%', height: '70px', flexDirection: 'column', gap: '4px', fontSize: '10px', border: '1px solid var(--panel-border)', borderRadius: '8px' }}>
                <Volume2 size={24} style={{ color: '#10b981' }} />
                <span>AUDIO</span>
              </button>
              <button className="tool-btn" onClick={() => setActiveInsertSubmenu('emoji')} style={{ width: '100%', height: '70px', flexDirection: 'column', gap: '4px', fontSize: '10px', border: '1px solid var(--panel-border)', borderRadius: '8px' }}>
                <Smile size={24} style={{ color: '#ef4444' }} />
                <span>EMOJI</span>
              </button>
              <button className="tool-btn" onClick={() => setActiveInsertSubmenu('clipart')} style={{ width: '100%', height: '70px', flexDirection: 'column', gap: '4px', fontSize: '10px', border: '1px solid var(--panel-border)', borderRadius: '8px' }}>
                <Box size={24} style={{ color: '#3b82f6' }} />
                <span>CLIP ART</span>
              </button>
              <button className="tool-btn" onClick={() => {}} style={{ width: '100%', height: '70px', flexDirection: 'column', gap: '4px', fontSize: '10px', border: '1px solid var(--panel-border)', borderRadius: '8px' }}>
                <Ruler size={24} style={{ color: '#8b5cf6' }} />
                <span>Instruments</span>
              </button>
              <button className="tool-btn" onClick={() => setActiveInsertSubmenu('background')} style={{ width: '100%', height: '70px', flexDirection: 'column', gap: '4px', fontSize: '10px', border: '1px solid var(--panel-border)', borderRadius: '8px' }}>
                <Grid size={24} style={{ color: '#06b6d4' }} />
                <span>Background</span>
              </button>
              <button className="tool-btn" onClick={() => {}} style={{ width: '100%', height: '70px', flexDirection: 'column', gap: '4px', fontSize: '10px', border: '1px solid var(--panel-border)', borderRadius: '8px', opacity: 0.6 }}>
                <Sparkles size={24} style={{ color: '#ec4899' }} />
                <span>Gen AI</span>
              </button>
              <button className="tool-btn" onClick={() => insertGraphingCalculator()} style={{ width: '100%', height: '70px', flexDirection: 'column', gap: '4px', fontSize: '10px', border: '1px solid var(--panel-border)', borderRadius: '8px' }}>
                <LineChart size={24} style={{ color: '#14b8a6' }} />
                <span>Graph Calc</span>
              </button>
              <button className="tool-btn" onClick={() => insertScientificCalculator()} style={{ width: '100%', height: '70px', flexDirection: 'column', gap: '4px', fontSize: '10px', border: '1px solid var(--panel-border)', borderRadius: '8px' }}>
                <Calculator size={24} style={{ color: '#f59e0b' }} />
                <span>Sci Calc</span>
              </button>
            </div>

            <input type="file" id="image-upload" hidden accept="image/*" onChange={handleImageUpload} />
            <input type="file" id="video-upload" hidden accept="video/*" onChange={handleVideoUpload} />
            <input type="file" id="audio-upload" hidden accept="audio/*" onChange={handleAudioUpload} />

            {activeInsertSubmenu === 'emoji' && (
              <div className="glass-panel" style={{ position: 'absolute', left: '100%', top: 0, marginLeft: '12px', width: '250px', padding: '12px', zIndex: 100 }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-secondary)' }}>Emojis (Drag to insert)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                  {EXTENDED_EMOJIS.map(emoji => (
                    <div key={emoji} onClick={() => insertEmoji(emoji)} style={{ fontSize: '24px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.1s', border: activeEmoji === emoji ? '1px solid #6366f1' : 'none', borderRadius: '4px' }} onMouseDown={(e) => e.target.style.transform = 'scale(1.2)'} onMouseUp={(e) => e.target.style.transform = 'scale(1)'}>{emoji}</div>
                  ))}
                </div>
              </div>
            )}

            {activeInsertSubmenu === 'clipart' && (
              <div className="glass-panel" style={{ position: 'absolute', left: '100%', top: 0, marginLeft: '12px', width: '250px', padding: '12px', zIndex: 100 }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-secondary)' }}>Clip Art (Drag to insert)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                   {Object.entries(CLIPART_PATHS).map(([name, path]) => (
                     <button key={name} className={`tool-btn ${activeClipartData === path ? 'active' : ''}`} onClick={() => insertClipart(path)} style={{ width: '100%', height: '50px', border: '1px solid var(--panel-border)', borderRadius: '6px' }} title={name}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={store.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <path d={path} />
                        </svg>
                     </button>
                   ))}
                </div>
              </div>
            )}


          </div>
        )}
        <button className="tool-btn" data-tooltip="Open Document" onClick={() => document.getElementById('document-upload').click()}>
          <FileUp size={24} />
        </button>
        <input type="file" id="document-upload" hidden accept="application/pdf, text/plain" onChange={handleDocumentUpload} />

        {showPenProps && (
          <div className="glass-panel properties-popover" style={{ width: '280px', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button className={`tool-btn ${store.penType === 'pen' ? 'active' : ''}`} onClick={() => store.setPenType('pen')} style={{ width: '100%', height: '40px', borderRadius: '6px' }} title="Pen"><Pen size={20} /></button>
              <button className={`tool-btn ${store.penType === 'highlighter' ? 'active' : ''}`} onClick={() => store.setPenType('highlighter')} style={{ width: '100%', height: '40px', borderRadius: '6px' }} title="Highlighter"><Highlighter size={20} /></button>
              <button className={`tool-btn ${store.penType === 'brush' ? 'active' : ''}`} onClick={() => store.setPenType('brush')} style={{ width: '100%', height: '40px', borderRadius: '6px' }} title="Brush"><Paintbrush size={20} /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
              <button className={`tool-btn ${store.penType === 'bucket' ? 'active' : ''}`} onClick={() => store.setPenType('bucket')} style={{ width: '100%', height: '40px', borderRadius: '6px' }} title="Thick Block Fill"><PaintBucket size={20} /></button>
              <button className={`tool-btn ${store.penType === 'spray' ? 'active' : ''}`} onClick={() => store.setPenType('spray')} style={{ width: '100%', height: '40px', borderRadius: '6px' }} title="Airbrush"><Sparkles size={20} /></button>
              <button className={`tool-btn ${store.penType === 'chisel' ? 'active' : ''}`} onClick={() => store.setPenType('chisel')} style={{ width: '100%', height: '40px', borderRadius: '6px' }} title="Chisel Tip"><PenTool size={20} /></button>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Basic Colors</div>
            <div className="color-picker" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '8px' }}>
              {['#ef4444', '#f59e0b', '#10b981', '#ffffff', '#3b82f6', '#8b5cf6', '#1e293b', '#a8a29e'].map(c => (
                <div key={c} className={`color-circle ${store.color === c ? 'active' : ''}`} style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #cbd5e1' : '2px solid transparent', width: '40px', height: '40px', margin: '0 auto' }} onClick={() => store.setColor(c)} title={c} />
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--panel-border)' }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative', width: '24px', height: '24px' }} title="Custom Color">
                <Palette size={20} color={store.color} />
                <input type="color" value={store.color} onChange={(e) => store.setColor(e.target.value)} style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
              </label>
              
              <div style={{ width: '24px', height: '24px', backgroundColor: store.color, borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} title="Selected Color"></div>
              
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 8px' }} title="Thickness">
                <input type="range" min="2" max="64" value={store.strokeWidth} onChange={(e) => store.setStrokeWidth(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        )}

        {showShapesProps && (
          <div className="glass-panel shapes-popover" style={{ display: 'flex', flexDirection: 'column', padding: '16px', gap: '16px', width: '320px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              <button className={`tool-btn ${store.tool === 'rectangle' ? 'active' : ''}`} onClick={() => store.setTool('rectangle')} title="Rectangle"><Square size={24} /></button>
              <button className={`tool-btn ${store.tool === 'circle' ? 'active' : ''}`} onClick={() => store.setTool('circle')} title="Ellipse"><CircleIcon size={24} /></button>
              <button className={`tool-btn ${store.tool === 'line' ? 'active' : ''}`} onClick={() => store.setTool('line')} title="Line"><Minus size={24} /></button>
              <button className={`tool-btn ${store.tool === 'arrow' ? 'active' : ''}`} onClick={() => store.setTool('arrow')} title="Arrow"><ArrowUpRight size={24} /></button>
              <button className={`tool-btn ${store.tool === 'triangle' ? 'active' : ''}`} onClick={() => store.setTool('triangle')} title="Triangle"><Triangle size={24} /></button>
              <button className={`tool-btn ${store.tool === 'diamond' ? 'active' : ''}`} onClick={() => store.setTool('diamond')} title="Diamond"><Diamond size={24} /></button>
              <button className={`tool-btn ${store.tool === 'hexagon' ? 'active' : ''}`} onClick={() => store.setTool('hexagon')} title="Hexagon"><Hexagon size={24} /></button>
              <button className={`tool-btn ${store.tool === 'star' ? 'active' : ''}`} onClick={() => store.setTool('star')} title="Star"><StarIcon size={24} /></button>
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Shape Color</div>
                <div className="color-picker" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#1e293b'].map(c => (
                    <div key={c} className={`color-circle ${store.color === c ? 'active' : ''}`} style={{ backgroundColor: c }} onClick={() => store.setColor(c)} title={c} />
                  ))}
                </div>
              </div>
              
              <div style={{ flex: 1, borderLeft: '1px solid var(--panel-border)', paddingLeft: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>More Shapes</div>
                <div style={{ height: '70px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--panel-border)', borderRadius: '6px', overflowY: 'auto', overflowX: 'hidden', padding: '6px 4px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                  <button className={`tool-btn ${store.tool === 'pentagon' ? 'active' : ''}`} onClick={() => store.setTool('pentagon')} title="Pentagon" style={{ padding: 0, minWidth: '28px', height: '28px', margin: '0 auto' }}><Pentagon size={20} /></button>
                  <button className={`tool-btn ${store.tool === 'octagon' ? 'active' : ''}`} onClick={() => store.setTool('octagon')} title="Octagon" style={{ padding: 0, minWidth: '28px', height: '28px', margin: '0 auto' }}><Octagon size={20} /></button>
                  <button className={`tool-btn ${store.tool === 'star4' ? 'active' : ''}`} onClick={() => store.setTool('star4')} title="4-Point Star" style={{ padding: 0, minWidth: '28px', height: '28px', margin: '0 auto' }}><StarIcon size={20} /></button>
                  <button className={`tool-btn ${store.tool === 'star6' ? 'active' : ''}`} onClick={() => store.setTool('star6')} title="6-Point Star" style={{ padding: 0, minWidth: '28px', height: '28px', margin: '0 auto' }}><StarIcon size={20} /></button>
                  <button className={`tool-btn ${store.tool === 'right-triangle' ? 'active' : ''}`} onClick={() => store.setTool('right-triangle')} title="Right Triangle" style={{ padding: 0, minWidth: '28px', height: '28px', margin: '0 auto' }}><Play size={20} /></button>
                  <button className={`tool-btn ${store.tool === 'cross' ? 'active' : ''}`} onClick={() => store.setTool('cross')} title="Cross" style={{ padding: 0, minWidth: '28px', height: '28px', margin: '0 auto' }}><Plus size={20} /></button>
                  <button className={`tool-btn ${store.tool === 'heart' ? 'active' : ''}`} onClick={() => store.setTool('heart')} title="Heart" style={{ padding: 0, minWidth: '28px', height: '28px', margin: '0 auto' }}><Heart size={20} /></button>
                  <button className={`tool-btn ${store.tool === 'cloud' ? 'active' : ''}`} onClick={() => store.setTool('cloud')} title="Cloud" style={{ padding: 0, minWidth: '28px', height: '28px', margin: '0 auto' }}><Cloud size={20} /></button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--panel-border)' }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative' }} title="Custom Color">
                <Palette size={20} color={store.color} />
                <input type="color" value={store.color} onChange={(e) => store.setColor(e.target.value)} style={{ width: 0, height: 0, opacity: 0, position: 'absolute' }} />
              </label>
              
              <div style={{ width: '24px', height: '24px', backgroundColor: store.color, borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} title="Selected Color"></div>
              
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 8px' }} title="Thickness">
                <input type="range" min="2" max="32" value={store.strokeWidth} onChange={(e) => store.setStrokeWidth(Number(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.05)', padding: '4px', borderRadius: '6px' }} title="Line Style">
                <div onClick={() => store.setDash([])} style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: store.dash.length === 0 ? 'white' : 'transparent', borderRadius: '4px', cursor: 'pointer' }}>
                  <div style={{ width: '16px', height: '2px', background: '#000' }}></div>
                </div>
                <div onClick={() => store.setDash([10, 8])} style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: store.dash.length > 0 && store.dash[0] === 10 ? 'white' : 'transparent', borderRadius: '4px', cursor: 'pointer' }}>
                  <div style={{ width: '16px', borderTop: '2px dashed #000' }}></div>
                </div>
                <div onClick={() => store.setDash([2, 5])} style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: store.dash.length > 0 && store.dash[0] === 2 ? 'white' : 'transparent', borderRadius: '4px', cursor: 'pointer' }}>
                  <div style={{ width: '16px', borderTop: '2px dotted #000' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="glass-panel bottom-left-panel" style={{ left: shiftUiLeftEdge, transition: 'left 0.3s', bottom: '20px' }}>
        <button className="tool-btn" onClick={store.undo} title="Undo">
          <Undo size={24} color={store.isDarkMode ? "#f1f5f9" : "#64748b"} />
        </button>
        <button className="tool-btn" onClick={store.redo} title="Redo">
          <Redo size={24} color={store.isDarkMode ? "#f1f5f9" : "#64748b"} />
        </button>
        <div style={{ width: '1px', background: 'var(--panel-border)', margin: '0 4px', height: '24px' }}></div>
        <button className="tool-btn" onClick={() => { store.addPage(); setPosition({x:0, y:0}); }} title="New Blank Page">
          <Plus size={24} color={store.isDarkMode ? "#f1f5f9" : "#64748b"} />
        </button>
        {store.isPdfMode && (
          <>
            <button className="tool-btn" onClick={handleDuplicatePage} title="Duplicate Current Page">
              <Files size={24} />
            </button>
            <button className="tool-btn danger" onClick={handleDeletePage} title="Delete Current Page">
              <Trash2 size={24} />
            </button>
          </>
        )}
      </div>

      <div className="glass-panel" style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        zIndex: 100,
        borderRadius: '12px',
        border: '2px solid #e2e8f0',
        transition: 'all 0.3s'
      }}>
        {store.isPdfMode && (
          <button 
            className="tool-btn" 
            style={{ padding: '4px' }}
            disabled={store.currentPageIndex === 0}
            onClick={() => { store.setPageIndex(store.currentPageIndex - 1); setPosition({x:0,y:0}); }}
          >
            <ChevronLeft size={20} />
          </button>
        )}
        
        <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', minWidth: '160px', textAlign: 'center' }}>
          {workspaceName} <span style={{ color: 'var(--text-secondary)', margin: '0 6px' }}>|</span> Page {store.currentPageIndex + 1} / {store.pages ? store.pages.length : 1}
        </div>

        {store.isPdfMode && (
          <button 
            className="tool-btn" 
            style={{ padding: '4px' }}
            disabled={store.currentPageIndex === store.pages.length - 1}
            onClick={() => { store.setPageIndex(store.currentPageIndex + 1); setPosition({x:0,y:0}); }}
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      <div className="glass-panel bottom-right-panel">
        <button className="tool-btn danger" onClick={store.clear} title="Clear Page">
          <Trash2 size={24} />
        </button>
      </div>

      {menuPos && selectedIds.length > 0 && (
        <div className="context-menu" style={{ left: menuPos.x, top: menuPos.y }}>
          <button className="context-btn" onClick={handleCut} title="Cut (Ctrl+X)"><Scissors size={18} /></button>
          <button className="context-btn" onClick={handleCopy} title="Copy (Ctrl+C)"><Copy size={18} /></button>
          <button className="context-btn" onClick={handlePaste} title="Paste (Ctrl+V)"><ClipboardPaste size={18} /></button>
          <button className="context-btn" onClick={handleDuplicate} title="Duplicate (Ctrl+D)"><Files size={18} /></button>
          <button className="context-btn" onClick={handleDelete} title="Delete (Del)" style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
        </div>
      )}

      {textMenuPos && selectedTextEl && store.tool === 'select' && (
        <div className="glass-panel text-popover" style={{ position: 'absolute', left: textMenuPos.x, top: textMenuPos.y - 10, transform: 'translate(-50%, -100%)', flexDirection: 'row', minWidth: 'auto', gap: '8px', padding: '8px', zIndex: 20 }}>
          <select 
            className="font-select" 
            value={selectedTextEl.fontFamily || store.fontFamily} 
            onChange={(e) => handleUpdateSelectedText({ fontFamily: e.target.value })}
            style={{ padding: '4px 8px', margin: 0 }}
          >
            <option value="Arial">Arial</option>
            <option value="'Inter', sans-serif">Inter</option>
            <option value="'Times New Roman', serif">Times New Roman</option>
            <option value="Comic Sans MS">Comic Sans</option>
            <option value="'Courier New', monospace">Courier</option>
            <option value="'Playfair Display', serif">Playfair</option>
          </select>
          <input 
            type="number" 
            style={{ width: '60px', padding: '4px', borderRadius: '6px', border: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0.7)', outline: 'none' }} 
            value={selectedTextEl.fontSize || store.fontSize} 
            onChange={(e) => handleUpdateSelectedText({ fontSize: Number(e.target.value) })}
            min="8" max="144"
          />
          <button className={`format-btn ${selectedTextEl.isBold ? 'active' : ''}`} style={{ padding: '4px' }} onClick={() => handleUpdateSelectedText({ isBold: !selectedTextEl.isBold })}><Bold size={16} /></button>
          <button className={`format-btn ${selectedTextEl.isItalic ? 'active' : ''}`} style={{ padding: '4px' }} onClick={() => handleUpdateSelectedText({ isItalic: !selectedTextEl.isItalic })}><Italic size={16} /></button>
          <button className={`format-btn ${selectedTextEl.isUnderline ? 'active' : ''}`} style={{ padding: '4px' }} onClick={() => handleUpdateSelectedText({ isUnderline: !selectedTextEl.isUnderline })}><Underline size={16} /></button>
          
          <div style={{ width: '1px', background: 'var(--panel-border)' }}></div>
          
          <div className="color-picker" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#1e293b'].map(c => (
              <div key={c} className={`color-circle ${selectedTextEl.color === c ? 'active' : ''}`} style={{ backgroundColor: c, width: '24px', height: '24px', flexShrink: 0, border: store.isDarkMode ? '1px solid #334155' : '1px solid transparent' }} onClick={() => handleUpdateSelectedText({ color: c })} />
            ))}
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative', width: '24px', height: '24px', paddingLeft: '4px' }} title="Custom Color">
              <Palette size={20} color={selectedTextEl.color || store.color} />
              <input type="color" value={selectedTextEl.color || store.color} onChange={(e) => handleUpdateSelectedText({ color: e.target.value })} style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
            </label>
          </div>
        </div>
      )}

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        ref={stageRef}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable={store.tool === null && !editingText}
        onDragEnd={(e) => {
          if (e.target === e.target.getStage()) {
            setPosition({ x: e.target.x(), y: e.target.y() });
          }
        }}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onClick={(e) => {
          if (editingText) {
            commitEditingText();
            return;
          }
          const clickedOnEmpty = e.target === e.target.getStage() || e.target.getClassName() === 'Layer';
          if (store.tool === 'text' && clickedOnEmpty && !editingText) {
            const pos = getRelativePointerPosition(stageRef.current);
            setEditingText({
              id: "node_" + Date.now().toString(),
              x: pos.x,
              y: pos.y,
              originalX: pos.x,
              originalY: pos.y,
              text: ""
            });
            setSelectedIds([]);
            setShowTextProps(false);
          }
        }}
        onTap={(e) => {
          if (editingText) {
            commitEditingText();
            return;
          }
          const clickedOnEmpty = e.target === e.target.getStage() || e.target.getClassName() === 'Layer';
          if (store.tool === 'text' && clickedOnEmpty && !editingText) {
            const pos = getRelativePointerPosition(stageRef.current);
            setEditingText({
              id: "node_" + Date.now().toString(),
              x: pos.x,
              y: pos.y,
              originalX: pos.x,
              originalY: pos.y,
              text: ""
            });
            setSelectedIds([]);
            setShowTextProps(false);
          }
        }}
        onWheel={handleWheel}
        onTouchStart={(e) => { e.evt.preventDefault(); handleStageMouseDown(e); }}
        onTouchMove={handleStageMouseMove}
        onTouchEnd={handleStageMouseUp}
        style={{ cursor: (store.tool === 'pen' && store.penType === 'bucket') ? 'crosshair' : store.tool === 'eraser' ? 'crosshair' : store.tool === 'select' ? 'default' : (store.tool === null && !editingText) ? 'grab' : store.tool === 'text' ? 'text' : 'crosshair' }}
      >
        <Layer id="document-layer">
          {elements.filter(el => el.isDocument).map((el) => {
            const commonProps = shapeProps(el);
            if (el.type === 'image') return <URLImage key={el.id} el={el} commonProps={commonProps} />;
            if (el.type === 'text') {
              let fontStyle = 'normal';
              if (el.isBold && el.isItalic) fontStyle = 'italic bold';
              else if (el.isBold) fontStyle = 'bold';
              else if (el.isItalic) fontStyle = 'italic';
              if (editingText && editingText.id === el.id) return null;
              return (
                <KonvaText {...commonProps} key={el.id} x={el.isTransformed ? el.x : el.x} y={el.isTransformed ? el.y : el.y} text={el.text} fontSize={el.fontSize} fontFamily={el.fontFamily} fontStyle={fontStyle} textDecoration={el.isUnderline ? 'underline' : ''} fill={el.color} width={el.width} padding={4} />
              );
            }
            if (el.type === 'eraser_polygon') {
              return (
                <Line key={el.id} id={el.id} points={el.points} fill="#000" closed={true} tension={0} globalCompositeOperation="destination-out" listening={false} />
              );
            }
            return null;
          })}
          
          {selectedIds.length > 0 && (
            <Transformer
              ref={docTrRef}
              enabledAnchors={
                selectedTextEl
                  ? ['middle-left', 'middle-right']
                  : ['top-left', 'top-center', 'top-right', 'middle-right', 'bottom-right', 'bottom-center', 'bottom-left', 'middle-left']
              }
              boundBoxFunc={(oldBox, newBox) => {
                if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) return oldBox;
                return newBox;
              }}
            />
          )}
        </Layer>
        <Layer id="drawing-layer">
          {elements.filter(el => !el.isDocument).map((el, i) => ({ el, i })).sort((a,b) => {
            const aIsText = a.el.type === 'text' || a.el.type === 'sticky_note';
            const bIsText = b.el.type === 'text' || b.el.type === 'sticky_note';
            if (aIsText && !bIsText) return 1;
            if (!aIsText && bIsText) return -1;
            return a.i - b.i;
          }).map(({ el }) => {
            if (el.type === 'eraser_polygon') {
              return (
                <Line key={el.id} id={el.id} points={el.points} fill="#000" closed={true} tension={0} globalCompositeOperation="destination-out" listening={false} />
              );
            }

            const commonProps = shapeProps(el);
            
            if (el.type === 'image') {
              return <URLImage key={el.id} el={el} commonProps={commonProps} />;
            }
            
            if (el.type === 'emoji' || el.type === 'clipart') {
              const startX = el.points[0];
              const startY = el.points[1];
              const minX = Math.min(startX, el.endX || startX);
              const minY = Math.min(startY, el.endY || startY);
              const w = Math.max(startX, el.endX || startX) - minX;
              const h = Math.max(startY, el.endY || startY) - minY;
              const size = Math.max(w, h, 20); // enforce min size
              
              if (el.type === 'emoji') {
                return (
                  <KonvaText {...commonProps} key={el.id} x={el.isTransformed ? el.x : minX} y={el.isTransformed ? el.y : minY} text={el.emojiChar || '😀'} fontSize={size} fontFamily="Arial" fill={el.color} width={size * 1.5} height={size * 1.5} rotation={el.rotation} scaleX={el.scaleX} scaleY={el.scaleY} />
                );
              } else {
                return (
                  <Path {...commonProps} key={el.id} x={el.isTransformed ? el.x : minX} y={el.isTransformed ? el.y : minY} data={el.clipartData} fill="transparent" stroke={el.color} strokeWidth={2} scaleX={(el.scaleX || 1) * (size / 24)} scaleY={(el.scaleY || 1) * (size / 24)} rotation={el.rotation} />
                );
              }
            }

            if (el.type === 'text') {
              let fontStyle = 'normal';
              if (el.isBold && el.isItalic) fontStyle = 'italic bold';
              else if (el.isBold) fontStyle = 'bold';
              else if (el.isItalic) fontStyle = 'italic';
              if (editingText && editingText.id === el.id) return null;
              return (
                <KonvaText {...commonProps} key={el.id} x={el.isTransformed ? el.x : el.x} y={el.isTransformed ? el.y : el.y} text={el.text} fontSize={el.fontSize} fontFamily={el.fontFamily} fontStyle={fontStyle} textDecoration={el.isUnderline ? 'underline' : ''} fill={el.color} width={el.width} padding={4} />
              );
            }
            if (el.type === 'pen' || el.type === 'eraser') {
              const isHighlighter = el.penType === 'highlighter';
              const isBrush = el.penType === 'brush';
              const isChisel = el.penType === 'chisel';
              const isSpray = el.penType === 'spray';
              const isBucket = el.penType === 'bucket';
              
              return (
                <Line 
                  {...commonProps} 
                  id={el.id}
                  key={el.id} 
                  x={el.x || 0} 
                  y={el.y || 0} 
                  points={el.points} 
                  stroke={el.color} 
                  strokeWidth={isBucket ? el.strokeWidth * 4 : el.strokeWidth} 
                  tension={isChisel || isHighlighter || isBucket ? 0 : 0.5} 
                  lineCap={isChisel || isHighlighter || isBucket ? 'square' : 'round'} 
                  lineJoin={isChisel || isHighlighter || isBucket ? 'miter' : 'round'} 
                  globalCompositeOperation={el.type === 'eraser' ? 'destination-out' : (isHighlighter ? 'multiply' : 'source-over')} 
                  opacity={isHighlighter ? 0.3 : (isSpray ? 0.6 : 1)}
                  shadowBlur={isBrush ? el.strokeWidth / 2 : (isSpray ? el.strokeWidth : 0)}
                  shadowColor={isBrush || isSpray ? el.color : null}
                  fill={el.fill}
                  closed={el.closed || (el.fill && el.fill !== 'transparent')}
                  hitStrokeWidth={Math.max(20, el.strokeWidth)} 
                />
              );
            }

            // MS PAINT SHAPES
            if (VECTOR_SHAPES.includes(el.type) && el.endX !== undefined) {
              const startX = el.points[0];
              const startY = el.points[1];
              const minX = Math.min(startX, el.endX);
              const minY = Math.min(startY, el.endY);
              const width = Math.abs(startX - el.endX);
              const height = Math.abs(startY - el.endY);
              const centerX = minX + width / 2;
              const centerY = minY + height / 2;

              if (el.type === 'rectangle') {
                return <Rect {...commonProps} key={el.id} x={el.isTransformed ? el.x : minX} y={el.isTransformed ? el.y : minY} width={width} height={height} stroke={el.color} strokeWidth={el.strokeWidth} cornerRadius={4} fill={el.fill} />;
              }
              if (el.type === 'circle') {
                return <Ellipse {...commonProps} key={el.id} x={el.isTransformed ? el.x : centerX} y={el.isTransformed ? el.y : centerY} radiusX={width / 2} radiusY={height / 2} stroke={el.color} strokeWidth={el.strokeWidth} fill={el.fill} />;
              }
              if (el.type === 'line') {
                return <Line {...commonProps} key={el.id} x={el.x || 0} y={el.y || 0} points={el.isTransformed ? [0, 0, el.endX - startX, el.endY - startY] : [startX, startY, el.endX, el.endY]} stroke={el.color} strokeWidth={el.strokeWidth} fill={el.fill} />;
              }
              if (el.type === 'arrow') {
                return <Arrow {...commonProps} key={el.id} x={el.x || 0} y={el.y || 0} points={el.isTransformed ? [0, 0, el.endX - startX, el.endY - startY] : [startX, startY, el.endX, el.endY]} pointerLength={20} pointerWidth={20} stroke={el.color} fill={el.fill !== 'transparent' ? el.fill : el.color} strokeWidth={el.strokeWidth} />;
              }
              if (el.type === 'triangle') {
                return <RegularPolygon {...commonProps} key={el.id} x={el.isTransformed ? el.x : centerX} y={el.isTransformed ? el.y : centerY + height / 6} sides={3} radius={Math.max(width, height) / 2} scaleX={width / Math.max(width, height)} scaleY={height / Math.max(width, height)} stroke={el.color} strokeWidth={el.strokeWidth} fill={el.fill} />;
              }
              if (el.type === 'diamond') {
                return <RegularPolygon {...commonProps} key={el.id} x={el.isTransformed ? el.x : centerX} y={el.isTransformed ? el.y : centerY} sides={4} radius={Math.max(width, height) / 2} scaleX={width / Math.max(width, height)} scaleY={height / Math.max(width, height)} stroke={el.color} strokeWidth={el.strokeWidth} fill={el.fill} />;
              }
              if (el.type === 'hexagon') {
                return <RegularPolygon {...commonProps} key={el.id} x={el.isTransformed ? el.x : centerX} y={el.isTransformed ? el.y : centerY} sides={6} radius={Math.max(width, height) / 2} scaleX={width / Math.max(width, height)} scaleY={height / Math.max(width, height)} stroke={el.color} strokeWidth={el.strokeWidth} fill={el.fill} />;
              }
              if (el.type === 'star') {
                const r = Math.max(width, height) / 2;
                return <Star {...commonProps} key={el.id} x={el.isTransformed ? el.x : centerX} y={el.isTransformed ? el.y : centerY} numPoints={5} innerRadius={r * 0.4} outerRadius={r} scaleX={width / Math.max(width, height)} scaleY={height / Math.max(width, height)} stroke={el.color} strokeWidth={el.strokeWidth} fill={el.fill} />;
              }
              if (el.type === 'pentagon') {
                return <RegularPolygon {...commonProps} key={el.id} x={el.isTransformed ? el.x : centerX} y={el.isTransformed ? el.y : centerY} sides={5} radius={Math.max(width, height) / 2} scaleX={width / Math.max(width, height)} scaleY={height / Math.max(width, height)} stroke={el.color} strokeWidth={el.strokeWidth} fill={el.fill} />;
              }
              if (el.type === 'octagon') {
                return <RegularPolygon {...commonProps} key={el.id} x={el.isTransformed ? el.x : centerX} y={el.isTransformed ? el.y : centerY} sides={8} radius={Math.max(width, height) / 2} scaleX={width / Math.max(width, height)} scaleY={height / Math.max(width, height)} stroke={el.color} strokeWidth={el.strokeWidth} fill={el.fill} />;
              }
              if (el.type === 'star4') {
                const r = Math.max(width, height) / 2;
                return <Star {...commonProps} key={el.id} x={el.isTransformed ? el.x : centerX} y={el.isTransformed ? el.y : centerY} numPoints={4} innerRadius={r * 0.4} outerRadius={r} scaleX={width / Math.max(width, height)} scaleY={height / Math.max(width, height)} stroke={el.color} strokeWidth={el.strokeWidth} fill={el.fill} />;
              }
              if (el.type === 'star6') {
                const r = Math.max(width, height) / 2;
                return <Star {...commonProps} key={el.id} x={el.isTransformed ? el.x : centerX} y={el.isTransformed ? el.y : centerY} numPoints={6} innerRadius={r * 0.5} outerRadius={r} scaleX={width / Math.max(width, height)} scaleY={height / Math.max(width, height)} stroke={el.color} strokeWidth={el.strokeWidth} fill={el.fill} />;
              }
              if (el.type === 'right-triangle') {
                 const pts = [startX, startY, startX, el.endY, el.endX, el.endY];
                 return <Line {...commonProps} key={el.id} x={el.x || 0} y={el.y || 0} points={pts} closed stroke={el.color} strokeWidth={el.strokeWidth} lineJoin="miter" fill={el.fill} />;
              }
              if (el.type === 'cross') {
                 const tX = width*0.2; const tY = height*0.2;
                 const pathData = `M ${-tX} ${-height/2} L ${tX} ${-height/2} L ${tX} ${-tY} L ${width/2} ${-tY} L ${width/2} ${tY} L ${tX} ${tY} L ${tX} ${height/2} L ${-tX} ${height/2} L ${-tX} ${tY} L ${-width/2} ${tY} L ${-width/2} ${-tY} L ${-tX} ${-tY} Z`;
                 return <Path {...commonProps} key={el.id} x={el.isTransformed ? el.x : centerX} y={el.isTransformed ? el.y : centerY} data={pathData} stroke={el.color} strokeWidth={el.strokeWidth} lineJoin="miter" fill={el.fill} />;
              }
              if (el.type === 'heart') {
                 const w = width; const h = height;
                 const data = `M 0 ${h*0.3} C 0 ${-h*0.1} ${w*0.5} ${-h*0.1} ${w*0.5} ${h*0.2} C ${w*0.5} ${-h*0.1} ${w} ${-h*0.1} ${w} ${h*0.3} C ${w} ${h*0.6} ${w*0.5} ${h*0.9} ${w*0.5} ${h} C ${w*0.5} ${h*0.9} 0 ${h*0.6} 0 ${h*0.3} Z`;
                 return <Path {...commonProps} key={el.id} x={el.isTransformed ? el.x : minX} y={el.isTransformed ? el.y : minY} data={data} stroke={el.color} strokeWidth={el.strokeWidth} fill={el.fill} />;
              }
              if (el.type === 'cloud') {
                 const w = width; const h = height;
                 const data = `M ${w*0.2} ${h*0.6} A ${w*0.2} ${h*0.2} 0 0 1 ${w*0.2} ${h*0.2} A ${w*0.3} ${h*0.3} 0 0 1 ${w*0.7} ${h*0.2} A ${w*0.25} ${h*0.25} 0 0 1 ${w*0.9} ${h*0.6} A ${w*0.2} ${h*0.2} 0 0 1 ${w*0.7} ${h*0.9} L ${w*0.3} ${h*0.9} A ${w*0.2} ${h*0.2} 0 0 1 ${w*0.2} ${h*0.6} Z`;
                 return <Path {...commonProps} key={el.id} x={el.isTransformed ? el.x : minX} y={el.isTransformed ? el.y : minY} data={data} stroke={el.color} strokeWidth={el.strokeWidth} fill={el.fill} />;
              }
            }

            if (el.type === 'sticky_note') {
              const startX = el.points ? el.points[0] : el.x;
              const startY = el.points ? el.points[1] : el.y;
              const minX = el.points ? Math.min(startX, el.endX || startX) : el.x;
              const minY = el.points ? Math.min(startY, el.endY || startY) : el.y;
              const w = el.points ? Math.max(startX, el.endX || startX) - minX : el.width;
              const h = el.points ? Math.max(startY, el.endY || startY) - minY : el.height;
              const sizeW = Math.max(w, 40);
              const sizeH = Math.max(h, 40);

              let fontStyle = 'normal';
              if (el.isBold && el.isItalic) fontStyle = 'italic bold';
              else if (el.isBold) fontStyle = 'bold';
              else if (el.isItalic) fontStyle = 'italic';

              return (
                <React.Fragment key={el.id}>
                  <Path 
                    {...commonProps} 
                    x={el.isTransformed ? el.x : minX} 
                    y={el.isTransformed ? el.y : minY} 
                    data="M 0 0 L 180 0 L 200 20 L 200 200 L 0 200 Z M 180 0 L 180 20 L 200 20"
                    fill={el.fill} 
                    stroke="rgba(0,0,0,0.1)" 
                    strokeWidth={1} 
                    scaleX={(el.scaleX || 1) * (sizeW / 200)}
                    scaleY={(el.scaleY || 1) * (sizeH / 200)}
                    shadowBlur={10} 
                    shadowColor="rgba(0,0,0,0.1)" 
                    onDblClick={() => setEditingText({
                      id: el.id,
                      text: el.text,
                      x: (el.isTransformed ? el.x : minX) + 10 * (el.scaleX || 1) * (sizeW/200),
                      y: (el.isTransformed ? el.y : minY) + 35 * (el.scaleY || 1) * (sizeH/200),
                      originalX: el.isTransformed ? el.x : minX,
                      originalY: el.isTransformed ? el.y : minY
                    })}
                  />
                  {(!editingText || editingText.id !== el.id) && (
                    <KonvaText 
                      {...commonProps} 
                      x={(el.isTransformed ? el.x : minX) + 10 * (el.scaleX || 1) * (sizeW/200)} 
                      y={(el.isTransformed ? el.y : minY) + 35 * (el.scaleY || 1) * (sizeH/200)} 
                      text={el.text} 
                      fontSize={(el.fontSize || 24) * Math.min(el.scaleX || 1, el.scaleY || 1) * (sizeH/200)} 
                      fontFamily={el.fontFamily || "Arial"} 
                      fontStyle={fontStyle}
                      textDecoration={el.isUnderline ? 'underline' : ''}
                      fill={el.color || "#333"} 
                      width={(sizeW - 20) * (el.scaleX || 1)} 
                      align="center" 
                      listening={false} 
                    />
                  )}
                </React.Fragment>
              );
            }
            

            if (el.type === 'audio') {
                return <AudioPlayerNode key={el.id} el={el} commonProps={commonProps} />;
            }
            if (el.type === 'video') {
                return <Rect {...commonProps} key={el.id} x={el.isTransformed ? el.x : el.x} y={el.isTransformed ? el.y : el.y} width={el.width} height={el.height} fill="rgba(0,0,0,0.01)" stroke={selectedIds.includes(el.id) ? "var(--primary-color)" : "transparent"} strokeWidth={2} />;
            }
            if (el.type === 'video_placeholder' || el.type === 'audio_placeholder' || el.type === 'graphing_calc' || el.type === 'scientific_calc') {
              const dict = {
                'video_placeholder': "📽️ Video: " + el.fileName,
                'audio_placeholder': "🎵 Audio: " + el.fileName,
                'graphing_calc': "📈 Loading Graph...",
                'scientific_calc': "🔢 Loading Calculator..."
              };
              return (
                <React.Fragment key={el.id}>
                  <Rect {...commonProps} x={el.isTransformed ? el.x : el.x} y={el.isTransformed ? el.y : el.y} width={el.width} height={el.height} fill={['graphing_calc', 'scientific_calc'].includes(el.type) ? "transparent" : "#f1f5f9"} stroke={['graphing_calc', 'scientific_calc'].includes(el.type) ? "transparent" : "#cbd5e1"} strokeWidth={1} cornerRadius={8} />
                  {!['graphing_calc', 'scientific_calc'].includes(el.type) && (
                    <KonvaText 
                      {...commonProps} 
                      x={el.isTransformed ? el.x : el.x} 
                      y={el.isTransformed ? el.y + el.height/2 - 10 : el.y + el.height/2 - 10} 
                      text={dict[el.type]} 
                      fontSize={14} 
                      width={el.width} 
                      align="center" 
                      fill="#475569" 
                      listening={false} 
                    />
                  )}
                </React.Fragment>
              );
            }
            return null;
          })}
          
          {lassoLine && (
            <Line id="activeLassoLine" points={lassoLine} stroke="#6366f1" strokeWidth={2} dash={[10, 5]} tension={0.5} fill="rgba(99, 102, 241, 0.1)" closed={false} listening={false} />
          )}

          {selectedIds.length > 0 && (
            <Transformer
              ref={trRef}
              enabledAnchors={
                selectedTextEl
                  ? ['middle-left', 'middle-right']
                  : ['top-left', 'top-center', 'top-right', 'middle-right', 'bottom-right', 'bottom-center', 'bottom-left', 'middle-left']
              }
              boundBoxFunc={(oldBox, newBox) => {
                if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) return oldBox;
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>

      {/* TOP LEFT: Logo */}
      <div className="glass-panel" style={{ 
        position: 'fixed', 
        top: 20, 
        left: shiftUiLeftEdge, 
        transition: 'left 0.3s',
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        padding: '6px 16px',
        zIndex: 100,
        fontWeight: '800',
        fontSize: '18px',
        color: 'var(--text-primary)',
        letterSpacing: '1px',
        userSelect: 'none'
      }}>
        <img src="/logo.png" alt="Trace" style={{ width: '28px', height: '28px', transform: 'scale(1.1)' }} />
        Trace
      </div>

      {/* TOP RIGHT: Save and Share */}
      <div className="glass-panel" style={{ 
        position: 'fixed', 
        top: 20, 
        right: 20, 
        display: 'flex', 
        gap: '8px', 
        padding: '8px',
        zIndex: 100,
        background: store.isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        borderColor: store.isDarkMode ? '#334155' : '#e2e8f0'
      }}>
        <button 
          className="tool-btn" 
          onClick={store.toggleDarkMode}
          title={store.isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{ width: '40px', height: '40px' }}
        >
          {store.isDarkMode ? (
            <Sun size={20} color="#f1f5f9" />
          ) : (
            <Moon size={20} color="#1e293b" />
          )}
        </button>
        <div style={{ width: '1px', height: '24px', background: store.isDarkMode ? '#334155' : '#cbd5e1', alignSelf: 'center' }} />
        <button 
          className="tool-btn" 
          onClick={handleSaveClick}
          disabled={isSaving}
          title="Save Workspace"
          style={{ width: '40px', height: '40px' }}
        >
          <Save size={20} color={isSaving ? "#94a3b8" : (store.isDarkMode ? "#f1f5f9" : "#1e293b")} />
        </button>

        <div style={{ width: '1px', height: '24px', background: store.isDarkMode ? '#334155' : '#cbd5e1', alignSelf: 'center' }} />

        <button 
          className={`tool-btn ${isRecording ? 'recording' : ''}`} 
          onClick={isRecording ? stopRecording : startRecording}
          title={isRecording ? "Stop Recording" : "Start Screen Recording"}
          style={{ 
            width: isRecording ? 'auto' : '40px', 
            height: '40px', 
            padding: isRecording ? '0 12px' : '0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isRecording ? (
            <>
              <div className="recording-dot recording-pulse" />
              <span className="recorder-timer">{formatRecordingTime(recordingTime)}</span>
              <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '1px' }} />
            </>
          ) : (
            <Video size={20} color={store.isDarkMode ? "#f1f5f9" : "#1e293b"} />
          )}
        </button>
        <button 
          className="tool-btn" 
          onClick={handleShare}
          title="Share Link"
          style={{ width: '40px', height: '40px' }}
        >
          <Share2 size={20} color={store.isDarkMode ? "#f1f5f9" : "#1e293b"} />
        </button>
      </div>

      {/* BOTTOM RIGHT: Zoom and Relocate */}
      <div className="glass-panel" style={{ 
        position: 'fixed', 
        bottom: 20, 
        right: 20, 
        display: 'flex', 
        alignItems: 'center',
        gap: '8px', 
        padding: '8px',
        zIndex: 100 
      }}>
        <button className="tool-btn" onClick={() => setScale(s => Math.max(0.1, s / 1.1))} title="Zoom Out">
          <Minus size={20} />
        </button>
        <div style={{ fontSize: '13px', fontWeight: 'bold', width: '45px', textAlign: 'center', color: 'var(--text-primary)', pointerEvents: 'none' }}>
          {Math.round(scale * 100)}%
        </div>
        <button className="tool-btn" onClick={() => setScale(s => Math.min(5, s * 1.1))} title="Zoom In">
          <Plus size={20} />
        </button>
        <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 4px' }} />
        <button className="tool-btn" onClick={handleRelocate} title="Relocate to Center (100%)">
          <LocateFixed size={20} />
        </button>
        <button 
          className="tool-btn" 
          onClick={() => {
            if (selectedIds.length > 0) {
              store.deleteElements(selectedIds);
              setSelectedIds([]);
            } else {
              store.clear();
            }
          }} 
          title={selectedIds.length > 0 ? "Delete Selected" : "Clear Page"}
        >
          <Trash2 size={20} color="#ef4444" />
        </button>
      </div>

      {/* SAVE MODAL */}
      {showSaveModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            background: '#fff', border: '2px solid #1e293b', borderRadius: '8px', 
            padding: '24px', width: '340px', display: 'flex', flexDirection: 'column', gap: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '16px' }}>Save Workspace</div>
              <button 
                onClick={handleSave} 
                style={{ 
                  border: '2px solid #1e293b', background: '#fff', color: '#ef4444', 
                  fontWeight: 'bold', padding: '6px 16px', cursor: 'pointer', borderRadius: '6px',
                  transition: 'background 0.2s',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => e.target.style.background = '#fee2e2'}
                onMouseOut={(e) => e.target.style.background = '#fff'}
              >
                Save
              </button>
            </div>
            <div>
              <input 
                autoFocus
                value={workspaceNameInput} 
                onChange={e => setWorkspaceNameInput(e.target.value)}
                onKeyDown={e => { if(e.key === 'Enter') handleSave(e); }}
                placeholder="Name your workspace..."
                style={{ 
                  border: '2px solid #cbd5e1', padding: '10px 12px', width: '100%', 
                  borderRadius: '6px', outline: 'none', fontSize: '14px',
                  color: '#1e293b'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
              />
            </div>
            <button 
                onClick={() => setShowSaveModal(false)}
                style={{
                  background: 'none', border: 'none', color: '#64748b', fontSize: '12px',
                  cursor: 'pointer', textDecoration: 'underline', marginTop: '-4px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {showShareModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            background: '#fff', border: '2px solid #1e293b', borderRadius: '12px', 
            padding: '24px', width: '400px', display: 'flex', flexDirection: 'column', gap: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '18px' }}>Share Workspace</div>
              <button 
                onClick={() => setShowShareModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ×
              </button>
            </div>
            
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              Anyone with this link can view your workspace.
            </p>

            <div style={{ display: 'flex', gap: '8px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <input 
                readOnly
                value={getShareUrl()} 
                style={{ 
                  flex: 1, border: 'none', background: 'transparent', fontSize: '13px', 
                  color: '#475569', outline: 'none', cursor: 'default'
                }}
              />
              <button 
                onClick={copyShareLink}
                style={{ 
                  background: '#1e293b', color: '#fff', border: 'none', 
                  padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '500'
                }}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
