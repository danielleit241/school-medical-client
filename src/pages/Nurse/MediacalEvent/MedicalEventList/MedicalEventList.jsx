import React, {useEffect, useState} from "react";
import axiosInstance from "../../../../api/axios";
import {useNavigate} from "react-router-dom";
import {Card, Button, Pagination, Spin, Avatar, Empty, Select} from "antd";
import {User, Calendar, MapPin, FileText} from "lucide-react";

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
  const pageSize = 3;
  const [loading, setLoading] = useState(false);
  const [severityFilter, setSeverityFilter] = useState("All");
  const search = "All";

  // State cho all data (không phân trang) để dùng cho stats bar
  const [allData, setAllData] = useState([]);

  // Fetch paginated data
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
              search,
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
  }, [navigate, pageIndex, pageSize, search]);

  // Fetch all data for stats bar (không phân trang)
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const response = await axiosInstance.get(
          "/api/nurses/students/medical-events/all",
        );
      setAllData(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching all medical events:", error);
        setAllData([]);
      }
    };
    fetchAllData();
  }, [search]);

  // Lọc theo severity cho bảng hiển thị
  const filteredData =
    severityFilter === "All"
      ? data
      : data.filter(
          (item) => item.medicalEvent.severityLevel === severityFilter
        );

  // Stats bar dùng allData (không phân trang)
  const statsTotal = allData.length;
  const statsLow = allData.filter(
    (item) => item.medicalEvent.severityLevel === "Low"
  ).length;
  const statsMedium = allData.filter(
    (item) => item.medicalEvent.severityLevel === "Medium"
  ).length;
  const statsHigh = allData.filter(
    (item) => item.medicalEvent.severityLevel === "High"
  ).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        padding: "0 0 32px 0",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
          padding: "16px 16px",
          marginBottom: "24px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          borderRadius: "20px 20px 0 0",
        }}
      >
        <h1
          style={{
            fontWeight: 800,
            margin: "0 0 6px 0",
            textShadow: "2px 2px 4px rgba(0,0,0,0.18)",
            letterSpacing: "1px",
          }}
        >
          Medical Events Dashboard
        </h1>
        <p
          style={{
            fontSize: 15,
            fontWeight: 500,
            margin: "0 0 8px 0",
            opacity: 0.9,
            maxWidth: 480,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Manage and review student medical events efficiently
        </p>
        {/* Filter select */}
        <div
          style={{
            marginTop: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <span style={{fontWeight: 500, fontSize: 22, color: "#fff"}}>
            Severity:{" "}
          </span>
          <Select
            value={severityFilter}
            onChange={setSeverityFilter}
            style={{width: 120, height: 30, borderRadius: 10}}
            size="middle"
          >
            <Select.Option value="All">All</Select.Option>
            <Select.Option value="Low">Low</Select.Option>
            <Select.Option value="Medium">Medium</Select.Option>
            <Select.Option value="High">High</Select.Option>
          </Select>
        </div>
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
        {/* Stats Bar - dùng allData */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
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
              flex: 1,
            }}
          >
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: 28,
                fontWeight: 700,
                color: "#1f2937",
              }}
            >
              {statsTotal}
            </h3>
            <p style={{margin: 0, color: "#6b7280", fontWeight: 600}}>
              Total Events
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
                fontSize: 28,
                fontWeight: 700,
                color: "#10b981",
              }}
            >
              {statsLow}
            </h3>
            <p style={{margin: 0, color: "#6b7280", fontWeight: 600}}>
              Low Severity
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
                fontSize: 28,
                fontWeight: 700,
                color: "#f59e0b",
              }}
            >
              {statsMedium}
            </h3>
            <p style={{margin: 0, color: "#6b7280", fontWeight: 600}}>
              Medium Severity
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
                fontSize: 28,
                fontWeight: 700,
                color: "#ef4444",
              }}
            >
              {statsHigh}
            </h3>
            <p style={{margin: 0, color: "#6b7280", fontWeight: 600}}>
              High Severity
            </p>
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
            <p style={{marginTop: 20, fontSize: 16, color: "#6b7280"}}>
              Loading medical events...
            </p>
          </div>
        ) : filteredData.length === 0 ? (
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
                <span style={{fontSize: 18, color: "#6b7280", fontWeight: 500}}>
                  No medical events found
                </span>
              }
              style={{fontSize: 18}}
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
            <div
              style={{
                width: "100%",
                padding: "0 32px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {filteredData.map((item) => (
                <Card
                  key={item.medicalEvent.eventId}
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: `2px solid ${
                      severityBorder[item.medicalEvent.severityLevel]
                    }`,
                    background: "#fff",
                    boxShadow: "0 4px 16px 0 rgba(53,83,131,0.10)",
                    marginBottom: 0,
                    transition: "box-shadow 0.2s",
                  }}
                  bodyStyle={{padding: "18px 24px"}}
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
                    <div style={{flex: 1}}>
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
                          icon={<User size={20} color="#fff" />}
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
                              fontSize: 18,
                              fontWeight: 700,
                              color: "#1e293b",
                              lineHeight: 1.2,
                            }}
                          >
                            {item.studentInfo.fullName}
                          </h3>
                          <p
                            style={{
                              margin: "4px 0 0 0",
                              color: "#6b7280",
                              fontSize: 13,
                              fontWeight: 500,
                            }}
                          >
                            Student ID: {item.studentInfo.studentCode || "N/A"}
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
                            fontSize: 14,
                            background: "#f0f7ff",
                            borderRadius: 6,
                            padding: "4px 12px",
                            border: "1.5px solid #dbeafe",
                          }}
                        >
                          <Calendar size={20} color="#2563eb" />
                          <span>{item.medicalEvent.eventDate}</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            color: "#059669",
                            fontWeight: 600,
                            fontSize: 14,
                            background: "#ecfdf5",
                            borderRadius: 6,
                            padding: "4px 12px",
                            border: "1.5px solid #a7f3d0",
                          }}
                        >
                          <MapPin size={20} style={{color: "#059669"}} />
                          <span>{item.medicalEvent.location}</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            color: "#f59e42",
                            fontWeight: 600,
                            fontSize: 14,
                            background: "#fff7ed",
                            borderRadius: 6,
                            padding: "4px 12px",
                            border: "1.5px solid #fde68a",
                          }}
                        >
                          <FileText size={20} style={{color: "#f59e42"}} />
                          <span>{item.medicalEvent.eventType}</span>
                        </div>
                      </div>
                      {/* Description */}
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
                          marginBottom: item.medicalEvent.notes ? 8 : 0,
                        }}
                      >
                        <span style={{color: "#6b7280", fontWeight: 600}}>
                          Description:
                        </span>{" "}
                        <span style={{fontWeight: 500, fontStyle: "italic"}}>
                          {item.medicalEvent.eventDescription}
                        </span>
                      </div>
                    </div>
                    {/* Right: Severity & Actions */}
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
                          backgroundColor:
                            severityBg[item.medicalEvent.severityLevel],
                          color: severityColor[item.medicalEvent.severityLevel],
                          border: `2px solid ${
                            severityColor[item.medicalEvent.severityLevel]
                          }`,
                          borderRadius: 18,
                          padding: "6px 18px",
                          fontSize: 13,
                          fontWeight: 700,
                          minWidth: 90,
                          textAlign: "center",
                          marginBottom: 6,
                        }}
                      >
                        {item.medicalEvent.severityLevel}
                      </div>
                      <Button
                        type="primary"
                        style={{
                          borderRadius: 8,
                          fontWeight: 700,
                          fontSize: 14,
                          height: 36,
                          paddingLeft: 16,
                          paddingRight: 16,
                          background:
                            "linear-gradient(90deg, #3058A4 0%, #2563eb 100%)",
                          border: "none",
                          boxShadow: "0 2px 8px #3058A433",
                          transition: "all 0.2s",
                        }}
                        onClick={() => {
                          navigate(
                            `/nurse/medical-event/medical-event-detail/`,
                            {
                              state: {
                                eventId: item.medicalEvent.eventId,
                              },
                            }
                          );
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
      </div>
    </div>
  );
};

export default MedicalEventList;
