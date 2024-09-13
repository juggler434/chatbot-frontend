import React from 'react';
import styled from 'styled-components';

const Message = styled.div`
  margin: 5px 0;
  padding: 10px;
  border-radius: 5px;
  background-color: #f1f1f1;
`;

interface ChatMessageProps {
  message: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return <Message>{message}</Message>;
};

export default ChatMessage;

