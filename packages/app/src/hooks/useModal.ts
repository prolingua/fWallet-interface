import React, { useCallback, useContext } from "react";
import { Context } from "../context/ModalProvider";

const useModal = (modal: React.ReactNode, key?: string, persist = false) => {
  const { onDismiss, onPresent } = useContext(Context);

  const handlePresent = useCallback(() => {
    onPresent(modal, persist, key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, modal, onPresent]);

  return [handlePresent, onDismiss];
};

export default useModal;
