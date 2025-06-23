import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import Swal from "sweetalert2";
import {
  Card,
  Descriptions,
  Tag,
  Spin,
  Button,
  Input,
  Row,
  Col,
  Form,
} from "antd";
import {useSelector} from "react-redux";
import dayjs from "dayjs";
import axiosInstance from "../../../../api/axios";

const MedicalReceivedDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const nurseId = useSelector((state) => state.user?.userId);
  const medicalRegistrationId = location.state?.registrationId;
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [doseNotes, setDoseNotes] = useState({});
  const [confirmingDose, setConfirmingDose] = useState(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    const fetchApi = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/api/nurses/medical-registrations/${medicalRegistrationId}`
        );
        setDetail(response.data);
        console.log("Medical registration detail:", response.data);
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

  // Complete từng dose
  const handleCompleteDose = async (doseIdx, dose) => {
    setConfirmingDose(doseIdx);
    console.log("Payload for dose:", {
      staffNurseId: nurseId,
      doseNumber: dose.doseNumber,
      dateCompleted: dayjs().format("YYYY-MM-DD"),
      notes: doseNotes[doseIdx] ?? "Medication administered on time.",
    });
    try {
      // Gửi đúng doseNumber là số thứ tự ("1", "2", "3")
      const responseComplete = await axiosInstance.put(
        `/api/nurses/medical-registrations/${medicalRegistrationId}/completed`,
        {
          staffNurseId: nurseId,
          doseNumber: String(dose.doseNumber),
          dateCompleted: dayjs().format("YYYY-MM-DD"),
          notes: doseNotes[doseIdx] ?? "Medication administered on time.",
        }
      );
      const {notificationTypeId, senderId, receiverId} = responseComplete.data;
      // eslint-disable-next-line no-unused-vars
      const notificationResponse = await axiosInstance.post(
        "/api/notifications/medical-registrations/completed/to-parent",
        {
          notificationTypeId,
          senderId,
          receiverId,
        }
      );
      // Đợi 600ms rồi mới gọi GET lại
      setTimeout(async () => {
        const response = await axiosInstance.get(
          `/api/nurses/medical-registrations/${medicalRegistrationId}`
        );
        setDetail(response.data);
        setDoseNotes((prev) => ({...prev, [doseIdx]: ""}));
      }, 1000);
    } catch (error) {
      // Sau khi GET lại, nếu dose đã complete thì không báo lỗi
      setTimeout(async () => {
        const response = await axiosInstance.get(
          `/api/nurses/medical-registrations/${medicalRegistrationId}`
        );
        setDetail(response.data);
        const updatedDose = response.data.medicalRegistrationDetails[doseIdx];
        if (updatedDose?.isCompleted) {
          Swal.fire({
            icon: "success",
            title: "Dose completed!",
            showConfirmButton: false,
            timer: 1200,
          });
          setDoseNotes((prev) => ({...prev, [doseIdx]: ""}));
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error?.response?.data?.title || "Cannot complete dose!",
          });
        }
      }, 600);
    } finally {
      setConfirmingDose(null);
    }
  };

  // Approve tổng sau khi đã complete hết
  const handleApprove = async () => {
    setApproving(true);
    try {
      const responseApproved = await axiosInstance.put(
        `/api/nurses/medical-registrations/${medicalRegistrationId}/approved`,
        {
          staffNurseId: nurseId,
          dateApproved: dayjs().format("YYYY-MM-DD"),
        }
      );

      const {notificationTypeId, senderId, receiverId} = responseApproved.data;
      // eslint-disable-next-line no-unused-vars
      const notificationResponse = await axiosInstance.post(
        "/api/notifications/medical-registrations/approved/to-parent",
        {
          notificationTypeId,
          senderId,
          receiverId,
        }
      );
      Swal.fire({
        icon: "success",
        title: "Registration approved!",
        showConfirmButton: false,
        timer: 1200,
      });
      const response = await axiosInstance.get(
        `/api/nurses/medical-registrations/${medicalRegistrationId}`
      );
      setDetail(response.data);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Cannot approve registration!",
      });
    } finally {
      setApproving(false);
    }
  };

  if (loading || !detail) {
    return <Spin style={{marginTop: 40}} />;
  }

  const {
    medicalRegistration,
    nurseApproved,
    student,
    medicalRegistrationDetails,
  } = detail;

  const allDoseCompleted =
    medicalRegistrationDetails &&
    medicalRegistrationDetails.length > 0 &&
    medicalRegistrationDetails.every((dose) => dose.isCompleted);
  return (
    <Row gutter={24} style={{maxWidth: 1300, margin: "32px auto"}}>
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
            labelStyle={{
              width: 220,
              minWidth: 180,
              fontWeight: 500,
              fontSize: 16,
            }}
            contentStyle={{width: 350, minWidth: 200, fontSize: 16}}
            style={{flex: 1}}
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
                  <div>
                    <b>By:</b> {nurseApproved.staffNurseFullName || ""}
                  </div>
                  <div>
                    <b>Date:</b> {nurseApproved.dateApproved}
                  </div>
                </>
              ) : (
                <Tag color="orange">Pending</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Medicine Image">
              {medicalRegistration?.pictureUrl ? (
                <img
                  src={medicalRegistration.pictureUrl}
                  alt="Medicine"
                  style={{
                    width: 160,
                    height: 160,
                    objectFit: "cover",
                    borderRadius: 12,
                    border: "1px solid #eee",
                    background: "#fafafa",
                    display: "block",
                  }}
                />
              ) : (
                <span style={{color: "#aaa"}}>No image</span>
              )}
            </Descriptions.Item>
          </Descriptions>
          <div
            style={{
              margin: "24px 0",
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <Button
              type="primary"
              style={{backgroundColor: "#355383"}}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            {!nurseApproved?.dateApproved && (
              <Button
                type="primary"
                loading={approving}
                style={{backgroundColor: "#52c41a"}}
                onClick={handleApprove}
              >
                Approve Registration
              </Button>
            )}
          </div>
        </Card>
      </Col>
      <Col xs={24} md={10}>
        <Card
          title="Dose Confirmation"
          style={{
            minHeight: 400,
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
          {/* Đã approve thì mới cho complete từng dose */}
          {nurseApproved?.dateApproved ? (
            <div>
              <p style={{marginBottom: 16, fontWeight: 500, fontSize: 16}}>
                Dose Details & Nurse Confirmation
              </p>
              {medicalRegistrationDetails &&
              medicalRegistrationDetails.length > 0 ? (
                // Sắp xếp tăng dần theo doseNumber trước khi map
                [...medicalRegistrationDetails]
                  .sort((a, b) => Number(a.doseNumber) - Number(b.doseNumber))
                  .map((dose, idx) => (
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
                      <b>Dose Number: {dose.doseNumber}</b>
                      <div>
                        <span>
                          <b>Dose Time:</b> {dose.doseTime}
                        </span>
                      </div>
                      <div>
                        <b>Notes:</b>{" "}
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
                      {/* Nurse confirm form for this dose */}
                      {!dose.isCompleted && (
                        <div style={{marginTop: 12}}>
                          <Input.TextArea
                            rows={2}
                            placeholder="Nurse notes for this dose..."
                            value={
                              doseNotes[idx] ??
                              "Medication administered on time."
                            }
                            onChange={(e) =>
                              setDoseNotes((prev) => ({
                                ...prev,
                                [idx]: e.target.value,
                              }))
                            }
                            style={{marginBottom: 8}}
                          />
                          <Button
                            type="primary"
                            loading={confirmingDose === idx}
                            style={{backgroundColor: "#355383"}}
                            onClick={() => handleCompleteDose(idx, dose)}
                          >
                            Complete
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <div style={{color: "#aaa"}}>No dose details available.</div>
              )}
            </div>
          ) : (
            <div style={{color: "#aaa"}}>
              Please approve the registration before confirming doses.
            </div>
          )}
          {/* Nếu đã approve xong hết thì hiển thị trạng thái */}
          {nurseApproved?.dateApproved && allDoseCompleted && (
            <div style={{marginTop: 24}}>
              <Tag color="green">All Doses Completed</Tag>
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default MedicalReceivedDetail;
