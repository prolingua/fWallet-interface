import React, { useEffect, useState } from "react";
import { createChart } from "lightweight-charts";
import { Heading3 } from "../index";

const Chart: React.FC<any> = ({ width, data, handleCrossHairData }) => {
  const chartRef = React.useRef(null);
  const [chart, setChart] = useState(null);
  const [series, setSeries] = useState<any>(null);
  const handleCrossHair = (point: any) => {
    const seriesPrice = [...point.seriesPrices.entries()];
    const price =
      seriesPrice.length && seriesPrice[0].length && seriesPrice[0][1];
    handleCrossHairData([point.time, price || undefined]);
  };

  React.useEffect(() => {
    if (chartRef.current?.children.length) {
      chartRef.current.removeChild(chartRef.current.children[0]);
    }

    if (chartRef.current) {
      setChart(
        createChart(chartRef.current, {
          width: width,
          height: 300,
          layout: {
            backgroundColor: "transparent",
            textColor: "#67748B",
          },
          grid: {
            vertLines: {
              visible: false,
            },
            horzLines: {
              visible: false,
            },
          },
          rightPriceScale: {
            borderVisible: false,
          },
          timeScale: {
            borderVisible: false,
            timeVisible: true,
          },
          crosshair: {
            horzLine: {
              visible: true,
            },
          },
          handleScale: false,
          handleScroll: false,
        })
      );
    }
  }, [width]);

  useEffect(() => {
    if (chart && series) {
      setChart(null);
      try {
        chart.removeSeries(series);
      } catch (err) {
        // ignore error
        // console.info(err);
      }
    }
    if (chart && data) {
      const newSeries = chart.addAreaSeries();
      newSeries.setData(data);

      setSeries(newSeries);
      chart.timeScale().fitContent();
      chart.subscribeCrosshairMove(handleCrossHair);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart, data]);

  return (
    <>
      <div ref={chartRef} />
      {chart && !data && (
        <Heading3 style={{ textAlign: "center", marginTop: "-180px" }}>
          No data available!
        </Heading3>
      )}
    </>
  );
};

export default Chart;
