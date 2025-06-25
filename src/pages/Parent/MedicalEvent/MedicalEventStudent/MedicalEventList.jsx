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
            Track and manage your child's medical event records easily
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
          {!showList || loadingEvents ? (
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
              {loadingEvents && <Spin size="large" style={{marginRight: 16}} />}
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
                paddingRight: 8,
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
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      {/* Left section with avatar and student name */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 15,
                          width: "30%",
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
                          }}
                        >
                          {selectedStudent?.fullName?.[0] || "U"}
                        </div>
                        <div>
                          <div style={{fontWeight: 700, fontSize: 18}}>
                            {selectedStudent?.fullName}
                          </div>
                          <div style={{color: "#666", fontSize: 14}}>
                            Student ID: {selectedStudent?.studentCode || "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Status and Details section (right aligned) */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 15,
                        }}
                      >
                        <Tag
                          color={
                            event.medicalEvent.severityLevel === "Low"
                              ? "success"
                              : event.medicalEvent.severityLevel === "Medium"
                              ? "warning"
                              : "error"
                          }
                          style={{
                            fontWeight: 600,
                            borderRadius: 20,
                            fontSize: 14,
                            padding: "4px 16px",
                            height: 32,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {event.medicalEvent.severityLevel}
                        </Tag>

                        <Button
                          style={{
                            borderRadius: 8,
                            background: "#355383",
                            color: "#fff",
                            fontWeight: 600,
                            minWidth: 90,
                            height: 40,
                            border: "none",
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

                    {/* Date, Event Type, and Location sections */}
                    <div
                      style={{
                        marginTop: 12,
                        display: "flex",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Date badge */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "6px 14px",
                          backgroundColor: "#f0f7ff",
                          borderRadius: 8,
                        }}
                      >
                        <span style={{marginRight: 8, color: "#5b8cff"}}>
                          Date:
                        </span>
                        <span style={{color: "#355383", fontWeight: 500}}>
                          {event.medicalEvent.eventDate}
                        </span>
                      </div>

                      {/* Event Type badge */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "6px 14px",
                          backgroundColor: "#fff9f6",
                          borderRadius: 8,
                        }}
                      >
                        <span style={{marginRight: 8, color: "#ff7d4d"}}>
                          Type:
                        </span>
                        <span style={{color: "#ff7d4d", fontWeight: 500}}>
                          {event.medicalEvent.eventType || "Not specified"}
                        </span>
                      </div>

                      {/* Location badge */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "6px 14px",
                          backgroundColor: "#f6f0ff",
                          borderRadius: 8,
                        }}
                      >
                        <span style={{marginRight: 8, color: "#a259e6"}}>
                          Location:
                        </span>
                        <span style={{color: "#a259e6", fontWeight: 500}}>
                          {event.medicalEvent.location || "Not specified"}
                        </span>
                      </div>
                    </div>

                    {/* Description section - full width at bottom */}
                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: "1px solid #f0f0f0",
                        color: "#666",
                        fontSize: 14,
                      }}
                    >
                      <span style={{fontWeight: 600}}>Description: </span>
                      {event.medicalEvent.description || "No description provided"}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Pagination section with back button */}
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
          style={{
            marginLeft: 16,
            borderRadius: 8,
          }}
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default MedicalEventList;
