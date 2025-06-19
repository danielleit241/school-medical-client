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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 0",
      }}
    >
      {/* Header Banner + Main Content Container */}
      <div
        className="animate__animated animate__fadeIn"
        style={{
          width: "90%",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(53,83,131,0.1)",
        }}
      >
        {/* Header Banner */}
        <div
          style={{
            width: "100%",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
            background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
            height: "100px",
            padding: "24px 0 18px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 2,
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
          <span style={{color: "white", fontSize: "24px", fontWeight: "600"}}>
            Medical Event Details
          </span>
        </div>
        {/* Main Content Container nằm trong banner */}
        <div
          style={{
            width: "100%",
            background: "#fff",
            borderBottomLeftRadius: "20px",
            borderBottomRightRadius: "20px",
            margin: 0,
            marginTop: 0,
            position: "relative",
            zIndex: 1,
            top: 0,
            left: 0,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            padding: "32px 0 32px 0",
            display: "flex",
            flexDirection: "row",
            gap: "20px",
          }}
        >
          {/* Left Column - Medical Event Detail (60%) */}
          <div style={{width: "60%", padding: "0 32px"}}>
            <Card
              title={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{fontSize: "20px", fontWeight: "600"}}>
                    Medical Event Information
                  </span>
                  <Tag
                    style={{
                      fontWeight: 600,
                      borderRadius: 16,
                      fontSize: 14,
                      padding: "4px 16px",
                      background: getSeverityColor(medicalEvent.severityLevel)
                        .background,
                      color: getSeverityColor(medicalEvent.severityLevel).color,
                      border: "none",
                    }}
                  >
                    Severity: {medicalEvent.severityLevel}
                  </Tag>
                </div>
              }
              style={{
                borderRadius: "8px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "none",
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        padding: "12px 16px",
                        background: "#f9f9f9",
                        height: "70px",
                        fontWeight: "500",
                        width: "40%",
                        fontSize: "17px",
                      }}
                    >
                      Student Code
                    </td>
                    <td style={{padding: "12px 16px", fontSize: "17px"}}>
                      {studentInfo?.studentCode || ""}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "12px 16px",
                        background: "#f9f9f9",
                        height: "70px",
                        fontWeight: "500",
                        width: "40%",
                        fontSize: "17px",
                      }}
                    >
                      Full Name
                    </td>
                    <td style={{padding: "12px 16px", fontSize: "17px"}}>
                      {studentInfo?.fullName || ""}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "12px 16px",
                        background: "#f9f9f9",
                        height: "70px",
                        fontWeight: "500",
                        width: "40%",
                        fontSize: "17px",
                      }}
                    >
                      Event Date
                    </td>
                    <td style={{padding: "12px 16px", fontSize: "17px"}}>
                      {medicalEvent?.eventDate || ""}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "12px 16px",
                        background: "#f9f9f9",
                        height: "70px",
                        fontWeight: "500",
                        width: "40%",
                        fontSize: "17px",
                      }}
                    >
                      Event Type
                    </td>
                    <td style={{padding: "12px 16px", fontSize: "17px"}}>
                      {medicalEvent?.eventType || ""}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "12px 16px",
                        background: "#f9f9f9",
                        height: "70px",
                        fontWeight: "500",
                        width: "40%",
                        fontSize: "17px",
                      }}
                    >
                      Description
                    </td>
                    <td style={{padding: "12px 16px", fontSize: "17px"}}>
                      {medicalEvent?.eventDescription || ""}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "12px 16px",
                        background: "#f9f9f9",
                        height: "70px",
                        fontWeight: "500",
                        width: "40%",
                        fontSize: "17px",
                      }}
                    >
                      Location
                    </td>
                    <td style={{padding: "12px 16px", fontSize: "17px"}}>
                      {medicalEvent?.location || ""}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "12px 16px",
                        background: "#f9f9f9",
                        height: "70px",
                        fontWeight: "500",
                        width: "40%",
                        fontSize: "17px",
                      }}
                    >
                      Severity Level
                    </td>
                    <td style={{padding: "12px 16px", fontSize: "17px"}}>
                      <span
                        style={{
                          background: getSeverityColor(
                            medicalEvent.severityLevel
                          ).background,
                          color: getSeverityColor(medicalEvent.severityLevel)
                            .color,
                          padding: "2px 10px",
                          borderRadius: "4px",
                          fontSize: "14px",
                          fontWeight: 600,
                          display: "inline-block",
                        }}
                      >
                        {medicalEvent?.severityLevel || ""}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "12px 16px",
                        background: "#f9f9f9",
                        height: "70px",
                        fontWeight: "500",
                        width: "40%",
                        fontSize: "17px",
                      }}
                    >
                      Notes
                    </td>
                    <td style={{padding: "12px 16px", fontSize: "17px"}}>
                      {medicalEvent?.notes || ""}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{marginTop: "24px"}}>
                <Button
                  onClick={handleBack}
                  style={{
                    background:
                      "linear-gradient(-90deg, #2B5DC4 0%, #355383 100%)",
                    borderColor: "#2255c4",
                    color: "white",
                    height: "36px",
                    fontSize: "14px",
                    borderRadius: "4px",
                    boxShadow: "none",
                    padding: "0 20px",
                  }}
                >
                  Back
                </Button>
              </div>
            </Card>
          </div>
          {/* Right Column - Medical Requests and Contact (40%) */}
          <div
            style={{
              width: "40%",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              padding: "0 32px 0 0",
            }}
          >
            {/* Medical Requests Card */}
            <Card
              title={
                <div style={{fontSize: "20px", fontWeight: "600"}}>
                  Medical Requests
                </div>
              }
              style={{
                borderRadius: "8px",
              }}
            >
              {medicalRequests && medicalRequests.length > 0 ? (
                medicalRequests.map((item, index) => (
                  <div
                    key={item.itemId || index}
                    style={{
                      padding: "16px",
                      borderBottom:
                        index < medicalRequests.length - 1
                          ? "1px solid #f0f0f0"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{fontWeight: "500", fontSize: "17px"}}>
                        Drug Name:
                      </span>
                      <span style={{fontWeight: "400", fontSize: "17px"}}>
                        {item.itemName}
                      </span>
                    </div>
                    <div
                      style={{display: "flex", justifyContent: "space-between"}}
                    >
                      <span style={{fontWeight: "500", fontSize: "17px"}}>
                        Quantity:
                      </span>
                      <span style={{fontWeight: "400", fontSize: "17px"}}>
                        {item.requestQuantity}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{padding: "20px", textAlign: "center", color: "#999"}}
                >
                  No medical requests found
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
      {/* Floating Help Button (bottom right) */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 1000,
        }}
      >
        <button
          id="help-fab"
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#e3e8ef", // xám nhạt
            color: "#355383", // xanh đậm cho icon
            border: "none",
            boxShadow: "0 2px 8px rgba(53, 83, 131, 0.10)",
            fontSize: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onClick={() => {
            const card = document.getElementById("help-contact-card");
            if (card)
              card.style.display =
                card.style.display === "block" ? "none" : "block";
          }}
          aria-label="Need Help?"
        >
          ?
        </button>
        {/* Contact Card Popup */}
        <div
          id="help-contact-card"
          style={{
            display: "none",
            position: "absolute",
            bottom: 70,
            right: 0,
            background: "#e6f3ff", // xanh nhạt
            borderRadius: 12,
            border: "1px solid #b6d6f6",
            padding: 32,
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(53, 83, 131, 0.10)",
            minWidth: 320,
            zIndex: 1001,
          }}
        >
          <div style={{fontSize: 32, color: "#355383", marginBottom: 8}}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 21s-7-4.35-7-10a7 7 0 0 1 14 0c0 5.65-7 10-7 10Z"
                stroke="#355383"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
                stroke="#355383"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div
            style={{
              fontWeight: 700,
              color: "#355383",
              fontSize: 20,
              marginBottom: 8,
            }}
          >
            Need Help?
          </div>
          <div style={{color: "#555", fontSize: 16, marginBottom: 18}}>
            Our support team is here to assist you with your booking.
          </div>
          <div
            style={{
              color: "#222",
              fontSize: 16,
              marginBottom: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <span>
              <b>Phone:</b>{" "}
              <a href="tel:0123456789" style={{color: "#355383"}}>
                0123 456 789
              </a>
            </span>
            <span>
              <b>Email:</b>{" "}
              <a href="mailto:support@school.edu" style={{color: "#355383"}}>
                support@school.edu
              </a>
            </span>
          </div>
          <button
            style={{
              border: "1px solid #355383",
              color: "#355383",
              background: "#e6f3ff",
              borderRadius: 8,
              padding: "8px 24px",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onClick={() => window.open("mailto:support@school.edu", "_blank")}
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicalEventDetail;
