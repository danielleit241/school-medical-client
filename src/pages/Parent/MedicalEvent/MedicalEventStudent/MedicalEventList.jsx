import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "../../../../api/axios";
import { setListStudentParent } from "../../../../redux/feature/listStudentParent";
import { Card, Button, Row, Col, Pagination, Spin, Descriptions, Tag, Divider, List } from "antd";


const MedicalEventList = () => {
  const dispatch = useDispatch();
  const parentId = useSelector((state) => state.user?.userId);

  // Step control
  const [step, setStep] = useState(1);

  // Step 1: List students
  const [data, setData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Step 2: List medical events
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Step 3: Medical event detail
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventDetail, setEventDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Step 1: Fetch students
  useEffect(() => {
    if (step !== 1) return;
    const fetchApi = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/parents/${parentId}/students`
        );
        setData(response.data);
        dispatch(setListStudentParent(response.data));
      } catch (error) {
        console.error("Error fetching children data:", error);
        setData([]);
      }
    };
    fetchApi();
  }, [parentId, dispatch, step]);

  // Step 2: Fetch medical events of student
  useEffect(() => {
    if (step !== 2 || !selectedStudent) return;
    setLoadingEvents(true);
    axiosInstance
      .get(`/api/parents/students/${selectedStudent.studentId}/medical-events`, {
        params: {
          pageIndex,
          pageSize,
          studentId: selectedStudent.studentId,
        },
      })
      .then((res) => {
        setEvents(res.data.items || []);
        setTotal(res.data.count || 0);
      })
      .catch(() => {
        setEvents([]);
        setTotal(0);
      })
      .finally(() => setLoadingEvents(false));
  }, [step, selectedStudent, pageIndex, pageSize]);

  // Step 3: Fetch medical event detail
  useEffect(() => {
    if (step !== 3 || !selectedEventId) return;
    setLoadingDetail(true);
    axiosInstance
      .get(`/api/parents/students/medical-events/${selectedEventId}`)
      .then((res) => setEventDetail(res.data))
      .catch(() => setEventDetail(null))
      .finally(() => setLoadingDetail(false));
  }, [step, selectedEventId]);

  // Step 1: Student list
  if (step === 1) {
    return (
      <div
        style={{
          padding: "30px",
          background: "#ffffff",
          height: "100%",
          borderRadius: "20px",
          boxShadow: "0 0px 15px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1>My Children</h1>
        <Row gutter={[16, 16]}>
          {data.map((item) => (
            <Col xs={24} sm={12} md={8} lg={6} key={item.studentId}>
              <Card title={item.fullName} style={{ minHeight: 220 }}>
                <p>
                  <b>Mã HS:</b> {item.studentCode}
                </p>
                <p>
                  <b>Ngày sinh:</b> {item.dayOfBirth}
                </p>
                <p>
                  <b>Lớp:</b> {item.grade.trim()}
                </p>
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedStudent(item);
                      setStep(2);
                      setPageIndex(1);
                    }}
                  >
                    View
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  // Step 2: Medical events list
  if (step === 2) {
    return (
      <div
        style={{
          padding: "30px",
          background: "#ffffff",
          height: "100%",
          borderRadius: "20px",
          boxShadow: "0 0px 15px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Button onClick={() => setStep(1)} style={{ marginBottom: 16 }}>
          Back
        </Button>
        <h2>Medical Events of {selectedStudent?.fullName}</h2>
        {loadingEvents ? (
          <Spin />
        ) : events.length === 0 ? (
          <div>No medical events found.</div>
        ) : (
          <>
            <Row
              gutter={[16, 16]}
              style={{
                marginBottom: 16,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "flex-start",
                alignItems: "stretch",
                width: "100%",
              }}
            >
              {events.map((event) => (
                <Col
                  xs={24}
                  sm={12}
                  md={8}
                  lg={6}
                  xl={5}
                  key={event.medicalEvent.eventId}
                  style={{ display: "flex" }}
                >
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
                      minWidth: 220,
                      maxWidth: 260,
                      borderRadius: 8,
                      boxShadow: "0 0px 5px rgba(0, 0, 0, 0.1)",
                      marginBottom: 16,
                      flex: 1,
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
                    <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                      <Button
                        type="primary"
                        style={{ backgroundColor: "#355383" }}
                        onClick={() => {
                          setSelectedEventId(event.medicalEvent.eventId);
                          setStep(3);
                        }}
                      >
                        Details
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Pagination
                current={pageIndex}
                pageSize={pageSize}
                total={total}
                onChange={setPageIndex}
              />
            </div>
          </>
        )}
      </div>
    );
  }

  // Step 3: Medical event detail
  if (step === 3) {
    if (loadingDetail) {
      return (
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Spin />
        </div>
      );
    }
    if (!eventDetail) {
      return <div>No medical event found.</div>;
    }
    const { medicalEvent, studentInfo, medicalRequests } = eventDetail;
    return (
      <div
        style={{
          width: "80%",
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          boxSizing: "border-box",
        }}
      >
        <Card
          title="Medical Event Detail"
          extra={
            medicalEvent.severityLevel === "Low" ? (
              <Tag color="green">{"Severity: " + medicalEvent.severityLevel}</Tag>
            ) : medicalEvent.severityLevel === "Medium" ? (
              <Tag color="orange">
                {"Severity: " + medicalEvent.severityLevel}
              </Tag>
            ) : (
              <Tag color="red">{"Severity: " + medicalEvent.severityLevel}</Tag>
            )
          }
          style={{
            minWidth: 300,
            borderRadius: 8,
            boxShadow: "0 0px 5px rgba(0, 0, 0, 0.1)",
            marginBottom: 16,
          }}
        >
          <Descriptions column={1} labelStyle={{ width: 400 }} bordered>
            <Descriptions.Item label="Student Code">
              {studentInfo?.studentCode || ""}
            </Descriptions.Item>
            <Descriptions.Item label="Full Name">
              {studentInfo?.fullName || ""}
            </Descriptions.Item>
            <Descriptions.Item label="Event Date">
              {medicalEvent?.eventDate || ""}
            </Descriptions.Item>
            <Descriptions.Item label="Event Type">
              {medicalEvent?.eventType || ""}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {medicalEvent?.eventDescription || ""}
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              {medicalEvent?.location || ""}
            </Descriptions.Item>
            <Descriptions.Item label="Severity Level">
              {medicalEvent?.severityLevel || ""}
            </Descriptions.Item>
            <Descriptions.Item label="Notes">
              {medicalEvent?.notes || ""}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left" style={{ marginTop: 32 }}>
            Medical Requests
          </Divider>
          <List
            dataSource={medicalRequests}
            bordered
            locale={{ emptyText: "No medical requests" }}
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

          <div style={{ display: "flex", gap: 20, marginTop: 24 }}>
            <Button type="default" onClick={() => setStep(2)}>
              Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};

export default MedicalEventList;
