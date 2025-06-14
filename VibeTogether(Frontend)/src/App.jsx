// Polyfill for 'window.global' to fix compatibility issues in some environments (e.g., Vite + STOMP.js)
window.global = window;

import React, { useRef, useState } from 'react';
import Player from './Components/Player';
import Home from './Components/Home';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

function App() {

  // Local state for YouTube video ID and slider-seeking status
  const [videoId, setVideoId] = useState("");
  const [isSeeking, setIsSeeking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Refs to hold mutable values across renders
  const room = useRef(null);                     // Stores current room name
  const stompClient = useRef(null);             // STOMP client instance
  const dis = useRef(true);                     // Flag to control sync behavior
  const playerRef = useRef();                   // Ref to access Player component's methods
  
  // Function to connect to WebSocket server using STOMP over SockJS
  const connect = (RoomName) => {
    room.current = RoomName;
    localStorage.setItem('roomName', RoomName);

    const socket = new SockJS("http://192.168.1.15:9090/server"); // Backend WebSocket endpoint

    // Create new STOMP client and configure lifecycle methods
    stompClient.current = new Client({
      webSocketFactory: () => socket,

      onConnect: () => {
        setIsConnected(true);
        // Subscribe to messages from the current room
        stompClient.current.subscribe("/topic/return/" + RoomName, (obj) => {
          showResponse(JSON.parse(obj.body));       // Handle received message
        });
      },

      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      }
    });

    stompClient.current.activate(); // Connect WebSocket
  };

  // Function to handle different types of WebSocket messages
  const showResponse = (obj) => {

    if (obj.type === "url") {
      dis.current = true;                                // Prevent duplicate URL updates
      localStorage.setItem('url', String(obj.value));    // Save URL locally
      setVideoId(obj.value);                             // Update YouTube video ID
      dis.current = false;
    }

    else if (obj.type === "p") {
      if (playerRef.current) {
        playerRef.current.Play_Pause();                  // Trigger play/pause
      }
    }

    else if (obj.type === 'slider') {
      if (playerRef.current)
        playerRef.current.onChangeSlider(obj.value);     // Seek to new time
    }
  };

  // React Router configuration
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home connect={connect} />                // Home component with connect callback
    },
    {
  path: "/video",
  element: (
  
      <Player ref={playerRef} values={{isConnected, connect, setIsSeeking, isSeeking, dis, stompClient, room, videoId, setVideoId }} />

  )
}
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;
