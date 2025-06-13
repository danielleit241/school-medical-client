import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {Button, Spin} from "antd";
import {CalendarOutlined} from "@ant-design/icons";
import axiosInstance from "../../../../api/axios";
import {useSelector} from "react-redux";

const AppointmentDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const appointmentId = location.state?.id;
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log(appointmentId);
  const userId = useSelector((state) => state.user?.userId);
  const nurseMap = JSON.parse(localStorage.getItem("nurseMap") || "{}");

  const getNurseName = (item) => {
    // Ưu tiên lấy từ API, nếu không có thì lấy từ localStorage
    return item.nurseName || nurseMap[item.appointmentId]?.fullName || "N/A";
  };

  useEffect(() => {
    if (!appointmentId) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `/api/parents/${userId}/appointments/${appointmentId}`
        );
        setAppointment(res.data);
        // console.log("Appointment Details:", res.data);
      } catch (error) {
        console.error("Error fetching appointment details:", error);
        setAppointment(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [appointmentId, userId]);

  const getStatus = (item) => {
    if (item.completionStatus) return {text: "Done", color: "#1890ff"};
    if (item.confirmationStatus) return {text: "Confirmed", color: "#52c41a"};
    return {text: "Pending", color: "#faad14"};
  };

  if (!appointmentId) return <div>No Appointment Found.</div>;
  if (loading)
    return (
      <div
        className="loading-container"
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
  if (!appointment) return <div>No Appointment Details Found.</div>;

  const statusInfo = getStatus(appointment);

  return (
    <div
      className="appointment-history-fullscreen animate__animated animate__fadeIn"
      style={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        padding: "20px",
        display: "flex", // Thêm dòng này
        justifyContent: "center", // Thêm dòng này
        alignItems: "center", // Thêm dòng này
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          width: "100%", // Đảm bảo card không bị co lại
          margin: "0 auto",
          display: "flex",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        {/* Left Side - Title Section */}
        <div
          style={{
            width: "30%",
            background: "linear-gradient(90deg, #2B5DC4 0%, #355383 100%)",
            padding: "40px 30px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: "linear-gradient(90deg, #86A6DF 0%, #86A6DF 100%)",
              borderRadius: "50%",
              width: "80px",
              height: "80px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <CalendarOutlined
              style={{fontSize: "40px", color: "white", margin: 0}}
            />
          </div>
          <h1
            style={{fontSize: "32px", fontWeight: "bold", margin: "0 0 16px 0"}}
          >
            Appointment Detail
          </h1>
          <p style={{fontSize: "16px", opacity: "0.8", margin: 0}}>
            View and manage your appointment information easily
          </p>
        </div>

        {/* Right Side - Content Section */}
        <div
          style={{
            width: "70%",
            backgroundColor: "#fff",
            padding: "30px",
            borderRadius: "0 20px 20px 0",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #f8f8f8",
            }}
          >
            <tbody>
              <tr style={{borderBottom: "1px solid #eee"}}>
                <td
                  style={{
                    padding: "20px 24px",
                    fontWeight: 600,
                    width: "200px",
                    height: "80px",
                    backgroundColor: "#f9f9f9",
                    fontSize: "16px",
                  }}
                >
                  Student Name
                </td>
                <td
                  style={{
                    padding: "20px 24px",
                    fontSize: "16px",
                  }}
                >
                  {appointment.student?.fullName || "..."}
                </td>
              </tr>
              <tr style={{borderBottom: "1px solid #eee"}}>
                <td
                  style={{
                    padding: "20px 24px",
                    fontWeight: 600,
                    width: "200px",
                    height: "80px",
                    backgroundColor: "#f9f9f9",
                    fontSize: "16px",
                  }}
                >
                  Date
                </td>
                <td
                  style={{
                    padding: "20px 24px",
                    fontSize: "16px",
                  }}
                >
                  {appointment.appointmentDate}
                </td>
              </tr>
              <tr style={{borderBottom: "1px solid #eee"}}>
                <td
                  style={{
                    padding: "20px 24px",
                    fontWeight: 600,
                    width: "200px",
                    height: "80px",
                    backgroundColor: "#f9f9f9",
                    fontSize: "16px",
                  }}
                >
                  Time
                </td>
                <td
                  style={{
                    padding: "20px 24px",
                    fontSize: "16px",
                  }}
                >
                  {appointment.appointmentStartTime?.slice(0, 5)} -{" "}
                  {appointment.appointmentEndTime?.slice(0, 5)}
                </td>
              </tr>
              <tr style={{borderBottom: "1px solid #eee"}}>
                <td
                  style={{
                    padding: "20px 24px",
                    fontWeight: 600,
                    width: "200px",
                    height: "80px",
                    backgroundColor: "#f9f9f9",
                    fontSize: "16px",
                  }}
                >
                  Topic
                </td>
                <td
                  style={{
                    padding: "20px 24px",
                    fontSize: "16px",
                  }}
                >
                  {appointment.topic}
                </td>
              </tr>
              <tr style={{borderBottom: "1px solid #eee"}}>
                <td
                  style={{
                    padding: "20px 24px",
                    fontWeight: 600,
                    width: "200px",
                    height: "80px",
                    backgroundColor: "#f9f9f9",
                    fontSize: "16px",
                  }}
                >
                  Reason
                </td>
                <td
                  style={{
                    padding: "20px 24px",
                    fontSize: "16px",
                  }}
                >
                  {appointment.appointmentReason}
                </td>
              </tr>
              <tr style={{borderBottom: "1px solid #eee"}}>
                <td
                  style={{
                    padding: "20px 24px",
                    fontWeight: 600,
                    width: "200px",
                    height: "80px",
                    backgroundColor: "#f9f9f9",
                    fontSize: "16px",
                  }}
                >
                  Nurse
                </td>
                <td
                  style={{
                    padding: "20px 24px",
                    fontSize: "16px",
                  }}
                >
                  {getNurseName(appointment) || "..."}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "20px 24px",
                    fontWeight: 600,
                    width: "200px",
                    height: "80px",
                    backgroundColor: "#f9f9f9",
                    fontSize: "16px",
                  }}
                >
                  Status
                </td>
                <td
                  style={{
                    padding: "20px 24px",
                    fontSize: "16px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "6px 16px",
                      backgroundColor:
                        statusInfo.text === "Pending"
                          ? "#FFC107"
                          : statusInfo.text === "Confirmed"
                          ? "#4CAF50"
                          : "#2196F3",
                      color: "white",
                      borderRadius: "20px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    {statusInfo.text}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{padding: "24px"}}>
            <Button
              type="default"
              onClick={() => navigate("/parent/appointment-history")}
              style={{
                borderRadius: "8px",
                height: "40px",
                padding: "0 24px",
                fontWeight: "500",
                boxShadow: "none",
                border: "1px solid #d9d9d9",
              }}
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;
