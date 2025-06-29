import {useEffect, useState} from "react";
import {Card, Tag, Spin, Button} from "antd";
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

  if (!eventDetail) {
    return <div>No medical event found.</div>;
  }

  const {medicalEvent, studentInfo, medicalRequests} = eventDetail;

  const getSeverityColor = (level) => {
    switch (level) {
      case "Low":
        return {background: "#e6fff2", color: "#1bbf7a"};
      case "Medium":
        return {background: "#fffbe6", color: "#faad14"};
      case "High":
        return {background: "#fff1f0", color: "#ff4d4f"};
      default:
        return {background: "#e6f3ff", color: "#2255c4"};
    }
  };

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

          {/* Title with icon */}
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
                  d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 8V16"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 12H16"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span style={{color: "white", fontSize: "28px", fontWeight: "600"}}>
              Medical Event Details
            </span>
          </div>

          {/* Added subtitle */}
          <div
            style={{
              color: "#e0e7ff",
              fontSize: "16px",
              fontWeight: "500",
              opacity: 0.9,
              marginTop: "4px",
            }}
          >
            Review incident details and medical response information
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
          {/* Left Column - Medical Event Information (65%) */}
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
              Medical Event Information
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
                    Student Code
                  </td>
                  <td style={{padding: "8px 16px", fontSize: "16px"}}>
                    {studentInfo?.studentCode ? (
                      studentInfo.studentCode
                    ) : (
                      <span style={{color: "#999999"}}>N/A</span>
                    )}
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
                    Full Name
                  </td>
                  <td style={{padding: "8px 16px", fontSize: "16px"}}>
                    {studentInfo?.fullName ? (
                      studentInfo.fullName
                    ) : (
                      <span style={{color: "#999999"}}>N/A</span>
                    )}
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
                    Event Date
                  </td>
                  <td style={{padding: "8px 16px", fontSize: "16px"}}>
                    {medicalEvent?.eventDate ? (
                      medicalEvent.eventDate
                    ) : (
                      <span style={{color: "#999999"}}>N/A</span>
                    )}
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
                    Event Type
                  </td>
                  <td style={{padding: "8px 16px", fontSize: "16px"}}>
                    {medicalEvent?.eventType ? (
                      medicalEvent.eventType
                    ) : (
                      <span style={{color: "#999999"}}>N/A</span>
                    )}
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
                    Description
                  </td>
                  <td style={{padding: "8px 16px", fontSize: "16px"}}>
                    {medicalEvent?.eventDescription ? (
                      medicalEvent.eventDescription
                    ) : (
                      <span style={{color: "#999999"}}>N/A</span>
                    )}
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
                    Location
                  </td>
                  <td style={{padding: "8px 16px", fontSize: "16px"}}>
                    {medicalEvent?.location ? (
                      medicalEvent.location
                    ) : (
                      <span style={{color: "#999999"}}>N/A</span>
                    )}
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
                    Severity Level
                  </td>
                  <td style={{padding: "8px 16px", fontSize: "16px"}}>
                    <span
                      style={{
                        background: getSeverityColor(medicalEvent.severityLevel)
                          .background,
                        color: getSeverityColor(medicalEvent.severityLevel)
                          .color,
                        border: "none",
                        borderRadius: "16px",
                        padding: "4px 16px",
                        fontWeight: "600",
                        fontSize: "14px",
                        display: "inline-block",
                      }}
                    >
                      {medicalEvent?.severityLevel || ""}
                    </span>
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
                    Notes
                  </td>
                  <td style={{padding: "8px 16px", fontSize: "16px"}}>
                    {medicalEvent?.notes ? (
                      medicalEvent.notes
                    ) : (
                      <span style={{color: "#999999"}}>N/A</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{marginTop: "30px"}}>
              <Button
                type="primary"
                onClick={handleBack}
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

          {/* Right Column - Medical Requests (35%) */}
          <div style={{width: "35%", padding: "30px"}}>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "600",
                marginBottom: "20px",
                color: "#333",
              }}
            >
              Medical Requests
            </h2>

            {medicalRequests && medicalRequests.length > 0 ? (
              medicalRequests.map((item, index) => (
                <div
                  key={item.itemId || index}
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
                      Drug Name:
                    </span>{" "}
                    <span style={{color: "#333", fontSize: "16px"}}>
                      {item.itemName}
                    </span>
                  </div>

                  <div style={{marginBottom: "10px", fontSize: "15px"}}>
                    <span style={{fontWeight: "500"}}>Quantity:</span>{" "}
                    <span style={{color: "#333"}}>{item.requestQuantity}</span>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  color: "#999",
                  textAlign: "center",
                  padding: "20px",
                  fontSize: "16px",
                }}
              >
                No medical requests found for this event.
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
              }}
            >
              <div style={{fontSize: 32, marginBottom: 8}}>♡</div>
              <div style={{fontWeight: 700, marginBottom: 8, fontSize: 18}}>
                Need Help?
              </div>
              <div style={{marginBottom: 14, color: "#888"}}>
                Our support team is here to assist you with your booking.
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
    </div>
  );
};

export default MedicalEventDetail;
