import React, {useEffect, useState} from "react";
import axiosInstance from "../../../../api/axios";
import {useSelector} from "react-redux";
import {Card, Spin, Empty, Button, Tag, Row, Col, Select} from "antd";
import "./index.scss";
import {useNavigate} from "react-router-dom";

const {Option} = Select;

const AppointmentHistory = () => {
  const userId = useSelector((state) => state.user?.userId);
  const [appointments, setAppointments] = useState([]);
  const [showList, setShowList] = useState(false);
  const [dotIndex, setDotIndex] = useState(0);

  const [filterStatus, setFilterStatus] = useState("Pending"); //để hiển thị all
  const navigate = useNavigate();
  const nurseMap = JSON.parse(localStorage.getItem("nurseMap") || "{}");

  const getNurseName = (item) => {
    // Ưu tiên lấy từ API, nếu không có thì lấy từ localStorage
    return item.nurseName || nurseMap[item.appointmentId]?.fullName || "N/A";
  };

  // Fetch appointments
  useEffect(() => {
    if (!userId) return;
    const fetchAppointments = async () => {
      setShowList(true);
      try {
        const response = await axiosInstance.get(
          `/api/parents/${userId}/appointments`,
          {
            params: {PageSize: 20, PageIndex: 1},
          }
        );
        const data = response.data;
        console.log("Fetched appointments:", data);
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : [];
        setAppointments(arr);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
      } finally {
        setShowList(false);
      }
    };
    fetchAppointments();
  }, [userId]);

  const getStatus = (item) => {
    if (item.completionStatus) return {text: "Completed", color: "blue"};
    if (item.confirmationStatus) return {text: "Confirmed", color: "green"};
    return {text: "Pending", color: "orange"};
  };

  // Filter logic theo yêu cầu
  const getFilteredAppointments = () => {
    return appointments.filter((item) => getStatus(item).text === filterStatus);
  };

  // Hiện hiệu ứng 3 dấu chấm lần lượt trong 2s rồi show list
  useEffect(() => {
    setShowList(false);
    setDotIndex(0);
    let interval = null;
    let timeout = null;

    interval = setInterval(() => {
      setDotIndex((prev) => (prev + 1) % 3);
    }, 200); // đổi dấu chấm mỗi 0.2s

    timeout = setTimeout(() => {
      setShowList(true);
      clearInterval(interval);
    }, 300); // tổng thời gian loading 0.3s

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []); // chỉ chạy 1 lần khi mount

  const filteredAppointments = getFilteredAppointments();

  return (
    <div
      className="appointment-history-fullscreen"
      style={{
        width: "90%",
        height: "100vh",
        margin: "20px auto",
        borderRadius: 20,
      }}
    >
      <div
        style={{
          background: "#ffffff",
          height: "100%",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            width: "100%",
            background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
            padding: "36px 0 18px 0",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            textAlign: "center",
            marginBottom: 32,
            boxShadow: "0 4px 24px 0 rgba(53,83,131,0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.13)",
                boxShadow: "0 2px 8px #a259e633",
              }}
            >
              <span style={{fontSize: 28, color: "#fff"}}>📅</span>
            </span>
            <span
              style={{
                fontWeight: 800,
                fontSize: 36,
                color: "#fff",
                letterSpacing: 1,
                textShadow: "0 2px 8px #2222",
              }}
            >
              Appointment History
            </span>
          </div>
          <div
            style={{
              color: "#e0e7ff",
              fontSize: 20,
              fontWeight: 500,
              textShadow: "0 1px 4px #2222",
            }}
          >
            View and manage your past and upcoming appointments easily
          </div>
        </div>
        <>
          <div
            style={{
              padding: "0 24px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <b>Filter: </b>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{width: 200}}
              placeholder="Filter by status"
            >
              <Option value="Pending">Pending</Option>
              <Option value="Confirmed">Confirmed</Option>
              <Option value="Completed">Completed</Option>
            </Select>
          </div>
          <div style={{padding: "0 24px"}}>
            {!showList ? (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: 32,
                  textAlign: "center",
                  fontSize: 30,
                  letterSpacing: 8,
                  height: 120,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  color: "#222",
                }}
              >
                <span>
                  <span style={{opacity: dotIndex === 0 ? 1 : 0.3}}>.</span>
                  <span style={{opacity: dotIndex === 1 ? 1 : 0.3}}>.</span>
                  <span style={{opacity: dotIndex === 2 ? 1 : 0.3}}>.</span>
                </span>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div
                style={{
                  borderRadius: 12,
                  padding: 32,
                  textAlign: "center",
                  fontSize: 20,
                  color: "#888",
                  marginTop: 40,
                }}
              >
                No appointment history found.
              </div>
            ) : (
              <div
                className="animate__animated animate__fadeIn"
                style={{
                  borderRadius: 20,
                  overflowY: "auto",
                  overflowX: "hidden",
                  paddingRight: 8,
                }}
              >
                <div
                  style={{display: "flex", flexDirection: "column", gap: 16}}
                >
                  {filteredAppointments.map((item) => {
                    const statusObj = getStatus(item);
                    return (
                      <Card
                        key={item.appointmentId}
                        style={{
                          borderRadius: 12,
                          width: "100%",
                          boxShadow: "0 2px 8px #f0f1f2",
                          padding: 0,
                          border: "1px solid #f0f0f0",
                        }}
                        bodyStyle={{padding: 20}}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              flex: 2,
                            }}
                          >
                            {/* Avatar gradient */}
                            <div
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(180deg, #2B5DC4 0%, #2B5DC4 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: 22,
                                color: "#fff",
                                marginRight: 14,
                              }}
                            >
                              {item.student?.fullName?.[0] || "U"}
                            </div>
                            <div>
                              <div style={{fontWeight: 700, fontSize: 17}}>
                                {item.student?.fullName}
                              </div>
                              <div style={{color: "#888", fontSize: 15}}>
                                {item.type || "Consultation"}
                              </div>
                            </div>
                          </div>

                          {/* Date and time */}
                          <div style={{flex: 2, padding: "0 20px"}}>
                            <div
                              style={{
                                color: "#355383",
                                fontSize: 15,
                                marginBottom: 4,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <span style={{marginRight: 6}}>📅</span>
                              {item.appointmentDate}
                            </div>
                            <div
                              style={{
                                color: "#1bbf7a",
                                fontSize: 15,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <span style={{marginRight: 6}}>🕒</span>
                              {item.appointmentStartTime?.slice(0, 5)} -{" "}
                              {item.appointmentEndTime?.slice(0, 5)}
                            </div>
                          </div>

                          {/* Nurse and status */}
                          <div style={{flex: 2}}>
                            <div
                              style={{
                                color: "#a259e6",
                                fontSize: 15,
                                marginBottom: 8,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <span style={{marginRight: 6}}>👩‍⚕️</span>
                              <span style={{fontWeight: 600}}>
                                {getNurseName(item) || "N/A"}
                              </span>
                            </div>
                            <Tag
                              color={statusObj.color}
                              style={{
                                fontWeight: 600,
                                borderRadius: 16,
                                fontSize: 14,
                                padding: "4px 16px",
                                background:
                                  statusObj.color === "green"
                                    ? "#e6fff2"
                                    : statusObj.color === "orange"
                                    ? "#fff7e6"
                                    : statusObj.color === "blue"
                                    ? "#e6f7ff"
                                    : undefined,
                                color:
                                  statusObj.color === "green"
                                    ? "#1bbf7a"
                                    : statusObj.color === "orange"
                                    ? "#fa8c16"
                                    : statusObj.color === "blue"
                                    ? "#1890ff"
                                    : undefined,
                                border: "none",
                              }}
                              icon={
                                statusObj.text === "Completed" ? (
                                  <span>✔️</span>
                                ) : undefined
                              }
                            >
                              {statusObj.text === "Completed"
                                ? "Complete"
                                : statusObj.text}
                            </Tag>
                          </div>

                          {/* Topic and button */}
                          <div
                            style={{
                              flex: 3,
                              display: "flex",
                              alignItems: "center",
                              gap: 16,
                            }}
                          >
                            <div
                              style={{
                                borderRadius: 10,
                                padding: "10px 14px",
                                color: "#222",
                                fontSize: 15,
                                flex: 1,
                                height: 42,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <b>Topic:</b> {item.topic || "No topic"}
                            </div>
                            <Button
                              style={{
                                borderRadius: 8,
                                background: "#fff",
                                color: "#355383",
                                border: "1px solid #355383",
                                fontWeight: 600,
                                minWidth: 90,
                                height: 42,
                              }}
                              onClick={() =>
                                navigate("/parent/appointment-details", {
                                  state: {id: item.appointmentId},
                                })
                              }
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      </div>
    </div>
  );
};

export default AppointmentHistory;
