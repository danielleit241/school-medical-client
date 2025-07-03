
import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import axiosInstance from "../../../../api/axios";
import Swal from "sweetalert2";
import {Spin, Button, Tooltip, Modal} from "antd";
import {PictureOutlined} from "@ant-design/icons";

const DetailMedicalRes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const medicalRegistrationId = location.state?.registrationId;
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  
  useEffect(() => {
    const fetchApi = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/api/parents/medical-registrations/${medicalRegistrationId}`
        );
        setDetail(response.data);
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
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const {
    medicalRegistration,
    nurseApproved,
    student,
    medicalRegistrationDetails,
  } = detail;

  // Function to get registration status - Thêm function mới
  const getRegistrationStatus = () => {
    // Nếu bị cancelled
    if (medicalRegistration.status === false) {
      return {
        text: "Cancelled",
        color: "#dc2626",
        bgColor: "#fef2f2",
        showDate: true,
        showNurseNotes: true,
      };
    }
    
    // Nếu chưa được approve
    if (medicalRegistration.status === null || medicalRegistration.status === undefined) {
      return {
        text: "Pending",
        color: "#f59e0b",
        bgColor: "#fffbeb",
        showDate: false,
        showNurseNotes: false,
      };
    }
    
    // Nếu đã approve
    if (medicalRegistration.status === true) {
      return {
        text: "Approved",
        color: "#10b981",
        bgColor: "#ecfdf5",
        showDate: true,
        showNurseNotes: true,
      };
    }
    
    return {
      text: "Unknown",
      color: "#6b7280",
      bgColor: "#f9fafb",
      showDate: false,
      showNurseNotes: false,
    };
  };

  // Kiểm tra đơn đã hoàn thành hết chưa
  const isAllDoseCompleted = () =>
    medicalRegistrationDetails &&
    medicalRegistrationDetails.length > 0 &&
    medicalRegistrationDetails.every((dose) => dose.isCompleted);

  const status = getRegistrationStatus();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      {/* Container that takes 90% of the outlet width */}
      <div
        className="animate__animated animate__fadeIn"
        style={{width: "90%", maxWidth: "1400px"}}
      >
        {/* Header Banner - Same width as main content */}
        <div
          style={{
            width: "100%",
            background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
            padding: "30px",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative background elements */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "120px",
              height: "120px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-30px",
              left: "-30px",
              width: "80px",
              height: "80px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: "25%",
              width: "60px",
              height: "60px",
              background: "rgba(255, 193, 7, 0.2)",
              borderRadius: "50%",
            }}
          />

          {/* Title với icon */}
          <div
            style={{display: "flex", alignItems: "center", marginBottom: "8px"}}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "15px",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 2V6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 2V6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 10H21"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span style={{color: "white", fontSize: "28px", fontWeight: "600"}}>
              Medication Registration
            </span>
          </div>

          {/* Subtitle */}
          <div
            style={{
              color: "#e0e7ff",
              fontSize: "16px",
              fontWeight: "500",
              opacity: 0.9,
              marginTop: "4px",
            }}
          >
            Review medication details and administration schedule
          </div>
        </div>

        {/* Main Content - Same width as header */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            background: "white",
            borderBottomLeftRadius: "20px",
            borderBottomRightRadius: "20px",
            width: "100%",
          }}
        >
          {/* Left Column - Medication Information (65% of main content) */}
          <div
            style={{
              width: "65%",
              padding: "30px",
              borderRight: "1px solid #f0f0f0",
            }}
          >
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "600",
                marginBottom: "20px",
                color: "#333",
              }}
            >
              Medication Information
            </h2>

            <table style={{width: "100%", borderCollapse: "collapse"}}>
              <tbody>
                <tr style={{borderBottom: "1px solid #eee"}}>
                  <td
                    style={{
                      padding: "12px 16px",
                      background: "#f9f9f9",
                      height: "80px",
                      fontWeight: "600",
                      width: "40%",
                      fontSize: "16px",
                    }}
                  >
                    Student Name
                  </td>
                  <td style={{padding: "8px 16px", fontSize: "16px"}}>
                    {student?.studentFullName}
                  </td>
                </tr>
                <tr style={{borderBottom: "1px solid #eee"}}>
                  <td
                    style={{
                      padding: "12px 16px",
                      background: "#f9f9f9",
                      height: "80px",
                      fontWeight: "600",
                      width: "40%",
                      fontSize: "16px",
                    }}
                  >
                    Medication Name
                  </td>
                  <td style={{padding: "8px 16px", fontSize: "16px"}}>
                    {medicalRegistration?.medicationName}
                  </td>
                </tr>
                <tr style={{borderBottom: "1px solid #eee"}}>
                  <td
                    style={{
                      padding: "12px 16px",
                      background: "#f9f9f9",
                      height: "80px",
                      fontWeight: "600",
                      width: "40%",
                      fontSize: "16px",
                    }}
                  >
                    Total Dosages (per day)
                  </td>
                  <td style={{padding: "8px 16px", fontSize: "16px"}}>
                    {medicalRegistration?.totalDosages}
                  </td>
                </tr>
                <tr style={{borderBottom: "1px solid #eee"}}>
                  <td
                    style={{
                      padding: "12px 16px",
                      background: "#f9f9f9",
                      height: "80px",
                      fontWeight: "600",
                      width: "40%",
                      fontSize: "16px",
                    }}
                  >
                    Date Submitted
                  </td>
                  <td style={{padding: "8px 16px", fontSize: "16px"}}>
                    {medicalRegistration?.dateSubmitted}
                  </td>
                </tr>
                <tr style={{borderBottom: "1px solid #eee"}}>
                  <td
                    style={{
                      padding: "12px 16px",
                      background: "#f9f9f9",
                      height: "80px",
                      fontWeight: "600",
                      width: "40%",
                      fontSize: "16px",
                    }}
                  >
                    Parent Notes
                  </td>
                  <td style={{padding: "8px 16px", fontSize: "16px"}}>
                    {medicalRegistration?.notes || "No notes provided"}
                  </td>
                </tr>
                <tr style={{borderBottom: "1px solid #eee"}}>
                  <td
                    style={{
                      padding: "12px 16px",
                      background: "#f9f9f9",
                      height: "80px",
                      fontWeight: "600",
                      width: "40%",
                      fontSize: "16px",
                    }}
                  >
                    Parent Consent
                  </td>
                  <td style={{padding: "8px 16px", fontSize: "16px"}}>
                    {medicalRegistration?.parentConsent ? (
                      <span
                        style={{
                          color: "#10b981",
                          background: "#ecfdf5",
                          border: "none",
                          borderRadius: "16px",
                          padding: "4px 16px",
                          fontWeight: "600",
                          fontSize: "14px",
                          display: "inline-block",
                        }}
                      >
                        Yes
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "#f59e0b",
                          background: "#fffbeb",
                          border: "none",
                          borderRadius: "16px",
                          padding: "4px 16px",
                          fontWeight: "600",
                          fontSize: "14px",
                          display: "inline-block",
                        }}
                      >
                        No
                      </span>
                    )}
                  </td>
                </tr>
                {/* Sửa lại phần Status để sử dụng logic mới */}
                <tr style={{borderBottom: "1px solid #eee"}}>
                  <td
                    style={{
                      padding: "12px 16px",
                      background: "#f9f9f9",
                      height: "80px",
                      fontWeight: "600",
                      width: "40%",
                      fontSize: "16px",
                    }}
                  >
                    Status
                  </td>
                  <td style={{padding: "8px 16px", fontSize: "16px"}}>
                    <span
                      style={{
                        background: status.bgColor,
                        color: status.color,
                        border: `2px solid ${status.color}`,
                        borderRadius: "16px",
                        padding: "6px 16px",
                        fontWeight: "600",
                        fontSize: "14px",
                        display: "inline-block",
                      }}
                    >
                      {status.text}
                    </span>
                    {status.showDate && nurseApproved?.dateApproved && (
                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "14px",
                          color: "#6b7280",
                        }}
                      >
                        <b>Date:</b> {nurseApproved.dateApproved}
                      </div>
                    )}
                  </td>
                </tr>
                {/* Thêm Nurse Notes row nếu có */}
                {status.showNurseNotes && medicalRegistration?.nurseNotes && (
                  <tr style={{borderBottom: "1px solid #eee"}}>
                    <td
                      style={{
                        padding: "12px 16px",
                        background: "#f9f9f9",
                        height: "80px",
                        fontWeight: "600",
                        width: "40%",
                        fontSize: "16px",
                      }}
                    >
                      Nurse Notes
                    </td>
                    <td style={{padding: "8px 16px", fontSize: "16px"}}>
                      <div
                        style={{
                          backgroundColor: "#f0f9ff",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid #bae6fd",
                          fontStyle: "italic",
                          color: "#0c4a6e",
                        }}
                      >
                        {medicalRegistration.nurseNotes}
                      </div>
                    </td>
                  </tr>
                )}
                <tr style={{borderBottom: "1px solid #eee"}}>
                  <td
                    style={{
                      padding: "8px 16px",
                      background: "#f9f9f9",
                      height: "120px",
                      fontWeight: "600",
                      width: "40%",
                      fontSize: "16px",
                      verticalAlign: "middle",
                    }}
                  >
                    Medicine Image
                  </td>
                  <td
                    style={{
                      padding: "8px 16px",
                      fontSize: "16px",
                      verticalAlign: "middle",
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
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{marginTop: "30px"}}>
              <Button
                type="primary"
                onClick={() => navigate(-1)}
                style={{
                  background:
                    "linear-gradient(-90deg, #2B5DC4 0%, #355383 100%)",
                  borderColor: "#2255c4",
                  height: "36px",
                  fontSize: "14px",
                  borderRadius: "4px",
                  boxShadow: "none",
                  padding: "0 20px",
                }}
              >
                Go Back
              </Button>
            </div>
          </div>

          {/* Right Column - Dose Sessions (35% of main content) */}
          <div style={{width: "35%", padding: "30px"}}>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "600",
                marginBottom: "20px",
                color: "#333",
              }}
            >
              Dose Sessions
            </h2>

            {/* Sửa lại logic hiển thị dose sessions */}
            {medicalRegistration.status === true ? (
              medicalRegistrationDetails &&
              medicalRegistrationDetails.length > 0 ? (
                <>
                  {medicalRegistrationDetails.map((dose, idx) => (
                    <div
                      key={dose.doseNumber + idx}
                      style={{
                        marginBottom: "20px",
                        borderRadius: "6px",
                        border: "1px solid #f0f0f0",
                        padding: "20px",
                        background: "#fff",
                      }}
                    >
                      <div style={{marginBottom: "10px"}}>
                        <span style={{fontWeight: "600", fontSize: "16px"}}>
                          Dose {dose.doseNumber}
                        </span>{" "}
                        <span style={{color: "#666", fontSize: "16px"}}>
                          ({dose.doseTime})
                        </span>
                      </div>

                      <div style={{marginBottom: "10px", fontSize: "15px"}}>
                        <span style={{fontWeight: "500"}}>Parent Notes:</span>{" "}
                        {dose.notes || (
                          <span style={{color: "#999"}}>No notes</span>
                        )}
                      </div>

                      <div style={{marginBottom: 6}}>
                        <b>Status:</b>{" "}
                        {dose.isCompleted ? (
                          <span
                            style={{
                              background: "#ecfdf5",
                              color: "#10b981",
                              border: "none",
                              borderRadius: "16px",
                              padding: "4px 16px",
                              fontWeight: "600",
                              fontSize: "14px",
                              display: "inline-block",
                            }}
                          >
                            Completed
                          </span>
                        ) : (
                          <span
                            style={{
                              background: "#fffbeb",
                              color: "#f59e0b",
                              border: "none",
                              borderRadius: "16px",
                              padding: "4px 16px",
                              fontWeight: "600",
                              fontSize: "14px",
                              display: "inline-block",
                            }}
                          >
                            Not Completed
                          </span>
                        )}
                      </div>

                      {dose.isCompleted && dose.dateCompleted && (
                        <div style={{fontSize: "15px", color: "#6b7280"}}>
                          <span style={{fontWeight: "500"}}>Date Completed:</span>{" "}
                          {dose.dateCompleted}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* All doses completed indicator */}
                  {isAllDoseCompleted() && (
                    <div
                      style={{
                        backgroundColor: "#eff6ff",
                        padding: "16px",
                        borderRadius: "10px",
                        border: "2px solid #2563eb",
                        textAlign: "center",
                        marginTop: "16px",
                      }}
                    >
                      <div
                        style={{
                          color: "#2563eb",
                          fontSize: "16px",
                          fontWeight: "700",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        <span style={{ fontSize: 18 }}>✔</span>
                        All Doses Completed
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div
                  style={{
                    color: "#999",
                    textAlign: "center",
                    padding: "20px",
                    fontSize: "16px",
                  }}
                >
                  No dose details available.
                </div>
              )
            ) : medicalRegistration.status === false ? (
              <div
                style={{
                  backgroundColor: "#fef2f2",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "2px solid #fecaca",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#dc2626",
                    fontSize: "16px",
                    fontWeight: "700",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 18 }}>❌</span>
                  Registration Cancelled
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                  }}
                >
                  {medicalRegistration.nurseNotes}
                </div>
              </div>
            ) : (
              <div
                style={{
                  color: "#999",
                  textAlign: "center",
                  padding: "20px",
                  fontSize: "16px",
                }}
              >
                Waiting for nurse approval to view dose sessions.
              </div>
            )}

            {/* Help Card */}
            <div
              style={{
                background: "#f7f1ff",
                borderRadius: 16,
                padding: 24,
                textAlign: "center",
                color: "#a259e6",
                border: "1px solid #e0d7fa",
                marginTop: "30px",
              }}
            >
              <div style={{fontSize: 32, marginBottom: 8}}>♡</div>
              <div style={{fontWeight: 700, marginBottom: 8, fontSize: 18}}>
                Need Help?
              </div>
              <div style={{marginBottom: 14, color: "#888"}}>
                Our support team is here to assist you with your medication registration.
              </div>
              <Button
                style={{
                  borderRadius: 8,
                  background: "#fff",
                  color: "#a259e6",
                  border: "1px solid #a259e6",
                  fontWeight: 600,
                  height: 42,
                }}
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
      
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

export default DetailMedicalRes;
