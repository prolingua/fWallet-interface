import React, { useContext } from "react";
import { ContentBox, Heading1, Typo1 } from "../../components";
import Column from "../../components/Column";
import Row from "../../components/Row";
import { ThemeContext } from "styled-components";
import Spacer from "../../components/Spacer";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import useFantomApiData from "../../hooks/useFantomApiData";
import useFantomApi, { FantomApiMethods } from "../../hooks/useFantomApi";

const CRatio: React.FC<any> = ({ value }) => {
  const { color } = useContext(ThemeContext);
  const percentage = value / 10;
  return (
    <Column>
      <Typo1
        style={{
          alignSelf: "center",
          fontWeight: "bold",
          color: color.greys.grey(),
        }}
      >
        C-Ratio
      </Typo1>
      <Spacer size="md" />
      <Row
        style={{
          width: 130,
          height: 130,
          alignSelf: "center",
          fontWeight: "bold",
        }}
      >
        <CircularProgressbar
          styles={buildStyles({
            pathColor: color.secondary.electricBlue(),
            trailColor: color.greys.darkGrey(0.4),
            textColor: color.white,
          })}
          value={percentage}
          text={`${value}%`}
        />
      </Row>
    </Column>
  );
};

const StatPair: React.FC<any> = ({ title, value1, value2, suffix }) => {
  const { color } = useContext(ThemeContext);
  return (
    <>
      <Typo1 style={{ fontWeight: "bold", color: color.greys.grey() }}>
        {title}
      </Typo1>
      <Row style={{ alignItems: "flex-end" }}>
        <div style={{ fontSize: "24px", fontWeight: "bold" }}>{value1}</div>
        <div
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: color.greys.darkGrey(),
            paddingBottom: ".1rem",
          }}
        >
          {value2}
        </div>
        <Spacer size="xs" />
        <div
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: color.greys.darkGrey(),
            paddingBottom: ".1rem",
          }}
        >
          {suffix}
        </div>
      </Row>
    </>
  );
};

const Home: React.FC<any> = () => {
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

export default Home;
