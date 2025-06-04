import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {Button, Card, Descriptions, Divider, List, Spin, Tag} from "antd";
import axiosInstance from "../../../../api/axios";
import Swal from "sweetalert2";

const MedicaEventDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const eventId = location.state?.eventId;
  //   const studentId = location.state?.studentId;
  const [eventDetail, setEventDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/nurses/students/medical-events/${eventId}`
        );
        setEventDetail(response.data);
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Cannot find medical event",
          text: "Please try again or select another event.",
          confirmButtonText: "Back",
        }).then(() => {
          navigate(-1);
        });
        setEventDetail(null);
      } finally {
        setLoading(false);
      }
    };
    if (eventId) fetchEventDetail();
  }, [eventId, navigate]);

  if (loading) {
    return (
      <div style={{textAlign: "center", marginTop: 40}}>
        <Spin />
      </div>
    );
  }

  if (!eventDetail) {
    return <div>No medical event found.</div>;
  }

  const {medicalEvent, studentInfo, medicalRequests} = eventDetail;

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
        <Descriptions column={1} labelStyle={{width: 400}} bordered>
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

        <Divider orientation="left" style={{marginTop: 32}}>
          Medical Requests
        </Divider>
        <List
          dataSource={medicalRequests}
          bordered
          locale={{emptyText: "No medical requests"}}
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

        <div style={{display: "flex", gap: 20, marginTop: 24}}>
          <Button type="default" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MedicaEventDetail;
