import React, {useEffect, useState} from "react";
import axiosInstance from "../../../../api/axios";
import {useSelector} from "react-redux";
import {Card, Button, Tag, Select, Pagination} from "antd";
import "./index.scss";
import {useNavigate} from "react-router-dom";

const {Option} = Select;

const AppointmentHistory = () => {
  const userId = useSelector((state) => state.user?.userId);
  const [appointments, setAppointments] = useState([]);
  const [showList, setShowList] = useState(false);
  const [dotIndex, setDotIndex] = useState(0);

  // Pagination states
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [filterStatus, setFilterStatus] = useState("All");
  const navigate = useNavigate();
  const nurseMap = JSON.parse(localStorage.getItem("nurseMap") || "{}");

  // eslint-disable-next-line no-unused-vars
  const getNurseName = (item) => {
    // Ưu tiên lấy từ API, nếu không có thì lấy từ localStorage
    return item.nurseName || nurseMap[item.appointmentId]?.fullName || "N/A";
  };

  // Fetch appointments với pagination
  useEffect(() => {
    if (!userId) return;

    const fetchAppointments = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/parents/${userId}/appointments`,
          {
            params: {
              PageSize: pageSize,
              PageIndex: pageIndex,
              SortBy: "appointmentDate",
              SortOrder: "desc",
            },
          }
        );

        const data = response.data;
        console.log("Fetched appointments:", data);

        // Xử lý data theo định dạng API trả về
        if (data && data.items) {
          setAppointments(data.items);
          setTotal(data.count || 0);
        } else if (Array.isArray(data)) {
          setAppointments(data);
          setTotal(data.length);
        } else {
          setAppointments([]);
          setTotal(0);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
        setTotal(0);
      }
    };

    fetchAppointments();
  }, [userId, pageIndex, pageSize]);

  const getStatus = (item) => {
    if (item.completionStatus === true ) return {text: "Completed", color: "blue"};
    if (item.completionStatus === false) return {text: "Cancelled", color: "fef2f2"};
    if (item.confirmationStatus) return {text: "Confirmed", color: "green"};
    return {text: "Pending", color: "orange"};
  };

  // Filter logic theo yêu cầu
  const getFilteredAppointments = () => {
    if (filterStatus === "All") return appointments;
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
      style={{
        padding: "20px 0",
        margin: "0 auto",
        width: "90%",
      }}
    >
      <div
        className="animate__animated animate__fadeIn"
        style={{
          background: "#fff",
          minHeight: "100vh",
          borderRadius: "20px 20px 0 0",
          padding: 0,
          position: "relative",
        }}
      >
        {/* Header gradient */}
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

        {/* Filter */}
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
            <Option value="All">All</Option>
            <Option value="Pending">Pending</Option>
            <Option value="Confirmed">Confirmed</Option>
            <Option value="Completed">Completed</Option>
            <Option value="Cancelled">Cancelled</Option>
          </Select>
        </div>

        {/* List content area */}
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
                overflowX: "hidden",
                paddingRight: 8,
              }}
            >
              <div style={{display: "flex", flexDirection: "column", gap: 16}}>
                {filteredAppointments.map((item) => (
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
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      {/* Left section with avatar and student name */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 15,
                          width: "30%",
                        }}
                      >
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
                          }}
                        >
                          {item.student?.fullName?.[0] || "U"}
                        </div>
                        <div>
                          <div style={{fontWeight: 700, fontSize: 18}}>
                            {item.student?.fullName}
                          </div>
                          <div style={{color: "#666", fontSize: 14}}>
                            Student ID: {item.student?.studentCode || "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Status and Details section (right aligned) */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 15,
                        }}
                      >
                        <Tag
                          color={
                            getStatus(item).color === "blue"
                              ? "success"
                              : getStatus(item).color === "green"
                              ? "processing"
                              : getStatus(item).color === "fef2f2"
                              ? "error"
                              : "warning"
                          }
                          style={{
                            fontWeight: 600,
                            borderRadius: 20,
                            fontSize: 14,
                            padding: "4px 16px",
                            height: 32,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {getStatus(item).text}
                        </Tag>

                        <Button
                          style={{
                            borderRadius: 8,
                            background: "#355383",
                            color: "#fff",
                            fontWeight: 600,
                            minWidth: 90,
                            height: 40,
                            border: "none",
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

                    {/* Date and Topic section */}
                    <div
                      style={{
                        marginTop: 12,
                        display: "flex",
                        gap: 12,
                      }}
                    >
                      {/* Date badge */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "6px 14px",
                          backgroundColor: "#f0f7ff",
                          borderRadius: 8,
                        }}
                      >
                        <span style={{marginRight: 8, color: "#5b8cff"}}>
                          Date:
                        </span>
                        <span style={{color: "#355383", fontWeight: 500}}>
                          {item.appointmentDate}
                        </span>
                      </div>

                      {/* Topic badge */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "6px 14px",
                          backgroundColor: "#fff9f6",
                          borderRadius: 8,
                        }}
                      >
                        <span style={{marginRight: 8, color: "#ff7d4d"}}>
                          Topic:
                        </span>
                        <span style={{color: "#ff7d4d", fontWeight: 500}}>
                          {item.topic || "No topic"}
                        </span>
                      </div>
                    </div>

                    {/* Reason section - full width at bottom */}
                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: "1px solid #f0f0f0",
                        color: "#666",
                        fontSize: 14,
                      }}
                    >
                      <span style={{fontWeight: 600}}>Description: </span>
                      {item.appointmentReason || "No description provided"}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pagination section - nằm dưới cùng ngoài container chính */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          background: "#fff",
          padding: "12px 0",
          borderRadius: "0 0 20px 20px",
        }}
      >
        <Pagination
          current={pageIndex}
          pageSize={pageSize}
          total={total}
          onChange={(page) => {
            setPageIndex(page);
          }}
        />
      </div>
    </div>
  );
};

export default AppointmentHistory;
