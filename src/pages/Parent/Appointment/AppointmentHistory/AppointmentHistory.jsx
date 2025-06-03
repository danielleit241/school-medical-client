import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../../api/axios';
import { useSelector } from 'react-redux';
import { Card, Spin, Empty, Button, Tag, Descriptions, Row, Col, Select } from 'antd';
import './index.scss';

const { Option } = Select;

const AppointmentHistory = () => {
  const userId = useSelector((state) => state.user?.userId);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("Pending");

  // Fetch appointments
  useEffect(() => {
    if (step !== 1 || !userId) return;
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/api/parents/${userId}/appointments`, {
          params: { PageSize: 20, PageIndex: 1 }
        });
        const data = response.data;
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
        setAppointments(arr);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [userId, step]);

  // Fetch appointment details
  const handleDetail = async (appointmentId) => {
    setDetailLoading(true);
    try {
      const response = await axiosInstance.get(`/api/parents/${userId}/appointments/${appointmentId}`);
      setSelectedAppointment(response.data);
      setStep(2);
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      setSelectedAppointment(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatus = (item) => {
    if (item.completionStatus) return { text: "Done", color: "blue" };
    if (item.confirmationStatus) return { text: "Confirmed", color: "green" };
    return { text: "Pending", color: "orange" };
  };

  // Filter logic theo yêu cầu
  const getFilteredAppointments = () => {
    let filtered = appointments.filter(item => getStatus(item).text === filterStatus);
    if (filtered.length === 0) {
      if (filterStatus === "Pending") {
        filtered = appointments.filter(item => getStatus(item).text === "Confirmed");
        if (filtered.length === 0) {
          filtered = appointments.filter(item => getStatus(item).text === "Done");
          if (filtered.length === 0) return [];
          setFilterStatus("Done");
        } else {
          setFilterStatus("Confirmed");
        }
      } else if (filterStatus === "Confirmed") {
        filtered = appointments.filter(item => getStatus(item).text === "Done");
        if (filtered.length === 0) return [];
        setFilterStatus("Done");
      }
    }
    return filtered;
  };

  const filteredAppointments = getFilteredAppointments();

  return (
    <div className="appointment-history-fullscreen" style={{
          backgroundColor: "#ffffff",
          height: "100vh",
          margin: "20px 20px",
          boxShadow: "0 0px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: 20,
        }}>
      <div
        style={{

          margin: "0 auto",
          padding: "32px 30px"
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32 }}>Appointment History</h1>
        {step === 1 ? (
          <>
            <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
              <b>Filter: </b>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 200 }}
                placeholder="Filter by status"
              >
                <Option value="Pending">Pending</Option>
                <Option value="Confirmed">Confirmed</Option>
                <Option value="Done">Done</Option>
              </Select>
            </div>
            {loading ? (
              <Spin />
            ) : filteredAppointments.length === 0 ? (
              <Empty description="No appointments found" />
            ) : (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  boxShadow: "0 0px 8px rgba(0, 0, 0, 0.1)",
                  padding: 24,
                  minHeight: 300,
                }}
              >
                <Row gutter={[24, 24]}>
                  {filteredAppointments.map(item => {
                    const statusObj = getStatus(item);
                    return (
                      <Col xs={24} sm={12} md={8} lg={6} key={item.appointmentId}>
                        <Card
                          style={{
                            borderRadius: 16,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                            minHeight: 230,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                          }}
                          bodyStyle={{ padding: 20, display: "flex", flexDirection: "column", height: "100%" }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 8 }}>
                              {item.student.fullName || "..."}
                            </div>
                            <div style={{ marginBottom: 4 }}>
                              <b>Date:</b> {item.appointmentDate}
                            </div>
                            <div style={{ marginBottom: 4 }}>
                              <b>Time:</b> {item.appointmentStartTime?.slice(0, 5)} - {item.appointmentEndTime?.slice(0, 5)}
                            </div>
                            <div style={{ marginBottom: 4 }}>
                              <b>Topic:</b> {item.topic}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", marginTop: 18 }}>
                            <Tag
                              color={statusObj.color}
                              style={{
                                padding: "6px 20px",
                                fontSize: 14,
                                textAlign: "center",
                                borderRadius: 8,
                              }}
                            >
                              {statusObj.text}
                            </Tag>
                            <Button
                              color="default" variant="outlined"
                              onClick={() => handleDetail(item.appointmentId)}
                            >
                              Details
                            </Button>
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            )}
          </>
        ) : detailLoading || !selectedAppointment ? (
          <Spin />
        ) : (
          <div style={{ maxWidth: 1000, margin: "32px auto" }}>
            <Card
              title="Appointment Details"
              style={{
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              }}
              bodyStyle={{ padding: 24 }}
              extra={<Button color="default" variant="outlined" onClick={() => setStep(1)}>Back</Button>}
            >
              <Descriptions
                column={1}
                bordered
                labelStyle={{ width: 180, fontWeight: 600 }}
                contentStyle={{ fontWeight: 400 }}
                size="middle"
              >
                <Descriptions.Item label="Student Name">
                  {selectedAppointment.student.fullName || "..."}
                </Descriptions.Item>
                <Descriptions.Item label="Date">
                  {selectedAppointment.appointmentDate}
                </Descriptions.Item>
                <Descriptions.Item label="Time">
                  {selectedAppointment.appointmentStartTime?.slice(0, 5)} - {selectedAppointment.appointmentEndTime?.slice(0, 5)}
                </Descriptions.Item>
                <Descriptions.Item label="Topic">
                  {selectedAppointment.topic}
                </Descriptions.Item>
                <Descriptions.Item label="Reason">
                  {selectedAppointment.appointmentReason}
                </Descriptions.Item>
                <Descriptions.Item label="Nurse">
                  {selectedAppointment.staffNurse.fullName || "..."}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag
                    color={getStatus(selectedAppointment).color}
                    style={{
                      padding: "6px 12px",
                      fontSize: 14,
                      textAlign: "center",
                      borderRadius: 8,
                    }}
                  >
                    {getStatus(selectedAppointment).text}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentHistory;