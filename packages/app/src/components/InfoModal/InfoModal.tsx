import React from "react";
import Modal from "../Modal";
import ModalContent from "../ModalContent";
import ModalTitle from "../ModalTitle";
import { Button, Heading3, OverlayButton, Typo1 } from "../index";
import Spacer from "../Spacer";
import Row from "../Row";

const InfoModal: React.FC<any> = ({
  title,
  message,
  actionButtonText,
  handleActionButton,
  actionButtonNoDismiss,
  withCloseButton = true,
  onDismiss,
}) => {
  return (
    <Modal>
      <ModalTitle text={title ? title : "Warning"} />
      <ModalContent>
        <Typo1>{message}</Typo1>
      </ModalContent>
      <Spacer size="xs" />
      <Row style={{ width: "100%", justifyContent: "center", gap: "1rem" }}>
        {handleActionButton && actionButtonText && (
          <Button
            style={{ flex: 1 }}
            onClick={() => {
              handleActionButton();
              !actionButtonNoDismiss && onDismiss();
            }}
            variant="primary"
          >
            {actionButtonText}
          </Button>
        )}
        {withCloseButton && (
          <OverlayButton style={{ flex: 1 }} onClick={() => onDismiss()}>
            <Heading3 style={{ color: "#765cde" }}>Close</Heading3>
          </OverlayButton>
        )}
      </Row>
    </Modal>
  );
};

export default InfoModal;
