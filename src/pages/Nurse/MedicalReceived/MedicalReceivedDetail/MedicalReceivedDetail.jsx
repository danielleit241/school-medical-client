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
} from "antd";
import { UserOutlined, CalendarOutlined, FileTextOutlined, EnvironmentOutlined, ArrowLeftOutlined, PictureOutlined } from "@ant-design/icons";
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
  const [cancelling, setCancelling] = useState(false); // Thêm state cho cancel
  const [parentId, setParentId] = useState(null);
  
  // Thêm states cho modal
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [nurseNote, setNurseNote] = useState("");
  const [actionType, setActionType] = useState(""); 

  useEffect(() => {
    const fetchApi = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/api/nurses/medical-registrations/${medicalRegistrationId}`
        );
        setDetail(response.data);
        setParentId(response.data.parent.userId);
        console.log("Medical Registration Details:", response.data.parent.userId);
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
      const {notificationTypeId, receiverId, senderId} = res.data
      await axiosInstance.post(`/api/notifications/medical-registrations/completed/to-parent`,{
        notificationTypeId,
        senderId,
        receiverId,
      });
      const response = await axiosInstance.get(
        `/api/nurses/medical-registrations/${medicalRegistrationId}`
      );
      Swal.fire({
          icon: "success",
          title: "Dose completed!",
          showConfirmButton: false,
          timer: 1200,
        });
        setDetail(response.data);
        setDoseNotes((prev) => ({ ...prev, [doseIdx]: "" }));
   
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

  // Show modal để nhập nurse note - sửa lại để support cả approve và cancel
  const showNoteModal = (type) => {
    setActionType(type);
    setNurseNote(""); // Reset note
    setIsNoteModalVisible(true);
  };

  // Handle khi nhấn OK trong modal - sửa lại để support cả approve và cancel
  const handleNoteModalOk = async () => {
    if (!nurseNote.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Note Required",
        text: `Please enter a note before ${actionType}ing.`,
      });
      return;
    }
    
    if (actionType === "approve") {
      await handleApprove();
    } else if (actionType === "cancel") {
      await handleCancel();
    }
  };

  // Handle khi nhấn Cancel trong modal
  const handleNoteModalCancel = () => {
    setIsNoteModalVisible(false);
    setNurseNote("");
    setActionType("");
  };

  // Approve registration
  const handleApprove = async () => {
    setApproving(true);
    setIsNoteModalVisible(false); // Đóng modal
    
    try {
      const requestData = {
        staffNurseId: nurseId,
        dateApproved: dayjs().format("YYYY-MM-DD"),
        status: true,
        nurseNotes: nurseNote.trim(),
      };
      
      console.log("Approve Request data:", requestData);
      
      const response = await axiosInstance.put(
        `/api/nurses/medical-registrations/${medicalRegistrationId}/approved`,
        requestData
      );
      
      console.log("Approve API response:", response.data);
      
      await axiosInstance.post(`/api/notifications/medical-registrations/approved/to-parent`,{
        notificationTypeId: medicalRegistrationId,
        senderId: nurseId,
        receiverId: parentId,
      });
      
      Swal.fire({
        icon: "success",
        title: "Registration approved!",
        showConfirmButton: false,
        timer: 1200,
      });
      
      const refreshResponse = await axiosInstance.get(
        `/api/nurses/medical-registrations/${medicalRegistrationId}`
      );
      
      setDetail(refreshResponse.data);
    } catch (error) {
      console.error("Error approving registration:", error);
      console.error("Error response data:", error.response?.data);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Cannot approve registration!",
      });
    } finally {
      setApproving(false);
      setNurseNote("");
      setActionType("");
    }
  };

  
  const handleCancel = async () => {
    setCancelling(true);
    setIsNoteModalVisible(false); 
    
    try {
      const requestData = {
        staffNurseId: nurseId,
        dateApproved: dayjs().format("YYYY-MM-DD"),
        status: false,
        nurseNotes: nurseNote.trim(),
      };
      
      console.log("Cancel Request data:", requestData);
      
      const response = await axiosInstance.put(
        `/api/nurses/medical-registrations/${medicalRegistrationId}/approved`,
        requestData
      );
      
      console.log("Cancel API response:", response.data);
      
      await axiosInstance.post(`/api/notifications/medical-registrations/approved/to-parent`,{
        notificationTypeId: medicalRegistrationId,
        senderId: nurseId,
        receiverId: parentId,
      });
      
      Swal.fire({
        icon: "success",
        title: "Registration cancelled!",
        showConfirmButton: false,
        timer: 1200,
      });
      
      const refreshResponse = await axiosInstance.get(
        `/api/nurses/medical-registrations/${medicalRegistrationId}`
      );
      
      setDetail(refreshResponse.data);
    } catch (error) {
      console.error("Error cancelling registration:", error);
      console.error("Error response data:", error.response?.data);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Cannot cancel registration!",
      });
    } finally {
      setCancelling(false);
      setNurseNote("");
      setActionType("");
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
  console.log ("Medical Registration Details:", detail);

  const allDoseCompleted =
    medicalRegistrationDetails &&
    medicalRegistrationDetails.length > 0 &&
    medicalRegistrationDetails.every((dose) => dose.isCompleted);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "0 0 32px 0",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
          padding: "16px 0 8px 0", // giảm padding dọc
          marginBottom: "20px", // giảm margin dưới
          color: "white",
          textAlign: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            fontSize: 20, // giảm font size
            fontWeight: 800,
            margin: "0 0 6px 0",
            textShadow: "2px 2px 4px rgba(0,0,0,0.13)",
            letterSpacing: "1px",
          }}
        >
          💊 Medication Registration Detail
        </h1>
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            margin: "0 0 8px 0",
            opacity: 0.9,
            maxWidth: 420,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          View and manage details of a student's medication registration
        </p>
      </div>

      {/* Back button and title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 6,
          marginTop: 10,
          padding: "0 8px",
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{
            marginRight: 10,
            borderRadius: 8,
            height: 30,
            paddingLeft: 10,
            paddingRight: 10,
            border: "2px solid #e5e7eb",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Back to List
        </Button>
        <h2
          style={{
            margin: 0,
            fontSize: 15,
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
          bodyStyle={{ padding: "16px 16px" }}
        >
          {/* Student Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 18,
              paddingBottom: 12,
              borderBottom: "1.5px solid #f1f5f9",
            }}
          >
            <Avatar
              size={44}
              icon={<UserOutlined />}
              style={{
                backgroundColor: "#4f46e5",
                marginRight: 14,
                boxShadow: "0 2px 8px rgba(79, 70, 229, 0.18)",
              }}
            />
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#1f2937",
                  lineHeight: 1.2,
                }}
              >
                {student?.studentFullName || "Unknown Student"}
              </h1>
              <p
                style={{
                  margin: "4px 0 0 0",
                  color: "#6b7280",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Student Code: {student?.studentCode || "N/A"}
              </p>
            </div>
            <div
              style={{
                backgroundColor: medicalRegistration.status === false 
                  ? "#fef2f2"  
                  : medicalRegistration.status === true 
                  ? "#f0f9ff"  
                  : "#fff7ed", 
                color: medicalRegistration.status === false 
                  ? "#dc2626"  
                  : medicalRegistration.status === true 
                  ? "#2563eb"  
                  : "#ea580c", 
                border: `2px solid ${
                  medicalRegistration.status === false 
                    ? "#dc2626"  
                    : medicalRegistration.status === true 
                    ? "#2563eb"  
                    : "#ea580c"  
                }`,
                borderRadius: 18,
                padding: "7px 16px",
                fontSize: 13,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {medicalRegistration.status === true ? "Approved" : 
              medicalRegistration.status === false ? "Cancelled" : "Pending"}
            </div>
          </div>

          {/* Info Grid + Medicine Picture */}
          <div
            style={{
              display: "flex",
              gap: 18,
              marginBottom: 18,
              flexWrap: "wrap",
            }}
          >
            {/* Left: Info Grid */}
            <div style={{ flex: 2, minWidth: 220 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: 12,
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                    <CalendarOutlined style={{ color: "#4f46e5", fontSize: 16, marginRight: 8 }} />
                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>Date Submitted</h4>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1f2937" }}>
                    {medicalRegistration?.dateSubmitted || ""}
                  </p>
                </div>
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: 12,
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                    <FileTextOutlined style={{ color: "#4f46e5", fontSize: 16, marginRight: 8 }} />
                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>Medication Name</h4>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1f2937" }}>
                    {medicalRegistration?.medicationName || ""}
                  </p>
                </div>
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: 12,
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                    <EnvironmentOutlined style={{ color: "#4f46e5", fontSize: 16, marginRight: 8 }} />
                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>Total Dosages (per day)</h4>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1f2937" }}>
                    {medicalRegistration?.totalDosages || ""}
                  </p>
                </div>
              </div>
              {/* Parent Notes & Consent */}
              <div style={{ marginTop: 12 }}>
                <div
                  style={{
                    backgroundColor: "#f0f9ff",
                    padding: 12,
                    borderRadius: 10,
                    border: "1.5px solid #bae6fd",
                    marginBottom: 8,
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0c4a6e" }}>Parent Notes</h4>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#0c4a6e" }}>
                    {medicalRegistration?.notes || <span style={{ color: "#aaa" }}>No notes</span>}
                  </p>
                </div>
                <div
                  style={{
                    backgroundColor: "#fefce8",
                    padding: 12,
                    borderRadius: 10,
                    border: "1.5px solid #fde047",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 6px 0",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#a16207",
                    }}
                  >
                    Parent Consent
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
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
                minWidth: 140,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                justifyContent: "flex-start",
              }}
            >
              <div
                style={{
                  background: "#f3f4f6",
                  borderRadius: 10,
                  padding: 8,
                  border: "1px solid #eee",
                  width: 110,
                  height: 110,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 4,
                }}
              >
                {medicalRegistration?.pictureUrl ? (
                  <img
                    src={medicalRegistration.pictureUrl}
                    alt="Medicine"
                    style={{
                      width: 90,
                      height: 90,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      background: "#fafafa",
                      display: "block",
                    }}
                  />
                ) : (
                  <PictureOutlined style={{ fontSize: 32, color: "#bbb" }} />
                )}
              </div>
              <span style={{ fontSize: 12, color: "#888" }}>Medicine Picture</span>
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
                marginTop: 8,
              }}
            >
              {medicalRegistration.status === null && (
                <>
                <Button
                  type="primary"
                  loading={approving}
                  style={{
                    background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 14,
                    padding: "6px 24px",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(16,185,129,0.12)",
                    width: "100%",
                  }}
                  onClick={() => showNoteModal("approve")} // Thay đổi ở đây
                >
                  Approve Registration
                </Button>
                <Button
                  type="primary"
                  loading={cancelling}
                  style={{
                    background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 14,
                    padding: "6px 24px",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(16,185,129,0.12)",
                    width: "100%",
                  }}
                  onClick={() => showNoteModal("cancel")}
                >
                  Cancel Registration
                </Button>
                </>            
              )}
            </div>

          {/* Dose Confirmation */}
          <div
            style={{
              display: "flex",
              gap: 18,
              flexWrap: "wrap",
              alignItems: "flex-start",
              marginTop: 8,
            }}
          >
            {/* Left: Action Buttons + Medicine Picture */}
            
            {/* Right: Dose Information */}
            {medicalRegistration.status === true && (
              <div style={{ flex: 2, minWidth: 220 }}>
              <Divider orientation="left" style={{ marginTop: 12, fontWeight: 700, fontSize: 15 }}>
                Dose Information
              </Divider>
              {nurseApproved?.dateApproved ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 14,
                  }}
                >
                  {medicalRegistrationDetails && medicalRegistrationDetails.length > 0 ? (
                    [...medicalRegistrationDetails]
                      .sort((a, b) => Number(a.doseNumber) - Number(b.doseNumber))
                      .map((dose, idx) => (
                        <div
                          key={dose.doseNumber + idx}
                          style={{
                            background: "#f8fafc",
                            border: "1.5px solid #e2e8f0",
                            borderRadius: 10,
                            padding: 14,
                            minHeight: 120,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            boxShadow: "0 1px 4px rgba(53,93,196,0.06)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ color: "#2B5DC4", fontWeight: 700, fontSize: 15 }}>
                              Dose #{dose.doseNumber}
                            </span>
                            {dose.isCompleted ? (
                              <span
                                style={{
                                  background: "#f0f9ff",
                                  color: "#2563eb",
                                  border: "2px solid #2563eb",
                                  borderRadius: 18,
                                  padding: "4px 14px",
                                  fontSize: 13,
                                  fontWeight: 700,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <span style={{ fontSize: 13, marginRight: 4 }}>✔</span>
                                Completed
                              </span>
                            ) : (
                              <Tag color="orange">Not Completed</Tag>
                            )}
                          </div>
                          <div style={{ fontSize: 13, marginBottom: 2 }}>
                            <b>Dose Time:</b> {dose.doseTime}
                          </div>
                          <div style={{ fontSize: 13, marginBottom: 2 }}>
                            <b>Notes:</b>{" "}
                            {dose.notes || <span style={{ color: "#aaa" }}>No notes</span>}
                          </div>
                          {dose.isCompleted && dose.dateCompleted && (
                            <div style={{ fontSize: 13, marginBottom: 2 }}>
                              <b>Date Completed:</b> {dose.dateCompleted}
                            </div>
                          )}
                          {!dose.isCompleted && (
                            <div style={{ marginTop: 6 }}>
                              <Button
                                type="primary"
                                loading={confirmingDose === idx}
                                style={{
                                  background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
                                  borderRadius: 8,
                                  fontWeight: 600,
                                  fontSize: 13,
                                  padding: "2px 16px",
                                  marginTop: 2,
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
                    <div style={{ color: "#aaa" }}>No dose details available.</div>
                  )}
                  {nurseApproved?.dateApproved && allDoseCompleted && (
                    <div
                      style={{
                        gridColumn: "1/-1",
                        marginTop: 6,
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
                          padding: "7px 18px",
                          fontSize: 14,
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span style={{ fontSize: 15, marginRight: 4 }}>✔</span>
                        All Doses Completed
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: "#aaa" }}>
                  Please approve the registration before confirming doses.
                </div>
              )}
            </div>
            )}
            {medicalRegistration.status === false && (
              <div style={{ flex: 2, minWidth: 220 }}>
                <Divider orientation="left" style={{ marginTop: 12, fontWeight: 700, fontSize: 15 }}>
                  Nurse Notes: <span style={{ color: "#dc2626" }}>{medicalRegistration.nurseNotes}</span>
                </Divider>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Nurse Note Modal */}
      <Modal
        title={
          <span style={{ fontSize: 18, fontWeight: 700, color: "#1f2937" }}>
            {actionType === "approve" ? "Approve Registration" : "Cancel Registration"}
          </span>
        }
        open={isNoteModalVisible}
        onOk={handleNoteModalOk}
        onCancel={handleNoteModalCancel}
        okText={actionType === "approve" ? "Approve" : "Cancel"}
        cancelText="Close"
        confirmLoading={approving || cancelling}
        okButtonProps={{
          style: {
            background: actionType === "approve" 
              ? "linear-gradient(135deg, #059669 0%, #10b981 100%)"
              : "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
            border: "none",
            fontWeight: 600,
          },
        }}
        width={500}
      >
        <div style={{ padding: "16px 0" }}>
          <p style={{ marginBottom: 16, color: "#6b7280", fontSize: 14 }}>
            {actionType === "approve" 
              ? "Please provide a note for approving this medical registration:"
              : "Please provide a reason for cancelling this medical registration:"
            }
          </p>
          <Input.TextArea
            value={nurseNote}
            onChange={(e) => setNurseNote(e.target.value)}
            placeholder={
              actionType === "approve"
                ? "Enter approval note (e.g., 'Registration reviewed and approved by nurse.')"
                : "Enter cancellation reason (e.g., 'Invalid medication request.')"
            }
            rows={4}
            maxLength={200}
            showCount
            style={{
              borderRadius: 8,
              fontSize: 14,
            }}
          />
          {nurseNote.trim() && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
              Preview: "{nurseNote.trim()}"
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default MedicalReceivedDetail;
