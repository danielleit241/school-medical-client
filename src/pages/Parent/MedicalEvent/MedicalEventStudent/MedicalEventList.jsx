import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import axiosInstance from "../../../../api/axios";
import {Card, Button, Tag, Pagination, Spin, Select} from "antd";
import {useNavigate, useLocation} from "react-router-dom";

const MedicalEventList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const parentId = useSelector((state) => state.user?.userId);
  const [selectedStudent, setSelectedStudent] = useState(
    location.state?.student || null
  );
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [showList, setShowList] = useState(false);
  const [dotIndex, setDotIndex] = useState(0);

  useEffect(() => {
    if (!selectedStudent) {
      const studentId = localStorage.getItem("studentId");
      if (studentId) {
        axiosInstance
          .get(`/api/parents/${parentId}/students`)
          .then((res) => {
            const found = res.data.find((s) => s.studentId === studentId);
            if (found) setSelectedStudent(found);
            else navigate("/parent/medical-event/children-list");
          })
          .catch(() => navigate("/parent/medical-event/children-list"));
      } else {
        navigate("/parent/medical-event/children-list");
      }
    }
  }, [selectedStudent, parentId, navigate]);

  useEffect(() => {
    if (!selectedStudent) return;
    setLoadingEvents(true);
    axiosInstance
      .get(
        `/api/parents/students/${selectedStudent.studentId}/medical-events`,
        {
          params: {
            pageIndex,
            pageSize,
            studentId: selectedStudent.studentId,
          },
        }
      )
      .then((res) => {
        setEvents(res.data.items || []);
        setTotal(res.data.count || 0);
      })
      .catch(() => {
        setEvents([]);
        setTotal(0);
      })
      .finally(() => setLoadingEvents(false));
  }, [selectedStudent, pageIndex, pageSize]);

  // Hiệu ứng loading với 3 dấu chấm
  useEffect(() => {
    setShowList(false);
    setDotIndex(0);
    let interval = null;
    let timeout = null;

    interval = setInterval(() => {
      setDotIndex((prev) => (prev + 1) % 3);
    }, 200);

    timeout = setTimeout(() => {
      setShowList(true);
      clearInterval(interval);
    }, 300);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Filter by severity
  const filteredEvents =
    filterSeverity === "all"
      ? events
      : events.filter(
          (event) => event.medicalEvent.severityLevel === filterSeverity
        );

  // Render severity tag
  const renderSeverityTag = (severityLevel) => {
    switch (severityLevel) {
      case "Low":
        return (
          <Tag
            color="green"
            style={{
              fontWeight: 600,
              borderRadius: 16,
              fontSize: 14,
              padding: "4px 16px",
              background: "#e6fff2",
              color: "#1bbf7a",
              border: "none",
            }}
          >
            Severity: Low
          </Tag>
        );
      case "Medium":
        return (
          <Tag
            color="orange"
            style={{
              fontWeight: 600,
              borderRadius: 16,
              fontSize: 14,
              padding: "4px 16px",
              background: "#fffbe6",
              color: "#faad14",
              border: "none",
            }}
          >
            Severity: Medium
          </Tag>
        );
      case "High":
        return (
          <Tag
            color="red"
            style={{
              fontWeight: 600,
              borderRadius: 16,
              fontSize: 14,
              padding: "4px 16px",
              background: "#fff1f0",
              color: "#ff4d4f",
              border: "none",
            }}
          >
            Severity: High
          </Tag>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        padding: "20px 0",
        margin: "0 auto",
        width: "90%",
      }}
    >
      <div
        className="animate__animated animate__fadeIn"
        style={{
          background: "#fff",
          minHeight: "100vh",
          borderRadius: "20px 20px 0 0",
          padding: 0,
          position: "relative",
        }}
      >
        {/* Header gradient */}
        <div
          style={{
            width: "100%",
            background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
            padding: "36px 0 18px 0",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            textAlign: "center",
            marginBottom: 32,
            boxShadow: "0 4px 24px 0 rgba(53,83,131,0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative background elements */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "120px",
              height: "120px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-30px",
              left: "-30px",
              width: "80px",
              height: "80px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: "25%",
              width: "60px",
              height: "60px",
              background: "rgba(255, 193, 7, 0.2)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.13)",
                boxShadow: "0 2px 8px #a259e633",
              }}
            >
              <span style={{fontSize: 28, color: "#fff"}}>🩺</span>
            </span>
            <span
              style={{
                fontWeight: 800,
                fontSize: 36,
                color: "#fff",
                letterSpacing: 1,
                textShadow: "0 2px 8px #2222",
              }}
            >
              Medical Event History
            </span>
          </div>
          <div
            style={{
              color: "#e0e7ff",
              fontSize: 20,
              fontWeight: 500,
              textShadow: "0 1px 4px #2222",
            }}
          >
            Track and manage your medical event records easily
          </div>
        </div>

        {/* Filter */}
        <div
          style={{
            padding: "0 24px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <b>Filter: </b>
          <Select
            value={filterSeverity}
            style={{width: 160}}
            onChange={setFilterSeverity}
            placeholder="Filter by severity"
          >
            <Select.Option value="all">All</Select.Option>
            <Select.Option value="Low">Low</Select.Option>
            <Select.Option value="Medium">Medium</Select.Option>
            <Select.Option value="High">High</Select.Option>
          </Select>
        </div>

        {/* List */}
        <div style={{padding: "0 24px"}}>
          {loadingEvents || !showList ? (
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 32,
                textAlign: "center",
                fontSize: 30,
                letterSpacing: 8,
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                color: "#222",
              }}
            >
              <span>
                <span style={{opacity: dotIndex === 0 ? 1 : 0.3}}>.</span>
                <span style={{opacity: dotIndex === 1 ? 1 : 0.3}}>.</span>
                <span style={{opacity: dotIndex === 2 ? 1 : 0.3}}>.</span>
              </span>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div
              style={{
                borderRadius: 12,
                padding: 32,
                textAlign: "center",
                fontSize: 20,
                color: "#888",
                marginTop: 40,
              }}
            >
              No medical events found.
            </div>
          ) : (
            <div
              className="animate__animated animate__fadeIn"
              style={{
                borderRadius: 20,
                overflowY: "auto",
                overflowX: "hidden",
                paddingRight: 8,
                maxHeight: 520,
              }}
            >
              <div style={{display: "flex", flexDirection: "column", gap: 16}}>
                {filteredEvents.map((event) => (
                  <Card
                    key={event.medicalEvent.eventId}
                    style={{
                      borderRadius: 12,
                      width: "100%",
                      boxShadow: "0 2px 8px #f0f1f2",
                      padding: 0,
                      border: "1px solid #f0f0f0",
                    }}
                    bodyStyle={{padding: 20}}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      {/* Student Info */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flex: 2,
                        }}
                      >
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            background:
                              "linear-gradient(180deg, #2B5DC4 0%, #2B5DC4 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 22,
                            color: "#fff",
                            marginRight: 14,
                          }}
                        >
                          {selectedStudent?.fullName?.[0] || "U"}
                        </div>
                        <div>
                          <div style={{fontWeight: 700, fontSize: 17}}>
                            {selectedStudent?.fullName}
                          </div>
                          <div style={{color: "#888", fontSize: 15}}>
                            {event.medicalEvent.eventType}
                          </div>
                        </div>
                      </div>

                      {/* Date and Location */}
                      <div style={{flex: 2, padding: "0 20px"}}>
                        <div
                          style={{
                            color: "#355383",
                            fontSize: 15,
                            marginBottom: 4,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <span style={{marginRight: 6}}>📅</span>
                          {event.medicalEvent.eventDate}
                        </div>
                        <div
                          style={{
                            color: "#1bbf7a",
                            fontSize: 15,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <span style={{marginRight: 6}}>📍</span>
                          {event.medicalEvent.location}
                        </div>
                      </div>

                      {/* Severity */}
                      <div style={{flex: 1.5}}>
                        <div
                          style={{
                            color: "#a259e6",
                            fontSize: 15,
                            marginBottom: 8,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <span style={{marginRight: 6}}>🏥</span>
                          <span style={{fontWeight: 600}}>
                            {event.medicalEvent.description?.substring(0, 20) ||
                              "No description"}
                            {event.medicalEvent.description?.length > 20
                              ? "..."
                              : ""}
                          </span>
                        </div>
                        {renderSeverityTag(event.medicalEvent.severityLevel)}
                      </div>

                      {/* Action */}
                      <div
                        style={{
                          flex: 1.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: 16,
                        }}
                      >
                        <Button
                          style={{
                            borderRadius: 8,
                            background: "#fff",
                            color: "#355383",
                            border: "1px solid #355383",
                            fontWeight: 600,
                            minWidth: 90,
                            height: 42,
                          }}
                          onClick={() => {
                            localStorage.setItem(
                              "eventId",
                              event.medicalEvent.eventId
                            );
                            navigate("/parent/medical-event/children-detail", {
                              state: {eventId: event.medicalEvent.eventId},
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
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          background: "#fff",
          padding: "12px 0",
          borderRadius: "0 0 20px 20px",
        }}
      >
        <Pagination
          current={pageIndex}
          pageSize={pageSize}
          total={total}
          onChange={setPageIndex}
        />
        <Button
          onClick={() => {
            localStorage.removeItem("studentId");
            navigate("/parent/medical-event/children-list");
          }}
          style={{marginLeft: 16, borderRadius: 8}}
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default MedicalEventList;
