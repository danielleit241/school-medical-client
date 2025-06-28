import React, {useEffect, useState, useRef} from "react";
import {
  Calendar,
  Users,
  Activity,
  Syringe,
  Heart,
  Clock,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import axiosInstance from "../../api/axios";
import dayjs from "dayjs";
import {useSelector} from "react-redux";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import {Divider, Tag} from "antd";
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const TABS = [
  {key: "rounds", label: "Rounds", icon: Syringe},
  {key: "appointments", label: "Appointment", icon: Calendar},
  {key: "medicalRegistrations", label: "Medical Registration", icon: Users},
  {key: "medicalEvents", label: "Medical Event", icon: Activity},
];

const STATUS_COLOR_MAP = {
  Completed: "#10b981",
  Pending: "#f59e0b",
  Confirmed: "#3b82f6",
  Approved: "#3b82f6",
  Participated: "#3b82f6",
  "Not Completed": "#ef4444",
};

const LoadingSpinner = () => (
  <div
    style={{display: "flex", alignItems: "center", justifyContent: "center"}}
  >
    <div
      style={{
        width: "24px",
        height: "24px",
        border: "2px solid #e5e7eb",
        borderTop: "2px solid #3b82f6",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    ></div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// SummaryCard: style inline
// eslint-disable-next-line no-unused-vars
const SummaryCard = ({title, count, loading, icon: Icon, gradient}) => {
  const gradientStyles = {
    "from-blue-500 to-blue-600":
      "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    "from-purple-500 to-purple-600":
      "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    "from-emerald-500 to-emerald-600":
      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  };
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "16px", // giảm từ 20px
        background:
          gradientStyles[gradient] ||
          gradientStyles["from-blue-500 to-blue-600"],
        padding: "24px", // giảm từ 32px
        color: "white",
        boxShadow:
          "0 6px 12px -3px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.04)", // nhẹ hơn
        transition: "all 0.3s",
        minHeight: "100px", // giảm từ 120px
        cursor: "pointer",
        marginBottom: "0", // loại bỏ margin thừa
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow =
          "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 6px 12px -3px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.04)";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: "16px",
              fontWeight: 600,
              margin: 0,
              marginBottom: 4,
            }}
          >
            {title}
          </p>
          <div style={{fontSize: "26px", fontWeight: 700, marginTop: "6px"}}>
            {loading ? <LoadingSpinner /> : count}
          </div>
        </div>
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.18)",
            padding: "12px",
            borderRadius: "50%",
          }}
        >
          <Icon style={{width: "28px", height: "28px"}} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: "-18px",
          bottom: "-18px",
          opacity: 0.13,
        }}
      >
        <Icon style={{width: "72px", height: "72px"}} />
      </div>
    </div>
  );
};

// TabButton: style inline
// eslint-disable-next-line no-unused-vars
const TabButton = ({tab, currentTab, onClick, icon: Icon, label}) => {
  const isActive = currentTab === tab;
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 20px", // giảm padding
        borderRadius: "8px", // giảm border radius
        fontSize: "15px", // nhỏ hơn
        border: isActive ? "2px solid #3b82f6" : "2px solid transparent",
        backgroundColor: isActive ? "#3b82f6" : "transparent",
        color: isActive ? "white" : "#374151",
        boxShadow: isActive ? "0 1px 4px 0 rgba(24,144,255,0.08)" : "none",
        cursor: "pointer",
        transition: "all 0.2s",
        marginRight: "8px",
        marginBottom: "8px",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = "#2563eb";
          e.currentTarget.style.backgroundColor = "#f0f6ff";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = "#374151";
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
      type="button"
    >
      <Icon
        style={{
          width: "20px",
          height: "20px",
          color: isActive ? "white" : "#9ca3af",
        }}
      />
      <span
        style={{
          display: window.innerWidth >= 640 ? "inline" : "none",
          fontSize: "15px",
        }}
      >
        {label}
      </span>
    </button>
  );
};

