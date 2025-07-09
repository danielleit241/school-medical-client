"use client";

import { useEffect, useState } from "react";
import axiosInstance from "../../../../api/axios";
import {
  Button,
  Spin,
  Empty,
  DatePicker,
  Input,
  Card,
  Avatar,
  Badge,
  Pagination,
} from "antd";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import Swal from "sweetalert2";

const statusConfig = {
  Cancelled: {
    color: "#dc2626",
    bgColor: "#fef2f2",
    borderColor: "#fed7aa",
    icon: <ExclamationCircleOutlined />,
    text: "Cancelled",
  },
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
};

const AppointmentList = () => {
  const staffNurseId = useSelector((state) => state.user?.userId);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [dateRequestStart, setDateRequestStart] = useState(dayjs().format("YYYY-MM-DD"));
  const [dateRequestEnd, setDateRequestEnd] = useState(dayjs().add(1, 'day').format("YYYY-MM-DD"));
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 4;
  const [parentId, setParentId] = useState(null);
  const [parentInfo, setParentInfo] = useState(null);
  const [total, setTotal] = useState(0);

  const formatPhone = (phone) => {
    if (!phone) return "";
      const digits = phone.replace(/\D/g, "");
      if (digits.length === 10) {
        return `${digits.slice(0,4)}.${digits.slice(4,7)}.${digits.slice(7,10)}`;
      }
      if (digits.length === 11) {
        return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}.${digits.slice(9,11)}`;
      }
        return phone; // fallback
  };

  useEffect(() => {
    if (step !== 1 || !staffNurseId) return;
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/api/nurses/${staffNurseId}/appointments`,
          {
            params: { dateRequestStart, dateRequestEnd, PageSize: pageSize, PageIndex: pageIndex },
          }
        );
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.items || [];
        setAppointments(data);
        setTotal(response.data?.count || 0);
      } catch {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [staffNurseId, dateRequestStart, dateRequestEnd, pageIndex, step]);

  const updateStatus = async (
    appointmentId,
    confirmationStatus,
    completionStatus
  ) => {
    if (step === 2 && selectedAppointment) {
      setSelectedAppointment((prev) => ({
        ...prev,
        confirmationStatus,
        completionStatus,
      }));
    }
    try {
      const res = await axiosInstance.put(
        `/api/nurses/appointments/${appointmentId}`,
        {
          staffNurseId,
          confirmationStatus,
          completionStatus,
        }
      );
      const { notificationTypeId, senderId, receiverId } = res.data;
      await axiosInstance.post("/api/notification/appoiments/to-parent", {
        notificationTypeId,
        senderId,
        receiverId,
      });
    } catch {
      console.error("Error updating appointment status");
    }
  };

  const handleDetail = async (appointmentId) => {
    setDetailLoading(true);
    try {
      const response = await axiosInstance.get(
        `/api/nurses/${staffNurseId}/appointments/${appointmentId}`
      );
      setParentId(response.data?.user?.userId);
      setSelectedAppointment({ ...(response.data.item || response.data) });
      if (step !== 2) setStep(2);
    } catch {
      setSelectedAppointment(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (parentId) {
      const fetchParentInfo = async () => {
        try {
          const response = await axiosInstance.get(
            `/api/user-profile/${parentId}`
          );
          setParentInfo(response.data);
        } catch {
          setParentInfo(null);
        }
      };
      fetchParentInfo();
    }
  }, [parentId]);

  const getStatus = (item) => {
    if (item.completionStatus === true) {
      return statusConfig.Completed;
    }
    if (item.completionStatus === false) {
      return statusConfig.Cancelled;
    }
    if (item.confirmationStatus) return statusConfig.Confirmed;
    return statusConfig.Pending;
  };

  const AppointmentCard = ({ item }) => {
    const status = getStatus(item);

    return (
      <Card
        className="appointment-card"
        style={{
          marginBottom: 0,
          borderRadius: 12,
          border: `2px solid ${status.borderColor}`,
          background: "#fff",
          boxShadow: "0 4px 16px 0 rgba(53,83,131,0.10)",
          transition: "box-shadow 0.2s",
        }}
        bodyStyle={{ padding: "18px 24px" }}
        hoverable
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          {/* Left: Student Info & Details */}
          <div style={{ flex: 1 }}>
            {/* Student Info */}
            <div
              style={{
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Avatar
                size={40}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: "#2563eb",
                  marginRight: 12,
                  boxShadow: "0 2px 8px rgba(37,99,235,0.13)",
                }}
              />
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 16, // giảm từ 18
                    fontWeight: 700,
                    color: "#1e293b",
                    lineHeight: 1.2,
                  }}
                >
                  {item.student?.fullName || "No name"}
                </h3>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    color: "#6b7280",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  Student ID: {item.student.studentCode || "N/A"}
                </p>
              </div>
            </div>
            {/* Details grid */}
            <div
              style={{
                display: "flex",
                gap: 16,
                marginBottom: 10,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#2563eb",
                  fontWeight: 600,
                  fontSize: 13, // giảm từ 14
                  background: "#f0f7ff",
                  borderRadius: 6,
                  padding: "4px 12px",
                  border: "1.5px solid #dbeafe",
                }}
              >
                <CalendarOutlined style={{ color: "#3058A4" }} />
                <span>
                  {dayjs(item.appointmentDate).format("MMM DD, YYYY")}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#059669",
                  fontWeight: 600,
                  fontSize: 13,
                  background: "#ecfdf5",
                  borderRadius: 6,
                  padding: "4px 12px",
                  border: "1.5px solid #a7f3d0",
                }}
              >
                <ClockCircleOutlined style={{ color: "#059669" }} />
                <span>
                  {item.appointmentStartTime?.slice(0, 5)} -{" "}
                  {item.appointmentEndTime?.slice(0, 5)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#f59e42",
                  fontWeight: 600,
                  fontSize: 13,
                  background: "#fff7ed",
                  borderRadius: 6,
                  padding: "4px 12px",
                  border: "1.5px solid #fde68a",
                }}
              >
                <FileTextOutlined style={{ color: "#f59e42" }} />
                <span>{item.topic || "General Consultation"}</span>
              </div>
            </div>
            {/* Reason Preview */}
            {item.appointmentReason && (
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 8,
                  padding: "8px 12px",
                  marginTop: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  border: "1px solid #e5e7eb",
                  marginBottom: 0,
                }}
              >
                <span
                  style={{ color: "#6b7280", fontWeight: 600, fontSize: 13 }}
                >
                  Reason:
                </span>{" "}
                <span
                  style={{ fontWeight: 500, fontStyle: "italic", fontSize: 13 }}
                >
                  {item.appointmentReason.length > 100
                    ? item.appointmentReason.substring(0, 100) + "..."
                    : item.appointmentReason}
                </span>
              </div>
            )}
          </div>
          {/* Right: Status & Actions */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 12,
              minWidth: 140,
            }}
          >
            <div
              style={{
                backgroundColor: status.bgColor,
                color: status.color,
                border: `2px solid ${status.color}`,
                borderRadius: 18,
                padding: "6px 18px",
                fontSize: 13,
                fontWeight: 700,
                minWidth: 90,
                textAlign: "center",
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {status.icon}
              {status.text}
            </div>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleDetail(item.appointmentId)}
              style={{
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 15, // giảm từ 14
                height: 36,
                paddingLeft: 16,
                paddingRight: 16,
                background: "linear-gradient(90deg, #3058A4 0%, #2563eb 100%)",
                border: "none",
                boxShadow: "0 2px 8px #3058A433",
                transition: "all 0.2s",
              }}
            >
              View
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const DetailView = () => {
    const status = getStatus(selectedAppointment);

    return (
      <div
        style={{
          width: "100%",
          margin: 0,
          maxWidth: "none",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 24, // giảm margin
            padding: "0 8px",
          }}
        >
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => setStep(1)}
            style={{
              marginRight: 12, // giảm margin
              borderRadius: 8,
              height: 36,
              paddingLeft: 12,
              paddingRight: 12,
              border: "2px solid #e5e7eb",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Back
          </Button>
          <h2
            style={{
              margin: 0,
              fontSize: 18, // giảm từ 20
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
            borderRadius: 14,
            boxShadow: "0 2px 8px #f0f1f2",
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            width: "100%",
            margin: 0,
          }}
          bodyStyle={{ padding: "20px 24px" }} // giảm padding
        >
          {/* Student Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 18, // giảm margin
              paddingBottom: 14,
              borderBottom: "1.5px solid #f1f5f9",
            }}
          >
            <Avatar
              size={48}
              icon={<UserOutlined />}
              style={{
                backgroundColor: "#4f46e5",
                marginRight: 14,
                boxShadow: "0 2px 8px rgba(79, 70, 229, 0.18)",
              }}
            />
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 18, // giảm từ 20
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
                border: `2px solid ${status.color}`,
                borderRadius: 18,
                padding: "7px 16px",
                fontSize: 13,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8,
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
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 14,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: 14,
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <CalendarOutlined
                  style={{ color: "#4f46e5", fontSize: 16, marginRight: 8 }}
                />
                <h4
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  Appointment Date
                </h4>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1f2937",
                }}
              >
                {dayjs(selectedAppointment.appointmentDate).format(
                  "dddd, MMMM DD, YYYY"
                )}
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: 14,
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <ClockCircleOutlined
                  style={{ color: "#4f46e5", fontSize: 16, marginRight: 8 }}
                />
                <h4
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  Time Slot
                </h4>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1f2937",
                }}
              >
                {selectedAppointment.appointmentStartTime?.slice(0, 5)} -{" "}
                {selectedAppointment.appointmentEndTime?.slice(0, 5)}
              </p>
            </div>
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: 14,
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                <UserOutlined style={{ color: "#0ea5e9", fontSize: 16, marginRight: 8 }} />
                <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>Parent Info</h4>
              </div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1f2937" }}>
                {parentInfo?.fullName || "N/A"} - {formatPhone(parentInfo?.phoneNumber || "N/A")}
              </p>
            </div>
          </div>

          {/* Topic and Reason */}
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                backgroundColor: "#f0f9ff",
                padding: 14,
                borderRadius: 10,
                border: "1.5px solid #bae6fd",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <FileTextOutlined
                  style={{ color: "#0284c7", fontSize: 20, marginRight: 12 }}
                />
                <h4
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#0c4a6e",
                  }}
                >
                  Consultation Topic
                </h4>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#0c4a6e",
                }}
              >
                {selectedAppointment.topic || "General Health Consultation"}
              </p>
            </div>

            {selectedAppointment.appointmentReason && (
              <div
                style={{
                  backgroundColor: "#fefce8",
                  padding: 14,
                  borderRadius: 15,
                  border: "1.5px solid #fde047",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#a16207",
                  }}
                >
                  Reason for Visit
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
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
                onClick={() =>
                  updateStatus(selectedAppointment.appointmentId, true, null)
                }
                style={{
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 15, // giảm từ 16
                  height: 44,
                  paddingLeft: 20,
                  paddingRight: 20,
                  background:
                    "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(5, 150, 105, 0.4)",
                }}
              >
                Confirm Appointment
              </Button>
            )}

            {selectedAppointment.confirmationStatus &&
              selectedAppointment.completionStatus === null && (
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={async () => {
                    const result = await Swal.fire({
                      title: "Mark as Complete?",
                      text: "This will mark the appointment as completed.",
                      icon: "question",
                      showCancelButton: true,
                      confirmButtonText: "Yes, complete it!",
                      cancelButtonText: "No, not yet",
                      confirmButtonColor: "#10b981",
                      cancelButtonColor: "#6b7280",
                    });
                    
                    if (result.isConfirmed) {
                      updateStatus(selectedAppointment.appointmentId, true, true);
                      Swal.fire({
                        title: "Completed!",
                        text: "The appointment has been marked as completed.",
                        icon: "success",
                        confirmButtonColor: "#10b981",
                      });
                    }
                  }}
                  style={{
                    borderRadius: 12,
                    fontWeight: 600,
                    fontSize: 15, 
                    height: 44,
                    paddingLeft: 20,
                    paddingRight: 20,
                    background:
                      "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(124, 58, 237, 0.4)",
                  }}
                >
                  Mark as Complete
                </Button>
              )}

            {selectedAppointment.confirmationStatus &&
              selectedAppointment.completionStatus === null && (
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={async () => {
                    const result = await Swal.fire({
                      title: "Are you sure?",
                      text: "This action will cancel the appointment.",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonText: "Yes, cancel it!",
                      cancelButtonText: "No, keep it",
                    });
                    if (result.isConfirmed) {
                      updateStatus(
                        selectedAppointment.appointmentId,
                        true,
                        false
                      );
                      Swal.fire({
                      title: "Success",
                      text: "The appointment has been cancelled.",
                      icon: "success",
                      confirmButtonColor: "#10b981",
                      });
                    }
                  }}
                  style={{
                    borderRadius: 12,
                    fontWeight: 600,
                    fontSize: 15, // giảm từ 16
                    height: 44,
                    paddingLeft: 20,
                    paddingRight: 20,
                    background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(220, 38, 38, 0.4)",
                  }}
                >
                  Cancel
                </Button>
              )}
          </div>
        </Card>
      </div>
    );
  };

  // Sắp xếp: Pending lên đầu
  const sortedAppointments = [...appointments].sort((a, b) => {
    const aPending = !a.confirmationStatus && a.completionStatus === null;
    const bPending = !b.confirmationStatus && b.completionStatus === null;
    if (aPending && !bPending) return -1;
    if (!aPending && bPending) return 1;
    return 0;
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        padding: "0",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
          padding: "20px 0 10px 0",
          borderRadius: "20px 20px 0 0",

          color: "white",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          marginBottom: 18,
        }}
      >
        <h1
          style={{
            fontWeight: 800,
            margin: "0 0 8px 0",
            textShadow: "2px 2px 4px rgba(0,0,0,0.18)",
            letterSpacing: "1px",
          }}
        >
          Appointment Dashboard
        </h1>
        <p
          style={{
            fontSize: 15, // giữ nguyên
            fontWeight: 500,
            margin: "0 0 10px 0",
            opacity: 0.9,
            maxWidth: 480,
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
              gap: 14,
              flexWrap: "wrap",
              marginTop: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* <FilterOutlined style={{fontSize: 15}} /> */}
              <span>Start Date:</span>
              <DatePicker
                value={dayjs(dateRequestStart)}
                format="YYYY-MM-DD"
                onChange={(_, dateString) => setDateRequestStart(dateString)}
                allowClear={false}
                size="middle"
                style={{
                  width: 160,
                  borderRadius: 8,
                }}
              />
              <span>End Date:</span>
              <DatePicker
                value={dayjs(dateRequestEnd)}
                format="YYYY-MM-DD"
                onChange={(_, dateString) => setDateRequestEnd(dateString)}
                allowClear={false}
                size="middle"
                style={{
                  width: 160,
                  borderRadius: 8,
                }}
              />
            </div>
          </div>      
        )}
      </div>

      {/* Main Content */}
      <div
        style={{
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
                padding: "20px 32px",
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
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: 24, // giảm từ 28
                    fontWeight: 700,
                    color: "#1f2937",
                  }}
                >
                  {appointments.length}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "#6b7280",
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  Total Appointments
                </p>
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
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: 24, // giảm từ 28
                    fontWeight: 700,
                    color: "#059669",
                  }}
                >
                  {appointments.filter((apt) => apt.completionStatus === true).length}
                </h3>
                <p style={{ margin: 0, color: "#6b7280", fontWeight: 600 }}>
                  Completed
                </p>
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
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: 24, 
                    fontWeight: 700,
                    color: "#2563eb",
                  }}
                >
                  {appointments.filter(
                    (apt) => apt.confirmationStatus === true && (apt.completionStatus === null || apt.completionStatus === undefined)
                  ).length}
                </h3>
                <p style={{ margin: 0, color: "#6b7280", fontWeight: 600 }}>
                  Confirmed
                </p>
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
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: 24, // giảm từ 28
                    fontWeight: 700,
                    color: "#f59e0b",
                  }}
                >
                  {appointments.filter((apt) => !apt.confirmationStatus).length}
                </h3>
                <p style={{ margin: 0, color: "#6b7280", fontWeight: 600 }}>
                  Pending
                </p>
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
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: 24, // giảm từ 28
                    fontWeight: 700,
                    color: "red",
                  }}
                >
                  {appointments.filter((apt) => !apt.confirmationStatus === false).length}
                </h3>
                <p style={{ margin: 0, color: "#6b7280", fontWeight: 600 }}>
                  Cancelled
                </p>
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
                <p style={{ marginTop: 20, fontSize: 16, color: "#6b7280" }}>
                  Loading appointments...
                </p>
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
                    <span
                      style={{
                        fontSize: 18,
                        color: "#6b7280",
                        fontWeight: 500,
                      }}
                    >
                      No appointments found for{" "}
                      {dayjs(dateRequestStart).format("MMMM DD, YYYY")} - {dayjs(dateRequestEnd).format("MMMM DD, YYYY")}
                    </span>
                    
                  }
                  style={{ fontSize: 18 }}
                />
              </div>
            ) : (
              <div
                style={{
                  maxHeight: "800px",
                  overflowY: "auto",
                  padding: "32px 0",
                  boxSizing: "border-box",
                }}
              >
                {sortedAppointments.map((item) => (
                  <div
                    style={{
                      width: "100%",
                      padding: "0 32px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 20,
                      marginBottom: 20,
                    }}
                    key={item.appointmentId}
                  >
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
            <p style={{ marginTop: 20, fontSize: 16, color: "#6b7280" }}>
              Loading appointment details...
            </p>
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
      {step === 1 && (
        <div style={{textAlign: "center", marginTop: 24, padding: "0 32px"}}>
          <Pagination
            current={pageIndex}
            pageSize={pageSize}
            total={total}
            onChange={(page) => {
              setPageIndex(page);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AppointmentList;
