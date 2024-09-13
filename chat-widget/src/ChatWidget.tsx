// src/ChatWidget.tsx
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import './ChatWidget.css'; // Add your styles here

interface Message {
  text: string;
  fromUser: boolean;
}

const ChatWidget: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('authToken'));
  const [isSignup, setIsSignup] = useState<boolean>(false); // For toggling between login and sign-up
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');

  // Handle input change for chat messages
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // Handle email and password input changes
  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  // Handle login form submission (URL-encoded form data)
  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    try {
      const formBody = new URLSearchParams({
        username: email,
        password
      }).toString();

      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody,
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const { access_token, token_type } = data;

      if (access_token) {
        localStorage.setItem('authToken', `${token_type} ${access_token}`);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Handle sign-up form submission (JSON data)
  const handleSignupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const bodyData = JSON.stringify({
        email: email,
        password: password
      });

      const response = await fetch('http://localhost:8000/users', { // User creation endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Sending JSON
        },
        body: bodyData, // JSON body
      });

      if (!response.ok) {
        throw new Error('Sign-up failed');
      }

      // Log the user in automatically after sign-up
      const data = await response.json();
      const { access_token, token_type } = data;

      if (access_token) {
        localStorage.setItem('authToken', `${token_type} ${access_token}`);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Remove the bearer token
    setIsLoggedIn(false); // Update the state to reflect that the user is logged out
  };

  // Handle sending a chat message
  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue.trim()) {
      setMessages([...messages, { text: inputValue, fromUser: true }]);
      setInputValue(''); // Clear input after sending a message
    }
  };

  useEffect(() => {
    // Fetch messages from backend or use WebSocket logic if needed
    // For now, using static messages or empty logic
  }, [isLoggedIn]);

  return (
    <div className="chat-widget">
      {!isLoggedIn ? (
        <div>
          <button onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? 'Switch to Login' : 'Switch to Sign-up'}
          </button>
          {isSignup ? (
            <form onSubmit={handleSignupSubmit}>
              <input type="email" value={email} onChange={handleEmailChange} placeholder="Email" required />
              <input type="password" value={password} onChange={handlePasswordChange} placeholder="Password" required />
              <button type="submit">Sign-up</button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit}>
              <input type="email" value={email} onChange={handleEmailChange} placeholder="Email" required />
              <input type="password" value={password} onChange={handlePasswordChange} placeholder="Password" required />
              <button type="submit">Login</button>
            </form>
          )}
        </div>
      ) : (
        <div>
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${message.fromUser ? 'from-user' : 'from-bot'}`}
              >
                {message.text}
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type your message"
              required
            />
            <button type="submit">Send</button>
          </form>
          <button onClick={handleLogout}>Logout</button> {/* Logout button */}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;

