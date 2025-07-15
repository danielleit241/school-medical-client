import React, {useEffect, useState} from "react";
import axiosInstance from "../../../../api/axios";
import {useNavigate} from "react-router-dom";
import {Card, Button, Tag, Pagination, Spin, Select, Empty, Avatar} from "antd";
import {useSelector} from "react-redux";
import {UserOutlined, FilterOutlined} from "@ant-design/icons";

const statusConfig = {
  completed: {
    color: "#10b981",
    bgColor: "#ecfdf5",
    borderColor: "#a7f3d0",
    text: "Completed",
  },
  cancelled: {
    color: "#dc2626",
    bgColor: "#fef2f2",
    borderColor: "#fecaca",
    text: "Cancelled",
  },
  pending: {
    color: "#f59e0b",
    bgColor: "#fffbeb",
    borderColor: "#fed7aa",
    text: "Pending",
  },
  approved: {
    color: "#2563eb",
    bgColor: "#eff6ff",
    borderColor: "#bfdbfe",
    text: "Approved",
  },
};

const MedicalReceived = () => {
  const navigate = useNavigate();
  const userId = useSelector((state) => state.user?.userId);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 4;
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/api/nurses/${userId}/medical-registrations`,
          {
            params: {
              pageIndex,
              pageSize,
            },
          }
        );
        console.log("Medical Registrations:", response.data);
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

  const isAllDoseCompleted = (item) =>
    item.medicalRegistrationDetails &&
    item.medicalRegistrationDetails.length > 0 &&
    item.medicalRegistrationDetails.every((dose) => dose.isCompleted);

  const getRegistrationStatus = (item) => {
    const registration = item.medicalRegistration;

    if (registration.status === false) {
      return statusConfig.cancelled;
    }

    if (registration.status === null || registration.status === undefined) {
      return statusConfig.pending;
    }

    if (registration.status === true) {
      const allDoseCompleted = isAllDoseCompleted(item);
      return allDoseCompleted ? statusConfig.completed : statusConfig.approved;
    }

    return statusConfig.pending;
  };

  const filteredData = data.filter((item) => {
    const registration = item.medicalRegistration;

    if (filterStatus === "approved") {
      return registration.status === true;
    }
    if (filterStatus === "cancelled") {
      return registration.status === false;
    }
    if (filterStatus === "pending") {
      return registration.status === null || registration.status === undefined;
    }
    if (filterStatus === "completed") {
      return registration.status === true && isAllDoseCompleted(item);
    }
    return true;
  });

  const noData = filteredData.length === 0;

  const MedicalCard = ({item}) => {
    const status = getRegistrationStatus(item);

    return (
      <Card
        style={{
          marginBottom: 16,
          borderRadius: 12,
          border: `2px solid ${status.borderColor}`,
          boxShadow: "0 4px 16px 0 rgba(53,83,131,0.10)",
          background: "#fff",
          transition: "all 0.2s",
        }}
        bodyStyle={{padding: "18px 24px"}}
        hoverable
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          {/* Left: Student Info & Details */}
          <div style={{flex: 1}}>
            <div
              style={{
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Avatar
                size={40}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: "#2563eb",
                  marginRight: 12,
                  boxShadow: "0 2px 8px rgba(37,99,235,0.13)",
                }}
              />
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#1e293b",
                    lineHeight: 1.2,
                  }}
                >
                  {item.student.studentFullName}
                </h3>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    color: "#6b7280",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  Student ID: {item.student.studentCode || "N/A"}
                </p>
              </div>
            </div>
            {/* Details grid */}
            <div
              style={{
                display: "flex",
                gap: 16,
                marginBottom: 10,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#2563eb",
                  fontWeight: 600,
                  fontSize: 14,
                  background: "#f0f7ff",
                  borderRadius: 6,
                  padding: "4px 12px",
                  border: "1.5px solid #dbeafe",
                }}
              >
                <span style={{fontWeight: 700}}>📅</span>
                <span>{item.medicalRegistration.dateSubmitted}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#059669",
                  fontWeight: 600,
                  fontSize: 14,
                  background: "#ecfdf5",
                  borderRadius: 6,
                  padding: "4px 12px",
                  border: "1.5px solid #a7f3d0",
                }}
              >
                <span style={{fontWeight: 700}}>🕒</span>
                <span>
                  Total Dosages: {item.medicalRegistration.totalDosages}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#f59e42",
                  fontWeight: 600,
                  fontSize: 14,
                  background: "#fff7ed",
                  borderRadius: 6,
                  padding: "4px 12px",
                  border: "1.5px solid #fde68a",
                }}
              >
                <span style={{fontWeight: 700}}>💊</span>
                <span>{item.medicalRegistration.medicationName}</span>
              </div>
            </div>
            {/* Parent Notes */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: 8,
                padding: "10px 12px",
                marginTop: 8,
                fontSize: 14,
                fontWeight: 600,
                color: "#374151",
                border: "1px solid #e5e7eb",
              }}
            >
              <span style={{color: "#6b7280", fontWeight: 600}}>
                Parent Notes:
              </span>{" "}
              <span style={{fontWeight: 500, fontStyle: "italic"}}>
                {item.medicalRegistration.notes || "No notes"}
              </span>
            </div>
          </div>
          {/* Right: Status & Actions */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 12,
              minWidth: 140,
            }}
          >
            <Tag
              style={{
                backgroundColor: status.bgColor,
                color: status.color,
                border: `2px solid ${status.color}`,
                borderRadius: 18,
                padding: "7px 18px",
                fontSize: 14,
                fontWeight: 700,
                minWidth: 120,
                textAlign: "center",
                marginBottom: 6,
              }}
            >
              {status.text}
            </Tag>
            <Button
              type="primary"
              style={{
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 15,
                height: 38,
                paddingLeft: 18,
                paddingRight: 18,
                background: "linear-gradient(90deg, #3058A4 0%, #2563eb 100%)",
                border: "none",
                boxShadow: "0 2px 8px #3058A433",
                transition: "all 0.2s",
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

  const totalCount = data.length;
  const pendingCount = data.filter(
    (item) =>
      item.medicalRegistration.status === null ||
      item.medicalRegistration.status === undefined
  ).length;
  const approvedCount = data.filter(
    (item) => item.medicalRegistration.status === true && !isAllDoseCompleted(item)
  ).length;
  const completedCount = data.filter(
    (item) => item.medicalRegistration.status === true && isAllDoseCompleted(item)
  ).length;
  const cancelledCount = data.filter(
    (item) => item.medicalRegistration.status === false
  ).length;

  return (
    <div className="min-h-screen bg-white py-8">
      {/* Header + Filter */}
      <div
        style={{
          width: "100%",
          background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
          padding: "20px 0 10px 0",
          marginBottom: "28px",
          textAlign: "center",
          position: "relative",
          borderRadius: "20px 20px 0 0",
        }}
      >
        <h1
          style={{
            fontWeight: 800,
            color: "#fff",
            letterSpacing: 1,
            marginBottom: 4,
            marginTop: 0,
          }}
        >
          Medical Received
        </h1>
        <div
          style={{
            color: "#e0e7ff",
            fontSize: 16,
            fontWeight: 500,
            marginBottom: 0,
          }}
        >
          Manage and review all medication requests from parents
        </div>

        

        <div
          style={{
            marginTop: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 500, color: "#ffffff" }}>
            Status:
          </span>
          <Select
            value={filterStatus}
            style={{ width: 140, height: 30, borderRadius: 10 }}
            onChange={setFilterStatus}
            size="large"
          >
            <Select.Option value="all">All</Select.Option>
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="approved">Approved</Select.Option>
            <Select.Option value="cancelled">Cancelled</Select.Option>
            <Select.Option value="completed">Completed</Select.Option>
          </Select>
        </div>
      </div>

      <div
        style={{
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginBottom: 32,
            gap: 20,
            flexWrap: "wrap",
            width: "100%",
            padding: "20px 32px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px 32px",
              borderRadius: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              textAlign: "center",
              minWidth: 150,
              flex: 1,
            }}
          >
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: 24,
                fontWeight: 700,
                color: "#1f2937",
              }}
            >
              {totalCount}
            </h3>
            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              Total Requests
            </p>
          </div>
          <div
            style={{
              backgroundColor: "white",
              padding: "20px 32px",
              borderRadius: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              textAlign: "center",
              minWidth: 150,
              flex: 1,
            }}
          >
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: 24,
                fontWeight: 700,
                color: "#f59e0b",
              }}
            >
              {pendingCount}
            </h3>
            <p style={{ margin: 0, color: "#6b7280", fontWeight: 600 }}>
              Pending
            </p>
          </div>
          <div
            style={{
              backgroundColor: "white",
              padding: "20px 32px",
              borderRadius: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              textAlign: "center",
              minWidth: 150,
              flex: 1,
            }}
          >
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: 24,
                fontWeight: 700,
                color: "#2563eb",
              }}
            >
              {approvedCount}
            </h3>
            <p style={{ margin: 0, color: "#6b7280", fontWeight: 600 }}>
              Approved
            </p>
          </div>
          <div
            style={{
              backgroundColor: "white",
              padding: "20px 32px",
              borderRadius: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              textAlign: "center",
              minWidth: 150,
              flex: 1,
            }}
          >
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: 24,
                fontWeight: 700,
                color: "#10b981",
              }}
            >
              {completedCount}
            </h3>
            <p style={{ margin: 0, color: "#6b7280", fontWeight: 600 }}>
              Completed
            </p>
          </div>
          <div
            style={{
              backgroundColor: "white",
              padding: "20px 32px",
              borderRadius: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              textAlign: "center",
              minWidth: 150,
              flex: 1,
            }}
          >
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: 24,
                fontWeight: 700,
                color: "#dc2626",
              }}
            >
              {cancelledCount}
            </h3>
            <p style={{ margin: 0, color: "#6b7280", fontWeight: 600 }}>
              Cancelled
            </p>
          </div>
        </div>
        {/* Loading & List */}
        {loading ? (
          <div style={{textAlign: "center"}}>
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
                <span style={{fontSize: 18, color: "#6b7280", fontWeight: 500}}>
                  No medical received requests found.
                </span>
              }
              style={{fontSize: 18}}
            />
          </div>
        ) : (
          <div
            style={{
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
                  gap: 20,
                }}
                key={item.medicalRegistration.registrationId}
              >
                <MedicalCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div
        style={{
          width: "100%",
          marginTop: 32,
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
  );
};

export default MedicalReceived;
