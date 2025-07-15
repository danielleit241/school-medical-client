import Chart from "chart.js/auto";
import React, {useEffect, useRef} from "react";
const RecentActionsChart = ({data, loading, error}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (loading || error || !data || data.length === 0) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels = data.map((item) => {
      const actionName = item.userRecentAction.name.split(" in ")[0];
      return actionName;
    });

    const values = data.map((item) => item.userRecentAction.count);

    const backgroundColors = [
      "#52c41a", // Create - green
      "#1890ff", // Update - blue
      "#fa8c16", // Reset password - orange
    ];

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: "Action Count",
          data: values,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors,
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
        tooltip: {
          callbacks: {
            label: function (context) {
              return `Count: ${context.raw}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0, 
          },
          title: {
            display: true,
            text: "Number of Actions",
          },
        },
        x: {
          title: {
            display: true,
            text: "Action Type",
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

  if (!data || data.length === 0) {
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

export default RecentActionsChart;
