import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import axiosInstance from "../../../../api/axios";
import {Card, Button, Row, Col, Tag, Pagination, Spin, Select} from "antd";
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

  // Filter by severity
  const filteredEvents =
    filterSeverity === "all"
      ? events
      : events.filter(
          (event) => event.medicalEvent.severityLevel === filterSeverity
        );

  // Chia events thành nhiều dòng, mỗi dòng 3 phần tử
  const rows = [];
  for (let i = 0; i < filteredEvents.length; i += 3) {
    rows.push(filteredEvents.slice(i, i + 3));
  }

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
        <div style={{display: "flex", flexDirection: "column"}}>
          <div
            style={{
              padding: "0 32px",
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
            >
              <Select.Option value="all">All</Select.Option>
              <Select.Option value="Low">Low</Select.Option>
              <Select.Option value="Medium">Medium</Select.Option>
              <Select.Option value="High">High</Select.Option>
            </Select>
          </div>
          {/* List */}
          <div
            style={{
              borderRadius: 20,
              minHeight: 300,
              maxHeight: 520,
              overflowY: "auto",
              overflowX: "hidden",
              padding: "0 32px 0 32px",
            }}
          >
            {loadingEvents ? (
              <Spin style={{marginTop: 40}} />
            ) : filteredEvents.length === 0 ? (
              <div
                style={{
                  borderRadius: 12,
                  padding: 32,
                  textAlign: "center",
                  fontSize: 20,
                  color: "#888",
                  marginTop: 40,
                  background: "#fff",
                }}
              >
                No medical events found.
              </div>
            ) : (
              rows.map((row, rowIndex) => (
                <Row
                  gutter={[24, 24]}
                  key={rowIndex}
                  style={{marginBottom: 0, width: "100%"}}
                >
                  {row.map((event) => (
                    <Col
                      xs={24}
                      sm={12}
                      md={8}
                      key={event.medicalEvent.eventId}
                    >
                      <Card
                        style={{
                          borderRadius: 12,
                          minHeight: 240,
                          boxShadow: "0 2px 8px #f0f1f2",
                          padding: 0,
                        }}
                        bodyStyle={{padding: 20}}
                        title={
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <span
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(180deg, #2B5DC4 0%, #2B5DC4 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: 20,
                              }}
                            >
                              {selectedStudent?.fullName?.[0] || "U"}
                            </span>
                            <span style={{fontWeight: 700, fontSize: 17}}>
                              {selectedStudent?.fullName}
                            </span>
                          </div>
                        }
                        extra={
                          event.medicalEvent.severityLevel === "Low" ? (
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
                          ) : event.medicalEvent.severityLevel === "Medium" ? (
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
                          ) : (
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
                          )
                        }
                      >
                        <div style={{marginBottom: 15, fontSize: 18}}>
                          <b style={{fontSize: 16}}>Date:</b>{" "}
                          {event.medicalEvent.eventDate}
                        </div>
                        <div style={{marginBottom: 15, fontSize: 18}}>
                          <b style={{fontSize: 16}}>Location:</b>{" "}
                          {event.medicalEvent.location}
                        </div>
                        <div style={{marginBottom: 15, fontSize: 18}}>
                          <b style={{fontSize: 16}}>Event Type:</b>{" "}
                          {event.medicalEvent.eventType}
                        </div>
                        <div style={{display: "flex", gap: 8, marginTop: 16}}>
                          <Button
                            type="primary"
                            style={{
                              borderRadius: 8,
                              background:
                                "linear-gradient(90deg, #2563ad 0%, #2563ad 100%)",
                              border: "none",
                              fontWeight: 600,
                              minWidth: 90,
                            }}
                            onClick={() => {
                              localStorage.setItem(
                                "eventId",
                                event.medicalEvent.eventId
                              );
                              navigate(
                                "/parent/medical-event/children-detail",
                                {
                                  state: {eventId: event.medicalEvent.eventId},
                                }
                              );
                            }}
                          >
                            Details
                          </Button>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ))
            )}
          </div>
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
