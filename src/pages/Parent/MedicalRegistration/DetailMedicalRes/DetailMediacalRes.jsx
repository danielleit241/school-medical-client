import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import axiosInstance from "../../../../api/axios";
import Swal from "sweetalert2";
import {Card, Descriptions, Tag, Spin, Button} from "antd";

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

  const {medicalRegistration, nurseApproved, student} = detail;

  return (
    <Card
      title={`Medication Registration Detail - ${
        student?.studentFullName || ""
      }`}
      style={{
        maxWidth: 1000,
        margin: "32px auto",
        height: "75vh",
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
      <Descriptions
        column={1}
        bordered
        labelStyle={{width: 200, height: "auto"}}
        contentStyle={{width: "100%"}}
        style={{flex: 1}}
      >
        <Descriptions.Item label="Student Name">
          {student?.studentFullName}
        </Descriptions.Item>
        <Descriptions.Item label="Medication Name">
          {medicalRegistration?.medicationName}
        </Descriptions.Item>
        <Descriptions.Item label="Dosage">
          {medicalRegistration?.dosage}
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
                <b>Notes:</b> {nurseApproved.staffNurseNotes || ""}
              </div>
            </>
          ) : (
            <Tag color="orange">Pending</Tag>
          )}
        </Descriptions.Item>
      </Descriptions>
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
          Quay lại
        </Button>
      </div>
    </Card>
  );
};

export default DetailMedicalRes;
