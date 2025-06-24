import React, {useEffect, useState} from "react";
import axiosInstance from "../../../../api/axios";
import Swal from "sweetalert2";
import {useNavigate} from "react-router-dom";
import {Card, Button, Tag, Pagination, Spin, Avatar, Empty} from "antd";
import {UserOutlined, CalendarOutlined, EnvironmentOutlined, FileTextOutlined} from "@ant-design/icons";

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

const severityBorder = {
  Low: "#a7f3d0",
  Medium: "#fde68a",
  High: "#fecaca",
};

const MedicalEventList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          "/api/nurses/students/medical-events",
          {
            params: {
              pageIndex,
              pageSize,
            },
          }
        );
        setData(response.data.items || []);
        setTotal(response.data.count || 0);
      } catch (error) {
        console.error("Error fetching medical events:", error);
        setData([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, pageIndex, pageSize]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: 0,
      }}
    >
      {/* Header Section */}
      <div
        style={{
          background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
          padding: "48px 32px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            fontSize: 42,
            fontWeight: 800,
            margin: "0 0 16px 0",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            letterSpacing: "1px",
          }}
        >
          🩺 Medical Events Dashboard
        </h1>
        <p
          style={{
            fontSize: 20,
            fontWeight: 500,
            margin: "0 0 32px 0",
            opacity: 0.9,
            maxWidth: 600,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Manage and review student medical events efficiently
        </p>
      </div>

      {/* Main Content */}
      <div
        style={{
          padding: "40px 0",
          width: "100%",
          maxWidth: "none",
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        {/* Stats Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
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
              flex: 1,
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: 28, fontWeight: 700, color: "#1f2937" }}>
              {total}
            </h3>
            <p style={{ margin: 0, color: "#6b7280", fontWeight: 600 }}>Total Events</p>
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
            <h3 style={{ margin: "0 0 8px 0", fontSize: 28, fontWeight: 700, color: "#10b981" }}>
              {data.filter((item) => item.medicalEvent.severityLevel === "Low").length}
            </h3>
            <p style={{ margin: 0, color: "#6b7280", fontWeight: 600 }}>Low Severity</p>
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
              {data.filter((item) => item.medicalEvent.severityLevel === "Medium").length}
            </h3>
            <p style={{ margin: 0, color: "#6b7280", fontWeight: 600 }}>Medium Severity</p>
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
            <h3 style={{ margin: "0 0 8px 0", fontSize: 28, fontWeight: 700, color: "#ef4444" }}>
              {data.filter((item) => item.medicalEvent.severityLevel === "High").length}
            </h3>
            <p style={{ margin: 0, color: "#6b7280", fontWeight: 600 }}>High Severity</p>
          </div>
        </div>

        {/* Medical Events List */}
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
            <p style={{ marginTop: 20, fontSize: 16, color: "#6b7280" }}>Loading medical events...</p>
          </div>
        ) : data.length === 0 ? (
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
                  No medical events found
                </span>
              }
              style={{ fontSize: 18 }}
            />
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              maxHeight: 600,
              overflowY: "auto",
              paddingRight: 8,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {data.map((item) => (
                <Card
                  key={item.medicalEvent.eventId}
                  style={{
                    width: "100%",
                    borderRadius: 16,
                    border: `2px solid ${severityBorder[item.medicalEvent.severityLevel]}`,
                    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    marginBottom: 0,
                  }}
                  bodyStyle={{ padding: "28px 32px" }}
                  hoverable
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    {/* Student Info */}
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 16, flex: 1 }}>
                      <Avatar
                        size={48}
                        icon={<UserOutlined />}
                        style={{
                          backgroundColor: "#4f46e5",
                          marginRight: 16,
                          boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
                        }}
                      />
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: 20,
                            fontWeight: 600,
                            color: "#1f2937",
                            lineHeight: 1.2,
                          }}
                        >
                          {item.studentInfo.fullName}
                        </h3>
                        <p
                          style={{
                            margin: "4px 0 0 0",
                            color: "#6b7280",
                            fontSize: 14,
                            fontWeight: 500,
                          }}
                        >
                          Student ID: {item.studentInfo.studentId || "N/A"}
                        </p>
                      </div>
                    </div>
                    {/* Severity Badge */}
                    <div
                      style={{
                        backgroundColor: severityBg[item.medicalEvent.severityLevel],
                        color: severityColor[item.medicalEvent.severityLevel],
                        border: `2px solid ${severityColor[item.medicalEvent.severityLevel]}`,
                        borderRadius: 20,
                        padding: "8px 20px",
                        fontSize: 15,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        minWidth: 120,
                        justifyContent: "center",
                      }}
                    >
                      {item.medicalEvent.severityLevel}
                    </div>
                  </div>
                  {/* Event Details */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 18,
                      marginBottom: 18,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <CalendarOutlined style={{ color: "#4f46e5", fontSize: 16 }} />
                      <span style={{ color: "#374151", fontWeight: 500 }}>
                        {item.medicalEvent.eventDate}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <EnvironmentOutlined style={{ color: "#4f46e5", fontSize: 16 }} />
                      <span style={{ color: "#374151", fontWeight: 500 }}>
                        {item.medicalEvent.location}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <FileTextOutlined style={{ color: "#4f46e5", fontSize: 16 }} />
                      <span style={{ color: "#374151", fontWeight: 500 }}>
                        {item.medicalEvent.eventType}
                      </span>
                    </div>
                  </div>
                  {/* Action */}
                  <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
                    <Button
                      type="primary"
                      style={{
                        background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
                        border: "none",
                        borderRadius: 10,
                        fontWeight: 600,
                        height: 40,
                        paddingLeft: 20,
                        paddingRight: 20,
                        boxShadow: "0 4px 15px rgba(79, 70, 229, 0.3)",
                        transition: "all 0.3s ease",
                      }}
                      onClick={() => {
                        navigate(`/nurse/medical-event/medical-event-detail/`, {
                          state: {
                            eventId: item.medicalEvent.eventId,
                          },
                        });
                      }}
                    >
                      Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
        {/* Pagination */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Pagination
            current={pageIndex}
            pageSize={pageSize}
            total={total}
            onChange={(page) => {
              setPageIndex(page);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MedicalEventList;
