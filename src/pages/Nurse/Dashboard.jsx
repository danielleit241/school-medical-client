import React, { useEffect, useState } from "react"
import { Calendar, Users, Activity, Syringe, Heart, Clock, TrendingUp } from "lucide-react"
import axiosInstance from "../../api/axios"
import dayjs from "dayjs"
import { useSelector } from "react-redux"

const TABS = [
  { key: "appointments", label: "Appointment", icon: Calendar },
  { key: "medicalRegistrations", label: "Medical Registration", icon: Users },
  { key: "medicalEvents", label: "Medical Event", icon: Activity },
  { key: "vaccinations", label: "Vaccinations", icon: Syringe },
  { key: "healthChecks", label: "Health Check", icon: Heart },
]

const STATUS_COLORS = {
  Completed: "#10b981",
  Confirm: "#3b82f6",
  Pending: "#f59e0b",
  "Not Completed": "#6b7280",
}

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
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "20px", fontWeight: 600, margin: 0 }}>{title}</p>
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
        padding: "8px 20px", // giảm padding cho gọn
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
const VaccinationItem = ({ item }) => (
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
      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#16a34a", fontSize: "18px" }}>
        <Clock style={{ width: "20px", height: "20px" }} />
        <span style={{ fontWeight: 600 }}>{item.daylefts ?? "N/A"} days left</span>
      </div>
    </div>
  </div>
)

// HealthCheckItem: style inline
const HealthCheckItem = ({ item }) => (
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
      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#dc2626", fontSize: "18px" }}>
        <Clock style={{ width: "20px", height: "20px" }} />
        <span style={{ fontWeight: 600 }}>{item.daylefts ?? "N/A"} days left</span>
      </div>
    </div>
  </div>
)

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

  const [tab, setTab] = useState("appointments")
  const [details, setDetails] = useState([])
  const [detailsLoading, setDetailsLoading] = useState(true)

  const [vaccinationList, setVaccinationList] = useState([])
  const [vaccinationLoading, setVaccinationLoading] = useState(false)

  const [healthCheckList, setHealthCheckList] = useState([])
  const [healthCheckLoading, setHealthCheckLoading] = useState(false)

  const from = dayjs().startOf("month").format("YYYY-MM-DD")
  const to = dayjs().endOf("month").format("YYYY-MM-DD")

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

    if (tab === "vaccinations") {
      setVaccinationLoading(true)
      axiosInstance
        .get(`/api/nurses/${nurseId}/dashboards/vaccinations`, { params: { From: from, To: to } })
        .then((res) => {
          setVaccinationList(Array.isArray(res.data) ? res.data : [])
        })
        .catch(() => setVaccinationList([]))
        .finally(() => {
          setVaccinationLoading(false)
          setDetailsLoading(false)
        })
      return
    }

    if (tab === "healthChecks") {
      setHealthCheckLoading(true)
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
            title={summary.appointments.name}
            count={summary.appointments.count}
            loading={summaryLoading.appointments}
            icon={Calendar}
            gradient="from-blue-500 to-blue-600"
          />
          <SummaryCard
            title={summary.medicalRegistrations.name}
            count={summary.medicalRegistrations.count}
            loading={summaryLoading.medicalRegistrations}
            icon={Users}
            gradient="from-purple-500 to-purple-600"
          />
          <SummaryCard
            title={summary.medicalEvents.name}
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
              flexWrap: "wrap",
              gap: "16px",
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
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
              {React.createElement(TABS.find((t) => t.key === tab)?.icon || Activity, {
                style: { width: "28px", height: "28px", color: "#3b82f6" },
              })}
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: 0 }}>
                {TABS.find((t) => t.key === tab)?.label} Status
              </h2>
            </div>

            {/* Content based on tab */}
            {tab === "vaccinations" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {vaccinationLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
                    <LoadingSpinner />
                  </div>
                ) : vaccinationList.length > 0 ? (
                  vaccinationList.map((item, idx) => <VaccinationItem key={idx} item={item} />)
                ) : (
                  <div style={{ textAlign: "center", padding: "48px 0", color: "#6b7280" }}>
                    <Syringe style={{ width: "48px", height: "48px", margin: "0 auto 16px", color: "#d1d5db" }} />
                    <p style={{ margin: 0 }}>No vaccination data available</p>
                  </div>
                )}
              </div>
            ) : tab === "healthChecks" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {healthCheckLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
                    <LoadingSpinner />
                  </div>
                ) : healthCheckList.length > 0 ? (
                  healthCheckList.map((item, idx) => <HealthCheckItem key={idx} item={item} />)
                ) : (
                  <div style={{ textAlign: "center", padding: "48px 0", color: "#6b7280" }}>
                    <Heart style={{ width: "48px", height: "48px", margin: "0 auto 16px", color: "#d1d5db" }} />
                    <p style={{ margin: 0 }}>No health check data available</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {detailsLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
                    <LoadingSpinner />
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
            )}
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
