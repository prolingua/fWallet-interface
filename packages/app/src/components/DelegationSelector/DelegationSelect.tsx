import React from "react";
import { Container, OverlayButton } from "../index";
import Column from "../Column";
import DelegationSelectRow from "./DelegationSelectRow";

const DelegationSelect: React.FC<any> = ({
  activeDelegations,
  selectedDelegation,
  setSelectedDelegation,
  proposal,
  handleClose,
}) => {
  const unselectedDelegations = activeDelegations.filter(
    (activeDelegation: any) =>
      activeDelegation.delegation.toStakerId !==
      selectedDelegation.delegation.toStakerId
  );
  return (
    <Container padding="1rem">
      <Column style={{ gap: ".5rem" }}>
        {unselectedDelegations.map((activeDelegation: any, index: number) => {
          const isFirst = index === 0;
          return (
            <OverlayButton
              style={{
                borderTop: !isFirst && "2px solid #202F49",
                paddingTop: !isFirst && ".5rem",
              }}
              key={`delegation-select-${index}`}
              onClick={() => setSelectedDelegation(activeDelegation)}
            >
              <DelegationSelectRow
                activeDelegation={activeDelegation}
                proposal={proposal}
              />
            </OverlayButton>
          );
        })}
      </Column>
    </Container>
  );
};

export default DelegationSelect;
