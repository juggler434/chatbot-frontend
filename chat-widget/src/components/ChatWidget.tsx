import React, { useState } from 'react';
import styled from 'styled-components';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const WidgetContainer = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  width: 300px;
  max-height: 400px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const MessageContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
`;

const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');

  const handleSend = (message: string) => {
    setMessages([...messages, message]);
    setInput('');
  };

  return (
    <WidgetContainer>
      <MessageContainer>
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
      </MessageContainer>
      <ChatInput input={input} setInput={setInput} onSend={handleSend} />
    </WidgetContainer>
  );
};

export default ChatWidget;

