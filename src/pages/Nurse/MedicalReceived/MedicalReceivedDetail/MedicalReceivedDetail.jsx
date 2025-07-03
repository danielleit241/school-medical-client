import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Card,
  Tag,
  Spin,
  Button,
  Input,
  Avatar,
  Divider,
  Modal,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  ArrowLeftOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
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
  const [parentId, setParentId] = useState(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  useEffect(() => {
    const fetchApi = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/api/nurses/medical-registrations/${medicalRegistrationId}`
        );
        setDetail(response.data);
        setParentId(response.data.parent.userId);
        console.log(
          "Medical Registration Details:",
          response.data.parent.userId
        );
      } catch (error) {
        console.error("Error fetching medical registration details:", error);
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
    try {
      const res = await axiosInstance.put(
        `/api/nurses/medical-registrations/${medicalRegistrationId}/completed`,
        {
          staffNurseId: nurseId,
          doseNumber: String(dose.doseNumber),
          dateCompleted: dayjs().format("YYYY-MM-DD"),
          notes: doseNotes[doseIdx] ?? "Medication administered on time.",
        }
      );
      const { notificationTypeId, receiverId, senderId } = res.data;
      await axiosInstance.post(
        `/api/notifications/medical-registrations/completed/to-parent`,
        {
          notificationTypeId,
          senderId,
          receiverId,
        }
      );
      setTimeout(async () => {
        const response = await axiosInstance.get(
          `/api/nurses/medical-registrations/${medicalRegistrationId}`
        );
        setDetail(response.data);
        setDoseNotes((prev) => ({ ...prev, [doseIdx]: "" }));
      }, 1000);
    } catch (error) {
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
          setDoseNotes((prev) => ({ ...prev, [doseIdx]: "" }));
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
      await axiosInstance.put(
        `/api/nurses/medical-registrations/${medicalRegistrationId}/approved`,
        {
          staffNurseId: nurseId,
          dateApproved: dayjs().format("YYYY-MM-DD"),
        }
      );
      await axiosInstance.post(
        `/api/notifications/medical-registrations/approved/to-parent`,
        {
          notificationTypeId: medicalRegistrationId,
          senderId: nurseId,
          receiverId: parentId,
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
    } catch (error) {
      console.error("Error approving registration:", error);
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
    return <Spin style={{ marginTop: 40 }} />;
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
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        padding: "0 0 32px 0",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
          padding: "20px 0 12px 0",
          marginBottom: "24px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          borderRadius: "20px 20px 0 0",
        }}
      >
        <h1
          style={{
            fontSize: 38,
            fontWeight: 800,
            margin: "0 0 8px 0",
            textShadow: "2px 2px 4px rgba(0,0,0,0.13)",
            letterSpacing: "1px",
          }}
        >
          Medication Registration Detail
        </h1>
        <p
          style={{
            fontSize: 16,
            fontWeight: 500,
            margin: "0 0 8px 0",
            opacity: 0.9,
            maxWidth: 420,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Manage details of a student's medication registration
        </p>
      </div>
      <div style={{ padding: "0 20px" }}>
        {/* Back button and title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 8,
            marginTop: 12,
            padding: "0 8px",
          }}
        >
          <Button
            icon={<ArrowLeftOutlined style={{display: 'flex', padding: '4px', marginRight: '0'}}/>}
            onClick={() => navigate(-1)}
            style={{
              marginRight: 12,
              borderRadius: 8,
              height: 36,
              paddingLeft: 12,
              paddingRight: 12,
              border: "2px solid #e5e7eb",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Back
          </Button>
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: "#1f2937",
            }}
          >
            Medication Registration Details
          </h2>
        </div>

        {/* Main Detail Card */}
        <div
          style={{
            width: "100%",
            margin: 0,
            maxWidth: "none",
            padding: "12px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
          }}
        >
          <Card
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              width: "100%",
              maxWidth: "none",
              minWidth: 0,
              margin: 0,
              border: "2px solid #2B5DC4",
            }}
            bodyStyle={{ padding: "20px 20px" }}
          >
            {/* Student Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: "1.5px solid #f1f5f9",
              }}
            >
              <Avatar
                size={48}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: "#4f46e5",
                  marginRight: 16,
                  boxShadow: "0 2px 8px rgba(79, 70, 229, 0.18)",
                }}
              />
              <div style={{ flex: 1 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#1f2937",
                    lineHeight: 1.2,
                  }}
                >
                  {student?.studentFullName || "Unknown Student"}
                </h1>
                <p
                  style={{
                    margin: "6px 0 0 0",
                    color: "#6b7280",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Student Code: {student?.studentCode || "N/A"}
                </p>
              </div>
              <div
                style={{
                  backgroundColor: "#f0f9ff",
                  color: "#2563eb",
                  border: "2px solid #2563eb",
                  borderRadius: 18,
                  padding: "8px 18px",
                  fontSize: 14,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {nurseApproved?.dateApproved
                  ? "Nurse Approved"
                  : "Pending Nurse"}
              </div>
            </div>

            {/* Info Grid + Medicine Picture */}
            <div
              style={{
                display: "flex",
                gap: 20,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              {/* Left: Info Grid */}
              <div style={{ flex: 2, minWidth: 220 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#f8fafc",
                      padding: 14,
                      borderRadius: 10,
                      border: "1.5px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <CalendarOutlined
                        style={{
                          color: "#4f46e5",
                          fontSize: 16,
                          marginRight: 8,
                        }}
                      />
                      <h4
                        style={{
                          margin: 0,
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        Date Submitted
                      </h4>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#1f2937",
                      }}
                    >
                      {medicalRegistration?.dateSubmitted || ""}
                    </p>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#f8fafc",
                      padding: 14,
                      borderRadius: 10,
                      border: "1.5px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <FileTextOutlined
                        style={{
                          color: "#4f46e5",
                          fontSize: 16,
                          marginRight: 8,
                        }}
                      />
                      <h4
                        style={{
                          margin: 0,
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        Medication Name
                      </h4>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#1f2937",
                      }}
                    >
                      {medicalRegistration?.medicationName || ""}
                    </p>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#f8fafc",
                      padding: 14,
                      borderRadius: 10,
                      border: "1.5px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <EnvironmentOutlined
                        style={{
                          color: "#4f46e5",
                          fontSize: 16,
                          marginRight: 8,
                        }}
                      />
                      <h4
                        style={{
                          margin: 0,
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        Total Dosages (per day)
                      </h4>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#1f2937",
                      }}
                    >
                      {medicalRegistration?.totalDosages || ""}
                    </p>
                  </div>
                </div>
                {/* Parent Notes & Consent */}
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      backgroundColor: "#f0f9ff",
                      padding: 14,
                      borderRadius: 10,
                      border: "1.5px solid #bae6fd",
                      marginBottom: 12,
                    }}
                  >
                    <h4
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#0c4a6e",
                      }}
                    >
                      Parent Notes
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#0c4a6e",
                      }}
                    >
                      {medicalRegistration?.notes || (
                        <span style={{ color: "#aaa" }}>No notes</span>
                      )}
                    </p>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#fefce8",
                      padding: 14,
                      borderRadius: 10,
                      border: "1.5px solid #fde047",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 8px 0",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#a16207",
                      }}
                    >
                      Parent Consent
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: "#a16207",
                        fontWeight: 500,
                      }}
                    >
                      {medicalRegistration?.parentConsent ? (
                        <Tag color="blue">Yes</Tag>
                      ) : (
                        <Tag color="red">No</Tag>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              {/* Right: Medicine Picture */}
              <div
                style={{
                  minWidth: 150,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  justifyContent: "flex-start",
                }}
              >
                <Tooltip
                  title={
                    medicalRegistration?.pictureUrl
                      ? "Click to view full screen"
                      : "No image available"
                  }
                  placement="top"
                >
                  <div
                    style={{
                      background: "#f3f4f6",
                      borderRadius: 10,
                      padding: 10,
                      border: "1px solid #eee",
                      width: 120,
                      height: 120,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 6,
                      cursor: medicalRegistration?.pictureUrl
                        ? "pointer"
                        : "default",
                    }}
                    onClick={() =>
                      medicalRegistration?.pictureUrl &&
                      setIsImageModalVisible(true)
                    }
                  >
                    {medicalRegistration?.pictureUrl ? (
                      <img
                        src={medicalRegistration.pictureUrl}
                        alt="Medicine"
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: "cover",
                          borderRadius: 8,
                          border: "1px solid #e5e7eb",
                          background: "#fafafa",
                          display: "block",
                          transition: "transform 0.2s ease",
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = "scale(1.05)";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = "scale(1)";
                        }}
                      />
                    ) : (
                      <PictureOutlined
                        style={{ fontSize: 36, color: "#bbb" }}
                      />
                    )}
                  </div>
                </Tooltip>
                <span style={{ fontSize: 13, color: "#888" }}>
                  Medicine Picture{" "}
                  {medicalRegistration?.pictureUrl && "(Click to view)"}
                </span>
              </div>
            </div>
            <div
              style={{
                minWidth: 180,
                maxWidth: 240,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 16,
                marginTop: 10,
              }}
            >
              {!nurseApproved?.dateApproved && (
                <Button
                  type="primary"
                  loading={approving}
                  style={{
                    background:
                      "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 15,
                    padding: "8px 24px",
                    height: 40,
                    border: "none",
                    boxShadow: "0 2px 8px rgba(16,185,129,0.12)",
                    width: "100%",
                  }}
                  onClick={handleApprove}
                >
                  Approve Registration
                </Button>    
              )}
            </div>
            

            {/* Dose Confirmation */}
            <div
              style={{
                display: "flex",
                gap: 20,
                flexWrap: "wrap",
                alignItems: "flex-start",
                marginTop: 10,
              }}
            >
              {/* Right: Dose Information */}
              <div style={{ flex: 2, minWidth: 220 }}>
                <Divider
                  orientation="left"
                  style={{ marginTop: 16, fontWeight: 700, fontSize: 16 }}
                >
                  Dose Information
                </Divider>
                {nurseApproved?.dateApproved ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 16,
                    }}
                  >
                    {medicalRegistrationDetails &&
                    medicalRegistrationDetails.length > 0 ? (
                      [...medicalRegistrationDetails]
                        .sort(
                          (a, b) => Number(a.doseNumber) - Number(b.doseNumber)
                        )
                        .map((dose, idx) => (
                          <div
                            key={dose.doseNumber + idx}
                            style={{
                              background: "#f8fafc",
                              border: "1.5px solid #e2e8f0",
                              borderRadius: 10,
                              padding: 16,
                              minHeight: 140,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              boxShadow: "0 1px 4px rgba(53,93,196,0.06)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 8,
                              }}
                            >
                              <span
                                style={{
                                  color: "#2B5DC4",
                                  fontWeight: 700,
                                  fontSize: 16,
                                }}
                              >
                                Dose #{dose.doseNumber}
                              </span>
                              {dose.isCompleted ? (
                                <span
                                  style={{
                                    background: "#f0f9ff",
                                    color: "#2563eb",
                                    border: "2px solid #2563eb",
                                    borderRadius: 18,
                                    padding: "5px 16px",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
                                >
                                  <span
                                    style={{ fontSize: 13, marginRight: 4 }}
                                  >
                                    ✔
                                  </span>
                                  Completed
                                </span>
                              ) : (
                                <Tag color="orange">Not Completed</Tag>
                              )}
                            </div>
                            <div style={{ fontSize: 14, marginBottom: 4 }}>
                              <b>Dose Time:</b> {dose.doseTime}
                            </div>
                            <div style={{ fontSize: 14, marginBottom: 4 }}>
                              <b>Notes:</b>{" "}
                              {dose.notes || (
                                <span style={{ color: "#aaa" }}>No notes</span>
                              )}
                            </div>
                            {dose.isCompleted && dose.dateCompleted && (
                              <div style={{ fontSize: 14, marginBottom: 4 }}>
                                <b>Date Completed:</b> {dose.dateCompleted}
                              </div>
                            )}
                            {!dose.isCompleted && (
                              <div style={{ marginTop: 8 }}>
                                <Button
                                  type="primary"
                                  loading={confirmingDose === idx}
                                  style={{
                                    background:
                                      "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    padding: "4px 18px",
                                    height: 36,
                                    marginTop: 4,
                                    border: "none",
                                    boxShadow: "0 1px 4px rgba(53,93,196,0.08)",
                                  }}
                                  onClick={() => handleCompleteDose(idx, dose)}
                                >
                                  Mark as Completed
                                </Button>
                              </div>
                            )}
                          </div>
                        ))
                    ) : (
                      <div style={{ color: "#aaa", fontSize: 14 }}>
                        No dose details available.
                      </div>
                    )}
                    {nurseApproved?.dateApproved && allDoseCompleted && (
                      <div
                        style={{
                          gridColumn: "1/-1",
                          marginTop: 8,
                          display: "flex",
                          justifyContent: "flex-start",
                        }}
                      >
                        <span
                          style={{
                            background: "#f0f9ff",
                            color: "#2563eb",
                            border: "2px solid #2563eb",
                            borderRadius: 18,
                            padding: "8px 20px",
                            fontSize: 15,
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span style={{ fontSize: 16, marginRight: 4 }}>
                            ✔
                          </span>
                          All Doses Completed
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ color: "#aaa", fontSize: 14 }}>
                    Please approve the registration before confirming doses.
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
      {/* Image Modal for full screen view */}
      <Modal
        open={isImageModalVisible}
        onCancel={() => setIsImageModalVisible(false)}
        footer={null}
        centered
        width="100%"
        style={{ maxWidth: 1000 }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          <img
            src={medicalRegistration?.pictureUrl}
            alt="Medicine Full View"
            style={{
              width: "100%",
              maxWidth: "100%",
              height: "auto",
              borderRadius: 12,
              border: "2px solid #e5e7eb",
              objectFit: "contain",
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default MedicalReceivedDetail;
