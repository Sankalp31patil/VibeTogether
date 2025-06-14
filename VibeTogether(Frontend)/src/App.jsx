// ✅ Polyfill: Required to avoid 'global is not defined' error with STOMP.js in Vite
window.global = window;

// ✅ Import the WebSocket endpoint from environment variable (.env.local)
const endpoint = import.meta.env.VITE_BACKEND_WS_URL;

// ----------------- Imports -----------------
import React, { useRef, useState } from 'react';
import Player from './Components/Player';
import Home from './Components/Home';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// ----------------- App Component -----------------
function App() {

  // ---------- Local State ----------
  const [videoId, setVideoId] = useState("");     // YouTube video ID to be played
  const [isSeeking, setIsSeeking] = useState(false); // Tracks slider activity
  const [isConnected, setIsConnected] = useState(false); // Tracks STOMP connection

  // ---------- Refs (used to persist values without causing re-renders) ----------
  const room = useRef(null);            // Stores current room name
  const stompClient = useRef(null);     // STOMP client instance
  const dis = useRef(true);             // Flag to disable sync temporarily (for URL updates)
  const playerRef = useRef();           // Reference to Player component (for calling its functions)

  // ---------- Connect to WebSocket (via SockJS + STOMP) ----------
  const connect = (RoomName) => {
    room.current = RoomName;
    localStorage.setItem('roomName', RoomName); // Persist room for reloads

    const socket = new SockJS(endpoint); // Create SockJS client with backend WebSocket URL

    // Setup STOMP client
    stompClient.current = new Client({
      webSocketFactory: () => socket, // Use SockJS as transport

      onConnect: () => {
        setIsConnected(true);

        // Subscribe to topic specific to the room
        stompClient.current.subscribe("/topic/return/" + RoomName, (obj) => {
          const payload = JSON.parse(obj.body);
          showResponse(payload); // Handle incoming WebSocket messages
        });
      },

      onStompError: (frame) => {
        console.error('❌ STOMP Error:', frame.headers['message']);
        console.error('Details:', frame.body);
      }
    });

    stompClient.current.activate(); // 🔌 Initiate WebSocket connection
  };

  // ---------- Handle WebSocket Messages ----------
  const showResponse = (obj) => {
    if (obj.type === "url") {
      // 🔁 URL sync event (e.g., when video is loaded in one tab and synced in others)
      dis.current = true;
      localStorage.setItem('url', String(obj.value));
      setVideoId(obj.value);
      dis.current = false;
    } else if (obj.type === "p") {
      // ▶️⏸ Play/Pause sync
      if (playerRef.current) {
        playerRef.current.Play_Pause();
      }
    } else if (obj.type === 'slider') {
      // ⏩ Slider/Seek sync
      if (playerRef.current) {
        playerRef.current.onChangeSlider(obj.value);
      }
    }
  };

  // ---------- Routing ----------
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home connect={connect} /> // Home screen where users create/join room
    },
    {
      path: "/video",
      element: (
        <Player
          ref={playerRef}
          values={{
            isConnected,
            connect,
            setIsSeeking,
            isSeeking,
            dis,
            stompClient,
            room,
            videoId,
            setVideoId
          }}
        />
      )
    }
  ]);

  // ---------- Render Router ----------
  return <RouterProvider router={router} />;
}

export default App;
