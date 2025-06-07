import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../api/axios";
import { Card, Button, Spin, Empty, Tag, DatePicker, Input, Descriptions } from "antd";
import dayjs from "dayjs";
import { useSelector } from "react-redux";

const AppointmentList = () => {
  const staffNurseId = useSelector((state) => state.user?.userId);
  console.log("Staff Nurse ID:", staffNurseId);
   const parentId = useSelector((state) => state.user?.parentId);
   console.log("Parent ID:", parentId);
 
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [dateRequest, setDateRequest] = useState(dayjs().format("YYYY-MM-DD"));
  const [pageIndex, setPageIndex] = useState(1);

  // Step 1: Fetch appointment list
  useEffect(() => {
    if (step !== 1 || !staffNurseId) return;

    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/api/nurses/${staffNurseId}/appointments`, {
          params: { dateRequest, PageSize: 10, PageIndex: pageIndex },
        });
        const data = Array.isArray(response.data) ? response.data : (response.data?.items || []);
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [staffNurseId, dateRequest, pageIndex, step]);

  const updateStatus = async (appointmentId, confirmationStatus, completionStatus) => {
  if (step === 2 && selectedAppointment) {
    setSelectedAppointment(prev => ({
      ...prev,
      confirmationStatus,
      completionStatus,
    }));
  }
  try {
    const res = await axiosInstance.put(`/api/nurses/appointments/${appointmentId}`, {
      staffNurseId,
      confirmationStatus,
      completionStatus,
    });
    const {notificationTypeId, senderId, receiverId} = res.data;

      // eslint-disable-next-line no-unused-vars
      const notificationResponse = await axiosInstance.post(
        "/api/notification/appoiments/to-parent",
        {
          notificationTypeId,
          senderId,
          receiverId,
        }
      );
  } catch (error) {
    console.error("Error updating appointment status or sending notification:", error);
  }
};

  const handleDetail = async (appointmentId) => {
    setDetailLoading(true);
    try {
      const response = await axiosInstance.get(`/api/nurses/${staffNurseId}/appointments/${appointmentId}`);
      setSelectedAppointment({ ...(response.data.item || response.data) });
      if (step !== 2) setStep(2);
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      setSelectedAppointment(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatus = (item) => {
    if (item.completionStatus) return { text: "Completed", color: "blue" };
    if (item.confirmationStatus) return { text: "Confirmed", color: "green" };
    return { text: "Pending", color: "orange" };
  };

  return (
    <Card
      title={step === 1 ? "Manage Appointments" : "Appointment Details"}
      style={{ maxWidth: 800, margin: "0 auto", marginTop: 24 }}
      extra={step === 2 && <Button onClick={() => setStep(1)}>Back</Button>}
    >
      {step === 1 ? (
        <>
          <div style={{ marginBottom: 16, display: "flex", gap: 16 }}>
            <DatePicker
              value={dayjs(dateRequest)}
              format="YYYY-MM-DD"
              onChange={(_, dateString) => setDateRequest(dateString)}
              allowClear={false}
            />
            <Input
              type="number"
              min={1}
              value={pageIndex}
              onChange={e => setPageIndex(Number(e.target.value))}
              style={{ width: 100 }}
              placeholder="Page"
            />
          </div>
          {loading ? (
            <Spin />
          ) : appointments.length === 0 ? (
            <Empty description="No appointments found" />
          ) : (
            appointments.map(item => {
              const statusObj = getStatus(item);
              return (
                <Card
                  key={item.appointmentId}
                  style={{ marginBottom: 16, borderRadius: 12 }}
                  bodyStyle={{ padding: 18 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <div><b>Student:</b> {item.student?.fullName || "..."}</div>
                      <div><b>Date:</b> {item.appointmentDate || "..."} &nbsp;
                        <b>Time:</b> {item.appointmentStartTime?.slice(0,5) || "..."} - {item.appointmentEndTime?.slice(0,5) || "..."}</div>
                      <div><b>Topic:</b> {item.topic || "..."}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                      <Tag color={statusObj.color} style={{ fontWeight: 500, fontSize: 15, marginBottom: 8 }}>
                        {statusObj.text}
                      </Tag>
                      <Button
                        onClick={() => handleDetail(item.appointmentId)}
                        style={{ minWidth: 90 }}
                      >
                        Details
                      </Button>
                      {step === 2 && !item.confirmationStatus && (
                        <Button
                          type="primary"
                          size="small"
                          style={{ marginTop: 8 }}
                          onClick={() => updateStatus(item.appointmentId, true, false)}
                        >
                          Confirm
                        </Button>
                      )}
                      {step === 2 && item.confirmationStatus && !item.completionStatus && (
                        <Button
                          type="primary"
                          size="small"
                          style={{ marginTop: 8, background: "#355383" }}
                          onClick={() => updateStatus(item.appointmentId, true, true)}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </>
      ) : (
        detailLoading || !selectedAppointment ? (
          <Spin />
        ) : (
          <div>
            <Descriptions
              column={1}
              bordered
              labelStyle={{ width: 220, fontWeight: 600 }}
              contentStyle={{ fontWeight: 400 }}
              size="middle"
            >
              <Descriptions.Item label="Student">
                {selectedAppointment.student?.fullName || "..."}
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {selectedAppointment.appointmentDate}
              </Descriptions.Item>
              <Descriptions.Item label="Time">
                {selectedAppointment.appointmentStartTime?.slice(0,5)} - {selectedAppointment.appointmentEndTime?.slice(0,5)}
              </Descriptions.Item>
              <Descriptions.Item label="Topic">
                {selectedAppointment.topic}
              </Descriptions.Item>
              <Descriptions.Item label="Reason">
                {selectedAppointment.appointmentReason}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatus(selectedAppointment).color}>
                  {getStatus(selectedAppointment).text}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
              {!selectedAppointment.confirmationStatus && (
                <Button
                  type="primary"
                  onClick={() => updateStatus(selectedAppointment.appointmentId, true, false)}
                >
                  Confirm
                </Button>
              )}
              {selectedAppointment.confirmationStatus && !selectedAppointment.completionStatus && (
                <Button
                  type="primary"
                  style={{ background: "#355383" }}
                  onClick={() => updateStatus(selectedAppointment.appointmentId, true, true)}
                >
                  Complete
                </Button>
              )}
            </div>
          </div>
        )
      )}
     
    </Card>
  );
};

export default AppointmentList;
