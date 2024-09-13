import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import './ChatWidget.css'; // Import the styles from your CSS file

interface Message {
  id: string;
  question: string;
  response: string;
  fromUser: boolean;
  created_at: string;
  updated_at: string;
}

const ChatWidget: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('authToken'));
  const [isSignup, setIsSignup] = useState<boolean>(false); // For toggling between login and sign-up
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [offset, setOffset] = useState<number>(0);
  const [limit, setLimit] = useState<number>(50);

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

  // Handle signup form submission
  const handleSignupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const bodyData = JSON.stringify({ email, password });

      const response = await fetch('http://localhost:8000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: bodyData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Signup failed: ${errorText}`);
      }

      const data = await response.json();
      const { access_token, token_type } = data;

      if (access_token) {
        localStorage.setItem('authToken', `${token_type} ${access_token}`);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error during signup:', error);
    }
  };

  // Handle login form submission
  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const bodyData = new URLSearchParams({
        username: email,
        password,
      });

      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyData.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login failed:', errorText);
        throw new Error('Login failed');
      }

      const data = await response.json();
      const { access_token, token_type } = data;

      if (access_token) {
        localStorage.setItem('authToken', `${token_type} ${access_token}`);
        setIsLoggedIn(true);
        fetchMessages();
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  // Fetch messages from the backend with pagination
  const fetchMessages = async (offset = 0, limit = 50) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8000/messages?offset=${offset}&limit=${limit}`, {
        method: 'GET',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch messages:', errorText);
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();

      // Map and update messages
      const formattedMessages: Message[] = data.map((msg: any) => ({
        id: msg.id,
        question: msg.question,
        response: msg.response,
        fromUser: true,
        created_at: msg.created_at,
        updated_at: msg.updated_at,
      }));

      setMessages((prevMessages) => [...prevMessages, ...formattedMessages]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Handle sending a message
  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (inputValue.trim()) {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const bodyData = JSON.stringify({ question: inputValue });

        const response = await fetch('http://localhost:8000/messages', {
          method: 'POST',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
          body: bodyData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to send message:', errorText);
          throw new Error('Failed to send message');
        }

        const data = await response.json();

        // Update the chat with both the question and response
        const newMessage: Message = {
          id: data.id || Date.now().toString(),
          question: data.question,
          response: data.response,
          fromUser: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setInputValue('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setMessages([]);
  };

  return (
    <div className="chat-container">
      <div className="header">
        <img
          src="https://example.com/fortune-teller-image.jpg"
          alt="Fortune Teller"
          className="fortune-teller-img"
        />
      </div>

      {!isLoggedIn ? (
        <div>
          <button onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? 'Switch to Login' : 'Switch to Sign-up'}
          </button>
          {isSignup ? (
            <form onSubmit={handleSignupSubmit}>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Email"
                required
              />
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Password"
                required
              />
              <button type="submit">Sign-up</button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit}>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Email"
                required
              />
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Password"
                required
              />
              <button type="submit">Login</button>
            </form>
          )}
        </div>
      ) : (
        <div>
          <div className="chat-messages">
            {messages.length === 0 ? (
              <p>No messages yet</p>
            ) : (
              messages.map((message) => (
                <div key={message.id}>
                  <div className="chat-message from-user">{message.question}</div>
                  {message.response && (
                    <div className="chat-message from-bot">{message.response}</div>
                  )}
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleSendMessage} className="message-input-form">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type your message"
              className="message-input"
              required
            />
            <button type="submit" className="send-button">Send</button>
          </form>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;

