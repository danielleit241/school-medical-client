import React, {useState, useEffect} from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Empty,
  Space,
  Divider,
  Tag,
  Button,
  Pagination,
} from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  BarcodeOutlined,
  ArrowLeftOutlined,
  DownOutlined,
  CheckOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axiosInstance from "../../../../api/axios";
import {LuSyringe} from "react-icons/lu";
import {MdFactory} from "react-icons/md";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";

const {Title, Text} = Typography;

const VaccineResult = () => {
  const navigate = useNavigate();
  const roleName = useSelector((state) => state.user?.role);
  const [loading, setLoading] = useState(true);
  const [vaccinationResults, setVaccinationResults] = useState([]);
  const [expandedItems, setExpandedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3; // Số items mỗi trang

  const student = localStorage.getItem("selectedStudent");
  const studentId = student ? JSON.parse(student).studentId : null;

  // Fetch vaccination results for the student
  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get(`/api/vaccination-results/students/${studentId}`)
      .then((res) => {
        setVaccinationResults(res.data?.items || []);
      })
      .catch((err) => {
        console.error("Error fetching vaccination results:", err);
        setVaccinationResults([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [studentId]);

  const handleBack = () => {
    setTimeout(() => {
      localStorage.removeItem("selectedStudent");
    }, 60000 * 30);
    navigate(`/${roleName}/health-declaration/my-children`);
  };

  // Xử lý đóng/mở dropdown
  const toggleItem = (index) => {
    setExpandedItems((prev) => {
      if (prev.includes(index)) {
        return prev.filter((item) => item !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  // Tính toán các item hiển thị trên trang hiện tại
  const currentItems = vaccinationResults.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Xử lý pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Đặt lại các item được mở rộng khi chuyển trang
    setExpandedItems([]);
    // Cuộn lên đầu trang
    window.scrollTo({top: 0, behavior: "smooth"});
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
      {/* Header with new design */}
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

        {/* Back button */}
        <Button
          icon={
            <ArrowLeftOutlined
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "18px",
                margin: 0,
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
              <LuSyringe
                size={24}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "18px",
                  margin: 0,
                }}
              />
            </div>
            <Title
              level={1}
              style={{
                margin: 0,
                color: "white",
                fontWeight: "bold",
                fontSize: "28px", // Changed from 32px to match HealthCheckResult
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              Child's Immunization Record
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
            <span style={{fontSize: "18px"}}>✨</span>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "14px", // Changed from 16px to match HealthCheckResult
                textAlign: "center",
              }}
            >
              Track vaccination history and detailed information of vaccines
            </Text>
            <span style={{fontSize: "18px"}}>🛡️</span>
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
                  <CheckOutlined
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "18px",
                      margin: 0,
                      fontWeight: "bold",
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
                    {vaccinationResults.length} Vaccines
                  </div>
                  <div
                    style={{
                      fontSize: "12px", // Changed from 14px to match HealthCheckResult
                      color: "rgba(255, 255, 255, 0.8)",
                    }}
                  >
                    Completed vaccinations
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
                  <SafetyOutlined
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "18px",
                      margin: 0,
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
                    Safe
                  </div>
                  <div
                    style={{
                      fontSize: "12px", // Changed from 14px to match HealthCheckResult
                      color: "rgba(255, 255, 255, 0.8)",
                    }}
                  >
                    Well protected
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Vaccine List - with translations */}
      {!Array.isArray(vaccinationResults) || vaccinationResults.length === 0 ? (
        <Empty description="No vaccination data found" />
      ) : (
        <>
          {currentItems.map((item, index) => {
            // Kiểm tra dữ liệu hợp lệ
            if (!item?.vaccineDoseSummary) {
              return null;
            }

            const actualIndex = (currentPage - 1) * pageSize + index;
            const isExpanded = expandedItems.includes(actualIndex);
            const colorClass = actualIndex % 2 === 0 ? "#4CAF50" : "#2196F3";
            const vaccineDetails =
              item.vaccineDoseSummary.vaccineResultDetails || [];

            return (
              <Card
                key={actualIndex}
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
                        backgroundColor: colorClass,
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
                      {item.vaccineDoseSummary.vaccineName}
                    </span>
                    <Tag
                      color={actualIndex % 2 === 0 ? "green" : "blue"}
                      style={{marginLeft: 8, fontSize: "12px"}} // Changed from 14px to match HealthCheckResult
                    >
                      {item.vaccineDoseSummary.totalDoseByVaccineName} doses
                    </Tag>
                  </div>
                  <div
                    style={{
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.3s",
                    }}
                  >
                    <DownOutlined />
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
                    {Array.isArray(vaccineDetails) &&
                    vaccineDetails.length > 0 ? (
                      vaccineDetails.map((detail, detailIndex) => (
                        <div
                          key={detailIndex}
                          style={{
                            marginBottom:
                              detailIndex < vaccineDetails.length - 1 ? 16 : 0,
                          }}
                        >
                          {detailIndex > 0 && <Divider />}
                          <Row gutter={[16, 16]}>
                            <Col xs={24} md={8}>
                              <Space direction="vertical" size="small">
                                <div>
                                  <CalendarOutlined style={{marginRight: 8}} />
                                  <Text strong>Vaccination date:</Text>
                                </div>
                                <Text style={{marginLeft: 24}}>
                                  {dayjs(detail.vaccinatedDate).format(
                                    "DD/MM/YYYY"
                                  )}
                                </Text>
                              </Space>
                            </Col>
                            <Col xs={24} md={8}>
                              <Space direction="vertical" size="small">
                                <div>
                                  <EnvironmentOutlined
                                    style={{marginRight: 8}}
                                  />
                                  <Text strong>Injection site:</Text>
                                </div>
                                <Text style={{marginLeft: 24}}>
                                  {detail.injectionSite}
                                </Text>
                              </Space>
                            </Col>
                            <Col xs={24} md={8}>
                              <Space direction="vertical" size="small">
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <MdFactory
                                    size={16}
                                    style={{marginRight: 8}}
                                  />
                                  <Text strong>Manufacturer:</Text>
                                </div>
                                <Text style={{marginLeft: 24}}>
                                  {detail.manufacturer}
                                </Text>
                              </Space>
                            </Col>
                            <Col xs={24} md={8}>
                              <Space direction="vertical" size="small">
                                <div>
                                  <BarcodeOutlined style={{marginRight: 8}} />
                                  <Text strong>Batch number:</Text>
                                </div>
                                <Text style={{marginLeft: 24}}>
                                  {detail.batchNumber}
                                </Text>
                              </Space>
                            </Col>
                            <Col xs={24} md={8}>
                              <Space direction="vertical" size="small">
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <LuSyringe
                                    size={16}
                                    style={{marginRight: 8}}
                                  />
                                  <Text strong>Dose number:</Text>
                                </div>
                                <Text style={{marginLeft: 24}}>
                                  {detail.doseNumber}
                                </Text>
                              </Space>
                            </Col>
                          </Row>
                        </div>
                      ))
                    ) : (
                      <Empty description="No details available" />
                    )}
                  </div>
                )}
              </Card>
            );
          })}

          {/* Pagination */}
          {vaccinationResults.length > pageSize && (
            <div style={{textAlign: "center", marginTop: 24}}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={vaccinationResults.length}
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
              font-size: 16px !important; // Changed from 20px to match HealthCheckResult
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

export default VaccineResult;
