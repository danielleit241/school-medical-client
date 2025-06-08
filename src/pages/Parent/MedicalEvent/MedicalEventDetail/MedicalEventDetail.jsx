import React, {useEffect, useState} from "react";
import {Card, Tag, Spin, Descriptions, Divider, List, Button} from "antd";
import axiosInstance from "../../../../api/axios";
import {useLocation, useNavigate} from "react-router-dom";

const MedicalEventDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const eventId = location.state?.eventId || localStorage.getItem("eventId");

  const [eventDetail, setEventDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!eventId) {
      navigate("/parent/medical-event/children-list");
    }
  }, [eventId, navigate]);

  useEffect(() => {
    if (!eventId) return;
    setLoadingDetail(true);
    axiosInstance
      .get(`/api/parents/students/medical-events/${eventId}`)
      .then((res) => setEventDetail(res.data))
      .catch(() => setEventDetail(null))
      .finally(() => setLoadingDetail(false));
  }, [eventId]);

  const handleBack = () => {
    localStorage.removeItem("eventId");
    navigate("/parent/medical-event/children-event-list");
  };

  if (loadingDetail) {
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
          <Button type="default" onClick={handleBack}>
            Back
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MedicalEventDetail;
