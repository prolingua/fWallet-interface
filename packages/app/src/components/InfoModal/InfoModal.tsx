import React from "react";
import Modal from "../Modal";
import ModalContent from "../ModalContent";
import ModalTitle from "../ModalTitle";
import { Button, Typo1 } from "../index";
import ModalActions from "../ModalActions";

const InfoModal: React.FC<any> = ({ message, handleButton, onDismiss }) => {
  return (
    <Modal>
      <ModalTitle text="Warning" />
      <ModalContent>
        <Typo1>{message}</Typo1>
      </ModalContent>
      <ModalActions>
        {handleButton && (
          <Button
            onClick={() => {
              handleButton();
              onDismiss();
            }}
            variant="secondary"
          >
            ADD
          </Button>
        )}
        <Button onClick={() => onDismiss()} variant="secondary">
          CLOSE
        </Button>
      </ModalActions>
    </Modal>
  );
};

export default InfoModal;
