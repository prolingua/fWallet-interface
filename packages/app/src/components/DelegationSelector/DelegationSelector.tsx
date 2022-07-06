import React from "react";
import DropDownButton from "../DropDownButton";
import { Button } from "../index";
import DelegationSelect from "./DelegationSelect";
import DelegationSelectRow from "./DelegationSelectRow";

const DelegationSelector: React.FC<any> = ({
  activeDelegations,
  selectedDelegation,
  setSelectedDelegation,
  proposal,
}) => {
  return (
    <DropDownButton
      disabled={!selectedDelegation || activeDelegations.length === 1}
      width="400px"
      DropDown={() =>
        DelegationSelect({
          activeDelegations,
          selectedDelegation,
          setSelectedDelegation,
          proposal,
        })
      }
      dropdownWidth={400}
      dropdownTop={70}
    >
      <Button
        variant="secondary"
        disabled={!selectedDelegation || activeDelegations.length === 1}
        style={{
          display: "flex",
          alignItems: "center",
          fontWeight: "bold",
          height: "56px",
          minWidth: "22rem",
          maxWidth: "100%",
        }}
      >
        {!selectedDelegation ? (
          "No active delegations"
        ) : (
          <DelegationSelectRow
            activeDelegation={selectedDelegation}
            proposal={proposal}
            isSelected={activeDelegations.length > 1}
          />
        )}
      </Button>
    </DropDownButton>
  );
};

export default DelegationSelector;
