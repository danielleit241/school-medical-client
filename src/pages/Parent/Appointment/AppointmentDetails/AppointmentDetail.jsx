import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {Button, Spin, Tag} from "antd";
import {CalendarOutlined} from "@ant-design/icons";
import axiosInstance from "../../../../api/axios";
import {useSelector} from "react-redux";

const AppointmentDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const appointmentId = location.state?.id;
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nurseInfo, setNurseInfo] = useState("");
  console.log(appointmentId);
  const userId = useSelector((state) => state.user?.userId);
  const nurseMap = JSON.parse(localStorage.getItem("nurseMap") || "{}");


  const formatPhone = (phone) => {
  if (!phone) return "";
  // Lấy chỉ số, bỏ ký tự không phải số
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    // 10 số: 012.345.6789
    return `${digits.slice(0,4)}.${digits.slice(4,7)}.${digits.slice(7,10)}`;
  }
  if (digits.length === 11) {
    // 11 số: 012.234.43210
    return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}.${digits.slice(9,11)}`;
  }
  return phone; // fallback
};
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
         console.log("Fetched Appointment Data:", res.data.staffNurse.fullName);
         setNurseInfo(res.data.staffNurse);
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
    if (item.completionStatus === true) return {text: "Completed", color: "#1890ff"};
    if (item.completionStatus === false) return {text: "Cancelled", color: "#fef2f2"};
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
                    borderRight: "2px solid #eee", // Thêm dòng này
                  }}
                >
                  Nurse
                </td>
                <td
                  style={{
                    padding: "20px 24px",
                    width: "250px",
                    fontSize: "16px",
                    borderRight: "2px solid #eee", // Thêm dòng này
                  }}
                >
                  {nurseInfo.fullName || getNurseName(appointment)}
                </td>
                <td
                  style={{
                    display: "flex",
                    gap: "8px",
                    padding: "20px 24px",
                    fontSize: "16px",
                    marginTop: "16px", 
                  }}
                >
                  <p style={{fontWeight: 600}}> Phone:</p> {formatPhone(nurseInfo.phoneNumber) }
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
                  <Tag
                    color={
                      statusInfo.color === "#1890ff"
                        ? "success"
                        : statusInfo.color === "#fef2f2"
                        ? "error"
                        : statusInfo.color === "#faad14"
                        ? "warning"
                        : statusInfo.color === "#52c41a"
                        ? "blue"
                        : "default"
                    }
                    style={{
                      display: "inline-block",
                      padding: "6px 16px",
                      borderRadius: "20px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    {statusInfo.text}
                  </Tag>
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
