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

  const [filterStatus, setFilterStatus] = useState("Pending");
  const navigate = useNavigate();

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
        // backgroundColor: "#ffffff",
        height: "100vh",
        margin: "20px 20px",
        // boxShadow: "0 0px 8px rgba(0, 0, 0, 0.1)",
        borderRadius: 20,
      }}
    >
      <div
        style={{
          margin: "0 auto",
          padding: "32px 30px",
        }}
      >
        <h1 style={{fontSize: 28, fontWeight: 700, marginBottom: 32}}>
          Appointment History
        </h1>
        <>
          <div
            style={{
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
              style={{
                borderRadius: 20,
                // padding: 24,
                minHeight: 300,
              }}
            >
              <Row gutter={[24, 24]}>
                {filteredAppointments.map((item) => {
                  const statusObj = getStatus(item);
                  return (
                    <Col xs={24} sm={12} md={8} lg={8} key={item.appointmentId}>
                      <Card
                        style={{
                          borderRadius: 12,
                          minHeight: 240,
                          boxShadow: "0 2px 8px #f0f1f2",
                          padding: 0,
                        }}
                        bodyStyle={{padding: 20}}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          {/* Avatar gradient */}
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, #6a82fb 0%, #fc5c7d 100%)",
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
                          <div style={{flex: 1}}>
                            <div style={{fontWeight: 700, fontSize: 17}}>
                              {item.student?.fullName}
                            </div>
                            <div style={{color: "#888", fontSize: 15}}>
                              {item.type || "Consultation"}
                            </div>
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
                                  : undefined,
                              color:
                                statusObj.color === "green"
                                  ? "#1bbf7a"
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
                        {/* Thông tin ngày, giờ, bác sĩ/y tá */}
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
                            marginBottom: 4,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <span style={{marginRight: 6}}>🕒</span>
                          {item.appointmentStartTime?.slice(0, 5)} -{" "}
                          {item.appointmentEndTime?.slice(0, 5)}
                        </div>
                        <div
                          style={{
                            color: "#a259e6",
                            fontSize: 15,
                            marginBottom: 4,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <span style={{marginRight: 6}}>👩‍⚕️</span>
                          {item.nurseName || "N/A"}
                        </div>
                        {/* Chủ đề */}
                        <div
                          style={{
                            background: "#fafbfc",
                            borderRadius: 10,
                            padding: "12px 14px",
                            margin: "14px 0 8px 0",
                            minHeight: 44,
                            color: "#222",
                            fontSize: 15,
                          }}
                        >
                          <b>Topic:</b> {item.topic || "No topic"}
                        </div>
                        <div style={{display: "flex", gap: 8, marginTop: 8}}>
                          <Button
                            style={{
                              borderRadius: 8,
                              background: "#fff",
                              color: "#355383",
                              border: "1px solid #355383",
                              fontWeight: 600,
                              minWidth: 90,
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
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
          )}
        </>
      </div>
    </div>
  );
};

export default AppointmentHistory;
