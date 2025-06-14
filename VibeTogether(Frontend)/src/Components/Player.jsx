import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import YouTube from 'react-youtube';
import 'bootstrap/dist/css/bootstrap.css';
import { FaPlay, FaPause } from "react-icons/fa";
import Slider from './Slider';
import { SlMagnifier } from "react-icons/sl";
import { RiFullscreenFill } from "react-icons/ri";
import './Style/Player.css';
import { useNavigate } from 'react-router-dom';

function Player(props, ref) {
  // States for video control
  const [player, setPlayer] = useState(null);
  const [url, setUrl] = useState("");
  const [playPause, setPlayPause] = useState(true);
  const [slideValue, setSlideValue] = useState("0");
  const [isSeeking, setIsSeeking] = useState(false);
  const [videoTime, setVideoTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");

  // Refs to handle timeouts and state
  const seekTimeout = useRef(null);
  const timeOut = useRef(null);
  const state = useRef(null);

  const navigate = useNavigate();

  // YouTube player options
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 0,
      rel: 0,
      fs: 1,
      modestbranding: 1
    }
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    onChangeSlider,
    Play_Pause,
    Navigate
  }));

  // Navigate back to home
  const Navigate = () => {
    navigate('/');
  };

  // Initial effect to connect to STOMP and restore local storage state
  useEffect(() => {
    if (!props.values.stompClient.current) {
      if (localStorage.getItem('roomName')) {
        props.values.connect(localStorage.getItem('roomName'));
      }
      if (localStorage.getItem('url')) {
        props.values.setVideoId(localStorage.getItem('url'));
        props.values.dis.current = false;
      }
    }

    // Fullscreen handling
    const videoContainer = document.getElementById('video-player-container');
    const fullscreenBtn = document.getElementById('fullscreen-btn');

    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        videoContainer.requestFullscreen().catch(err => {
          console.error(`Fullscreen error: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    });
  }, []);

  // Auto-hide controls and cursor after inactivity
  useEffect(() => {
    const mouseMove = document.getElementById('videoCover');
    const divController = document.getElementById('controller');

    const handleMouseMove = () => {
      mouseMove.style.cursor = 'default';
      divController.style.visibility = 'visible';

      if (timeOut.current) clearTimeout(timeOut.current);

      if (state.current !== 2) {
        timeOut.current = setTimeout(() => {
          mouseMove.style.cursor = 'none';
          divController.style.visibility = 'hidden';
        }, 3000);
      }
    };

    mouseMove.addEventListener('mousemove', handleMouseMove);

    return () => {
      mouseMove.removeEventListener('mousemove', handleMouseMove);
    };
  }, [playPause]);

  // Send messages to server using STOMP
  const Publish = (e, obj) => {
    if (props.values.stompClient.current && props.values.stompClient.current.connected) {
      props.values.stompClient.current.publish({
        destination: "/app/url/" + props.values.room.current,
        body: JSON.stringify(obj)
      });
    } else {
      console.warn("STOMP client not connected.");
    }
  };

  // Extract and send YouTube video ID
  const getYouTubeVideoID = (e) => {
    e.preventDefault();
    const regex = /(?:youtube\.com.*(?:\/|v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    if (match) {
      Publish(e, { type: "url", value: match[1] });
    }
  };

  // Player ready event
  const onPlayerReady = (e) => {
    setPlayer(e.target);
  };

  // Handle player state changes (play/pause/end)
  const onPlayerStateChange = (event) => {
    state.current = event.data;

    if (state.current === 1) setPlayPause(false);      // Playing
    else if (state.current === 2 || state.current === 0) setPlayPause(true); // Paused or Ended
  };

  // Toggle Play/Pause
  const Play_Pause = () => {
    playPause ? player.playVideo() : player.pauseVideo();
    setPlayPause(!playPause);
  };

  // Change video time via slider
  const onChangeSlider = (value) => {
    setIsSeeking(true);
    const percentage = Number(value);
    setSlideValue(value);

    if (seekTimeout.current) clearTimeout(seekTimeout.current);

    seekTimeout.current = setTimeout(() => {
      if (player) {
        const duration = player.getDuration();
        const time = (percentage / 100) * duration;
        if (props.values.videoId !== "")
          player.seekTo(time, true);
      }
      setIsSeeking(false);
    }, 300);
  };

  // Handle video player error
  const onError = (event) => {
    console.error("YouTube player error:", event.data);
  };

  // Update slider and time display every second
  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      if (!isSeeking) {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        const percentage = (currentTime / duration) * 100;

        setVideoTime(formatTime(currentTime));
        setDuration(formatTime(duration));
        setSlideValue(String(percentage));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [player, isSeeking, props.values.videoId]);

  // Format time into mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  // Logout function: disconnect, clear localStorage, redirect
  const logout = () => {
    if (props.values.stompClient.current)
      props.values.stompClient.current.deactivate();

    localStorage.removeItem('roomName');
    localStorage.removeItem('url');
    localStorage.setItem("count", localStorage.getItem('count') - 1);
    navigate('/');
  };

  return (
    <>
      <div className="Container">
        {/* Room Info Display */}
        <div className='roomDiv'>
          {localStorage.getItem('roomName') && <p className='ROOM'> ROOM:</p>}
          <p className='RoomName' style={{ color: localStorage.getItem('roomName') ? 'green' : 'red' }}>
            {localStorage.getItem('roomName') || "Invalid Entry"}
          </p>
        </div>

        {/* URL Form */}
        <form className='Form-fill' onSubmit={getYouTubeVideoID}>
          <input
            required
            type="text"
            id='input-url'
            className="searchBar"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Search"
          />
          <button className='Search-btn'> <SlMagnifier /></button>
        </form>

        {/* Video Player Section */}
        <div id='video-player-container' className='videoDiv'>
          <YouTube
            videoId={props.values.videoId}
            opts={opts}
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
            iframeClassName="youtube-iframe"
            onError={onError}
          />
          <div id='videoCover' className='videoCover' onClick={(e) => Publish(e, { type: "p", value: "" })} />

          {/* Video Controls */}
          <div id='controller' className="controller">
            {player && <Slider values={{ setIsSeeking, Publish, setSlideValue, slideValue }} />}
            <button disabled={props.values.dis.current} className='btn-pp' onClick={(e) => Publish(e, { type: "p", value: "" })}>
              {playPause ? <FaPlay /> : <FaPause />}
            </button>
            {player && <p className='time'>{videoTime + " / " + duration}</p>}
            <button id='fullscreen-btn' className='fullScreen'><RiFullscreenFill /></button>
          </div>
        </div>

        {/* Logout Button */}
        {player && <button onClick={logout} className='logout'>Logout</button>}
      </div>
    </>
  );
}

// Forward ref to allow parent to call methods
export default forwardRef(Player);
