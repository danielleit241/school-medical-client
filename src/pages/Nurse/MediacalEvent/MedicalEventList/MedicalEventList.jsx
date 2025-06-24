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
        padding: "0 0 32px 0",
      }}
    >
      {/* Header Section */}
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
          🩺 Medical Events Dashboard
        </h1>
        <p
          style={{
            fontSize: 18,
            fontWeight: 500,
            margin: "0 0 20px 0",
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
              maxHeight: "650px",
              overflowY: "auto",
              padding: "32px 0",
              boxSizing: "border-box",
            }}
          >
            <div style={{
              width: "100%",
              padding: "0 32px",
              display: "flex", 
              flexDirection: "column",
              gap: 20 
              }}>
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
                  bodyStyle={{ padding: "32px 36px" }}
                  hoverable
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 32 }}>
                    {/* Left: Student Info & Details */}
                    <div style={{ flex: 1 }}>
                      {/* Student Info */}
                      <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 16 }}>
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
                          <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#1f2937", lineHeight: 1.2 }}>
                            {item.studentInfo.fullName}
                          </h3>
                          <p style={{ margin: "6px 0 0 0", color: "#6b7280", fontSize: 16, fontWeight: 500 }}>
                            Student ID: {item.studentInfo.studentId || "N/A"}
                          </p>
                        </div>
                      </div>
                      {/* Details grid */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                          gap: 24,
                          marginBottom: 18,
                          alignItems: "center",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <CalendarOutlined style={{ color: "#4f46e5", fontSize: 20 }} />
                          <span style={{ color: "#374151", fontWeight: 600, fontSize: 18 }}>
                            {item.medicalEvent.eventDate}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <EnvironmentOutlined style={{ color: "#4f46e5", fontSize: 20 }} />
                          <span style={{ color: "#374151", fontWeight: 600, fontSize: 18 }}>
                            {item.medicalEvent.location}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <FileTextOutlined style={{ color: "#4f46e5", fontSize: 20 }} />
                          <span style={{ color: "#374151", fontWeight: 600, fontSize: 18 }}>
                            {item.medicalEvent.eventType}
                          </span>
                        </div>
                      </div>
                      {/* Description */}
                      <div
                        style={{
                          background: "#f8fafc",
                          borderRadius: 10,
                          padding: "14px 18px",
                          marginTop: 10,
                          fontSize: 16,
                          fontWeight: 600,
                          color: "#374151",
                          border: "1px solid #e5e7eb",
                          marginBottom: item.medicalEvent.notes ? 10 : 0,
                        }}
                      >
                        <span style={{ color: "#6b7280", fontWeight: 600 }}>Description:</span>{" "}
                        <span style={{ fontWeight: 500, fontStyle: "italic" }}>
                          {item.medicalEvent.eventDescription}
                        </span>
                      </div>
                    </div>
                    {/* Right: Severity & Actions */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 20, minWidth: 180 }}>
                      <div
                        style={{
                          backgroundColor: severityBg[item.medicalEvent.severityLevel],
                          color: severityColor[item.medicalEvent.severityLevel],
                          border: `2px solid ${severityColor[item.medicalEvent.severityLevel]}`,
                          borderRadius: 24,
                          padding: "10px 28px",
                          fontSize: 17,
                          fontWeight: 700,
                          minWidth: 120,
                          textAlign: "center",
                          marginBottom: 8,
                        }}
                      >
                        {item.medicalEvent.severityLevel}
                      </div>
                      <Button
                        type="primary"
                        style={{
                          borderRadius: 12,
                          fontWeight: 700,
                          fontSize: 18,
                          height: 48,
                          paddingLeft: 32,
                          paddingRight: 32,
                          background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
                          border: "none",
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
