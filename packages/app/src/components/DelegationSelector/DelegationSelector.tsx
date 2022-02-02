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
        disabled={!selectedDelegation}
        style={{
          display: "flex",
          alignItems: "center",
          fontWeight: "bold",
          width: "25rem",
          height: "56px",
        }}
      >
        {!selectedDelegation ? (
          "No active delegations"
        ) : (
          <DelegationSelectRow
            activeDelegation={selectedDelegation}
            proposal={proposal}
            isSelected
          />
        )}
      </Button>
    </DropDownButton>
  );
};

export default DelegationSelector;
