import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import axiosInstance from "../../../../api/axios";
import Swal from "sweetalert2";
import {Card, Descriptions, Tag, Spin, Button, Row, Col} from "antd";

const DetailMedicalRes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const medicalRegistrationId = location.state?.registrationId;
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchApi = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/api/parents/medical-registrations/${medicalRegistrationId}`
        );
        setDetail(response.data);
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Cannot get medical registration details!",
        }).then(() => {
          navigate(-1);
        });
      } finally {
        setLoading(false);
      }
    };
    if (medicalRegistrationId) {
      fetchApi();
    } else {
      Swal.fire({
        icon: "error",
        title: "No Data",
        text: "Don't have medical registration information!",
      }).then(() => {
        navigate(-1);
      });
    }
  }, [medicalRegistrationId, navigate]);

  if (!medicalRegistrationId) {
    return <div>No medical registration data available.</div>;
  }

  if (loading || !detail) {
    return <Spin style={{marginTop: 40}} />;
  }

  const {
    medicalRegistration,
    nurseApproved,
    student,
    medicalRegistrationDetails,
  } = detail;

  return (
    <Card
      title={`Medication Registration Detail - ${
        student?.studentFullName || ""
      }`}
      style={{
        maxWidth: 1200,
        margin: "32px auto",
        minHeight: "75vh",
        display: "flex",
        flexDirection: "column",
      }}
      bodyStyle={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        padding: "30px",
      }}
      extra={
        nurseApproved?.dateApproved ? (
          <Tag color="green">Nurse Approved</Tag>
        ) : (
          <Tag color="orange">Pending Nurse</Tag>
        )
      }
    >
      <Row gutter={32}>
        {/* Main info */}
        <Col xs={24} md={14}>
          <Descriptions
            column={1}
            bordered
            labelStyle={{
              width: 260,
              height: 70,
              minWidth: 200,
              fontWeight: 500,
              fontSize: 16,
            }}
            contentStyle={{width: 400, minWidth: 250, fontSize: 16}}
            style={{flex: 1, marginBottom: 24}}
          >
            <Descriptions.Item label="Student Name">
              {student?.studentFullName}
            </Descriptions.Item>
            <Descriptions.Item label="Medication Name">
              {medicalRegistration?.medicationName}
            </Descriptions.Item>
            <Descriptions.Item label="Total Dosages (per day)">
              {medicalRegistration?.totalDosages}
            </Descriptions.Item>
            <Descriptions.Item label="Date Submitted">
              {medicalRegistration?.dateSubmitted}
            </Descriptions.Item>
            <Descriptions.Item label="Parent Notes">
              {medicalRegistration?.notes}
            </Descriptions.Item>
            <Descriptions.Item label="Parent Consent">
              {medicalRegistration?.parentConsent ? (
                <Tag color="blue">Yes</Tag>
              ) : (
                <Tag color="red">No</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Nurse Approved">
              {nurseApproved?.dateApproved ? (
                <>
                  <Tag color="green">Approved</Tag>
                  <div className="mt-2">
                    <b>Date:</b> {nurseApproved?.dateApproved || ""}
                  </div>
                </>
              ) : (
                <Tag color="orange">Pending</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Col>

        {/* Dose details */}
        <Col xs={24} md={10}>
          <div>
            <p style={{marginBottom: 16, fontWeight: 500, fontSize: 16}}>
              Dose Details
            </p>
            {nurseApproved?.dateApproved ? (
              medicalRegistrationDetails &&
              medicalRegistrationDetails.length > 0 ? (
                medicalRegistrationDetails.map((dose, idx) => (
                  <div
                    key={dose.doseNumber + idx}
                    style={{
                      background: "#f6f6f6",
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 16,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <b>
                      Dose {dose.doseNumber}{" "}
                      <span style={{fontWeight: 400}}>({dose.doseTime})</span>
                    </b>
                    <div>
                      <b>Parent Notes:</b>{" "}
                      {dose.notes || (
                        <span style={{color: "#aaa"}}>No notes</span>
                      )}
                    </div>
                    <div>
                      <b>Status:</b>{" "}
                      {dose.isCompleted ? (
                        <Tag color="green">Completed</Tag>
                      ) : (
                        <Tag color="orange">Not Completed</Tag>
                      )}
                    </div>
                    {dose.isCompleted && dose.dateCompleted && (
                      <div>
                        <b>Date Completed:</b> {dose.dateCompleted}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{color: "#aaa"}}>No dose details available.</div>
              )
            ) : (
              <div style={{color: "#aaa"}}>
                The nurse has not approved this registration yet.
              </div>
            )}
          </div>
        </Col>
      </Row>
      <div
        style={{
          margin: "24px 0",
          textAlign: "center",
          display: "flex",
          justifyContent: "left",
        }}
      >
        <Button
          type="primary"
          style={{backgroundColor: "#355383"}}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </div>
    </Card>
  );
};

export default DetailMedicalRes;
