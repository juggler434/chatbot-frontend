// src/ChatWidget.tsx
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import './ChatWidget.css'; // Add your styles here

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

  // Fetch messages from the backend with pagination
  const fetchMessages = async (offset = 0, limit = 50) => {
  const token = localStorage.getItem('authToken');
  if (!token) return;

  try {
    const response = await fetch(`http://localhost:8000/messages?offset=${offset}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    // Ensure that the response is typed as an array of Message-like objects
    const data: Array<{
      id: string;
      question: string;
      response: string;
      created_at: string;
      updated_at: string;
    }> = await response.json();

    // Map the API response to a format we can use for rendering
    const formattedMessages: Message[] = data.map((msg) => ({
      id: msg.id,
      question: msg.question,
      response: msg.response,
      fromUser: true, // All questions are from the user
      created_at: msg.created_at,
      updated_at: msg.updated_at,
    }));

    // Filter out duplicates by message id
    setMessages((prevMessages) => {
      const newMessages = formattedMessages.filter(
        (msg: Message) => !prevMessages.some((prevMsg) => prevMsg.id === msg.id)
      );
      return [...prevMessages, ...newMessages];
    });
  } catch (error) {
    console.error(error);
  }
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

        // Fetch initial messages when logged in
        fetchMessages();
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

        // Fetch initial messages when signed up
        fetchMessages();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Remove the bearer token
    setIsLoggedIn(false); // Update the state to reflect that the user is logged out
    setMessages([]); // Clear messages on logout
  };

  // Handle sending a chat message (only from the user)
  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue.trim()) {
      setMessages([...messages, { id: Date.now().toString(), question: inputValue, response: '', fromUser: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]);
      setInputValue(''); // Clear input after sending a message
    }
  };

  // Load more messages (pagination)
  const loadMoreMessages = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchMessages(newOffset, limit); // Fetch the next set of messages
  };

  useEffect(() => {
    // Fetch initial messages after login
    if (isLoggedIn) {
      fetchMessages();
    }
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
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`chat-message from-user`}>
                  {message.question}
                </div>
                {message.response && (
                  <div className="chat-message from-bot">
                    {message.response}
                  </div>
                )}
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
          <button onClick={loadMoreMessages}>Load More Messages</button> {/* Load more messages */}
          <button onClick={handleLogout}>Logout</button> {/* Logout button */}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;

