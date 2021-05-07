import React from "react";
import Modal from "../Modal";
import ModalContent from "../ModalContent";

const InfoModal: React.FC<any> = ({ message }) => {
  return (
    <Modal>
      <ModalContent>
        <div>{message}</div>
      </ModalContent>
    </Modal>
  );
};

export default InfoModal;
