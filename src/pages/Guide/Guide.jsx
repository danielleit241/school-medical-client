import React, {useState} from "react";
import {
  Card,
  Typography,
  Button,
  Tag,
  Steps,
  Row,
  Col,
  Divider,
  Alert,
  Space,
  List,
} from "antd";
import {
  LoginOutlined,
  UserOutlined,
  HeartOutlined,
  SettingOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  LockOutlined,
  UsergroupAddOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import "./Guide.scss";
import LoginScreen from "../../assets/images/screenshot-login.png";
import ServicesScreen from "../../assets/images/screenshot-services.png";
import HealthProfileScreen from "../../assets/images/screenshot-health-profile.png";
import SidebarScreen from "../../assets/images/screenshot-sidebar.png";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
const {Title, Paragraph, Text} = Typography;
const {Step} = Steps;

// Định nghĩa bảng màu xanh dịu hơn
const colors = {
  primary: "#4A90E2", // Xanh dương dịu
  primaryLight: "#B3D4FC", // Xanh dương nhạt
  primaryLighter: "#EAF4FF", // Xanh dương rất nhạt
  default: "#F8F8F8", // Xanh dương đậm
  secondary: "#5ABEA7", // Xanh lục dịu
  secondaryLight: "#C2EFE5", // Xanh lục nhạt
  accent: "#6A8FDB", // Xanh tím dịu
  accentLight: "#D1DCF5", // Xanh tím nhạt
  success: "#5CB88E", // Xanh lá mát
  warning: "#E2AA4A", // Cam vàng dịu
};

export default function Guide() {
  const navigate = useNavigate();
  const roleName = useSelector((state) => state.user?.role);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 1,
      title: "Login to the System",
      description: "First step to using our medical services",
      icon: (
        <LoginOutlined
          style={{display: "flex", alignItems: "center", margin: 0, padding: 4}}
        />
      ),
      content: (
        <div className="space-y-4">
          <Alert
            message="Login Information"
            description={
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <PhoneOutlined
                    style={{
                      display: "flex",
                      alignItems: "center",
                      margin: 0,
                      padding: 4,
                    }}
                  />
                  <span>Phone Number: Enter your registered phone number</span>
                </div>
                <div className="flex items-center gap-2">
                  <LockOutlined
                    style={{
                      display: "flex",
                      alignItems: "center",
                      margin: 0,
                      padding: 4,
                    }}
                  />
                  <span>Password: Enter your password</span>
                </div>
              </div>
            }
            type="info"
            showIcon
          />

          <div style={{textAlign: "center", margin: "20px 0"}}>
            <img
              src={LoginScreen}
              alt="Login Screen"
              style={{
                maxWidth: "100%",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                border: `1px solid ${colors.primaryLight}`,
              }}
            />
          </div>

          <Alert
            message="Note: If you don't have an account, please contact the school for support in creating an account."
            type="warning"
            showIcon
          />
        </div>
      ),
    },
    {
      id: 2,
      title: "Choose Appropriate Services",
      description: "After successful login, you can use the services",
      icon: (
        <MedicineBoxOutlined
          style={{display: "flex", alignItems: "center", margin: 0, padding: 4}}
        />
      ),
      content: (
        <div className="space-y-4">
          <Card title="Available Services" style={{marginBottom: 16}}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{display: "flex", alignItems: "center", gap: 8}}>
                  <CheckCircleOutlined
                    style={{
                      color: colors.success,
                      display: "flex",
                      alignItems: "center",
                      margin: 0,
                      padding: 4,
                    }}
                  />
                  <span>Health Check</span>
                </div>
              </Col>
              <Col span={12}>
                <div style={{display: "flex", alignItems: "center", gap: 8}}>
                  <CheckCircleOutlined
                    style={{
                      color: colors.success,
                      display: "flex",
                      alignItems: "center",
                      margin: 0,
                      padding: 4,
                    }}
                  />
                  <span>Vaccinations</span>
                </div>
              </Col>
              <Col span={12}>
                <div style={{display: "flex", alignItems: "center", gap: 8}}>
                  <CheckCircleOutlined
                    style={{
                      color: colors.success,
                      display: "flex",
                      alignItems: "center",
                      margin: 0,
                      padding: 4,
                    }}
                  />
                  <span>Medical Registration</span>
                </div>
              </Col>
              <Col span={12}>
                <div style={{display: "flex", alignItems: "center", gap: 8}}>
                  <CheckCircleOutlined
                    style={{
                      color: colors.success,
                      display: "flex",
                      alignItems: "center",
                      margin: 0,
                      padding: 4,
                    }}
                  />
                  <span>Appointment Registration</span>
                </div>
              </Col>
            </Row>
          </Card>

          <div style={{textAlign: "center", margin: "20px 0"}}>
            <img
              src={ServicesScreen}
              alt="Services Screen"
              style={{
                maxWidth: "100%",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                border: `1px solid ${colors.primaryLight}`,
              }}
            />
          </div>

          <Alert
            message="Guide: Click on the relevant menu item in the sidebar to access all available medical services."
            type="info"
            showIcon
          />
        </div>
      ),
    },
    {
      id: 3,
      title: "Health Declaration for Your Child",
      description: "Create a health profile for your child if not already done",
      icon: (
        <HeartOutlined
          style={{display: "flex", alignItems: "center", margin: 0, padding: 4}}
        />
      ),
      content: (
        <div className="space-y-4">
          <Alert
            message="Important"
            description={
              <div>
                <p style={{marginBottom: 8}}>
                  If you haven't created a health declaration for your child
                  yet, you need to create a profile before using medical
                  services.
                </p>
                <div className="space-y-2">
                  <div style={{display: "flex", alignItems: "center", gap: 8}}>
                    <ArrowRightOutlined
                      style={{
                        display: "flex",
                        alignItems: "center",
                        margin: 0,
                        padding: 4,
                      }}
                    />
                    <span>Click on "Health Declaration" in the left menu</span>
                  </div>
                  <div style={{display: "flex", alignItems: "center", gap: 8}}>
                    <ArrowRightOutlined
                      style={{
                        display: "flex",
                        alignItems: "center",
                        margin: 0,
                        padding: 4,
                      }}
                    />
                    <span>Select your child's information to update</span>
                  </div>
                </div>
              </div>
            }
            type="error"
            showIcon
          />

          <Row gutter={16}>
            <Col span={12}>
              <div style={{textAlign: "center"}}>
                <img
                  src={SidebarScreen}
                  alt="Navigation Menu"
                  style={{
                    maxWidth: "100%",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    border: `1px solid ${colors.primaryLight}`,
                  }}
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{textAlign: "center"}}>
                <img
                  src={HealthProfileScreen}
                  alt="Health Profile"
                  style={{
                    maxWidth: "100%",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    border: `1px solid ${colors.primaryLight}`,
                  }}
                />
              </div>
            </Col>
          </Row>

          <Alert
            message="Benefits: Health profiles help doctors provide the best care for your child."
            type="success"
            showIcon
          />
        </div>
      ),
    },
  ];

  const navigationItems = [
    {
      name: "Timetable",
      icon: (
        <HeartOutlined
          style={{display: "flex", alignItems: "center", margin: 0, padding: 4}}
        />
      ),
      description: "View your child's timetable",
      path: "timetable", // Đường dẫn đến trang đích
    },
    {
      name: "Appointment Registration",
      icon: (
        <HeartOutlined
          style={{display: "flex", alignItems: "center", margin: 0, padding: 4}}
        />
      ),
      description: "Register for medical appointments",
      path: "appointments-list", // Đường dẫn đến trang đích
    },
    {
      name: "Health Profile of Your Child",
      icon: (
        <MedicineBoxOutlined
          style={{display: "flex", alignItems: "center", margin: 0, padding: 4}}
        />
      ),
      description: "View and manage your child's health profile",
      path: "health-declaration/my-children", // Đường dẫn đến trang đích
    },
    {
      name: "Medical Registration",
      icon: (
        <FileTextOutlined
          style={{display: "flex", alignItems: "center", margin: 0, padding: 4}}
        />
      ),
      description: "Register for medical services",
      path: "medical-registration/create", // Đường dẫn đến trang đích
    },
    {
      name: "Medical Event",
      icon: (
        <CalendarOutlined
          style={{display: "flex", alignItems: "center", margin: 0, padding: 4}}
        />
      ),
      description: "View your children's medical event participation",
      path: "medical-event/children-list", // Đường dẫn đến trang đích
    },
  ];
  return (
    <div
      style={{
        padding: "24px",
        background: "#fff",
        minHeight: "100vh",
      }}
    >
      <div style={{maxWidth: "1440px", margin: "0 auto"}}>
        {/* Header */}
        <div style={{textAlign: "center", marginBottom: 32}}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <Title
              level={1}
              style={{margin: 0, color: "#355282", fontWeight: 700}}
            >
              School Medical System: How to Use
            </Title>
          </div>
          <Paragraph
            style={{
              color: "#aaa",
              fontSize: 20,
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            3 simple steps to start using medical services
          </Paragraph>
        </div>
        {/* Quick Overview
        <Card
          style={{
            marginBottom: 24,
            borderColor: colors.primaryLight,
            background: `${colors.primaryLighter}`,
          }}
        >
          <Row gutter={16}>
            {steps.map((step, index) => (
              <Col key={step.id} xs={24} md={8}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      padding: 8,
                      borderRadius: "50%",
                      background:
                        currentStep >= index ? colors.primary : colors.default,
                      color: currentStep >= index ? "#fff" : colors.primary,
                    }}
                  >
                    {step.icon}
                  </div>
                  <div>
                    <Tag
                      color={currentStep >= index ? colors.primary : "default"}
                    >
                      Step {step.id}
                    </Tag>
                  </div>
                </div>
                <div style={{marginLeft: 40}}>
                  <Text strong style={{color: colors.primary}}>
                    {step.title}
                  </Text>
                  <br />
                  <Text type="secondary">{step.description}</Text>
                </div>
              </Col>
            ))}
          </Row>
        </Card> */}
        {/* Content Row - Step Content & Navigation Guide side by side */}
        <Row gutter={16} style={{marginBottom: 24}}>
          {/* Current Step Content - Left Side */}
          <Col xs={24} lg={18}>
            <Card
              style={{
                height: "100%",
                borderColor: colors.primaryLight,
                boxShadow: "0 2px 10px rgba(74, 144, 226, 0.1)",
              }}
            >
              {/* Previous/Next Navigation */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 30,
                }}
              >
                <Button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  icon={<ArrowLeftOutlined />}
                  style={
                    currentStep !== 0
                      ? {borderColor: colors.primary, color: colors.primary}
                      : {}
                  }
                >
                  Previous Step
                </Button>

                {/* Step Navigation Buttons */}
                <div style={{textAlign: "center", marginBottom: 20}}>
                  <Space size={16}>
                    {steps.map((step, index) => (
                      <Button
                        key={step.id}
                        type={currentStep === index ? "primary" : "default"}
                        onClick={() => setCurrentStep(index)}
                        icon={step.icon}
                        style={
                          currentStep === index
                            ? {
                                backgroundColor: colors.primary,
                                borderColor: colors.primary,
                              }
                            : {
                                borderColor: colors.primary,
                                color: colors.primary,
                              }
                        }
                      >
                        Step {step.id}
                      </Button>
                    ))}
                  </Space>
                </div>

                <Button
                  type="primary"
                  onClick={() =>
                    setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
                  }
                  disabled={currentStep === steps.length - 1}
                  style={
                    currentStep !== steps.length - 1
                      ? {
                          backgroundColor: colors.primary,
                          borderColor: colors.primary,
                        }
                      : {}
                  }
                >
                  Next Step
                  <ArrowRightOutlined />
                </Button>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    color: colors.primary,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {steps[currentStep].icon}
                  <Title level={4} style={{margin: 0, color: colors.primary}}>
                    {steps[currentStep].title}
                  </Title>
                </div>
              </div>

              <Divider
                style={{borderColor: colors.primaryLight, margin: "10px 0"}}
              />
              {steps[currentStep].content}
            </Card>
          </Col>

          {/* Navigation Guide - Right Side */}
          <Col xs={24} lg={6}>
            <Card
              style={{
                height: "100%",
                borderColor: colors.primaryLight,
                boxShadow: "0 2px 10px rgba(74, 144, 226, 0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <UserOutlined style={{color: colors.primary}} />
                <Title level={4} style={{margin: 0, color: colors.primary}}>
                  Navigation Menu Guide
                </Title>
              </div>
              <Paragraph type="secondary">
                Main functions in the system
              </Paragraph>
              <List
                grid={{gutter: 16, column: 1}}
                dataSource={navigationItems}
                renderItem={(item) => (
                  <List.Item>
                    <div
                      onClick={() =>
                        (window.location.href = `/${roleName}/${item.path}`)
                      }
                      style={{cursor: "pointer"}}
                    >
                      <Card
                        size="small"
                        hoverable
                        style={{display: "flex", alignItems: "center"}}
                        bodyStyle={{padding: 12, flex: 1}}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              padding: 8,
                              background: colors.primaryLighter,
                              borderRadius: 8,
                              color: colors.primary,
                            }}
                          >
                            {item.icon}
                          </div>
                          <div>
                            <Text strong style={{color: colors.primary}}>
                              {item.name}
                            </Text>
                            <br />
                            <Text type="secondary">{item.description}</Text>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
        {/* Footer */}
        <Card
          style={{
            marginTop: 48,
            textAlign: "center",
            background: colors.primaryLighter,
            borderColor: colors.primaryLight,
          }}
        >
          <Title level={4} style={{color: colors.primary}}>
            Need Additional Support?
          </Title>
          <Paragraph>
            If you encounter difficulties using the system, please contact the
            school for assistance.
          </Paragraph>
          <Space size={32} style={{justifyContent: "center"}}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: colors.primary,
              }}
            >
              <PhoneOutlined />
              <span>Hotline: (237) 681-812-255</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: colors.primary,
              }}
            >
              <UserOutlined />
              <span>Hours: 8:00 - 17:00 (Mon-Fri)</span>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
}
