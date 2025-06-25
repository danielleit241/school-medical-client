import React, { useEffect, useState, useRef } from "react"
import { Calendar, Users, Activity, Syringe, Heart, Clock, TrendingUp, ChevronDown } from "lucide-react"
import axiosInstance from "../../api/axios"
import dayjs from "dayjs"
import { useSelector } from "react-redux"
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const TABS = [
  { key: "rounds", label: "Rounds", icon: Syringe },
  { key: "appointments", label: "Appointment", icon: Calendar },
  { key: "medicalRegistrations", label: "Medical Registration", icon: Users },
  { key: "medicalEvents", label: "Medical Event", icon: Activity },
];

const STATUS_COLOR_MAP = {
  "Completed": "#10b981",
  "Pending": "#f59e0b",
  "Confirmed": "#3b82f6",
  "Approved": "#3b82f6",
  "Participated": "#3b82f6",
  "Not Completed": "#ef4444",
};

const LoadingSpinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
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
)

// SummaryCard: style inline
// eslint-disable-next-line no-unused-vars
const SummaryCard = ({ title, count, loading, icon: Icon, gradient }) => {
  const gradientStyles = {
    "from-blue-500 to-blue-600": "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    "from-purple-500 to-purple-600": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    "from-emerald-500 to-emerald-600": "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  }
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "20px",
        background: gradientStyles[gradient] || gradientStyles["from-blue-500 to-blue-600"],
        padding: "32px",
        color: "white",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
        transition: "all 0.3s",
        minHeight: "120px",
        cursor: "pointer",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)"
        e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)"
        e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "18px", fontWeight: 600, margin: 0 }}>{title}</p>
          <div style={{ fontSize: "40px", fontWeight: 800, marginTop: "12px" }}>
            {loading ? <LoadingSpinner /> : count}
          </div>
        </div>
        <div style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: "16px", borderRadius: "50%" }}>
          <Icon style={{ width: "32px", height: "32px" }} />
        </div>
      </div>
      <div style={{ position: "absolute", right: "-24px", bottom: "-24px", opacity: 0.18 }}>
        <Icon style={{ width: "96px", height: "96px" }} />
      </div>
    </div>
  )
}

// TabButton: style inline
// eslint-disable-next-line no-unused-vars
const TabButton = ({ tab, currentTab, onClick, icon: Icon, label }) => {
  const isActive = currentTab === tab
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "18px 32px",
        borderRadius: "12px",
        // fontWeight: "700",
        fontSize: "18px",
        border: isActive ? "2px solid #3b82f6" : "2px solid transparent",
        backgroundColor: isActive ? "#3b82f6" : "transparent",
        color: isActive ? "white" : "#374151",
        boxShadow: isActive ? "0 2px 8px 0 rgba(24,144,255,0.10)" : "none",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.color = "#2563eb"
          e.currentTarget.style.backgroundColor = "#f0f6ff"
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.color = "#374151"
          e.currentTarget.style.backgroundColor = "transparent"
        }
      }}
      type="button"
    >
      <Icon style={{ width: "24px", height: "24px", color: isActive ? "white" : "#9ca3af" }} />
      <span style={{ display: window.innerWidth >= 640 ? "inline" : "none" }}>{label}</span>
    </button>
  )
}

// StatusItem: style inline
const StatusItem = ({ item, totalCount }) => {
  const percentage = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0

  const name = (item.name || "").toLowerCase();

  let dotColor = "#6b7280"; // default gray
  if (name.startsWith("completed")) dotColor = "#10b981";      
  else if (name.startsWith("pending")) dotColor = "#f59e0b";   
  else if (name.startsWith("confirm") || name.startsWith("approved")) dotColor = "#3b82f6";   // xanh dương
  else if (name.startsWith("not completed")) dotColor = "red";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "36px 20px", // giảm padding cho gọn
        borderRadius: "12px",
        backgroundColor: "#f9fafb",
        marginBottom: "12px",
        transition: "background 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#f9fafb")}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            backgroundColor: dotColor,
          }}
        ></div>
        <span style={{ fontSize: "16px", color: "#374151", fontWeight: 600 }}>{item.name}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <span style={{ fontSize: "18px", color: "#111827", fontWeight: 700 }}>{item.count}</span>
        {totalCount > 0 && (
          <div
            style={{
              width: "100px",
              backgroundColor: "#e5e7eb",
              borderRadius: "9999px",
              height: "8px",
              position: "relative",
            }}
          >
            <div
              style={{
                height: "8px",
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
  )
}

// VaccinationItem: style inline
const VaccinationItem = ({ item }) => {
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
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "24px",
      background: "linear-gradient(90deg, #f0fdf4 0%, #ecfdf5 100%)",
      borderRadius: "12px",
      border: "1px solid #bbf7d0",
      marginBottom: "12px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        <div style={{ backgroundColor: "#22c55e", padding: "12px", borderRadius: "50%" }}>
          <Syringe style={{ width: "24px", height: "24px", color: "white" }} />
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: "18px", color: "#1f2937", margin: 0 }}>Round: {item.roundName || "N/A"}</p>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: "6px 0 0 0" }}>Start: {item.startDate || "N/A"}</p>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: statusColor, fontSize: "18px" }}>
          <Clock style={{ width: "20px", height: "20px" }} />
          <span style={{ fontWeight: 600 }}>{statusText}</span>
        </div>
      </div>
    </div>
  );
};

