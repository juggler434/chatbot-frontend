import React from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
  display: flex;
  padding: 10px;
  border-top: 1px solid #ddd;
`;

const TextInput = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const SendButton = styled.button`
  margin-left: 10px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

interface ChatInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onSend: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, onSend }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = () => {
    if (input.trim()) {
      onSend(input);
    }
  };

  return (
    <InputContainer>
      <TextInput type="text" value={input} onChange={handleChange} />
      <SendButton onClick={handleSubmit}>Send</SendButton>
    </InputContainer>
  );
};

export default ChatInput;

