import React, {useState, useEffect} from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Empty,
  Tag,
  Button,
  Pagination,
  Space,
  // Divider,
} from "antd";
import {
  Calendar,
  User,
  FileText,
  Ruler,
  Weight,
  Eye,
  Ear,
  Stethoscope,
  HeartPulse,
  ChevronDown,
  ArrowLeft,
  Check,
  Heart,
  Phone, // Add this import
} from "lucide-react";
import dayjs from "dayjs";
import axiosInstance from "../../../../api/axios";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";

const {Title, Text} = Typography;

const HealthCheckResult = () => {
  const navigate = useNavigate();
  const roleName = useSelector((state) => state.user?.role);
  const [loading, setLoading] = useState(true);
  const [healthResults, setHealthResults] = useState([]);
  const [expandedItems, setExpandedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const student = localStorage.getItem("selectedStudent");
  const studentId = student ? JSON.parse(student).studentId : null;

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get(`/api/health-check-results/students/${studentId}`)
      .then((res) => {
        setHealthResults(res.data?.items || []);
      })
      .catch((err) => {
        console.error("Error fetching health check results:", err);
        setHealthResults([]);
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  const handleBack = () => {
    setTimeout(() => {
      localStorage.removeItem("selectedStudent");
    }, 60000 * 30);
    navigate(`/${roleName}/health-declaration/my-children`);
  };

  const toggleItem = (index) => {
    setExpandedItems((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index]
    );
  };

  const currentItems = healthResults.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setExpandedItems([]);
    window.scrollTo({top: 0, behavior: "smooth"});
  };

  // Modify this function to map status codes correctly
  const getStatusLabel = (status) => {
    // Log để kiểm tra giá trị thực tế
    console.log("Status value:", status, "Type:", typeof status);

    // Chuyển về string và so sánh
    const statusStr = String(status).toLowerCase();

    switch (statusStr) {
      case "0":
      case "pending":
        return "Pending";
      case "1":
      case "completed":
        return "Completed";
      case "2":
      case "failed":
        return "Failed";
      case "3":
      case "declined":
        return "Declined";
      default:
        return status; // Trả về giá trị gốc nếu không match
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "64vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{padding: "16px"}}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
          borderRadius: "16px",
          padding: "24px 24px",
          marginBottom: "24px",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative background */}
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

        {/* Back button */}
        <Button
          icon={
            <ArrowLeft
              size={18}
              style={{
                color: "white",
              }}
            />
          }
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            background: "rgba(255, 255, 255, 0.2)",
            borderColor: "transparent",
            color: "white",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={handleBack}
        />

        {/* Main title section */}
        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "16px",
                backdropFilter: "blur(10px)",
              }}
            >
              <Heart
                size={24}
                style={{
                  color: "white",
                }}
              />
            </div>
            <Title
              level={1}
              style={{
                margin: 0,
                color: "white",
                fontWeight: "bold",
                fontSize: "28px", // Changed from 32px
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              Child's Health Check Records
            </Title>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "12px 0",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <span style={{fontSize: "18px"}}>🩺</span>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "14px", // Changed from 16px
                textAlign: "center",
              }}
            >
              Track health check history and details for your child
            </Text>
            <span style={{fontSize: "18px"}}>💪</span>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row
          gutter={16}
          style={{marginTop: "24px", position: "relative", zIndex: 1}}
        >
          <Col xs={24} sm={12}>
            <Card
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                border: "none",
                backdropFilter: "blur(10px)",
              }}
              bodyStyle={{padding: "16px"}}
            >
              <div style={{display: "flex", alignItems: "center"}}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "#4CAF50",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: "12px",
                    boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)",
                  }}
                >
                  <Check
                    size={24}
                    style={{
                      color: "white",
                    }}
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: "bold",
                      color: "white",
                      fontSize: "18px",
                      textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    {healthResults.length} Records
                  </div>
                  <div
                    style={{
                      fontSize: "12px", // Changed from 14px
                      color: "rgba(255, 255, 255, 0.8)",
                    }}
                  >
                    Completed health checks
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                border: "none",
                backdropFilter: "blur(10px)",
              }}
              bodyStyle={{padding: "16px"}}
            >
              <div style={{display: "flex", alignItems: "center"}}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "#FFC107",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: "12px",
                    boxShadow: "0 2px 8px rgba(255, 193, 7, 0.3)",
                  }}
                >
                  <User
                    size={24}
                    style={{
                      color: "white",
                    }}
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: "bold",
                      color: "white",
                      fontSize: "18px",
                      textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    Healthy
                  </div>
                  <div
                    style={{
                      fontSize: "12px", // Changed from 14px
                      color: "rgba(255, 255, 255, 0.8)",
                    }}
                  >
                    Regularly checked
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Health Check List */}
      {!Array.isArray(healthResults) || healthResults.length === 0 ? (
        <Empty description="No health check data found" />
      ) : (
        <>
          {currentItems.map((item, index) => {
            const actualIndex = (currentPage - 1) * pageSize + index;
            const isExpanded = expandedItems.includes(actualIndex);

            return (
              <Card
                key={item.resultId}
                style={{
                  marginBottom: 16,
                  borderRadius: 8,
                  overflow: "hidden",
                }}
                styles={{
                  body: {
                    padding: 0,
                  },
                }}
              >
                {/* Card Header (Clickable) */}
                <div
                  onClick={() => toggleItem(actualIndex)}
                  style={{
                    padding: "16px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#ffffff",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f8f8f8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ffffff")
                  }
                >
                  <div style={{display: "flex", alignItems: "center"}}>
                    <div
                      style={{
                        backgroundColor: "#4CAF50",
                        color: "white",
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 12,
                        fontWeight: "bold",
                      }}
                    >
                      {actualIndex + 1}
                    </div>
                    <span style={{fontWeight: 500, fontSize: "20px"}}>
                      Health Check on{" "}
                      {dayjs(item.datePerformed).format("DD/MM/YYYY")}
                    </span>
                    <Tag
                      color={
                        getStatusLabel(item.status) === "Pending"
                          ? "orange"
                          : getStatusLabel(item.status) === "Completed"
                          ? "green"
                          : getStatusLabel(item.status) === "Failed"
                          ? "red"
                          : "default"
                      }
                      style={{marginLeft: 8, fontWeight: 600, fontSize: "12px"}} // Changed from 14px
                    >
                      {getStatusLabel(item.status)}
                    </Tag>
                  </div>
                  <div
                    style={{
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.3s",
                    }}
                  >
                    <ChevronDown size={18} />
                  </div>
                </div>

                {/* Nội dung chi tiết (Hiển thị có điều kiện) */}
                {isExpanded && (
                  <div
                    className="content-details"
                    style={{
                      padding: "16px",
                      animation: "fadeIn 0.3s ease",
                    }}
                  >
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={8}>
                        <Space direction="vertical" size="small">
                          <div style={{display: "flex", alignItems: "center"}}>
                            <Calendar size={16} style={{marginRight: 8}} />
                            <Text strong>Date Performed: </Text>
                            {dayjs(item.datePerformed).format("DD/MM/YYYY")}
                          </div>
                        </Space>
                      </Col>
                      <Col xs={24} md={8}>
                        <Space direction="vertical" size="small">
                          <div style={{display: "flex", alignItems: "center"}}>
                            <User size={16} style={{marginRight: 8}} />
                            <Text strong>Recorded By: </Text>
                            {item.recordedBy?.nurseName}
                            {" - "}
                            {/* Replace PhoneOutlined with Phone */}
                            {item.recordedBy?.nursePhone}
                          </div>
                        </Space>
                      </Col>
                      <Col xs={24} md={8}>
                        <Space direction="vertical" size="small">
                          <div style={{display: "flex", alignItems: "center"}}>
                            <FileText size={16} style={{marginRight: 8}} />
                            <Text strong>Notes: </Text>
                            {item.notes || "No notes"}
                          </div>
                        </Space>
                      </Col>
                      <Col xs={24} md={8}>
                        <Space direction="vertical" size="small">
                          <div style={{display: "flex", alignItems: "center"}}>
                            <Ruler size={16} style={{marginRight: 8}} />
                            <Text strong>Height: </Text>
                            {item.height}
                          </div>
                        </Space>
                      </Col>
                      <Col xs={24} md={8}>
                        <Space direction="vertical" size="small">
                          <div style={{display: "flex", alignItems: "center"}}>
                            <Weight size={16} style={{marginRight: 8}} />
                            <Text strong>Weight: </Text>
                            {item.weight}
                          </div>
                        </Space>
                      </Col>
                      <Col xs={24} md={8}>
                        <Space direction="vertical" size="small">
                          <div style={{display: "flex", alignItems: "center"}}>
                            <Eye size={16} style={{marginRight: 8}} />
                            <Text strong>Vision: </Text>
                            Left: {item.visionLeft} - Right: {item.visionRight}
                          </div>
                        </Space>
                      </Col>
                      <Col xs={24} md={8}>
                        <Space direction="vertical" size="small">
                          <div style={{display: "flex", alignItems: "center"}}>
                            <Ear size={16} style={{marginRight: 8}} />
                            <Text strong>Hearing: </Text>
                            {item.hearing}
                          </div>
                        </Space>
                      </Col>
                      <Col xs={24} md={8}>
                        <Space direction="vertical" size="small">
                          <div style={{display: "flex", alignItems: "center"}}>
                            <Stethoscope size={16} style={{marginRight: 8}} />
                            <Text strong>Nose: </Text>
                            {item.nose}
                          </div>
                        </Space>
                      </Col>
                      <Col xs={24} md={8}>
                        <Space direction="vertical" size="small">
                          <div style={{display: "flex", alignItems: "center"}}>
                            <HeartPulse size={16} style={{marginRight: 8}} />
                            <Text strong>Blood Pressure: </Text>
                            {item.bloodPressure}
                          </div>
                        </Space>
                      </Col>
                    </Row>
                  </div>
                )}
              </Card>
            );
          })}

          {/* Pagination */}
          {healthResults.length > pageSize && (
            <div style={{textAlign: "center", marginTop: 24}}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={healthResults.length}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          )}

          <style jsx="true">{`
            .content-details {
              animation: fadeIn 0.3s ease;
            }
            .content-details * {
              font-size: 16px !important; // Changed from 18px
            }
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
};

export default HealthCheckResult;
