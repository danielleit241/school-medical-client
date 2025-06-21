import React, {useEffect, useState} from "react";
import usePollingEffect from "../../hooks/PollingService";
import {
  Card,
  Typography,
  Tag,
  Tabs,
  Row,
  Col,
  Badge,
  Space,
  Divider,
  Spin,
  Progress,
  notification,
  Alert,
  Statistic,
  Select,
  Switch,
} from "antd";
import {
  UserOutlined,
  KeyOutlined,
  LockOutlined,
  WarningOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  AlertOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../api/axios";
import {useSelector} from "react-redux";

const {Title, Text} = Typography;
const {TabPane} = Tabs;

const ManagerDashboard = () => {
  // eslint-disable-next-line no-unused-vars
  const [activeTab, setActiveTab] = useState("health-checkups");
  const roleName = useSelector((state) => state.user?.role);
  const [totalStudents, setTotalStudents] = useState(null);
  const [healthDeclarations, setHealthDeclarations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [declarationsLoading, setDeclarationsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [declarationsError, setDeclarationsError] = useState(null);
  const [medicineRequests, setMedicineRequests] = useState(null);
  const [medicineLoading, setMedicineLoading] = useState(true);
  const [medicineError, setMedicineError] = useState(null);
  const [healthChecks, setHealthChecks] = useState(null);
  const [healthChecksLoading, setHealthChecksLoading] = useState(true);
  const [healthChecksError, setHealthChecksError] = useState(null);
  const [vaccinations, setVaccinations] = useState(null);
  const [vaccinationsLoading, setVaccinationsLoading] = useState(true);
  const [vaccinationsError, setVaccinationsError] = useState(null);
  const [lowStockMedicals, setLowStockMedicals] = useState([]);
  const [lowStockLoading, setLowStockLoading] = useState(true);
  const [lowStockError, setLowStockError] = useState(null);
  const [expiringMedicals, setExpiringMedicals] = useState([]);
  const [expiringLoading, setExpiringLoading] = useState(true);
  const [expiringError, setExpiringError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [prevLowStockCount, setPrevLowStockCount] = useState(0);

  // States mới cho phần Admin Dashboard
  const [usersData, setUsersData] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  // Styling constants
  const cardHeadStyle = {
    padding: "12px 16px",
    borderBottom: "1px solid #f0f0f0",
  };
  const cardBodyStyle = {
    padding: "16px",
  };
  const metricTitleStyle = {
    fontSize: "14px",
    fontWeight: 500,
    marginBottom: 0,
    color: "rgba(0, 0, 0, 0.65)",
  };
  const metricValueStyle = {
    fontSize: "24px",
    fontWeight: 700,
    margin: "4px 0",
  };
  const metricSubtitleStyle = {
    fontSize: "12px",
    color: "rgba(0, 0, 0, 0.45)",
  };
  const statusDotStyle = {
    width: 10,
    height: 10,
    borderRadius: "50%",
    display: "inline-block",
    marginRight: 8,
  };

  // Cấu hình thời gian cập nhật
  // eslint-disable-next-line no-unused-vars
  const [pollingConfig, setPollingConfig] = useState({
    enabled: true,
    interval: 86400000 / 2, // 1 ngày
  });

  // Hàm fetch dữ liệu quan trọng
  const fetchCriticalData = async () => {
    await Promise.all([
      fetchLowStockMedicals(),
      fetchExpiringMedicals(),
      fetchMedicineRequests(),
    ]);
    setLastUpdated(new Date());
  };

  // Chuyển các hàm fetch thành độc lập để có thể tái sử dụng
  const fetchTotalStudents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        "/api/managers/dashboards/students"
      );

      if (response.data && response.data.length > 0) {
        const studentData = response.data[0]?.item || undefined;
        setTotalStudents(studentData);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching total students:", err);
      setError("Failed to load student data");
      setLoading(false);
    }
  };

  const fetchHealthDeclarations = async () => {
    try {
      setDeclarationsLoading(true);
      const response = await axiosInstance.get(
        "/api/managers/dashboards/health-declarations"
      );

      if (response.data && response.data.length > 0) {
        const declarationsData = {
          total: response.data[0]?.item || {count: 0, name: "No data"},
          submitted: response.data[1]?.item || {count: 0, name: "No data"},
          notSubmitted: response.data[2]?.item || {count: 0, name: "No data"},
        };
        setHealthDeclarations(declarationsData);
      }
      setDeclarationsLoading(false);
    } catch (err) {
      console.error("Error fetching health declarations:", err);
      setDeclarationsError("Failed to load declarations data");
      setDeclarationsLoading(false);
    }
  };

  const fetchMedicineRequests = async () => {
    try {
      setMedicineLoading(true);
      const response = await axiosInstance.get(
        "/api/managers/dashboards/medical-requests"
      );

      if (response.data && response.data.length > 0) {
        const requestData = response.data[0]?.item || undefined;
        setMedicineRequests(requestData);
      }
      setMedicineLoading(false);
    } catch (err) {
      console.error("Error fetching medicine requests:", err);
      setMedicineError("Failed to load medicine request data");
      setMedicineLoading(false);
    }
  };

  const fetchHealthChecks = async () => {
    try {
      setHealthChecksLoading(true);
      const response = await axiosInstance.get(
        "/api/managers/dashboards/health-checks"
      );

      if (response.data && response.data.length > 0) {
        const healthChecksData = {
          completed: response.data[0]?.item || {count: 0, name: "No data"},
          pending: response.data[1]?.item || {count: 0, name: "No data"},
          failed: response.data[2]?.item || {count: 0, name: "No data"},
          declined: response.data[3]?.item || {count: 0, name: "No data"},
        };
        setHealthChecks(healthChecksData);
      }
      setHealthChecksLoading(false);
    } catch (err) {
      console.error("Error fetching health checks:", err);
      setHealthChecksError("Failed to load health check data");
      setHealthChecksLoading(false);
    }
  };

  const fetchVaccinations = async () => {
    try {
      setVaccinationsLoading(true);
      const response = await axiosInstance.get(
        "/api/managers/dashboards/vaccinations"
      );

      if (response.data && response.data.length > 0) {
        const vaccinationData = {
          completed: response.data[0]?.item || {count: 0, name: "No data"},
          pending: response.data[1]?.item || {count: 0, name: "No data"},
          failed: response.data[2]?.item || {count: 0, name: "No data"},
          declined: response.data[3]?.item || {count: 0, name: "No data"},
          notQualified: response.data[4]?.item || {count: 0, name: "No data"},
        };
        setVaccinations(vaccinationData);
      }
      setVaccinationsLoading(false);
    } catch (err) {
      console.error("Error fetching vaccinations:", err);
      setVaccinationsError("Failed to load vaccination data");
      setVaccinationsLoading(false);
    }
  };

  const fetchLowStockMedicals = async () => {
    try {
      setLowStockLoading(true);
      const response = await axiosInstance.get(
        "/api/managers/dashboards/low-stock-medicals"
      );

      if (response.data && response.data.length > 0) {
        setLowStockMedicals(response.data);
      }
      setLowStockLoading(false);
    } catch (err) {
      console.error("Error fetching low stock medicals:", err);
      setLowStockError("Failed to load low stock data");
      setLowStockLoading(false);
    }
  };

  const fetchExpiringMedicals = async () => {
    try {
      setExpiringLoading(true);
      const response = await axiosInstance.get(
        "/api/managers/dashboards/expiring-medicals"
      );

      if (response.data && Array.isArray(response.data)) {
        setExpiringMedicals(response.data);
      }
      setExpiringLoading(false);
    } catch (err) {
      console.error("Error fetching expiring medicals:", err);
      // Xử lý đặc biệt cho lỗi 404 - đây là trường hợp hợp lệ, không phải lỗi thật sự
      if (err.response && err.response.status === 404) {
        setExpiringMedicals([]);
        setExpiringError(null);
      } else {
        setExpiringError("Failed to load expiring items data");
      }
      setExpiringLoading(false);
    }
  };

  // Fetch tất cả dữ liệu ban đầu
  useEffect(() => {
    fetchTotalStudents();
    fetchHealthDeclarations();
    fetchMedicineRequests();
    fetchHealthChecks();
    fetchVaccinations();
    fetchLowStockMedicals();
    fetchExpiringMedicals();
  }, []);

  // Polling effect cho dữ liệu quan trọng
  usePollingEffect(
    () => {
      console.log("Polling critical data...", new Date().toLocaleTimeString());
      fetchCriticalData();
    },
    pollingConfig.enabled ? pollingConfig.interval : null,
    []
  );

  //   // Cho phép người dùng tắt/bật polling và thay đổi chu kỳ
  //   const togglePolling = () => {
  //     setPollingConfig((prev) => ({...prev, enabled: !prev.enabled}));
  //   };

  // Calculate completion rate
  const getCompletionRate = () => {
    if (!healthDeclarations) return 0;

    const total = healthDeclarations.total.count || 0;
    const submitted = healthDeclarations.submitted.count || 0;

    if (total === 0) return 0;
    return Math.round((submitted / total) * 100);
  };

  // Get health check stats
  const getHealthCheckStats = () => {
    if (!healthChecks) return {total: 0, percentages: {}};

    const total =
      (healthChecks.completed.count || 0) +
      (healthChecks.pending.count || 0) +
      (healthChecks.failed.count || 0) +
      (healthChecks.declined.count || 0);

    const percentages = {
      completed:
        total > 0
          ? Math.round((healthChecks.completed.count / total) * 100)
          : 0,
      pending:
        total > 0 ? Math.round((healthChecks.pending.count / total) * 100) : 0,
      failed:
        total > 0 ? Math.round((healthChecks.failed.count / total) * 100) : 0,
      declined:
        total > 0 ? Math.round((healthChecks.declined.count / total) * 100) : 0,
    };

    return {total, percentages};
  };

  // Get vaccination stats
  const getVaccinationStats = () => {
    if (!vaccinations) return {total: 0, percentages: {}};

    const total =
      (vaccinations.completed.count || 0) +
      (vaccinations.pending.count || 0) +
      (vaccinations.failed.count || 0) +
      (vaccinations.declined.count || 0) +
      (vaccinations.notQualified.count || 0);

    const percentages = {
      completed:
        total > 0
          ? Math.round((vaccinations.completed.count / total) * 100)
          : 0,
      pending:
        total > 0 ? Math.round((vaccinations.pending.count / total) * 100) : 0,
      failed:
        total > 0 ? Math.round((vaccinations.failed.count / total) * 100) : 0,
      declined:
        total > 0 ? Math.round((vaccinations.declined.count / total) * 100) : 0,
      notQualified:
        total > 0
          ? Math.round((vaccinations.notQualified.count / total) * 100)
          : 0,
    };

    return {total, percentages};
  };

  // Hàm để tính tổng số thiết bị/thuốc thiếu
  const getLowStockCount = () => {
    if (!lowStockMedicals || lowStockMedicals.length === 0) return 0;
    return lowStockMedicals.length;
  };

  // Hàm để lấy mức cảnh báo dựa vào số lượng tồn kho
  const getStockAlertLevel = (quantity) => {
    if (quantity <= 5) return "critical";
    if (quantity <= 10) return "warning";
    return "attention";
  };

  // Hàm để xác định màu sắc dựa vào số ngày còn lại
  const getExpiryColorScheme = (daysLeft) => {
    if (daysLeft <= 7) {
      return {bgColor: "#fff1f0", tagColor: "red"};
    } else if (daysLeft <= 14) {
      return {bgColor: "#fff7e6", tagColor: "orange"};
    } else {
      return {bgColor: "#fffbe6", tagColor: "gold"};
    }
  };

  useEffect(() => {
    const currentCount = lowStockMedicals?.length || 0;
    if (prevLowStockCount > 0 && currentCount > prevLowStockCount) {
      notification.warning({
        message: "Low Stock Alert",
        description: `You now have ${currentCount} items with low stock (increased from ${prevLowStockCount})`,
      });
    }
    setPrevLowStockCount(currentCount);
  }, [lowStockMedicals, prevLowStockCount]);

  // Hàm để viết hoa chữ cái đầu tiên
  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  // Hàm tính toán phần trăm cho phần Admin Dashboard
  const getDefaultPasswordPercentage = () => {
    if (!usersData || !usersData.total.count) return 0;
    return Math.round(
      (usersData.defaultPassword.count / usersData.total.count) * 100
    );
  };

  const getPasswordChangedPercentage = () => {
    if (!usersData || !usersData.total.count) return 0;
    return Math.round(
      (usersData.passwordChanged.count / usersData.total.count) * 100
    );
  };

  // Hàm fetch dữ liệu Admin khi role là "admin"
  useEffect(() => {
    const fetchAdminData = async () => {
      if (roleName !== "admin") return;

      try {
        setUsersLoading(true);
        const response = await axiosInstance.get(
          "/api/admins/dashboards/users"
        );

        if (response.data && response.data.length > 0) {
          const formattedData = {
            total: response.data[0]?.item || {count: 0, name: "No data"},
            passwordChanged: response.data[1]?.item || {
              count: 0,
              name: "No data",
            },
            defaultPassword: response.data[2]?.item || {
              count: 0,
              name: "No data",
            },
          };
          setUsersData(formattedData);
        }
        setUsersLoading(false);
      } catch (err) {
        console.error("Error fetching admin users data:", err);
        setUsersError("Failed to load users data");
        setUsersLoading(false);
      }
    };

    fetchAdminData();
  }, [roleName]);

  return (
    <div style={{padding: "24px"}}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            position: "absolute",
            top: -35,
            left: 0,
          }}
        >
          <Text type="secondary">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Text>
        </div>
        <Title level={3} style={{margin: 0}}>
          {capitalizeFirstLetter(roleName)} Dashboard
        </Title>
        <Tag color={roleName === "admin" ? "purple" : "blue"}>
          {roleName === "admin" ? "System Administrator" : "Healthcare Manager"}
        </Tag>
      </div>

      {/* Admin-specific Dashboard - chỉ hiển thị khi roleName là "admin" */}
      {roleName === "admin" && (
        <>
          <Row gutter={[16, 16]} style={{marginBottom: "24px"}}>
            {/* Total Users */}
            <Col xs={24} sm={12} md={8}>
              <Card
                bodyStyle={{padding: 0}}
                bordered={true}
                style={{height: "180px"}}
              >
                <div style={cardHeadStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={metricTitleStyle}>Total Users</Text>
                    <UserOutlined style={{fontSize: 16, color: "#1890ff"}} />
                  </div>
                </div>
                <div style={cardBodyStyle}>
                  {usersLoading ? (
                    <Spin size="small" />
                  ) : usersError ? (
                    <div style={{color: "red", fontSize: "14px"}}>
                      {usersError}
                    </div>
                  ) : usersData ? (
                    <>
                      <div style={{...metricValueStyle, color: "#1890ff"}}>
                        {usersData.total.count}
                      </div>
                      <div style={metricSubtitleStyle}>
                        {usersData.total.name}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{...metricValueStyle}}>0</div>
                      <div style={metricSubtitleStyle}>No data available</div>
                    </>
                  )}
                </div>
              </Card>
            </Col>

            {/* Password Changed */}
            <Col xs={24} sm={12} md={8}>
              <Card
                bodyStyle={{padding: 0}}
                bordered={true}
                style={{height: "180px"}}
              >
                <div style={cardHeadStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={metricTitleStyle}>Password Changed</Text>
                    <KeyOutlined style={{fontSize: 16, color: "#52c41a"}} />
                  </div>
                </div>
                <div style={cardBodyStyle}>
                  {usersLoading ? (
                    <Spin size="small" />
                  ) : usersError ? (
                    <div style={{color: "red", fontSize: "14px"}}>
                      {usersError}
                    </div>
                  ) : usersData ? (
                    <>
                      <div style={{...metricValueStyle, color: "#52c41a"}}>
                        {usersData.passwordChanged.count} /{" "}
                        {usersData.total.count}
                      </div>
                      <div style={metricSubtitleStyle}>
                        {getPasswordChangedPercentage()}% have changed passwords
                      </div>
                      <Progress
                        percent={getPasswordChangedPercentage()}
                        size="small"
                        status="active"
                        strokeColor="#52c41a"
                        style={{marginTop: "8px"}}
                      />
                    </>
                  ) : (
                    <>
                      <div style={{...metricValueStyle, color: "#52c41a"}}>
                        0
                      </div>
                      <div style={metricSubtitleStyle}>No data available</div>
                    </>
                  )}
                </div>
              </Card>
            </Col>

            {/* Default Password */}
            <Col xs={24} sm={24} md={8}>
              <Card
                bodyStyle={{padding: 0}}
                bordered={true}
                style={{height: "180px"}}
              >
                <div style={cardHeadStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={metricTitleStyle}>Default Password</Text>
                    <LockOutlined style={{fontSize: 16, color: "#f5222d"}} />
                  </div>
                </div>
                <div style={cardBodyStyle}>
                  {usersLoading ? (
                    <Spin size="small" />
                  ) : usersError ? (
                    <div style={{color: "red", fontSize: "14px"}}>
                      {usersError}
                    </div>
                  ) : usersData ? (
                    <>
                      <div style={{...metricValueStyle, color: "#f5222d"}}>
                        {usersData.defaultPassword.count} /{" "}
                        {usersData.total.count}
                      </div>
                      <div style={metricSubtitleStyle}>
                        {getDefaultPasswordPercentage()}% using default password
                      </div>
                      <Progress
                        percent={getDefaultPasswordPercentage()}
                        size="small"
                        status="active"
                        strokeColor="#52c41a"
                        style={{marginTop: "8px"}}
                      />
                    </>
                  ) : (
                    <>
                      <div style={{...metricValueStyle}}>0</div>
                      <div style={metricSubtitleStyle}>No data available</div>
                    </>
                  )}
                </div>
              </Card>
            </Col>
          </Row>

          <Divider>Healthcare Management</Divider>
        </>
      )}

      {/* Key Metrics (hiển thị cho tất cả roles) */}
      <Row gutter={[16, 16]} style={{marginBottom: "24px"}}>
        {/* Total Students */}
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card
            bodyStyle={{padding: 0}}
            bordered={true}
            style={{height: "180px"}}
          >
            <div style={cardHeadStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={metricTitleStyle}>Total Students</Text>
                <UserOutlined
                  style={{fontSize: 16, color: "rgba(0, 0, 0, 0.45)"}}
                />
              </div>
            </div>
            <div style={cardBodyStyle}>
              {loading ? (
                <Spin size="small" />
              ) : error ? (
                <div style={{color: "red", fontSize: "14px"}}>{error}</div>
              ) : totalStudents ? (
                <>
                  <div style={{...metricValueStyle}}>{totalStudents.count}</div>
                  <div style={metricSubtitleStyle}>{totalStudents.name}</div>
                </>
              ) : (
                <>
                  <div style={{...metricValueStyle}}>0</div>
                  <div style={metricSubtitleStyle}>No data available</div>
                </>
              )}
            </div>
          </Card>
        </Col>

        {/* Health Declarations */}
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card
            bodyStyle={{padding: 0}}
            bordered={true}
            style={{height: "180px"}}
          >
            <div style={cardHeadStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={metricTitleStyle}>Health Declarations</Text>
                <FileTextOutlined style={{fontSize: 16, color: "#1890ff"}} />
              </div>
            </div>
            <div style={cardBodyStyle}>
              {declarationsLoading ? (
                <Spin size="small" />
              ) : declarationsError ? (
                <div style={{color: "red", fontSize: "14px"}}>
                  {declarationsError}
                </div>
              ) : healthDeclarations ? (
                <>
                  <div style={{...metricValueStyle, color: "#1890ff"}}>
                    {healthDeclarations.submitted.count} /{" "}
                    {healthDeclarations.total.count}
                  </div>
                  <div style={metricSubtitleStyle}>
                    {getCompletionRate()}% completion rate
                  </div>
                  <Progress
                    percent={getCompletionRate()}
                    size="small"
                    status="active"
                    strokeColor="#1890ff"
                    style={{marginTop: "8px"}}
                  />
                </>
              ) : (
                <>
                  <div style={{...metricValueStyle, color: "#1890ff"}}>0</div>
                  <div style={metricSubtitleStyle}>No data available</div>
                </>
              )}
            </div>
          </Card>
        </Col>

        {/* Medicine Requests */}
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card
            bodyStyle={{padding: 0}}
            bordered={true}
            style={{height: "180px"}}
          >
            <div style={cardHeadStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={metricTitleStyle}>Medicine Requests</Text>
                <MedicineBoxOutlined style={{fontSize: 16, color: "#52c41a"}} />
              </div>
            </div>
            <div style={cardBodyStyle}>
              {medicineLoading ? (
                <Spin size="small" />
              ) : medicineError ? (
                <div style={{color: "red", fontSize: "14px"}}>
                  {medicineError}
                </div>
              ) : medicineRequests ? (
                <>
                  <div style={{...metricValueStyle, color: "#52c41a"}}>
                    {medicineRequests.count}
                  </div>
                  <div style={metricSubtitleStyle}>{medicineRequests.name}</div>
                </>
              ) : (
                <>
                  <div style={{...metricValueStyle, color: "#52c41a"}}>0</div>
                  <div style={metricSubtitleStyle}>No data available</div>
                </>
              )}
            </div>
          </Card>
        </Col>

        {/* Low Stock Alerts */}
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card
            bodyStyle={{padding: 0}}
            bordered={true}
            style={{height: "180px"}}
          >
            <div style={cardHeadStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={metricTitleStyle}>Low Stock Alerts</Text>
                <AlertOutlined style={{fontSize: 16, color: "#f5222d"}} />
              </div>
            </div>
            <div style={cardBodyStyle}>
              {lowStockLoading ? (
                <Spin size="small" />
              ) : lowStockError ? (
                <div style={{color: "red", fontSize: "14px"}}>
                  {lowStockError}
                </div>
              ) : lowStockMedicals && lowStockMedicals.length > 0 ? (
                <>
                  <div style={{...metricValueStyle, color: "#f5222d"}}>
                    {getLowStockCount()}
                  </div>
                  <div style={metricSubtitleStyle}>Items require attention</div>
                </>
              ) : (
                <>
                  <div style={{...metricValueStyle, color: "#52c41a"}}>0</div>
                  <div style={metricSubtitleStyle}>All stock levels normal</div>
                </>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Detailed Analytics */}
      <Tabs
        defaultActiveKey="health-checkups"
        onChange={setActiveTab}
        style={{marginBottom: 24}}
      >
        <TabPane tab="Health Checkups" key="health-checkups">
          <Row gutter={[16, 16]}>
            {/* Health Checkup Participation */}
            <Col xs={24} lg={12}>
              <Card title="Health Checkup Participation" bordered={true}>
                {healthChecksLoading ? (
                  <div style={{textAlign: "center", padding: "20px"}}>
                    <Spin />
                  </div>
                ) : healthChecksError ? (
                  <div
                    style={{color: "red", textAlign: "center", padding: "20px"}}
                  >
                    {healthChecksError}
                  </div>
                ) : healthChecks ? (
                  <Space direction="vertical" style={{width: "100%"}}>
                    {/* Completed */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start", // Thay đổi từ center sang flex-start
                        marginBottom: 12,
                        padding: "8px",
                        backgroundColor: "#f6ffed",
                        borderRadius: "4px",
                      }}
                    >
                      <Space direction="vertical" size={0}>
                        <Space>
                          <div
                            style={{
                              ...statusDotStyle,
                              backgroundColor: "#52c41a",
                            }}
                          ></div>
                          <Text strong>Completed</Text>
                        </Space>
                        <Text
                          type="secondary"
                          style={{marginLeft: "18px", fontSize: "12px"}}
                        >
                          {healthChecks.completed.name}
                        </Text>
                      </Space>
                      <Text strong>
                        {healthChecks.completed.count} (
                        {getHealthCheckStats().percentages.completed}%)
                      </Text>
                    </div>

                    {/* Pending */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 12,
                        padding: "8px",
                        backgroundColor: "#fffbe6",
                        borderRadius: "4px",
                      }}
                    >
                      <Space direction="vertical" size={0}>
                        <Space>
                          <div
                            style={{
                              ...statusDotStyle,
                              backgroundColor: "#faad14",
                            }}
                          ></div>
                          <Text strong>Pending</Text>
                        </Space>
                        <Text
                          type="secondary"
                          style={{marginLeft: "18px", fontSize: "12px"}}
                        >
                          {healthChecks.pending.name}
                        </Text>
                      </Space>
                      <Text strong>
                        {healthChecks.pending.count} (
                        {getHealthCheckStats().percentages.pending}%)
                      </Text>
                    </div>

                    {/* Failed */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 12,
                        padding: "8px",
                        backgroundColor: "#fff1f0",
                        borderRadius: "4px",
                      }}
                    >
                      <Space direction="vertical" size={0}>
                        <Space>
                          <div
                            style={{
                              ...statusDotStyle,
                              backgroundColor: "#f5222d",
                            }}
                          ></div>
                          <Text strong>Failed</Text>
                        </Space>
                        <Text
                          type="secondary"
                          style={{marginLeft: "18px", fontSize: "12px"}}
                        >
                          {healthChecks.failed.name}
                        </Text>
                      </Space>
                      <Text strong>
                        {healthChecks.failed.count} (
                        {getHealthCheckStats().percentages.failed}%)
                      </Text>
                    </div>

                    {/* Declined */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 12,
                        padding: "8px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "4px",
                      }}
                    >
                      <Space direction="vertical" size={0}>
                        <Space>
                          <div
                            style={{
                              ...statusDotStyle,
                              backgroundColor: "#8c8c8c",
                            }}
                          ></div>
                          <Text strong>Declined</Text>
                        </Space>
                        <Text
                          type="secondary"
                          style={{marginLeft: "18px", fontSize: "12px"}}
                        >
                          {healthChecks.declined.name}
                        </Text>
                      </Space>
                      <Text strong>
                        {healthChecks.declined.count} (
                        {getHealthCheckStats().percentages.declined}%)
                      </Text>
                    </div>

                    <Divider style={{margin: "12px 0"}} />
                  </Space>
                ) : (
                  <div style={{textAlign: "center", padding: "20px"}}>
                    No data available
                  </div>
                )}
              </Card>
            </Col>

            {/* Monthly Trends */}
            <Col xs={24} lg={12}>
              <Card title="Monthly Trends" bordered={true}>
                <Space direction="vertical" style={{width: "100%"}}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      backgroundColor: "#f6ffed",
                      borderRadius: 8,
                      marginBottom: 12,
                    }}
                  >
                    <Text>This Week</Text>
                    <Text style={{color: "#52c41a", fontWeight: 500}}>
                      +12.5%
                    </Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      backgroundColor: "#e6f7ff",
                      borderRadius: 8,
                      marginBottom: 12,
                    }}
                  >
                    <Text>This Month</Text>
                    <Text style={{color: "#1890ff", fontWeight: 500}}>
                      +8.3%
                    </Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      backgroundColor: "#f9f0ff",
                      borderRadius: 8,
                    }}
                  >
                    <Text>This Year</Text>
                    <Text style={{color: "#722ed1", fontWeight: 500}}>
                      +15.7%
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Vaccinations" key="vaccinations">
          <Row gutter={[16, 16]}>
            {/* Vaccination Status */}
            <Col xs={24} lg={12}>
              <Card title="Vaccination Status" bordered={true}>
                {vaccinationsLoading ? (
                  <div style={{textAlign: "center", padding: "20px"}}>
                    <Spin />
                  </div>
                ) : vaccinationsError ? (
                  <div
                    style={{color: "red", textAlign: "center", padding: "20px"}}
                  >
                    {vaccinationsError}
                  </div>
                ) : vaccinations ? (
                  <Space direction="vertical" style={{width: "100%"}}>
                    {/* Completed */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 12,
                        padding: "8px",
                        backgroundColor: "#f6ffed",
                        borderRadius: "4px",
                      }}
                    >
                      <Space direction="vertical" size={0}>
                        <Space>
                          <div
                            style={{
                              ...statusDotStyle,
                              backgroundColor: "#52c41a",
                            }}
                          ></div>
                          <Text strong>Completed</Text>
                        </Space>
                        <Text
                          type="secondary"
                          style={{marginLeft: "18px", fontSize: "12px"}}
                        >
                          {vaccinations.completed.name}
                        </Text>
                      </Space>
                      <Text strong>
                        {vaccinations.completed.count} (
                        {getVaccinationStats().percentages.completed}%)
                      </Text>
                    </div>

                    {/* Pending */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 12,
                        padding: "8px",
                        backgroundColor: "#fffbe6",
                        borderRadius: "4px",
                      }}
                    >
                      <Space direction="vertical" size={0}>
                        <Space>
                          <div
                            style={{
                              ...statusDotStyle,
                              backgroundColor: "#faad14",
                            }}
                          ></div>
                          <Text strong>Pending</Text>
                        </Space>
                        <Text
                          type="secondary"
                          style={{marginLeft: "18px", fontSize: "12px"}}
                        >
                          {vaccinations.pending.name}
                        </Text>
                      </Space>
                      <Text strong>
                        {vaccinations.pending.count} (
                        {getVaccinationStats().percentages.pending}%)
                      </Text>
                    </div>

                    {/* Failed */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 12,
                        padding: "8px",
                        backgroundColor: "#fff1f0",
                        borderRadius: "4px",
                      }}
                    >
                      <Space direction="vertical" size={0}>
                        <Space>
                          <div
                            style={{
                              ...statusDotStyle,
                              backgroundColor: "#f5222d",
                            }}
                          ></div>
                          <Text strong>Failed</Text>
                        </Space>
                        <Text
                          type="secondary"
                          style={{marginLeft: "18px", fontSize: "12px"}}
                        >
                          {vaccinations.failed.name}
                        </Text>
                      </Space>
                      <Text strong>
                        {vaccinations.failed.count} (
                        {getVaccinationStats().percentages.failed}%)
                      </Text>
                    </div>

                    {/* Not Qualified */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 12,
                        padding: "8px",
                        backgroundColor: "#fff7e6",
                        borderRadius: "4px",
                      }}
                    >
                      <Space direction="vertical" size={0}>
                        <Space>
                          <div
                            style={{
                              ...statusDotStyle,
                              backgroundColor: "#fa8c16",
                            }}
                          ></div>
                          <Text strong>Not Qualified</Text>
                        </Space>
                        <Text
                          type="secondary"
                          style={{marginLeft: "18px", fontSize: "12px"}}
                        >
                          {vaccinations.notQualified.name}
                        </Text>
                      </Space>
                      <Text strong>
                        {vaccinations.notQualified.count} (
                        {getVaccinationStats().percentages.notQualified}%)
                      </Text>
                    </div>

                    {/* Declined */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 12,
                        padding: "8px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "4px",
                      }}
                    >
                      <Space direction="vertical" size={0}>
                        <Space>
                          <div
                            style={{
                              ...statusDotStyle,
                              backgroundColor: "#8c8c8c",
                            }}
                          ></div>
                          <Text strong>Declined</Text>
                        </Space>
                        <Text
                          type="secondary"
                          style={{marginLeft: "18px", fontSize: "12px"}}
                        >
                          {vaccinations.declined.name}
                        </Text>
                      </Space>
                      <Text strong>
                        {vaccinations.declined.count} (
                        {getVaccinationStats().percentages.declined}%)
                      </Text>
                    </div>

                    <Divider style={{margin: "12px 0"}} />
                  </Space>
                ) : (
                  <div style={{textAlign: "center", padding: "20px"}}>
                    No data available
                  </div>
                )}
              </Card>
            </Col>

            {/* Vaccination Trends */}
            <Col xs={24} lg={12}>
              <Card title="Vaccination Trends" bordered={true}>
                <Space direction="vertical" style={{width: "100%"}}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      backgroundColor: "#f6ffed",
                      borderRadius: 8,
                      marginBottom: 12,
                    }}
                  >
                    <Text>This Week</Text>
                    <Text style={{color: "#52c41a", fontWeight: 500}}>
                      +18.2%
                    </Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      backgroundColor: "#e6f7ff",
                      borderRadius: 8,
                      marginBottom: 12,
                    }}
                  >
                    <Text>This Month</Text>
                    <Text style={{color: "#1890ff", fontWeight: 500}}>
                      +22.1%
                    </Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      backgroundColor: "#f9f0ff",
                      borderRadius: 8,
                    }}
                  >
                    <Text>This Year</Text>
                    <Text style={{color: "#722ed1", fontWeight: 500}}>
                      +28.5%
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Inventory" key="inventory">
          <Row gutter={[16, 16]}>
            {/* Low Stock Medicines */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <AlertOutlined style={{color: "#f5222d"}} />
                    <span>Low Stock Medicines</span>
                  </Space>
                }
                bordered={true}
              >
                {lowStockLoading ? (
                  <div style={{textAlign: "center", padding: "20px"}}>
                    <Spin />
                  </div>
                ) : lowStockError ? (
                  <div
                    style={{color: "red", textAlign: "center", padding: "20px"}}
                  >
                    {lowStockError}
                  </div>
                ) : lowStockMedicals && lowStockMedicals.length > 0 ? (
                  <Space direction="vertical" style={{width: "100%"}}>
                    {lowStockMedicals.map((item, index) => {
                      const itemName = Object.keys(item)[0];
                      const quantity = item[itemName];
                      const alertLevel = getStockAlertLevel(quantity);

                      let bgColor = "#fffbe6"; // Default color (yellow-light)
                      let badgeColor = "#faad14";

                      if (alertLevel === "critical") {
                        bgColor = "#fff1f0"; // Red-light
                        badgeColor = "#f5222d";
                      } else if (alertLevel === "warning") {
                        bgColor = "#fff7e6"; // Orange-light
                        badgeColor = "#fa8c16";
                      }

                      return (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            backgroundColor: bgColor,
                            borderRadius: 8,
                            marginBottom:
                              index < lowStockMedicals.length - 1 ? 12 : 0,
                          }}
                        >
                          <Text>{itemName}</Text>
                          {alertLevel === "critical" ? (
                            <Badge
                              count={quantity}
                              style={{backgroundColor: badgeColor}}
                            />
                          ) : (
                            <Badge
                              count={quantity}
                              style={{
                                backgroundColor: "#fff",
                                color: badgeColor,
                                boxShadow: `0 0 0 1px ${badgeColor} inset`,
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </Space>
                ) : (
                  <div style={{textAlign: "center", padding: "20px"}}>
                    No low stock items
                  </div>
                )}
              </Card>
            </Col>

            {/* Expiring Soon */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <CalendarOutlined style={{color: "#fa8c16"}} />
                    <span>Expiring Soon</span>
                  </Space>
                }
                bordered={true}
              >
                {expiringLoading ? (
                  <div style={{textAlign: "center", padding: "20px"}}>
                    <Spin />
                  </div>
                ) : expiringError ? (
                  <div
                    style={{color: "red", textAlign: "center", padding: "20px"}}
                  >
                    {expiringError}
                  </div>
                ) : expiringMedicals && expiringMedicals.length > 0 ? (
                  <Space direction="vertical" style={{width: "100%"}}>
                    {expiringMedicals.map((item, index) => {
                      const itemName = Object.keys(item)[0];
                      const daysLeft = item[itemName];
                      const {bgColor, tagColor} =
                        getExpiryColorScheme(daysLeft);

                      return (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            backgroundColor: bgColor,
                            borderRadius: 8,
                            marginBottom:
                              index < expiringMedicals.length - 1 ? 12 : 0,
                          }}
                        >
                          <Text>{itemName}</Text>
                          <Tag color={tagColor}>
                            {daysLeft} {daysLeft === 1 ? "day" : "days"}
                          </Tag>
                        </div>
                      );
                    })}
                  </Space>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      backgroundColor: "#f6ffed",
                      borderRadius: 8,
                      color: "#52c41a",
                    }}
                  >
                    <Space direction="vertical" align="center">
                      <CheckCircleOutlined style={{fontSize: 24}} />
                      <Text>No expiring items in the next 30 days</Text>
                    </Space>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* Auto Refresh Switch */}
      {/* <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "16px",
        }}
      >
        <Space>
          <Text>Auto refresh:</Text>
          <Switch
            checkedChildren="On"
            unCheckedChildren="Off"
            checked={pollingConfig.enabled}
            onChange={togglePolling}
          />
          {pollingConfig.enabled && (
            <Select
              value={pollingConfig.interval / 60000} // Hiển thị phút
              onChange={(value) =>
                setPollingConfig((prev) => ({...prev, interval: value * 60000}))
              }
              style={{width: 100}}
            >
              <Select.Option value={5}>5 min</Select.Option>
              <Select.Option value={15}>15 min</Select.Option>
              <Select.Option value={30}>30 min</Select.Option>
              <Select.Option value={60}>1 hour</Select.Option>
              <Select.Option value={120}>2 hours</Select.Option>
            </Select>
          )}
        </Space>
      </div> */}
    </div>
  );
};

export default ManagerDashboard;
