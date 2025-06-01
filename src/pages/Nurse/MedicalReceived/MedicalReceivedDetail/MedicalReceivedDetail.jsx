import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import axiosInstance from "../../../../api/axios";
import Swal from "sweetalert2";
import {
  Card,
  Descriptions,
  Tag,
  Spin,
  Button,
  Input,
  Form,
  Row,
  Col,
} from "antd";
import {useSelector} from "react-redux";
import dayjs from "dayjs";

const MedicalReceivedDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const nurseId = useSelector((state) => state.user?.userId);
  const medicalRegistrationId = location.state?.registrationId;
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    const fetchApi = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/api/nurses/medical-registrations/${medicalRegistrationId}`
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
        text: "Don't have find medical registration information!",
      }).then(() => {
        navigate(-1);
      });
    }
  }, [medicalRegistrationId, navigate]);

  const handleApprove = async (values) => {
    setConfirming(true);
    if (!nurseId) {
      Swal.fire({
        icon: "error",
        title: "Don't have nurse ID",
        text: "Cannot find nurse ID. Please log in again.",
      });
      setConfirming(false);
      return;
    }
    const body = {
      staffNurseId: nurseId,
      staffNurseNotes: values.staffNurseNotes,
      dateApproved: dayjs().format("YYYY-MM-DD"),
    };
    try {
      await axiosInstance.put(
        `/api/nurses/medical-registrations/${medicalRegistrationId}`,
        body
      );
      Swal.fire({
        icon: "success",
        title: "Confirmed Successfully",
        text: "Medication registration has been confirmed.",
        showConfirmButton: false,
        timer: 1200, // 1.2 giây tự đóng
      });
      setTimeout(() => {
        navigate(-1); // hoặc window.location.reload();
      }, 1200);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Cannot confirm!",
      });
    } finally {
      setConfirming(false);
    }
  };

  if (loading || !detail) {
    return <Spin style={{marginTop: 40}} />;
  }

  const {medicalRegistration, nurseApproved, student} = detail;

  return (
    <Row gutter={24} style={{maxWidth: 1100, margin: "32px auto"}}>
      <Col xs={24} md={14}>
        <Card
          title={`Medication Registration Detail - ${
            student?.studentFullName || ""
          }`}
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
          bodyStyle={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "left",
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
                  <div>
                    <b>By:</b> {nurseApproved.staffNurseFullName || ""}
                  </div>
                  <div>
                    <b>Notes:</b> {nurseApproved.staffNurseNotes || ""}
                  </div>
                  <div>
                    <b>Date:</b> {nurseApproved.dateApproved}
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
              justifyContent: "center",
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
      </Col>
      <Col xs={24} md={10}>
        <Card
          title="Nurse Note & Approve"
          style={{
            height: "45%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
          bodyStyle={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            width: "100%",
            padding: "24px",
          }}
        >
          {nurseApproved?.dateApproved ? (
            <>
              <p>
                <b>Note:</b>{" "}
                {nurseApproved.staffNurseNotes || "No notes"}
              </p>
              <p>
                <b>Approved By:</b> {nurseApproved.staffNurseFullName || ""}
              </p>
              <p>
                <b>Date:</b> {nurseApproved.dateApproved}
              </p>
              <Tag color="green">Approved</Tag>
            </>
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleApprove}
              initialValues={{
                staffNurseNotes: "Confirmed for medication",
              }}
            >
              <Form.Item
                label="Nurse Notes"
                name="staffNurseNotes"
                rules={[{message: "Please enter notes!"}]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Enter notes for the medication..."
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={confirming}
                  style={{backgroundColor: "#355383"}}
                >
                  Confirm
                </Button>
              </Form.Item>
            </Form>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default MedicalReceivedDetail;
