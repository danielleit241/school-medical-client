import React, {useEffect, useState} from "react";
import axiosInstance from "../../../../api/axios";
import {useSelector} from "react-redux";
import {
  Card,
  Spin,
  Empty,
  Button,
  Tag,
  Row,
  Col,
  Select,
} from "antd";
import "./index.scss";
import { useNavigate } from "react-router-dom";

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
    if ( !userId) return;
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
    let filtered = appointments.filter(
      (item) => getStatus(item).text === filterStatus
    );
    if (filtered.length === 0) {
      if (filterStatus === "Pending") {
        filtered = appointments.filter(
          (item) => getStatus(item).text === "Confirmed"
        );
        if (filtered.length === 0) {
          filtered = appointments.filter(
            (item) => getStatus(item).text === "Completed"
          );
          if (filtered.length === 0) return [];
          setFilterStatus("Completed");
        } else {
          setFilterStatus("Confirmed");
        }
      } else if (filterStatus === "Confirmed") {
        filtered = appointments.filter(
          (item) => getStatus(item).text === "Completed"
        );
        if (filtered.length === 0) return [];
        setFilterStatus("Completed");
      }
    }
    return filtered;
  };

   // Hiện hiệu ứng 3 dấu chấm lần lượt trong 2s rồi show list
      useEffect(() => {
          setShowList(false);
          setDotIndex(0);
          let interval = null;
          let timeout = null;
  
          interval = setInterval(() => {
              setDotIndex(prev => (prev + 1) % 3);
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

  return  (
    <div
      className="appointment-history-fullscreen"
      style={{
        backgroundColor: "#ffffff",
        height: "100vh",
        margin: "20px 20px",
        boxShadow: "0 0px 8px rgba(0, 0, 0, 0.1)",
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
                            <div style={{
                                    background: "#fff",
                                    borderRadius: 12,
                                    padding: 32,
                                    textAlign: "center",
                                    fontSize: 30, // tăng kích thước
                                    letterSpacing: 8,
                                    height: 120,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 900, // đậm hơn
                                    color: "#222", // màu đậm hơn
                                }}>
                                <span>
                                    <span style={{ opacity: dotIndex === 0 ? 1 : 0.3 }}>.</span>
                                    <span style={{ opacity: dotIndex === 1 ? 1 : 0.3 }}>.</span>
                                    <span style={{ opacity: dotIndex === 2 ? 1 : 0.3 }}>.</span>
                                </span>
                            </div>
                            ): filteredAppointments.length === 0 ? (
            <Empty description="No appointments found" />
          ) : (
            <div
              style={{
                borderRadius: 20,
                padding: 24,
                minHeight: 300,
              }}
            >
              <Row gutter={[16, 16]}>
                {filteredAppointments.map((item) => {
                  const statusObj = getStatus(item);
                  return (
                    <Col
                      xs={24}
                      sm={12}
                      md={8}
                      lg={6}
                      key={item.appointmentId}
                    >
                      <Card
                        title={item.student.fullName}
                        style={{
                          minHeight: 220,
                          borderRadius: "10px",
                          boxShadow: "0 0px 5px rgba(0, 0, 0, 0.1)",
                          marginBottom: 16,
                        }}
                        bodyStyle={{padding: 20}}
                      >
                        <p>
                          <b>Date:</b> {item.appointmentDate}
                        </p>
                        <p>
                          <b>Time:</b>{" "}
                          {item.appointmentStartTime?.slice(0, 5)} -{" "}
                          {item.appointmentEndTime?.slice(0, 5)}
                        </p>
                        <p>
                          <b>Topic:</b> {item.topic}
                        </p>
                        <div style={{display: "flex", gap: 8, marginTop: 16}}>
                          <Tag
                            color={statusObj.color}
                            style={{
                              padding: "6px 20px",
                              fontSize: 14,
                              textAlign: "center",
                              borderRadius: 8,
                            }}
                          >
                            {statusObj.text}
                          </Tag>
                          <Button
                            type="primary"
                            style={{ background: "#355383" }}
                            onClick={() =>
                              navigate("/parent/appointment-details", {
                                state: { id: item.appointmentId },
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