// StatusItem: style inline
const StatusItem = ({item, totalCount}) => {
  const percentage =
    totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;

  const name = (item.name || "").toLowerCase();

  let dotColor = "#6b7280"; // default gray
  if (name.startsWith("completed")) dotColor = "#10b981";
  else if (name.startsWith("pending")) dotColor = "#f59e0b";
  else if (name.startsWith("confirm") || name.startsWith("approved"))
    dotColor = "#3b82f6"; // xanh dương
  else if (name.startsWith("not completed")) dotColor = "red";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 14px", // giảm padding
        borderRadius: "8px",
        backgroundColor: "#f9fafb",
        marginBottom: "8px",
        transition: "background 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
    >
      <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: dotColor,
          }}
        ></div>
        <span style={{fontSize: "15px", color: "#374151", fontWeight: 600}}>
          {item.name}
        </span>
      </div>
      <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
        <span style={{fontSize: "16px", color: "#111827", fontWeight: 700}}>
          {item.count}
        </span>
        {totalCount > 0 && (
          <div
            style={{
              width: "70px",
              backgroundColor: "#e5e7eb",
              borderRadius: "9999px",
              height: "6px",
              position: "relative",
            }}
          >
            <div
              style={{
                height: "6px",
                borderRadius: "9999px",
                width: `${percentage}%`,
                backgroundColor: dotColor,
                transition: "width 0.5s",
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

// VaccinationItem: style inline
const VaccinationItem = ({item}) => {
  // Kiểm tra trạng thái ngày
  let statusText = "";
  let statusColor = "#16a34a";
  if (item.daylefts === 0) {
    statusText = "In Active";
    statusColor = "#3b82f6";
  } else if (item.daylefts < 0) {
    statusText = "Expired";
    statusColor = "#ef4444";
  } else {
    statusText = `${item.daylefts} days left`;
    statusColor = "#16a34a";
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px",
        background: "linear-gradient(90deg, #f0fdf4 0%, #ecfdf5 100%)",
        borderRadius: "8px",
        border: "1px solid #bbf7d0",
        marginBottom: "8px",
      }}
    >
      <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
        <div
          style={{
            backgroundColor: "#22c55e",
            padding: "8px",
            borderRadius: "50%",
          }}
        >
          <Syringe style={{width: "18px", height: "18px", color: "white"}} />
        </div>
        <div>
          <p
            style={{
              fontWeight: 600,
              fontSize: "15px",
              color: "#1f2937",
              margin: 0,
            }}
          >
            Round: {item.roundName || "N/A"}
          </p>
          <p style={{fontSize: "13px", color: "#6b7280", margin: "4px 0 0 0"}}>
            Start: {item.startDate || "N/A"}
          </p>
        </div>
      </div>
      <div style={{textAlign: "right"}}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: statusColor,
            fontSize: "15px",
          }}
        >
          <Clock style={{width: "16px", height: "16px"}} />
          <span style={{fontWeight: 600}}>{statusText}</span>
        </div>
      </div>
    </div>
  );
};

const HealthCheckItem = ({item}) => {
  // Kiểm tra trạng thái ngày
  let statusText = "";
  let statusColor = "#dc2626";
  if (item.daylefts === 0) {
    statusText = "In Active";
    statusColor = "#3b82f6";
  } else if (item.daylefts < 0) {
    statusText = "Expired";
    statusColor = "#ef4444";
  } else {
    statusText = `${item.daylefts} days left`;
    statusColor = "#dc2626";
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px",
        background: "linear-gradient(90deg, #fef2f2 0%, #fef7f7 100%)",
        borderRadius: "8px",
        border: "1px solid #fecaca",
        marginBottom: "8px",
      }}
    >
      <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
        <div
          style={{
            backgroundColor: "#ef4444",
            padding: "8px",
            borderRadius: "50%",
          }}
        >
          <Heart style={{width: "18px", height: "18px", color: "white"}} />
        </div>
        <div>
          <p
            style={{
              fontWeight: 600,
              fontSize: "15px",
              color: "#1f2937",
              margin: 0,
            }}
          >
            Round: {item.roundName || "N/A"}
          </p>
          <p style={{fontSize: "13px", color: "#6b7280", margin: "4px 0 0 0"}}>
            Start: {item.startDate || "N/A"}
          </p>
        </div>
      </div>
      <div style={{textAlign: "right"}}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: statusColor,
            fontSize: "15px",
          }}
        >
          <Clock style={{width: "16px", height: "16px"}} />
          <span style={{fontWeight: 600}}>{statusText}</span>
        </div>
      </div>
    </div>
  );
};

const getMonthOptions = () => {
  // Lấy 12 tháng gần nhất, tháng hiện tại lên đầu
  const arr = [];
  const now = dayjs();
  for (let i = 0; i < 12; i++) {
    const m = now.subtract(i, "month");
    arr.push({
      label: m.format("MMMM YYYY"),
      value: m.format("YYYY-MM"),
      from: m.startOf("month").format("YYYY-MM-DD"),
      to: m.endOf("month").format("YYYY-MM-DD"),
    });
  }
  return arr;
};

const Dashboard = () => {
  const nurseId = useSelector((state) => state.user?.userId);
  const [summary, setSummary] = useState({
    appointments: {name: "Appointment", count: 0},
    medicalRegistrations: {name: "Medical Registration", count: 0},
    medicalEvents: {name: "Medical Events", count: 0},
  });
  const [summaryLoading, setSummaryLoading] = useState({
    appointments: true,
    medicalRegistrations: true,
    medicalEvents: true,
  });

  // Đổi tab mặc định nếu cần
  const [tab, setTab] = useState("rounds");
  const [details, setDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(true);

  const [vaccinationList, setVaccinationList] = useState([]);
  const [vaccinationLoading, setVaccinationLoading] = useState(false);

  const [healthCheckList, setHealthCheckList] = useState([]);
  const [healthCheckLoading, setHealthCheckLoading] = useState(false);

  // Thêm state cho tháng được chọn
  const monthOptions = getMonthOptions();
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]);
  const from = selectedMonth.from;
  const to = selectedMonth.to;

  // Fetch summary cards
  useEffect(() => {
    if (!nurseId) return;
    const fetchAppointments = async () => {
      setSummaryLoading((prev) => ({...prev, appointments: true}));
      try {
        const res = await axiosInstance.get(
          `/api/nurses/${nurseId}/dashboards/appoiments`,
          {
            params: {From: from, To: to},
          }
        );
        setSummary((prev) => ({
          ...prev,
          appointments: res.data?.item || {name: "Appointment", count: 0},
        }));
      } finally {
        setSummaryLoading((prev) => ({...prev, appointments: false}));
      }
    };
    const fetchMedicalRegistrations = async () => {
      setSummaryLoading((prev) => ({...prev, medicalRegistrations: true}));
      try {
        const res = await axiosInstance.get(
          `/api/nurses/${nurseId}/dashboards/medical-registations`,
          {
            params: {From: from, To: to},
          }
        );
        setSummary((prev) => ({
          ...prev,
          medicalRegistrations: res.data?.item || {
            name: "Medical Registration",
            count: 0,
          },
        }));
      } finally {
        setSummaryLoading((prev) => ({...prev, medicalRegistrations: false}));
      }
    };
    const fetchMedicalEvents = async () => {
      setSummaryLoading((prev) => ({...prev, medicalEvents: true}));
      try {
        const res = await axiosInstance.get(
          `/api/nurses/${nurseId}/dashboards/medical-events`,
          {
            params: {From: from, To: to},
          }
        );
        setSummary((prev) => ({
          ...prev,
          medicalEvents: res.data?.item || {name: "Medical Events", count: 0},
        }));
      } finally {
        setSummaryLoading((prev) => ({...prev, medicalEvents: false}));
      }
    };

    fetchAppointments();
    fetchMedicalRegistrations();
    fetchMedicalEvents();
  }, [from, to, nurseId]);

  // Fetch tab details
  useEffect(() => {
    if (!nurseId) return;
    setDetailsLoading(true);

    // Gộp logic fetch cho tab rounds
    if (tab === "rounds") {
      setVaccinationLoading(true);
      setHealthCheckLoading(true);

      axiosInstance
        .get(`/api/nurses/${nurseId}/dashboards/vaccinations`, {
          params: {From: from, To: to},
        })
        .then((res) => {
          setVaccinationList(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => setVaccinationList([]))
        .finally(() => setVaccinationLoading(false));

      axiosInstance
        .get(`/api/nurses/${nurseId}/dashboards/health-checks`, {
          params: {From: from, To: to},
        })
        .then((res) => {
          setHealthCheckList(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => setHealthCheckList([]))
        .finally(() => {
          setHealthCheckLoading(false);
          setDetailsLoading(false);
        });

      return;
    }

    let api = "";
    if (tab === "appointments")
      api = `/api/nurses/${nurseId}/dashboards/appoiments/details`;
    else if (tab === "medicalRegistrations")
      api = `/api/nurses/${nurseId}/dashboards/medical-registations/details`;
    else if (tab === "medicalEvents")
      api = `/api/nurses/${nurseId}/dashboards/medical-events/details`;
    if (!api) {
      setDetails([]);
      setDetailsLoading(false);
      return;
    }
    axiosInstance
      .get(api, {params: {From: from, To: to}})
      .then((res) => {
        if (Array.isArray(res.data)) {
          setDetails(res.data.map((x) => x.item));
        } else if (res.data?.item) {
          setDetails([res.data.item]);
        } else {
          setDetails([]);
        }
      })
      .catch(() => setDetails([]))
      .finally(() => setDetailsLoading(false));
  }, [tab, from, to, nurseId]);

  const totalDetailCount = details.reduce(
    (sum, item) => sum + (item.count || 0),
    0
  );

  // Xác định status chính cho từng tab
  const getMainStatus = (tab) => {
    if (tab === "appointments") return "Confirmed";
    if (tab === "medicalRegistrations") return "Approved";
    if (tab === "medicalEvents") return "Participated";
    return "";
  };

  // Đặt nhãn cho chart theo tab
  const getChartTitle = (tab) => {
    if (tab === "appointments") return "Appointment Participation";
    if (tab === "medicalRegistrations")
      return "Medical Registration Participation";
    if (tab === "medicalEvents") return "Medical Event Participation";
    return "";
  };

  // Chuẩn hóa status cho trục x
  function normalizeStatus(name = "") {
    const lower = name.toLowerCase();
    if (lower.includes("pending")) return "Pending";
    if (lower.includes("confirm")) return "Confirmed";
    if (lower.includes("approve")) return "Approved";
    if (lower.includes("not completed")) return "Not Completed";
    if (lower.includes("completed")) return "Completed";
    if (lower.includes("participated")) return "Participated";
    return name;
  }

  // Gom nhóm count theo status chuẩn
  const statusCountMap = {};
  details.forEach((item) => {
    const status = normalizeStatus(item.name);
    if (!statusCountMap[status]) statusCountMap[status] = 0;
    statusCountMap[status] += item.count || 0;
  });

  // Tùy tab, lấy đúng labels, data và màu cho chart
  let chartLabels = [];
  let chartDataArr = [];
  let chartColorsArr = [];
  if (tab === "medicalEvents") {
    chartLabels = details.map((item) => item.name);
    chartDataArr = details.map((item) => item.count || 0);
    chartColorsArr = details.map((item) => {
      const status = normalizeStatus(item.name);
      return STATUS_COLOR_MAP[status] || "#6b7280";
    });
  } else {
    const mainStatus = getMainStatus(tab);
    chartLabels = ["Pending", mainStatus, "Not Completed", "Completed"];
    chartDataArr = [
      statusCountMap["Pending"] || 0,
      statusCountMap[mainStatus] || 0,
      statusCountMap["Not Completed"] || 0,
      statusCountMap["Completed"] || 0,
    ];
    chartColorsArr = chartLabels.map(
      (status) => STATUS_COLOR_MAP[status] || "#6b7280"
    );
  }

  const chartRef = useRef(null);

  // Vẽ chartjs Bar chart thuần
  useEffect(() => {
    if (!chartRef.current || !details.length) return;
    // Xóa chart cũ nếu có
    if (chartRef.current._chartInstance) {
      chartRef.current._chartInstance.destroy();
    }
    const ctx = chartRef.current.getContext("2d");
    chartRef.current._chartInstance = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: "Status Count",
            data: chartDataArr,
            backgroundColor: chartColorsArr, // Sử dụng màu đã mapping
            borderRadius: 8,
            maxBarThickness: 60,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {display: false},
          tooltip: {enabled: true},
        },
        scales: {
          x: {
            grid: {display: false},
            ticks: {color: "#374151", font: {size: 16, weight: "bold"}},
          },
          y: {
            beginAtZero: true,
            grid: {color: "#e5e7eb"},
            ticks: {
              color: "#374151",
              font: {size: 16, weight: "bold"},
              stepSize: 1,
            },
          },
        },
      },
    });
    // Cleanup khi unmount
    return () => {
      if (chartRef.current && chartRef.current._chartInstance) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        chartRef.current._chartInstance.destroy();
      }
    };
    // eslint-disable-next-line
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(chartLabels),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(chartDataArr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(chartColorsArr),
  ]);

  const getDateRange = (str) => {
    if (!str) return "";
    const idx = str.indexOf(" in ");
    return idx !== -1 ? str.slice(idx + 1) : "";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        {/* Divider trên cùng cho toàn bộ dashboard */}
        <Divider
          orientation="center"
          orientationMargin={0}
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#355383",
            margin: "24px 0 32px 0",
            borderColor: "#e5e7eb",
            background: "transparent",
            display: "flex",
            alignItems: "center",
          }}
        >
          Nurse Dashboard
        </Divider>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              window.innerWidth >= 768 ? "repeat(3, 1fr)" : "1fr",
            gap: "32px",
            marginBottom: "32px",
            width: "100%",
          }}
        >
          <SummaryCard
            title={
              <div>
                <div
                  style={{fontSize: "25px", fontWeight: 700, marginBottom: 4}}
                >
                  Total Appointment
                </div>
                <span
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "18px",
                    fontWeight: 600,
                  }}
                >
                  {getDateRange(summary.appointments.name)}
                </span>
              </div>
            }
            count={summary.appointments.count}
            loading={summaryLoading.appointments}
            icon={Calendar}
            gradient="from-blue-500 to-blue-600"
          />
          <SummaryCard
            title={
              <div>
                <div
                  style={{fontSize: "25px", fontWeight: 700, marginBottom: 4}}
                >
                  Medical Registration
                </div>
                <span
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "18px",
                    fontWeight: 600,
                  }}
                >
                  {getDateRange(summary.appointments.name)}
                </span>
              </div>
            }
            count={summary.medicalRegistrations.count}
            loading={summaryLoading.medicalRegistrations}
            icon={Users}
            gradient="from-purple-500 to-purple-600"
          />
          <SummaryCard
            title={
              <div>
                <div
                  style={{fontSize: "25px", fontWeight: 700, marginBottom: 4}}
                >
                  Medical Event
                </div>
                <span
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "18px",
                    fontWeight: 600,
                  }}
                >
                  {getDateRange(summary.appointments.name)}
                </span>
              </div>
            }
            count={summary.medicalEvents.count}
            loading={summaryLoading.medicalEvents}
            icon={TrendingUp}
            gradient="from-emerald-500 to-emerald-600"
          />
        </div>

        {/* Divider cho phần chi tiết bên dưới */}
        <Divider
          orientation="center"
          orientationMargin={0}
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#355383",
            margin: "24px 0 32px 0",
            borderColor: "#e5e7eb",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{fontWeight: 800, color: "#355383"}}>
              Details & Statistics
            </span>
          </div>
        </Divider>
        <style>
          {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
        </style>

        {/* Tabs */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "18px",
            boxShadow:
              "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "18px",
              backgroundColor: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
              fontSize: "20px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div style={{display: "flex", flexWrap: "wrap", gap: 0, flex: 1}}>
              {TABS.map((t) => (
                <TabButton
                  key={t.key}
                  tab={t.key}
                  currentTab={tab}
                  onClick={() => setTab(t.key)}
                  icon={t.icon}
                  label={t.label}
                />
              ))}
            </div>
            <div style={{position: "relative", minWidth: 180, marginLeft: 16}}>
              <select
                value={selectedMonth.value}
                onChange={(e) => {
                  const opt = monthOptions.find(
                    (m) => m.value === e.target.value
                  );
                  if (opt) setSelectedMonth(opt);
                }}
                style={{
                  padding: "8px 36px 8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#374151",
                  background: "#f9fafb",
                  appearance: "none",
                  outline: "none",
                  minWidth: 160,
                  cursor: "pointer",
                }}
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  width: 20,
                  height: 20,
                  color: "#6b7280",
                }}
              />
            </div>
          </div>
          <div
            style={{
              padding: "36px",
              flex: 1,
              minHeight: "350px",
              display: "flex",
              flexDirection: "column",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div style={{width: "100%"}}>
              {/* Tiêu đề cùng hàng */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 40,
                  marginBottom: 32,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    flex: 1,
                  }}
                >
                  {React.createElement(
                    TABS.find((t) => t.key === tab)?.icon || Activity,
                    {
                      style: {width: "32px", height: "32px", color: "#3b82f6"},
                    }
                  )}
                  <h2
                    style={{
                      fontSize: "18px",
                      fontWeight: "800",
                      color: "#111827",
                      margin: 0,
                    }}
                  >
                    {TABS.find((t) => t.key === tab)?.label} Status
                  </h2>
                </div>
                <div style={{flex: 1}}>
                  <h2
                    style={{
                      fontSize: "18px",
                      fontWeight: "800",
                      color: "#355383",
                      margin: 0,
                      textAlign: "left",
                    }}
                  >
                    {getChartTitle(tab)}
                  </h2>
                </div>
              </div>
              {/* 2 cột content và chart */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 40,
                  alignItems: "flex-start",
                  minHeight: 440,
                }}
              >
                {/* Cột bên trái */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    minHeight: 440,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                  }}
                >
                  {detailsLoading ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        padding: "48px 0",
                      }}
                    >
                      <LoadingSpinner />
                    </div>
                  ) : tab === "rounds" ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 40,
                        minHeight: 440,
                      }}
                    >
                      {/* Vaccinations bên trái với scroll riêng */}
                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                          minHeight: 440,
                          maxHeight: 440,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-start",
                          overflowY: "auto",
                          paddingRight: 8,
                        }}
                      >
                        <h3
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: "#3b82f6",
                            margin: "0 0 18px 0",
                          }}
                        >
                          Vaccinations
                        </h3>
                        {vaccinationLoading ? (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              padding: "24px 0",
                            }}
                          >
                            <LoadingSpinner />
                          </div>
                        ) : vaccinationList.length > 0 ? (
                          vaccinationList.map((item, idx) => (
                            <VaccinationItem key={idx} item={item} />
                          ))
                        ) : (
                          <div
                            style={{
                              textAlign: "center",
                              padding: "24px 0",
                              color: "#6b7280",
                            }}
                          >
                            <Syringe
                              style={{
                                width: "48px",
                                height: "48px",
                                margin: "0 auto 16px",
                                color: "#d1d5db",
                              }}
                            />
                            <p style={{margin: 0}}>No vaccination data</p>
                          </div>
                        )}
                      </div>
                      {/* HealthCheck bên phải với scroll riêng */}
                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                          minHeight: 440,
                          maxHeight: 440,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-start",
                          overflowY: "auto",
                          paddingRight: 8,
                        }}
                      >
                        <h3
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: "#ef4444",
                            margin: "0 0 18px 0",
                          }}
                        >
                          Health Check
                        </h3>
                        {healthCheckLoading ? (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              padding: "24px 0",
                            }}
                          >
                            <LoadingSpinner />
                          </div>
                        ) : healthCheckList.length > 0 ? (
                          healthCheckList.map((item, idx) => (
                            <HealthCheckItem key={idx} item={item} />
                          ))
                        ) : (
                          <div
                            style={{
                              textAlign: "center",
                              padding: "24px 0",
                              color: "#6b7280",
                            }}
                          >
                            <Heart
                              style={{
                                width: "48px",
                                height: "48px",
                                margin: "0 auto 16px",
                                color: "#fecaca",
                              }}
                            />
                            <p style={{margin: 0}}>No health check data</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : details.length > 0 ? (
                    details.map((item) => (
                      <StatusItem
                        key={item.name}
                        item={item}
                        totalCount={totalDetailCount}
                      />
                    ))
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "48px 0",
                        color: "#6b7280",
                      }}
                    >
                      <Activity
                        style={{
                          width: "48px",
                          height: "48px",
                          margin: "0 auto 16px",
                          color: "#d1d5db",
                        }}
                      />
                      <p style={{margin: 0}}>No data available</p>
                    </div>
                  )}
                </div>
                {/* Cột bên phải: chỉ hiện chart cho appointments, medicalRegistrations, medicalEvents */}
                {(tab === "appointments" ||
                  tab === "medicalRegistrations" ||
                  tab === "medicalEvents") && (
                  <div
                    style={{
                      flex: 1,
                      background: "#f9fafb",
                      borderRadius: 16,
                      padding: 24,
                      minHeight: 440,
                      boxShadow: "0 1px 4px #e5e7eb",
                      display: "flex",
                      flexDirection: "column",
                      minWidth: 0,
                      justifyContent: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        borderBottom: "1px solid #e5e7eb",
                        marginBottom: 16,
                        marginLeft: 0,
                      }}
                    />
                    <div
                      style={{
                        width: "100%",
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {details.length > 0 ? (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <canvas
                            ref={chartRef}
                            width={1}
                            height={1}
                            style={{
                              width: "100%",
                              height: "320px",
                              maxWidth: "100%",
                              maxHeight: "100%",
                              background: "transparent",
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            color: "#bbb",
                            textAlign: "center",
                            width: "100%",
                          }}
                        >
                          <div style={{fontSize: 48, marginBottom: 12}}>📊</div>
                          No chart data
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
