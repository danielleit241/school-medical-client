"use client"

import { useEffect, useState } from "react"
import axiosInstance from "../../../../api/axios"
import { Button, Spin, Empty, DatePicker, Input, Card, Avatar, Badge } from "antd"
import dayjs from "dayjs"
import { useSelector } from "react-redux"
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  FilterOutlined,
  EyeOutlined,
} from "@ant-design/icons"

const statusConfig = {
  Completed: {
    color: "#10b981",
    bgColor: "#ecfdf5",
    borderColor: "#a7f3d0",
    icon: <CheckCircleOutlined />,
    text: "Completed",
  },
  Confirmed: {
    color: "#3b82f6",
    bgColor: "#eff6ff",
    borderColor: "#bfdbfe",
    icon: <ExclamationCircleOutlined />,
    text: "Confirmed",
  },
  Pending: {
    color: "#f59e0b",
    bgColor: "#fffbeb",
    borderColor: "#fed7aa",
    icon: <SyncOutlined />,
    text: "Pending",
  },
}

const AppointmentList = () => {
  const staffNurseId = useSelector((state) => state.user?.userId)

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [dateRequest, setDateRequest] = useState(dayjs().format("YYYY-MM-DD"))
  const [pageIndex, setPageIndex] = useState(1)

  useEffect(() => {
    if (step !== 1 || !staffNurseId) return
    const fetchAppointments = async () => {
      setLoading(true)
      try {
        const response = await axiosInstance.get(`/api/nurses/${staffNurseId}/appointments`, {
          params: { dateRequest, PageSize: 10, PageIndex: pageIndex },
        })
        const data = Array.isArray(response.data) ? response.data : response.data?.items || []
        setAppointments(data)
      } catch {
        setAppointments([])
      } finally {
        setLoading(false)
      }
    }
    fetchAppointments()
  }, [staffNurseId, dateRequest, pageIndex, step])

  const updateStatus = async (appointmentId, confirmationStatus, completionStatus) => {
    if (step === 2 && selectedAppointment) {
      setSelectedAppointment((prev) => ({
        ...prev,
        confirmationStatus,
        completionStatus,
      }))
    }
    try {
      const res = await axiosInstance.put(`/api/nurses/appointments/${appointmentId}`, {
        staffNurseId,
        confirmationStatus,
        completionStatus,
      })
      const { notificationTypeId, senderId, receiverId } = res.data
      await axiosInstance.post("/api/notification/appoiments/to-parent", { notificationTypeId, senderId, receiverId })
    } catch {
      console.error("Error updating appointment status")
    }
  }

  const handleDetail = async (appointmentId) => {
    setDetailLoading(true)
    try {
      const response = await axiosInstance.get(`/api/nurses/${staffNurseId}/appointments/${appointmentId}`)
      setSelectedAppointment({ ...(response.data.item || response.data) })
      if (step !== 2) setStep(2)
    } catch {
      setSelectedAppointment(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const getStatus = (item) => {
    if (item.completionStatus) return statusConfig.Completed
    if (item.confirmationStatus) return statusConfig.Confirmed
    return statusConfig.Pending
  }

  const AppointmentCard = ({ item }) => {
    const status = getStatus(item);

    return (
      <Card
        className="appointment-card"
        style={{
          marginBottom: 20,
          borderRadius: 16,
          border: `2px solid ${status.borderColor}`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          transition: "all 0.3s ease",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        }}
        bodyStyle={{ padding: "28px 32px" }} // tăng padding cho nổi bật hơn
        hoverable
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ flex: 1 }}>
            {/* Student Info */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
              <Avatar
                size={56}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: "#4f46e5",
                  marginRight: 20,
                  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
                }}
              />
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 28, // tăng font size
                    fontWeight: 700,
                    color: "#1f2937",
                    lineHeight: 1.2,
                  }}
                >
                  {item.student?.fullName || "No name"}
                </h3>
                {/* Bỏ studentId */}
              </div>
            </div>

            {/* Appointment Details */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 20,
                marginBottom: 22,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <CalendarOutlined style={{ color: "#4f46e5", fontSize: 22 }} />
                <span style={{ color: "#374151", fontWeight: 600, fontSize: 17 }}>
                  {dayjs(item.appointmentDate).format("MMM DD, YYYY")}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ClockCircleOutlined style={{ color: "#4f46e5", fontSize: 22 }} />
                <span style={{ color: "#374151", fontWeight: 600, fontSize: 17 }}>
                  {item.appointmentStartTime?.slice(0, 5)} - {item.appointmentEndTime?.slice(0, 5)}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <FileTextOutlined style={{ color: "#4f46e5", fontSize: 22 }} />
                <span style={{ color: "#374151", fontWeight: 600, fontSize: 17 }}>
                  {item.topic || "General Consultation"}
                </span>
              </div>
            </div>

            {/* Reason Preview */}
            {item.appointmentReason && (
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  padding: 16,
                  borderRadius: 10,
                  marginBottom: 18,
                  border: "1px solid #e2e8f0",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: 16,
                    fontStyle: "italic",
                  }}
                >
                  "
                  {item.appointmentReason.length > 100
                    ? item.appointmentReason.substring(0, 100) + "..."
                    : item.appointmentReason}
                  "
                </p>
              </div>
            )}
          </div>

          {/* Status and Actions */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 18 }}>
            <Badge
              count={
                <div
                  style={{
                    backgroundColor: status.bgColor,
                    color: status.color,
                    border: `2px solid ${status.color}`,
                    borderRadius: 22,
                    padding: "8px 20px",
                    fontSize: 16,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    minWidth: 110,
                    justifyContent: "center",
                  }}
                >
                  {status.icon}
                  {status.text}
                </div>
              }
              showZero
            />

            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleDetail(item.appointmentId)}
              style={{
                borderRadius: 12,
                fontWeight: 700,
                height: 46,
                fontSize: 17,
                paddingLeft: 28,
                paddingRight: 28,
                background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
                border: "none",
                boxShadow: "0 4px 15px rgba(79, 70, 229, 0.3)",
                transition: "all 0.3s ease",
              }}
            >
              View Details
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const DetailView = () => {
    const status = getStatus(selectedAppointment)

    return (
      <div
        style={{
          width: "100%", // mở rộng full ngang
          margin: 0,     // bỏ căn giữa
          maxWidth: "none",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 32,
            padding: "0 8px",
          }}
        >
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => setStep(1)}
            style={{
              marginRight: 16,
              borderRadius: 10,
              height: 40,
              paddingLeft: 16,
              paddingRight: 16,
              border: "2px solid #e5e7eb",
              fontWeight: 600,
            }}
          >
            Back to List
          </Button>
          <h2
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              color: "#1f2937",
            }}
          >
            Appointment Details
          </h2>
        </div>

        {/* Main Detail Card */}
        <Card
          style={{
            borderRadius: 20,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            width: "100%", // full width tới 2 viền xanh
            margin: 0,
          }}
          bodyStyle={{ padding: "40px 48px" }}
        >
          {/* Student Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 32,
              paddingBottom: 24,
              borderBottom: "2px solid #f1f5f9",
            }}
          >
            <Avatar
              size={64}
              icon={<UserOutlined />}
              style={{
                backgroundColor: "#4f46e5",
                marginRight: 20,
                boxShadow: "0 6px 20px rgba(79, 70, 229, 0.4)",
              }}
            />
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#1f2937",
                  lineHeight: 1.2,
                }}
              >
                {selectedAppointment.student?.fullName || "Unknown Student"}
              </h1>
            </div>
            <div
              style={{
                backgroundColor: status.bgColor,
                color: status.color,
                border: `3px solid ${status.color}`,
                borderRadius: 25,
                padding: "12px 24px",
                fontSize: 16,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {status.icon}
              {status.text}
            </div>
          </div>

          {/* Appointment Information Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 24,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: 24,
                borderRadius: 16,
                border: "2px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <CalendarOutlined style={{ color: "#4f46e5", fontSize: 20, marginRight: 12 }} />
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#374151" }}>Appointment Date</h4>
              </div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1f2937" }}>
                {dayjs(selectedAppointment.appointmentDate).format("dddd, MMMM DD, YYYY")}
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: 24,
                borderRadius: 16,
                border: "2px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <ClockCircleOutlined style={{ color: "#4f46e5", fontSize: 20, marginRight: 12 }} />
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#374151" }}>Time Slot</h4>
              </div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1f2937" }}>
                {selectedAppointment.appointmentStartTime?.slice(0, 5)} -{" "}
                {selectedAppointment.appointmentEndTime?.slice(0, 5)}
              </p>
            </div>
          </div>

          {/* Topic and Reason */}
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                backgroundColor: "#f0f9ff",
                padding: 24,
                borderRadius: 16,
                border: "2px solid #bae6fd",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <FileTextOutlined style={{ color: "#0284c7", fontSize: 20, marginRight: 12 }} />
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0c4a6e" }}>Consultation Topic</h4>
              </div>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#0c4a6e" }}>
                {selectedAppointment.topic || "General Health Consultation"}
              </p>
            </div>

            {selectedAppointment.appointmentReason && (
              <div
                style={{
                  backgroundColor: "#fefce8",
                  padding: 24,
                  borderRadius: 15,
                  border: "2px solid #fde047",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#a16207",
                  }}
                >
                  Reason for Visit
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: 16,
                    lineHeight: 1.6,
                    color: "#a16207",
                    fontWeight: 500,
                  }}
                >
                  {selectedAppointment.appointmentReason}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "flex-end",
              paddingTop: 24,
              borderTop: "2px solid #f1f5f9",
            }}
          >
            {!selectedAppointment.confirmationStatus && (
              <Button
                type="primary"
                size="large"
                icon={<CheckCircleOutlined />}
                onClick={() => updateStatus(selectedAppointment.appointmentId, true, false)}
                style={{
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 16,
                  height: 48,
                  paddingLeft: 24,
                  paddingRight: 24,
                  background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(5, 150, 105, 0.4)",
                }}
              >
                Confirm Appointment
              </Button>
            )}

            {selectedAppointment.confirmationStatus && !selectedAppointment.completionStatus && (
              <Button
                type="primary"
                size="large"
                icon={<CheckCircleOutlined />}
                onClick={() => updateStatus(selectedAppointment.appointmentId, true, true)}
                style={{
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 16,
                  height: 48,
                  paddingLeft: 24,
                  paddingRight: 24,
                  background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(124, 58, 237, 0.4)",
                }}
              >
                Mark as Complete
              </Button>
            )}
          </div>
        </Card>
      </div>
    )

  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6", // Đổi về màu nền xám nhạt giống CampaignList.jsx
        padding: "0",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)", // Đồng bộ gradient xanh với CampaignList.jsx
          padding: "48px 32px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            fontSize: 38,
            fontWeight: 800,
            margin: "0 0 16px 0",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            letterSpacing: "1px",
          }}
        >
          🏥 Nurse Appointment Dashboard
        </h1>
        <p
          style={{
            fontSize: 20,
            fontWeight: 500,
            margin: "0 0 20px 0",
            opacity: 0.9,
            maxWidth: 600,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Manage student health appointments with ease and efficiency
        </p>
        {step === 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <FilterOutlined style={{ fontSize: 18 }} />
              <DatePicker
                value={dayjs(dateRequest)}
                format="YYYY-MM-DD"
                onChange={(_, dateString) => setDateRequest(dateString)}
                allowClear={false}
                size="large"
                style={{
                  width: 200,
                  borderRadius: 10,
                }}
              />
            </div>
            <Input
              type="number"
              min={1}
              value={pageIndex}
              onChange={(e) => setPageIndex(Number(e.target.value))}
              size="large"
              style={{
                width: 120,
                borderRadius: 10,
              }}
              placeholder="Page #"
              prefix="📄"
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div
        style={{
          padding: "40px 0",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        {step === 1 ? (
          <>
            {/* Stats Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start", // không căn giữa
                marginBottom: 32,
                gap: 20,
                flexWrap: "wrap",
                width: "100%",
              }}
            >
              <div
                style={{
                  backgroundColor: "white",
                  padding: "20px 32px",
                  borderRadius: 16,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  textAlign: "center",
                  minWidth: 150,
                  flex: 1, // mở rộng full chiều ngang
                }}
              >
                <h3 style={{ margin: "0 0 8px 0", fontSize: 28, fontWeight: 700, color: "#1f2937" }}>
                  {appointments.length}
                </h3>
                <p style={{ margin: 0, color: "#6b7280", fontWeight: 600 }}>Total Appointments</p>
              </div>
              <div
                style={{
                  backgroundColor: "white",
                  padding: "20px 32px",
                  borderRadius: 16,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  textAlign: "center",
                  minWidth: 150,
                  flex: 1,
                }}
              >
                <h3 style={{ margin: "0 0 8px 0", fontSize: 28, fontWeight: 700, color: "#059669" }}>
                  {appointments.filter((apt) => apt.completionStatus).length}
                </h3>
                <p style={{ margin: 0, color: "#6b7280", fontWeight: 600 }}>Completed</p>
              </div>
              <div
                style={{
                  backgroundColor: "white",
                  padding: "20px 32px",
                  borderRadius: 16,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  textAlign: "center",
                  minWidth: 150,
                  flex: 1,
                }}
              >
                <h3 style={{ margin: "0 0 8px 0", fontSize: 28, fontWeight: 700, color: "#f59e0b" }}>
                  {appointments.filter((apt) => !apt.confirmationStatus).length}
                </h3>
                <p style={{ margin: 0, color: "#6b7280", fontWeight: 600 }}>Pending</p>
              </div>
            </div>

            {/* Appointments List */}
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px 0",
                  backgroundColor: "white",
                  borderRadius: 20,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  margin: "0 32px",
                }}
              >
                <Spin size="large" />
                <p style={{ marginTop: 20, fontSize: 16, color: "#6b7280" }}>Loading appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: 20,
                  padding: "80px 40px",
                  textAlign: "center",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  margin: "0 32px",
                }}
              >
                <Empty
                  description={
                    <span style={{ fontSize: 18, color: "#6b7280", fontWeight: 500 }}>
                      No appointments found for {dayjs(dateRequest).format("MMMM DD, YYYY")}
                    </span>
                  }
                  style={{ fontSize: 18 }}
                />
              </div>
            ) : (
              <div
                style={{
                  maxHeight: "650px",
                  overflowY: "auto",
                  padding: "32px 0",
                  boxSizing: "border-box",
                  
                }}
              >
                {appointments.map((item) => (
                  <div style={{ 
                    width: "100%",
                    padding: "0 32px",
                    display: "flex", 
                    flexDirection: "column",
                    gap: 20,                  
                    }} 
                    key={item.appointmentId}>
                    <AppointmentCard item={item} />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : detailLoading ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px 0",
              backgroundColor: "white",
              borderRadius: 20,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              margin: "0 32px",
            }}
          >
            <Spin size="large" />
            <p style={{ marginTop: 20, fontSize: 16, color: "#6b7280" }}>Loading appointment details...</p>
          </div>
        ) : selectedAppointment ? (
          <div style={{ width: "100%" }}>
            <DetailView />
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: "80px 40px",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              margin: "0 32px",
            }}
          >
            <Empty description="Appointment not found" />
          </div>
        )}
      </div>
    </div>
  )
}

export default AppointmentList
