import React, {useEffect, useRef} from "react";
import {Spin} from "antd";
import Chart from "chart.js/auto";

const VaccinationChart = ({data, loading, error}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (loading || error || !data) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const chartData = {
      labels: ["Completed", "Pending", "Failed", "Not Qualified", "Declined"],
      datasets: [
        {
          label: "Vaccination Status",
          data: [
            data.completed?.count || 0,
            data.pending?.count || 0,
            data.failed?.count || 0,
            data.notQualified?.count || 0,
            data.declined?.count || 0,
          ],
          backgroundColor: [
            "#52c41a", // green
            "#faad14", // yellow
            "#f5222d", // red
            "#fa8c16", // orange
            "#8c8c8c", // gray
          ],
          borderColor: ["#52c41a", "#faad14", "#f5222d", "#fa8c16", "#8c8c8c"],
          borderWidth: 1,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, 
        },
        title: {
          display: false, 
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0, 
          },
        },
      },
    };

    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: chartData,
      options: chartOptions,
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, loading, error]);

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "20px",
          height: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          color: "red",
          textAlign: "center",
          padding: "20px",
          height: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "20px",
          height: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        No data available
      </div>
    );
  }

  return (
    <div style={{height: "300px", position: "relative"}}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default VaccinationChart;
