import React, { createContext, useCallback, useState } from "react";
import styled from "styled-components";

interface NotifyContext {
  content?: React.ReactNode;
  isOpen?: boolean;
  notifyKey?: string;
  onPresent: (content: React.ReactNode, key?: string) => void;
  onDismiss: () => void;
}

export const Context = createContext<NotifyContext>({
  onPresent: () => {},
  onDismiss: () => {},
});

const NotifyProvider: React.FC = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<React.ReactNode>();
  const [notifyKey, setNotifyKey] = useState<string>();

  const handlePresent = useCallback(
    (notifyContent: React.ReactNode, key?: string) => {
      setNotifyKey(key);
      setContent(notifyContent);
      setIsOpen(true);
      // Disable page scrollbar on modal open
      document.body.style.overflow = "hidden";
    },
    [setContent, setIsOpen, setNotifyKey]
  );

  const handleDismiss = useCallback(() => {
    setContent(undefined);
    setIsOpen(false);
    setNotifyKey(undefined);
    document.body.style.overflow = "auto";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setContent, setIsOpen, notifyKey]);

  return (
    <Context.Provider
      value={{
        content,
        isOpen,
        notifyKey,
        onPresent: handlePresent,
        onDismiss: handleDismiss,
      }}
    >
      {children}
      {isOpen && (
        <StyledNotifyWrapper>
          {React.isValidElement(content) &&
            React.cloneElement(content, {
              onDismiss: handleDismiss,
            })}
        </StyledNotifyWrapper>
      )}
    </Context.Provider>
  );
};

const StyledNotifyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: fixed;
  z-index: 2000;
  right: 0;
  bottom: 0;
  margin: 2rem;
`;

export default NotifyProvider;