const HealthCheckItem = ({ item }) => {
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
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "24px",
      background: "linear-gradient(90deg, #fef2f2 0%, #fef7f7 100%)",
      borderRadius: "12px",
      border: "1px solid #fecaca",
      marginBottom: "12px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        <div style={{ backgroundColor: "#ef4444", padding: "12px", borderRadius: "50%" }}>
          <Heart style={{ width: "24px", height: "24px", color: "white" }} />
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: "20px", color: "#1f2937", margin: 0 }}>Round: {item.roundName || "N/A"}</p>
          <p style={{ fontSize: "16px", color: "#6b7280", margin: "6px 0 0 0" }}>Start: {item.startDate || "N/A"}</p>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: statusColor, fontSize: "18px" }}>
          <Clock style={{ width: "20px", height: "20px" }} />
          <span style={{ fontWeight: 600 }}>{statusText}</span>
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
  const nurseId = useSelector((state) => state.user?.userId)
  const [summary, setSummary] = useState({
    appointments: { name: "Appointment", count: 0 },
    medicalRegistrations: { name: "Medical Registration", count: 0 },
    medicalEvents: { name: "Medical Events", count: 0 },
  })
  const [summaryLoading, setSummaryLoading] = useState({
    appointments: true,
    medicalRegistrations: true,
    medicalEvents: true,
  })

  // Đổi tab mặc định nếu cần
  const [tab, setTab] = useState("rounds")
  const [details, setDetails] = useState([])
  const [detailsLoading, setDetailsLoading] = useState(true)

  const [vaccinationList, setVaccinationList] = useState([])
  const [vaccinationLoading, setVaccinationLoading] = useState(false)

  const [healthCheckList, setHealthCheckList] = useState([])
  const [healthCheckLoading, setHealthCheckLoading] = useState(false)

  // Thêm state cho tháng được chọn
  const monthOptions = getMonthOptions();
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]);
  const from = selectedMonth.from;
  const to = selectedMonth.to;

  // Fetch summary cards
  useEffect(() => {
    if (!nurseId) return
    const fetchAppointments = async () => {
      setSummaryLoading((prev) => ({ ...prev, appointments: true }))
      try {
        const res = await axiosInstance.get(`/api/nurses/${nurseId}/dashboards/appoiments`, {
          params: { From: from, To: to },
        })
        setSummary((prev) => ({
          ...prev,
          appointments: res.data?.item || { name: "Appointment", count: 0 },
        }))
      } finally {
        setSummaryLoading((prev) => ({ ...prev, appointments: false }))
      }
    }
    const fetchMedicalRegistrations = async () => {
      setSummaryLoading((prev) => ({ ...prev, medicalRegistrations: true }))
      try {
        const res = await axiosInstance.get(`/api/nurses/${nurseId}/dashboards/medical-registations`, {
          params: { From: from, To: to },
        })
        setSummary((prev) => ({
          ...prev,
          medicalRegistrations: res.data?.item || { name: "Medical Registration", count: 0 },
        }))
      } finally {
        setSummaryLoading((prev) => ({ ...prev, medicalRegistrations: false }))
      }
    }
    const fetchMedicalEvents = async () => {
      setSummaryLoading((prev) => ({ ...prev, medicalEvents: true }))
      try {
        const res = await axiosInstance.get(`/api/nurses/${nurseId}/dashboards/medical-events`, {
          params: { From: from, To: to },
        })
        setSummary((prev) => ({
          ...prev,
          medicalEvents: res.data?.item || { name: "Medical Events", count: 0 },
        }))
      } finally {
        setSummaryLoading((prev) => ({ ...prev, medicalEvents: false }))
      }
    }

    fetchAppointments()
    fetchMedicalRegistrations()
    fetchMedicalEvents()
  }, [from, to, nurseId])

  // Fetch tab details
  useEffect(() => {
    if (!nurseId) return
    setDetailsLoading(true)

    // Gộp logic fetch cho tab rounds
    if (tab === "rounds") {
      setVaccinationLoading(true)
      setHealthCheckLoading(true)

      axiosInstance
        .get(`/api/nurses/${nurseId}/dashboards/vaccinations`, { params: { From: from, To: to } })
        .then((res) => {
          setVaccinationList(Array.isArray(res.data) ? res.data : [])
        })
        .catch(() => setVaccinationList([]))
        .finally(() => setVaccinationLoading(false))

      axiosInstance
        .get(`/api/nurses/${nurseId}/dashboards/health-checks`, { params: { From: from, To: to } })
        .then((res) => {
          setHealthCheckList(Array.isArray(res.data) ? res.data : [])
        })
        .catch(() => setHealthCheckList([]))
        .finally(() => {
          setHealthCheckLoading(false)
          setDetailsLoading(false)
        })

      return
    }

    let api = ""
    if (tab === "appointments") api = `/api/nurses/${nurseId}/dashboards/appoiments/details`
    else if (tab === "medicalRegistrations") api = `/api/nurses/${nurseId}/dashboards/medical-registations/details`
    else if (tab === "medicalEvents") api = `/api/nurses/${nurseId}/dashboards/medical-events/details`
    if (!api) {
      setDetails([])
      setDetailsLoading(false)
      return
    }
    axiosInstance
      .get(api, { params: { From: from, To: to } })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setDetails(res.data.map((x) => x.item))
        } else if (res.data?.item) {
          setDetails([res.data.item])
        } else {
          setDetails([])
        }
      })
      .catch(() => setDetails([]))
      .finally(() => setDetailsLoading(false))
  }, [tab, from, to, nurseId])

  const totalDetailCount = details.reduce((sum, item) => sum + (item.count || 0), 0)

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
    if (tab === "medicalRegistrations") return "Medical Registration Participation";
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
    chartColorsArr = chartLabels.map((status) => STATUS_COLOR_MAP[status] || "#6b7280");
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
          legend: { display: false },
          tooltip: { enabled: true },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#374151", font: { size: 16, weight: "bold" } },
          },
          y: {
            beginAtZero: true,
            grid: { color: "#e5e7eb" },
            ticks: { color: "#374151", font: { size: 16, weight: "bold" }, stepSize: 1 },
          },
        },
      },
    });
    // Cleanup khi unmount
    return () => {
      if (chartRef.current && chartRef.current._chartInstance) {       
        chartRef.current._chartInstance.destroy();
      }
    };
    // eslint-disable-next-line
  }, [JSON.stringify(chartLabels), JSON.stringify(chartDataArr), JSON.stringify(chartColorsArr)]);

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
      <div style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: window.innerWidth >= 640 ? "row" : "column",
            justifyContent: "space-between",
            alignItems: window.innerWidth >= 640 ? "center" : "flex-start",
            marginBottom: "32px",
            width: "100%",
          }}
        >
          <div>
            <h1 style={{fontWeight: "700", color: "#111827", marginBottom: "8px", margin: 0 }}>
              Nurse Dashboard
            </h1>
          </div>
          {/* Dropdown chọn tháng */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <select
                value={selectedMonth.value}
                onChange={e => {
                  const opt = monthOptions.find(m => m.value === e.target.value);
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
                  cursor: "pointer"
                }}
              >
                {monthOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                width: 20,
                height: 20,
                color: "#6b7280"
              }} />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: "#dcfce7",
                color: "#166534",
                padding: "10px 28px",
                borderRadius: "9999px",
                fontWeight: "600",
                marginTop: window.innerWidth >= 640 ? "0" : "18px",
                fontSize: "20px",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: "#22c55e",
                  borderRadius: "50%",
                  animation: "pulse 2s infinite",
                }}
              ></div>
              Healthcare Nurse
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: window.innerWidth >= 768 ? "repeat(3, 1fr)" : "1fr",
            gap: "32px",
            marginBottom: "32px",
            width: "100%",
          }}
        >
          <SummaryCard
            title={
              <div>
                <div style={{ fontSize: "25px", fontWeight: 700, marginBottom: 4 }}>
                  Total Appointment
                </div>
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "18px", fontWeight: 600 }}>
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
                <div style={{ fontSize: "25px", fontWeight: 700, marginBottom: 4 }}>
                  Medical Registration
                </div>
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "18px", fontWeight: 600 }}>
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
                <div style={{ fontSize: "25px", fontWeight: 700, marginBottom: 4 }}>
                  Medical Event
                </div>
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "18px", fontWeight: 600 }}>
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

        {/* Tabs */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "18px",
            boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)",
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
              justifyContent: "space-evenly",
              flexWrap: "wrap",
              padding: "18px",
              backgroundColor: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
              fontSize: "20px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
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
            <div style={{ width: "100%" }}>
              {/* Tiêu đề cùng hàng */}
              <div style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 40,
                marginBottom: 32,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                  {React.createElement(TABS.find((t) => t.key === tab)?.icon || Activity, {
                    style: { width: "32px", height: "32px", color: "#3b82f6" },
                  })}
                  <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#111827", margin: 0 }}>
                    {TABS.find((t) => t.key === tab)?.label} Status
                  </h2>
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: "#355383",
                    margin: 0,
                    textAlign: "left",
                  }}>
                    {getChartTitle(tab)}
                  </h2>
                </div>
              </div>
              {/* 2 cột content và chart */}
              <div style={{ display: "flex", flexDirection: "row", gap: 40, alignItems: "flex-start", minHeight: 440 }}>
                {/* Cột bên trái */}
                <div style={{
                  flex: 1,
                  minWidth: 0,
                  minHeight: 440,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                }}>
                  {detailsLoading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
                      <LoadingSpinner />
                    </div>
                  ) : tab === "rounds" ? (
                    <div style={{ display: "flex", flexDirection: "row", gap: 40, minHeight: 440 }}>
                      {/* Vaccinations bên trái với scroll riêng */}
                      <div style={{
                        flex: 1,
                        minWidth: 0,
                        minHeight: 440,
                        maxHeight: 440,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        overflowY: "auto",
                        paddingRight: 8,
                      }}>
                        <h3 style={{ fontSize: 22, fontWeight: 700, color: "#3b82f6", margin: "0 0 18px 0" }}>Vaccinations</h3>
                        {vaccinationLoading ? (
                          <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
                            <LoadingSpinner />
                          </div>
                        ) : vaccinationList.length > 0 ? (
                          vaccinationList.map((item, idx) => (
                            <VaccinationItem key={idx} item={item} />
                          ))
                        ) : (
                          <div style={{ textAlign: "center", padding: "24px 0", color: "#6b7280" }}>
                            <Syringe style={{ width: "48px", height: "48px", margin: "0 auto 16px", color: "#d1d5db" }} />
                            <p style={{ margin: 0 }}>No vaccination data</p>
                          </div>
                        )}
                      </div>
                      {/* HealthCheck bên phải với scroll riêng */}
                      <div style={{
                        flex: 1,
                        minWidth: 0,
                        minHeight: 440,
                        maxHeight: 440,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        overflowY: "auto",
                        paddingRight: 8,
                      }}>
                        <h3 style={{ fontSize: 22, fontWeight: 700, color: "#ef4444", margin: "0 0 18px 0" }}>Health Check</h3>
                        {healthCheckLoading ? (
                          <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
                            <LoadingSpinner />
                          </div>
                        ) : healthCheckList.length > 0 ? (
                          healthCheckList.map((item, idx) => (
                            <HealthCheckItem key={idx} item={item} />
                          ))
                        ) : (
                          <div style={{ textAlign: "center", padding: "24px 0", color: "#6b7280" }}>
                            <Heart style={{ width: "48px", height: "48px", margin: "0 auto 16px", color: "#fecaca" }} />
                            <p style={{ margin: 0 }}>No health check data</p>
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
                    <div style={{ textAlign: "center", padding: "48px 0", color: "#6b7280" }}>
                      <Activity style={{ width: "48px", height: "48px", margin: "0 auto 16px", color: "#d1d5db" }} />
                      <p style={{ margin: 0 }}>No data available</p>
                    </div>
                  )}
                </div>
                {/* Cột bên phải: chỉ hiện chart cho appointments, medicalRegistrations, medicalEvents */}
                {(tab === "appointments" || tab === "medicalRegistrations" || tab === "medicalEvents") && (
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
                    <div style={{ width: "100%", flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                      {details.length > 0 ? (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <canvas
                            ref={chartRef}
                            width={1}
                            height={1}
                            style={{
                              width: "100%",
                              height: "320px",
                              maxWidth: "100%",
                              maxHeight: "100%",
                              background: "transparent"
                            }}
                          />
                        </div>
                      ) : (
                        <div style={{ color: "#bbb", textAlign: "center", width: "100%" }}>
                          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
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
  )
}

export default Dashboard
