import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../../api/axios';
import { useSelector } from 'react-redux';
import { Card, List, Spin, Empty, Button, Tag } from 'antd';
import './index.scss';

const AppointmentHistory = () => {
  const userId = useSelector((state) => state.user?.userId);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // appointment fetch (step 1)
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

  // appointment details (step 2)
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

  return (
    <div className="appointment-history-fullscreen">
      <Card
        title={step === 1 ? "Appointment History" : "Appointment Details"}
        className="appointment-history-card"
        extra={step === 2 && <Button onClick={() => setStep(1)}>Back</Button>}
      >
        {step === 1 ? (
          loading ? (
            <Spin />
          ) : appointments.length === 0 ? (
            <Empty description="No appointments found" />
          ) : (
            <List
              itemLayout="vertical"
              dataSource={appointments}
              renderItem={item => {
                const statusObj = getStatus(item);
                return (
                  <List.Item
                    key={item.appointmentId}
                    className="appointment-history-row"
                  >
                    <div className="appointment-history-row-info">
                      <div><b>Student Name:</b> {item.student.fullName || "..."}</div>
                      <div><b>Date:</b> {item.appointmentDate}</div>
                      <div><b>Time:</b> {item.appointmentStartTime?.slice(0,5)} - {item.appointmentEndTime?.slice(0,5)}</div>
                      <div><b>Topic:</b> {item.topic}</div>
                    </div>
                    <div className="appointment-history-row-actions">
                      <Tag color={statusObj.color}>{statusObj.text}</Tag>
                      <Button onClick={() => handleDetail(item.appointmentId)}>
                        Details
                      </Button>
                    </div>
                  </List.Item>
                );
              }}
            />
          )
        ) : (
          detailLoading || !selectedAppointment ? (
            <Spin />
          ) : (
            <div className="appointment-history-detail">
              <div><b>Student Name:</b> {selectedAppointment.student.fullName || "..." }</div>
              <div><b>Date:</b> {selectedAppointment.appointmentDate}</div>
              <div><b>Time:</b> {selectedAppointment.appointmentStartTime?.slice(0,5)} - {selectedAppointment.appointmentEndTime?.slice(0,5)}</div>
              <div><b>Topic:</b> {selectedAppointment.topic}</div>
              <div><b>Reason:</b> {selectedAppointment.appointmentReason}</div>
              <div><b>Nurse:</b> { selectedAppointment.staffNurse.fullName || "..." }</div>
              <div><b>Status:</b> <Tag color={getStatus(selectedAppointment).color}>{getStatus(selectedAppointment).text}</Tag></div>
            </div>
          )
        )}
      </Card>
    </div>
  );
};

export default AppointmentHistory;