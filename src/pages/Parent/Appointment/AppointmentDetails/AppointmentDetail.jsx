import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {Card, Descriptions, Button, Tag, Spin} from "antd";
import axiosInstance from "../../../../api/axios";
import {useSelector} from "react-redux";

const AppointmentDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const appointmentId = location.state?.id;
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log(appointmentId);
  const userId = useSelector((state) => state.user?.userId);
  useEffect(() => {
    if (!appointmentId) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `/api/parents/${userId}/appointments/${appointmentId}`
        );
        setAppointment(res.data);
        // console.log("Appointment Details:", res.data);
      } catch (error) {
        console.error("Error fetching appointment details:", error);
        setAppointment(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [appointmentId, userId]);

  const getStatus = (item) => {
    if (item.completionStatus) return {text: "Done", color: "blue"};
    if (item.confirmationStatus) return {text: "Confirmed", color: "green"};
    return {text: "Pending", color: "orange"};
  };

  if (!appointmentId) return <div>No Appointment Found.</div>;
  if (loading) return <Spin />;
  if (!appointment) return <div>No Appointment Details Found.</div>;

  return (
    <div
      className="appointment-history-fullscreen"
      style={{
        backgroundColor: "none !important",
        height: "100vh",
        margin: "20px 20px",
        boxShadow: "none !important",
        borderRadius: 20,
      }}
    >
      <div
        style={{
          margin: "0 auto",
          padding: "32px 30px",
        }}
      >
        <h1 style={{fontSize: 28, fontWeight: 700, marginBottom: 32}}>
          Appointment Detail
        </h1>
        <Card title="Appointment Details" style={{width: "100%"}}>
          <Descriptions
            column={1}
            bordered
            labelStyle={{width: 400, fontWeight: 600}}
            contentStyle={{fontWeight: 400}}
            size="middle"
          >
            <Descriptions.Item label="Student Name">
              {appointment.student?.fullName || "..."}
            </Descriptions.Item>
            <Descriptions.Item label="Date">
              {appointment.appointmentDate}
            </Descriptions.Item>
            <Descriptions.Item label="Time">
              {appointment.appointmentStartTime?.slice(0, 5)} -{" "}
              {appointment.appointmentEndTime?.slice(0, 5)}
            </Descriptions.Item>
            <Descriptions.Item label="Topic">
              {appointment.topic}
            </Descriptions.Item>
            <Descriptions.Item label="Reason">
              {appointment.appointmentReason}
            </Descriptions.Item>
            <Descriptions.Item label="Nurse">
              {appointment.staffNurse?.fullName || "..."}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag
                color={getStatus(appointment).color}
                style={{
                  padding: "6px 12px",
                  fontSize: 14,
                  textAlign: "center",
                  borderRadius: 8,
                }}
              >
                {getStatus(appointment).text}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
          <div style={{display: "flex", gap: 20, marginTop: 24}}>
            <Button type="default" onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentDetail;
