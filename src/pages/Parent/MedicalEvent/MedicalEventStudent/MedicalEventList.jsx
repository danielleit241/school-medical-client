import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import axiosInstance from "../../../../api/axios";
import {Card, Button, Row, Col, Tag, Pagination, Spin} from "antd";
import MedicalEventDetail from "../MedicalEventDetail/MedicalEventDetail";
import {useNavigate, useLocation} from "react-router-dom";

const MedicalEventList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const parentId = useSelector((state) => state.user?.userId);

  // Lấy student từ state hoặc localStorage
  const [selectedStudent, setSelectedStudent] = useState(
    location.state?.student || null
  );
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    // Nếu không có student, chuyển về trang chọn học sinh
    if (!selectedStudent) {
      const studentId = localStorage.getItem("studentId");
      if (studentId) {
        // Nếu có studentId trong localStorage, fetch lại thông tin học sinh
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

  // Chia events thành nhiều dòng, mỗi dòng 5 phần tử
  const rows = [];
  for (let i = 0; i < events.length; i += 5) {
    rows.push(events.slice(i, i + 5));
  }

  return (
    <div style={{padding: 20}}>
      <h2 style={{margin: 0, fontWeight: 600, marginBottom: 16}}>
        Medical Events of {selectedStudent?.fullName}
      </h2>
      {loadingEvents ? (
        <Spin style={{marginTop: 40}} />
      ) : events.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "#888",
            marginTop: 40,
            fontSize: 18,
          }}
        >
          No medical events found.
        </div>
      ) : (
        <>
          {rows.map((row, rowIndex) => (
            <Row
              gutter={[16, 16]}
              key={rowIndex}
              style={{
                marginBottom: 16,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "left",
                alignItems: "center",
                width: "100%",
                gap: 50,
              }}
            >
              {row.map((event) => (
                <Col span={4} key={event.medicalEvent.eventId}>
                  <Card
                    title={selectedStudent.fullName}
                    extra={
                      event.medicalEvent.severityLevel === "Low" ? (
                        <Tag color="green">
                          {"Severity: " + event.medicalEvent.severityLevel}
                        </Tag>
                      ) : event.medicalEvent.severityLevel === "Medium" ? (
                        <Tag color="orange">
                          {"Severity: " + event.medicalEvent.severityLevel}
                        </Tag>
                      ) : (
                        <Tag color="red">
                          {"Severity: " + event.medicalEvent.severityLevel}
                        </Tag>
                      )
                    }
                    style={{
                      minWidth: 300,
                      borderRadius: 8,
                      boxShadow: "0 0px 5px rgba(0, 0, 0, 0.1)",
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <p>
                        <b>Student Name:</b> {selectedStudent.fullName}
                      </p>
                      <p>
                        <b>Date:</b> {event.medicalEvent.eventDate}
                      </p>
                      <p>
                        <b>Location:</b> {event.medicalEvent.location}
                      </p>
                      <p>
                        <b>Event Type:</b> {event.medicalEvent.eventType}
                      </p>
                    </div>
                    <div style={{display: "flex", gap: 8, marginTop: 16}}>
                      <Button
                        type="primary"
                        style={{backgroundColor: "#355383"}}
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
                  </Card>
                </Col>
              ))}
            </Row>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "left",
              marginTop: 24,
            }}
          >
            <div>
              <Pagination
                current={pageIndex}
                pageSize={pageSize}
                total={total}
                onChange={setPageIndex}
              />
            </div>
            <div>
              <Button
                onClick={() => {
                  localStorage.removeItem("studentId");
                  navigate("/parent/medical-event/children-list");
                }}
                style={{marginBottom: 16}}
              >
                Back
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MedicalEventList;
