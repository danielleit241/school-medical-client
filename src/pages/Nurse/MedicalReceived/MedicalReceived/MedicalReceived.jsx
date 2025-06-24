import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../api/axios";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Tag,
  Pagination,
  Spin,
  Select,
  Empty,
  Avatar,
} from "antd";
import { useSelector } from "react-redux";
import { UserOutlined, FilterOutlined } from "@ant-design/icons";

const statusConfig = {
  done: {
    color: "#10b981",
    bgColor: "#ecfdf5",
    borderColor: "#a7f3d0",
    text: "Nurse Approved",
  },
  notyet: {
    color: "#f59e0b",
    bgColor: "#fffbeb",
    borderColor: "#fed7aa",
    text: "Not Yet",
  },
};

const MedicalReceived = () => {
  const navigate = useNavigate();
  const userId = useSelector((state) => state.user?.userId);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("notyet"); // "notyet" | "done"

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/api/nurses/${userId}/medical-registrations`
        );
        setData(response.data.items || []);
        setTotal(response.data.count || 0);
      } catch (error) {
        console.error("Error fetching medical registrations:", error);
        setData([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, userId, pageIndex, pageSize]);

  // Hàm kiểm tra đơn đã complete hết chưa
  const isAllDoseCompleted = (item) =>
    item.medicalRegistrationDetails &&
    item.medicalRegistrationDetails.length > 0 &&
    item.medicalRegistrationDetails.every((dose) => dose.isCompleted);

  // Lọc data theo filter
  const filteredData = data.filter((item) => {
    if (filterStatus === "done") return isAllDoseCompleted(item);
    if (filterStatus === "notyet") return !isAllDoseCompleted(item);
    return true;
  });

  // Kiểm tra nếu không có dữ liệu trong filter hiện tại
  const noData = filteredData.length === 0;

  // Card component giống AppointmentList
  const MedicalCard = ({ item }) => {
    const done = isAllDoseCompleted(item);
    const status = done ? statusConfig.done : statusConfig.notyet;
    const notCompletedDoses =
      item.medicalRegistrationDetails?.filter((dose) => !dose.isCompleted) || [];

    return (
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 16,
          border: `2px solid ${status.borderColor}`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          transition: "all 0.3s ease",
        }}
        bodyStyle={{ padding: "32px 36px" }}
        hoverable
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 32 }}>
          {/* Left: Student Info & Details */}
          <div style={{ flex: 1 }}>
            {/* Student Info */}
            <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 16 }}>
              <Avatar
                size={48}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: "#4f46e5",
                  marginRight: 16,
                  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
                }}
              />              
              <div>
                <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#1f2937", lineHeight: 1.2 }}>
                  {item.student.studentFullName}
                </h3>
              </div>
            </div>
            {/* Details grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 24,
                marginBottom: 18,
                alignItems: "center",
              }}
            >
              <div style={{ color: "#3058A4", fontWeight: 600, fontSize: 18, wordBreak: "break-word" }}>
                {item.medicalRegistration.medicationName}
              </div>
              <div style={{ color: "#374151", fontSize: 17, fontWeight: 600 }}>
                <span style={{ color: "#6b7280", fontWeight: 500 }}>Total Dosages:</span>{" "}
                {item.medicalRegistration.totalDosages}
              </div>
              <div style={{ color: "#374151", fontSize: 17, fontWeight: 600 }}>
                <span style={{ color: "#6b7280", fontWeight: 500 }}>Date Submitted:</span>{" "}
                {item.medicalRegistration.dateSubmitted}
              </div>
            </div>
            {/* Parent Notes với background giống Description */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: 10,
                padding: "14px 18px",
                marginTop: 10,
                fontSize: 16,
                fontWeight: 600,
                color: "#374151",
                border: "1px solid #e5e7eb",
              }}
            >
              <span style={{ color: "#6b7280", fontWeight: 600 }}>Parent Notes:</span>{" "}
              <span style={{ fontWeight: 500, fontStyle: "italic" }}>{item.medicalRegistration.notes}</span>
            </div>
          </div>
          {/* Right: Status & Actions */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 20, minWidth: 180 }}>
            <Tag
              style={{
                backgroundColor: status.bgColor,
                color: status.color,
                border: `2px solid ${status.color}`,
                borderRadius: 24,
                padding: "10px 28px",
                fontSize: 17,
                fontWeight: 700,
                minWidth: 120,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              {status.text}
              {!done && notCompletedDoses.length > 0 && (
                <span style={{ marginLeft: 8, fontWeight: 600 }}>
                  (
                  {notCompletedDoses
                    .map((dose) => `Dose ${dose.doseNumber}`)
                    .join(", ")}
                  )
                </span>
              )}
            </Tag>
            <Button
              type="primary"
              style={{
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 18,
                height: 48,
                paddingLeft: 32,
                paddingRight: 32,
                background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
                border: "none",
                boxShadow: "0 4px 15px rgba(79, 70, 229, 0.3)",
                transition: "all 0.3s ease",
              }}
              onClick={() => {
                navigate(`/nurse/medical-received/medical-received-detail`, {
                  state: {
                    registrationId: item.medicalRegistration.registrationId,
                    studentId: item.student.studentId,
                  },
                });
              }}
            >
              Details
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Header + Filter */}
      <div
        style={{
          width: "100%",
          background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
          padding: "36px 0 18px 0",
          marginBottom: "40px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <h1
          style={{
            fontWeight: 700,
            fontSize: 38,
            color: "#fff",
            letterSpacing: 1,
            marginBottom: 8,
            marginTop: 0,
          }}
        >
          Medical Received Requests
        </h1>
        <div
          style={{
            color: "#e0e7ff",
            fontSize: 20,
            fontWeight: 500,
          }}
        >
          Manage and review all medication requests from parents
        </div>
        {/* Filter status đưa lên header */}
        <div
          style={{
            marginTop: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <FilterOutlined style={{ fontSize: 18, color: "#fff" }} />
          <span style={{ fontSize: 18, fontWeight: 500, color: "#fff" }}>Filter by status:</span>
          <Select
            value={filterStatus}
            style={{ width: 180, borderRadius: 10 }}
            onChange={setFilterStatus}
            size="large"
          >
            <Select.Option value="notyet">Not Yet</Select.Option>
            <Select.Option value="done">Done</Select.Option>
          </Select>
        </div>
      </div>

      <div
        style={{
          maxHeight: "650px",
          padding: "32px 0",
          boxSizing: "border-box",
        }}
      >
        {/* Loading & List */}
        {loading ? (
          <div style={{ textAlign: "center" }}>
            <Spin size="large" />
          </div>
        ) : noData ? (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: "80px 40px",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              margin: "0 32px",
            }}
          >
            <Empty
              description={
                <span style={{ fontSize: 18, color: "#6b7280", fontWeight: 500 }}>
                  No medical received requests found.
                </span>
              }
              style={{ fontSize: 18 }}
            />
          </div>
        ) : (
          <div
            style={{
              maxHeight: "650px",
              overflowY: "auto",
              padding: "32px 0",
              boxSizing: "border-box",
              
            }}
          >
            {filteredData.map((item) => (
              <div
                style={{
                  width: "100%",
                  padding: "0 32px",
                  display: "flex", 
                  flexDirection: "column",
                  gap: 20 
                  
                }}
                key={item.medicalRegistration.registrationId}
              >
                <MedicalCard item={item} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginTop: 40,
            marginBottom: 32,
          }}
        >
          <Pagination
            current={pageIndex}
            pageSize={pageSize}
            total={total}
            onChange={(page) => setPageIndex(page)}
            showSizeChanger={false}
            style={{
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 2px 8px #e6f7ff",
              padding: "12px 24px",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MedicalReceived;
