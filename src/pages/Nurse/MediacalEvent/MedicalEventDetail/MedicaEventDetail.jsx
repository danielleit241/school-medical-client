import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {Button, Card, Descriptions, Divider, List, Spin, Avatar} from "antd";
import axiosInstance from "../../../../api/axios";
import Swal from "sweetalert2";
import {
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

const severityColor = {
  Low: "#10b981",
  Medium: "#f59e0b",
  High: "#ef4444",
};
const severityBg = {
  Low: "#ecfdf5",
  Medium: "#fef9c3",
  High: "#fee2e2",
};

const MedicaEventDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const eventId = location.state?.eventId;
  const [eventDetail, setEventDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/nurses/students/medical-events/${eventId}`
        );
        setEventDetail(response.data);
      } catch (error) {
        console.error("Error fetching medical event detail:", error);
        Swal.fire({
          icon: "error",
          title: "Cannot find medical event",
          text: "Please try again or select another event.",
          confirmButtonText: "Back",
        }).then(() => {
          navigate(-1);
        });
        setEventDetail(null);
      } finally {
        setLoading(false);
      }
    };
    if (eventId) fetchEventDetail();
  }, [eventId, navigate]);

  if (loading) {
    return (
      <div style={{textAlign: "center", marginTop: 40}}>
        <Spin />
      </div>
    );
  }

  if (!eventDetail) {
    return <div>No medical event found.</div>;
  }

  const {medicalEvent, studentInfo, medicalRequests} = eventDetail;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "0 0 32px 0",
      }}
    >
      {/* Header Section - giống MedicalEventList */}
      <div
        style={{
          background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
          padding: "20px 0 10px 0", 
          marginBottom: "18px", 
          color: "white",
          textAlign: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            fontSize: 28, 
            fontWeight: 800,
            margin: "0 0 4px 0", 
            textShadow: "2px 2px 4px rgba(0,0,0,0.18)",
            letterSpacing: "1px",
          }}
        >
          🩺 Medical Event Details
        </h1>
        <p
          style={{
            fontSize: 15, 
            fontWeight: 500,
            margin: "0 0 6px 0", // giảm margin dưới
            opacity: 0.9,
            maxWidth: 480,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          View and manage details of a student medical event
        </p>
      </div>

      {/* Nút Back nằm ngoài header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 8,
          marginTop: 24,
          padding: "0 8px",
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{
            marginRight: 10,
            borderRadius: 8,
            height: 30,
            paddingLeft: 10,
            paddingRight: 10,
            border: "2px solid #e5e7eb",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Back to List
        </Button>
        <h2
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 700,
            color: "#1f2937",
          }}
        >
          Medical Event Details
        </h2>
      </div>

      {/* Main Detail Card */}
      <div
        style={{
          width: "100%",
          margin: 0,
          maxWidth: "none",
          padding: "10px 0", // giảm padding dọc
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <Card
          style={{
            borderRadius: 10, // giảm bo góc
            boxShadow: "0 2px 8px #f0f1f2", // giảm shadow
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            width: "100%",
            maxWidth: "none",
            minWidth: 0,
            margin: 0,
            border: `2px solid ${severityColor[medicalEvent.severityLevel]}`,
          }}
          bodyStyle={{ padding: "14px 18px" }} // giảm padding trong card
        >
          {/* Student Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 18,
              paddingBottom: 12,
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
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#1f2937",
                  lineHeight: 1.2,
                }}
              >
                {studentInfo?.fullName || "Unknown Student"}
              </h1>
              <p
                style={{
                  margin: "6px 0 0 0",
                  color: "#6b7280",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Student Code: {studentInfo?.studentCode || "N/A"}
              </p>
            </div>
            <div
              style={{
                backgroundColor: severityBg[medicalEvent.severityLevel],
                color: severityColor[medicalEvent.severityLevel],
                border: `2px solid ${severityColor[medicalEvent.severityLevel]}`,
                borderRadius: 18,
                padding: "7px 16px",
                fontSize: 13,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {medicalEvent.severityLevel}
            </div>
          </div>

          {/* Event Info Grid */}
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
              <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                <CalendarOutlined style={{ color: "#4f46e5", fontSize: 16, marginRight: 8 }} />
                <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>Event Date</h4>
              </div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1f2937" }}>
                {medicalEvent?.eventDate || ""}
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
              <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                <FileTextOutlined style={{ color: "#4f46e5", fontSize: 16, marginRight: 8 }} />
                <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>Event Type</h4>
              </div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1f2937" }}>
                {medicalEvent?.eventType || ""}
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
              <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                <EnvironmentOutlined style={{ color: "#4f46e5", fontSize: 16, marginRight: 8 }} />
                <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>Location</h4>
              </div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1f2937" }}>
                {medicalEvent?.location || ""}
              </p>
            </div>
          </div>

          {/* Description & Notes */}
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                backgroundColor: "#f0f9ff",
                padding: 14,
                borderRadius: 10,
                border: "1.5px solid #bae6fd",
                marginBottom: 10,
              }}
            >
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0c4a6e" }}>Description</h4>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#0c4a6e" }}>
                {medicalEvent?.eventDescription || ""}
              </p>
            </div>
            {medicalEvent?.notes && (
              <div
                style={{
                  backgroundColor: "#fefce8",
                  padding: 14,
                  borderRadius: 10,
                  border: "1.5px solid #fde047",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#a16207",
                  }}
                >
                  Notes
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: "#a16207",
                    fontWeight: 500,
                  }}
                >
                  {medicalEvent?.notes}
                </p>
              </div>
            )}
          </div>

          {/* Medical Requests */}
          <Divider orientation="left" style={{marginTop: 18, fontWeight: 700, fontSize: 15}}>
            Medical Requests
          </Divider>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
              marginBottom: 8,
            }}
          >
            {medicalRequests && medicalRequests.length > 0 ? (
              medicalRequests.map((item) => (
                <div
                  key={item.itemId}
                  style={{
                    background: "#f8fafc",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 10,
                    padding: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    minHeight: 90,
                    boxShadow: "0 1px 4px rgba(53,93,196,0.06)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <FileTextOutlined style={{ color: "#4f46e5", fontSize: 17 }} />
                    <span style={{ fontWeight: 700, color: "#1e293b", fontSize: 15 }}>
                      {item.itemName}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 2 }}>
                    <b>Item Name:</b> {item.itemName}
                  </div>
                  <div style={{ fontSize: 13, color: "#059669" }}>
                    <b>Quantity:</b> {item.requestQuantity}
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  background: "#f8fafc",
                  border: "1.5px dashed #e2e8f0",
                  borderRadius: 10,
                  padding: 24,
                  color: "#94a3b8",
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: 15,
                  gridColumn: "1/-1",
                }}
              >
                No medical requests
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MedicaEventDetail;
