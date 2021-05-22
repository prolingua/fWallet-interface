import React, { useContext } from "react";
import { ThemeContext } from "styled-components";
import { ContentBox, Heading1 } from "../../components";
import Column from "../../components/Column";
import Spacer from "../../components/Spacer";
import Row from "../../components/Row";
import StatPair from "../../components/StatPair";
import CRatio from "../../components/C-Ratio";

const Balance: React.FC<any> = () => {
  const { color } = useContext(ThemeContext);

  return (
    <ContentBox>
      <Column style={{ flex: 4 }}>
        <Heading1>Balance</Heading1>
        <Spacer size="sm" />
        <Row style={{ alignItems: "flex-end" }}>
          <div style={{ fontSize: "64px", fontWeight: "bold" }}>$8,412</div>
          <div
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: color.greys.darkGrey(),
              paddingBottom: ".5rem",
            }}
          >
            .67
          </div>
        </Row>
      </Column>
      <Column style={{ flex: 2 }}>
        <Spacer size="lg" />
        <StatPair title="Available" value1="7,121" value2="" suffix="FTM" />
        <Spacer />
        <StatPair title="Staked" value1="2,734" value2=".43" suffix="FTM" />
        <Spacer />
        <StatPair
          title="Pending rewards"
          value1="996"
          value2=".58"
          suffix="FTM"
        />
      </Column>
      <Column style={{ flex: 2 }}>
        <Spacer size="lg" />
        <StatPair
          title="Minted sFTM"
          value1="1,414"
          value2=".89"
          suffix="sFTM"
        />
        <Spacer />
        <StatPair
          title="Locked collateral"
          value1="756"
          value2=""
          suffix="FTM"
        />
        <Spacer />
        <StatPair title="Net APY" value1="8.41%" value2="" suffix="" />
      </Column>
      <Column style={{ flex: 2 }}>
        <Spacer size="lg" />
        <CRatio value="620" />
      </Column>
    </ContentBox>
  );
};

export default Balance;
