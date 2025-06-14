import React, { useState } from 'react';
// Import custom CSS for Home component
import './Style/Home.css';
// React Router hook for navigation
import { useNavigate } from 'react-router-dom';
// Optional: Bootstrap container (though not used directly here)
import { Container } from 'react-bootstrap';

const Home = (props) => {
  // Local state to hold room name input value
  const [roomName, setRoomName] = useState("");

  // Hook to programmatically navigate to another route
  const navigate = useNavigate();

  // Form submission handler
  const submit = (e) => {
    e.preventDefault(); // Prevent default form submission reload behavior

    // Call parent component's connect function to establish WebSocket connection
    props.connect(roomName);

    // Update a simple localStorage count tracker (optional logic)
    let count = 0;
    if (localStorage.getItem('count')) {
      count = Number(localStorage.getItem('count'));
    }
    localStorage.setItem('count', count + 1);

    // Navigate to the /video route
    navigate('/video');
  }

  return (
    <>
      {/* Top navigation bar with logo/icon */}
      <nav className='navbar'>
        <img src="/icon.png" alt="Logo" />
      </nav>

      {/* Main form to enter room name */}
      <div className='roomFormDiv'>
        <form onSubmit={submit} className='roomForm'>
          <p>WELCOME!</p>
          {/* Room name input */}
          <input
            required
            type="text"
            className='roomValue'
            id='room-value'
            value={roomName}
            placeholder="Enter Room Name"
            onChange={(e) => setRoomName(e.target.value)}
          />
          {/* Submit button */}
          <button type='submit' className='roomEnter'>Enter</button>
        </form>
      </div>
    </>
  )
}

export default Home;
