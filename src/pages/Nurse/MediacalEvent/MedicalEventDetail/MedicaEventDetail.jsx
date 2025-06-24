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
          padding: "36px 0 18px 0",
          marginBottom: "40px",
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
          🩺 Medical Event Details
        </h1>
        <p
          style={{
            fontSize: 18,
            fontWeight: 500,
            margin: "0 0 32px 0",
            opacity: 0.9,
            maxWidth: 600,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          View and manage details of a student medical event
        </p>
      </div>

      {/* Nút Back nằm ngoài header */}
      <div  style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 10,
            marginTop: 40,
            padding: "0 8px",
          }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
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
            Medical Event Details
          </h2>
      </div>

      {/* Main Detail Card */}
      <div
        style={{
          width: "100%",
          margin: 0,
          maxWidth: "none",
          padding: "40px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",   
        }}
      >
        <Card
          style={{
            borderRadius: 20,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            width: "100%",           
            maxWidth: "none",        
            minWidth: 0,
            margin: 0,
            border: `3px solid ${severityColor[medicalEvent.severityLevel]}`,
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
                {studentInfo?.fullName || "Unknown Student"}
              </h1>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#6b7280",
                  fontSize: 16,
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
                border: `3px solid ${severityColor[medicalEvent.severityLevel]}`,
                borderRadius: 25,
                padding: "12px 24px",
                fontSize: 16,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {medicalEvent.severityLevel}
            </div>
          </div>

          {/* Event Info Grid */}
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
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#374151" }}>Event Date</h4>
              </div>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#1f2937" }}>
                {medicalEvent?.eventDate || ""}
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
                <FileTextOutlined style={{ color: "#4f46e5", fontSize: 20, marginRight: 12 }} />
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#374151" }}>Event Type</h4>
              </div>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#1f2937" }}>
                {medicalEvent?.eventType || ""}
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
                <EnvironmentOutlined style={{ color: "#4f46e5", fontSize: 20, marginRight: 12 }} />
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#374151" }}>Location</h4>
              </div>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#1f2937" }}>
                {medicalEvent?.location || ""}
              </p>
            </div>
          </div>

          {/* Description & Notes */}
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
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0c4a6e" }}>Description</h4>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: "#0c4a6e" }}>
                {medicalEvent?.eventDescription || ""}
              </p>
            </div>
            {medicalEvent?.notes && (
              <div
                style={{
                  backgroundColor: "#fefce8",
                  padding: 24,
                  borderRadius: 16,
                  border: "2px solid #fde047",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#a16207",
                  }}
                >
                  Notes
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
                  {medicalEvent?.notes}
                </p>
              </div>
            )}
          </div>

          {/* Medical Requests */}
          <Divider orientation="left" style={{marginTop: 32, fontWeight: 700, fontSize: 18}}>
            Medical Requests
          </Divider>
          <List
            dataSource={medicalRequests}
            bordered
            locale={{emptyText: "No medical requests"}}
            renderItem={(item) => (
              <List.Item>
                <Descriptions column={3} size="small">
                  <Descriptions.Item label="Item Id">
                    {item.itemId}
                  </Descriptions.Item>
                  <Descriptions.Item label="Drug Name">
                    {item.itemName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Quantity">
                    {item.requestQuantity}
                  </Descriptions.Item>
                </Descriptions>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </div>
  );
};

export default MedicaEventDetail;
