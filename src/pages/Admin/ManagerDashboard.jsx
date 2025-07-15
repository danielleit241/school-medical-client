import React, {useEffect, useState, useRef, useCallback} from "react";
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
  DatePicker,
  Button,
  Table,
  Modal,
} from "antd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";
import Chart from "chart.js/auto";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend
);
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
  EditOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../api/axios";
import {useSelector} from "react-redux";
import HealthCheckupChart from "./HealthCheckupChart";
import VaccinationChart from "./VaccinationChart";
import dayjs from "dayjs";
import Swal from "sweetalert2";

const {Title, Text} = Typography;
const {TabPane} = Tabs;
const {RangePicker} = DatePicker;

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
  const [recentActions, setRecentActions] = useState(null);
  const [recentActionsLoading, setRecentActionsLoading] = useState(true);
  const [recentActionsError, setRecentActionsError] = useState(null);

  const [usersData, setUsersData] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  const [dateRange, setDateRange] = useState([null, null]);

  useEffect(() => {
    if (localStorage.getItem("showLoginSuccess") === "1") {
      Swal.fire({
        icon: "success",
        title: "Login successful!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      localStorage.removeItem("showLoginSuccess");
    }
  }, []);
  
  // Styling constants
  const cardHeadStyle = {
    padding: "12px 16px",
    borderBottom: "1px solid #f0f0f0",
  };
  const cardBodyStyle = {
    padding: "16px",
  };
  const metricTitleStyle = {
    fontSize: "18px", 
    fontWeight: 500,
    marginBottom: 0,
    color: "rgba(0, 0, 0, 0.65)",
  };
  const metricValueStyle = {
    fontSize: "28px", 
    fontWeight: 700,
    margin: "4px 0",
  };
  const metricSubtitleStyle = {
    fontSize: "14px", 
    color: "rgba(0, 0, 0, 0.45)",
  };
  const statusDotStyle = {
    width: 10,
    height: 10,
    borderRadius: "50%",
    display: "inline-block",
    marginRight: 8,
  };

  // eslint-disable-next-line no-unused-vars
  const [pollingConfig, setPollingConfig] = useState({
    enabled: true,
    interval: 86400000 / 2, // 1 ngày
  });

  const getDateRangeParams = useCallback(() => {
    if (!dateRange[0] || !dateRange[1]) return {};
    return {
      From: dateRange[0].format("YYYY-MM-DD"),
      To: dateRange[1].format("YYYY-MM-DD"),
    };
  }, [dateRange]);

  const setCurrentMonth = () => {
    const now = dayjs();
    const startOfMonth = now.startOf("month");
    const endOfMonth = now.endOf("month");
    setDateRange([startOfMonth, endOfMonth]);
    return {start: startOfMonth, end: endOfMonth};
  };

  const setPreviousMonth = () => {
    const now = dayjs();
    const previousMonth = now.subtract(1, "month");
    const startOfMonth = previousMonth.startOf("month");
    const endOfMonth = previousMonth.endOf("month");
    setDateRange([startOfMonth, endOfMonth]);
    return {start: startOfMonth, end: endOfMonth};
  };

  const fetchTotalStudents = async () => {
    try {
      setLoading(true);
      const params = getDateRangeParams();
      const response = await axiosInstance.get(
        "/api/managers/dashboards/students",
        {params}
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
      const params = getDateRangeParams();
      const response = await axiosInstance.get(
        "/api/managers/dashboards/health-declarations",
        {params}
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
      const params = getDateRangeParams();
      const response = await axiosInstance.get(
        "/api/managers/dashboards/medical-requests",
        {params}
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

  const [healthChecksRaw, setHealthChecksRaw] = useState([]);

  const fetchHealthChecks = async () => {
    try {
      setHealthChecksLoading(true);
      const params = getDateRangeParams();
      const response = await axiosInstance.get(
        "/api/managers/dashboards/health-checks",
        {params}
      );

      setHealthChecksRaw(response.data || []);

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

  const [vaccinationsRaw, setVaccinationsRaw] = useState([]);

  const fetchVaccinations = async () => {
    try {
      setVaccinationsLoading(true);
      const params = getDateRangeParams();
      const response = await axiosInstance.get(
        "/api/managers/dashboards/vaccinations",
        {params}
      );
      setVaccinationsRaw(response.data || []);
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
      const params = getDateRangeParams();
      const response = await axiosInstance.get(
        "/api/managers/dashboards/low-stock-medicals",
        {params}
      );
      console.log("Low stock response:", response.data);

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
      if (err.response && err.response.status === 404) {
        setExpiringMedicals([]);
        setExpiringError(null);
      } else {
        setExpiringError("Failed to load expiring items data");
      }
      setExpiringLoading(false);
    }
  };

  const fetchCriticalData = async () => {
    // eslint-disable-next-line no-unused-vars
    const params = getDateRangeParams();
    await Promise.all([
      fetchLowStockMedicals(),
      fetchExpiringMedicals(),
      fetchMedicineRequests(),
    ]);
    setLastUpdated(new Date());
  };

  const fetchData = () => {
    fetchTotalStudents();
    fetchHealthDeclarations();
    fetchMedicineRequests();
    fetchHealthChecks();
    fetchVaccinations();
    fetchLowStockMedicals();
    fetchExpiringMedicals();

    if (roleName === "admin") {
      fetchAdminData();
    }
  };

  const fetchAdminData = async () => {
    if (roleName !== "admin") return;

    try {
      setUsersLoading(true);
      setRecentActionsLoading(true);

      const params = getDateRangeParams();

      const [usersResponse, actionsResponse] = await Promise.all([
        axiosInstance.get("/api/admins/dashboards/users", {params}),
        axiosInstance.get("/api/admins/dashboards/recent-actions", {params}),
      ]);

      if (usersResponse.data && usersResponse.data.length > 0) {
        const formattedData = {
          total: usersResponse.data[0]?.item || {count: 0, name: "No data"},
          passwordChanged: usersResponse.data[1]?.item || {
            count: 0,
            name: "No data",
          },
          defaultPassword: usersResponse.data[2]?.item || {
            count: 0,
            name: "No data",
          },
        };
        setUsersData(formattedData);
      }

      if (actionsResponse.data) {
        setRecentActions(actionsResponse.data);
      }

      setUsersError(null);
      setRecentActionsError(null);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      if (err.config?.url.includes("users")) {
        setUsersError("Failed to load users data");
      }
      if (err.config?.url.includes("recent-actions")) {
        setRecentActionsError("Failed to load recent actions data");
      }
    } finally {
      setUsersLoading(false);
      setRecentActionsLoading(false);
    }
  };

  useEffect(() => {
    if (roleName === "admin") {
      fetchAdminData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleName]); // Chỉ phụ thuộc vào roleName, không phụ thuộc vào dateRange

  useEffect(() => {
    // eslint-disable-next-line no-unused-vars
    const {start, end} = setCurrentMonth();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  usePollingEffect(
    () => {
      console.log("Polling critical data...", new Date().toLocaleTimeString());
      fetchCriticalData();
    },
    pollingConfig.enabled ? pollingConfig.interval : null,
    []
  );

  const getCompletionRate = () => {
    if (!healthDeclarations) return 0;

    const total = healthDeclarations.total.count || 0;
    const submitted = healthDeclarations.submitted.count || 0;

    if (total === 0) return 0;
    return Math.round((submitted / total) * 100);
  };

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

  // eslint-disable-next-line no-unused-vars
  const getLowStockCount = () => {
    if (!lowStockMedicals || lowStockMedicals.length === 0) return 0;
    return lowStockMedicals.length;
  };

  // eslint-disable-next-line no-unused-vars
  const getStockAlertLevel = (quantity) => {
    if (quantity <= 5) return "critical";
    if (quantity <= 10) return "warning";
    return "attention";
  };

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

  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

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

  useEffect(() => {
    const fetchAdminData = async () => {
      if (roleName !== "admin") return;

      try {
        setUsersLoading(true);
        setRecentActionsLoading(true);

        const params = getDateRangeParams();

        const [usersResponse, actionsResponse] = await Promise.all([
          axiosInstance.get("/api/admins/dashboards/users", {params}),
          axiosInstance.get("/api/admins/dashboards/recent-actions", {params}),
        ]);

        if (usersResponse.data && usersResponse.data.length > 0) {
          const formattedData = {
            total: usersResponse.data[0]?.item || {count: 0, name: "No data"},
            passwordChanged: usersResponse.data[1]?.item || {
              count: 0,
              name: "No data",
            },
            defaultPassword: usersResponse.data[2]?.item || {
              count: 0,
              name: "No data",
            },
          };
          setUsersData(formattedData);
        }

        if (actionsResponse.data) {
          setRecentActions(actionsResponse.data);
        }

        setUsersError(null);
        setRecentActionsError(null);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        if (err.config?.url.includes("users")) {
          setUsersError("Failed to load users data");
        }
        if (err.config?.url.includes("recent-actions")) {
          setRecentActionsError("Failed to load recent actions data");
        }
      } finally {
        setUsersLoading(false);
        setRecentActionsLoading(false);
      }
    };

    fetchAdminData();
  }, [roleName, getDateRangeParams]);

  const RecentActionsChart = ({data, loading, error}) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
      if (loading || error || !data || data.length === 0) return;

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const labels = data.map((item) => {
        const actionName = item.userRecentAction.name.split(" in ")[0];
        return actionName;
      });

      const values = data.map((item) => item.userRecentAction.count);

      const backgroundColors = [
        "#52c41a", // Create - green
        "#1890ff", // Update - blue
        "#fa8c16", // Reset password - orange
      ];

      const chartData = {
        labels: labels,
        datasets: [
          {
            label: "Action Count",
            data: values,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors,
            borderWidth: 1,
          },
        ],
      };

      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `Count: ${context.raw}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0, 
            },
            title: {
              display: true,
              text: "Number of Actions",
            },
          },
          x: {
            title: {
              display: true,
              text: "Action Type",
            },
          },
        },
      };

      const ctx = chartRef.current.getContext("2d");
      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: chartData,
        options: chartOptions,
      });

      return () => {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
      };
    }, [data, loading, error]);

    if (loading) {
      return (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            height: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spin />
        </div>
      );
    }

    if (error) {
      return (
        <div
          style={{
            color: "red",
            textAlign: "center",
            padding: "20px",
            height: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {error}
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            height: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          No data available
        </div>
      );
    }

    return (
      <div style={{height: "300px", position: "relative"}}>
        <canvas ref={chartRef} />
      </div>
    );
  };

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestDetail, setRequestDetail] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);

  const handleOpenRequestModal = async () => {
    setRequestModalOpen(true);
    setRequestLoading(true);
    try {
      const ids =
        medicineRequests &&
        medicineRequests.details &&
        medicineRequests.details.length > 0
          ? medicineRequests.details.map((item) => item.id)
          : [];
      const results = await Promise.all(
        ids.map((id) =>
          axiosInstance
            .get(`/api/medical-requests/${id}`)
            .then((res) => (Array.isArray(res.data) ? res.data : [res.data]))
            .catch(() => [])
        )
      );
      setRequestDetail(results.flat());
    } catch (err) {
      console.error(err);
      setRequestDetail([]);
    } finally {
      setRequestLoading(false);
    }
  };

  const [healthCheckModal, setHealthCheckModal] = useState({
    open: false,
    status: "",
    loading: false,
    data: [],
  });

  const handleOpenHealthCheckModal = async (statusKey) => {
    setHealthCheckModal({
      open: true,
      status: statusKey,
      loading: true,
      data: [],
    });
    try {
      const statusMap = {
        completed: 0,
        pending: 1,
        failed: 2,
        declined: 3,
      };
      const apiDataIdx = statusMap[statusKey];
      const apiData = healthChecksRaw?.[apiDataIdx]?.item || {};
      const details = apiData.details || [];
      const ids = details.map((item) => item.id);

      const results = await Promise.all(
        ids.map((id) =>
          axiosInstance
            .get(`/api/health-check-results/${id}`)
            .then((res) => res.data)
            .catch(() => null)
        )
      );
      setHealthCheckModal({
        open: true,
        status: statusKey,
        loading: false,
        data: results.filter(Boolean),
      });
    } catch (err) {
      console.error("Error fetching health check results:", err);
      setHealthCheckModal({
        open: true,
        status: statusKey,
        loading: false,
        data: [],
      });
    }
  };

  const [vaccinationModal, setVaccinationModal] = useState({
    open: false,
    status: "",
    loading: false,
    data: [],
  });

  const handleOpenVaccinationModal = async (statusKey) => {
    setVaccinationModal({
      open: true,
      status: statusKey,
      loading: true,
      data: [],
    });
    try {
      const statusMap = {
        completed: 0,
        pending: 1,
        failed: 2,
        declined: 3,
        notQualified: 4,
      };
      const apiDataIdx = statusMap[statusKey];
      const apiData = vaccinationsRaw?.[apiDataIdx]?.item || {};
      const details = apiData.details || [];
      const ids = details.map((item) => item.id);

      const results = await Promise.all(
        ids.map((id) =>
          axiosInstance
            .get(`/api/vaccination-results/${id}`)
            .then((res) => res.data)
            .catch(() => null)
        )
      );
      setVaccinationModal({
        open: true,
        status: statusKey,
        loading: false,
        data: results.filter(Boolean),
      });
    } catch (err) {
      console.error("Error fetching vaccination results:", err);
      setVaccinationModal({
        open: true,
        status: statusKey,
        loading: false,
        data: [],
      });
    }
  };

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

      {/* Date Range Filter */}
      <div style={{marginBottom: 24}}>
        <Card
          title={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Date Filter</span>
              <Space>
                <Button
                  size="small"
                  onClick={() => {
                    // eslint-disable-next-line no-unused-vars
                    const {start, end} = setCurrentMonth();
                    fetchData();
                  }}
                >
                  This Month
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    // eslint-disable-next-line no-unused-vars
                    const {start, end} = setPreviousMonth();
                    fetchData();
                  }}
                >
                  Previous Month
                </Button>
              </Space>
            </div>
          }
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                setDateRange(dates);
              }}
              format="DD/MM/YYYY"
              allowClear={false}
              style={{width: "70%"}}
            />
            <Space>
              <Button
                onClick={() => {
                  // eslint-disable-next-line no-unused-vars
                  const {start, end} = setCurrentMonth();
                  fetchData();
                }}
              >
                Reset
              </Button>
              <Button
                style={{
                  background: "#355383",
                  borderColor: "#355383",
                  color: "#fff",
                }}
                type="primary"
                onClick={() => fetchData()}
                disabled={!dateRange[0] || !dateRange[1]}
              >
                Apply Filter
              </Button>
            </Space>
          </div>
          {dateRange[0] && dateRange[1] && (
            <div style={{marginTop: 8}}>
              <Text type="secondary">
                Showing data from {dateRange[0].format("DD/MM/YYYY")} to{" "}
                {dateRange[1].format("DD/MM/YYYY")}
              </Text>
            </div>
          )}
        </Card>
      </div>

      {roleName === "admin" && <Divider>Account Management</Divider>}
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
                    <UserOutlined style={{fontSize: 18, color: "#1890ff"}} />
                  </div>
                </div>
                <div style={cardBodyStyle}>
                  {usersLoading ? (
                    <Spin size="small" />
                  ) : usersError ? (
                    <div style={{color: "red", fontSize: "18px"}}>
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
                    <KeyOutlined style={{fontSize: 18, color: "#52c41a"}} />
                  </div>
                </div>
                <div style={cardBodyStyle}>
                  {usersLoading ? (
                    <Spin size="small" />
                  ) : usersError ? (
                    <div style={{color: "red", fontSize: "18px"}}>
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
                    <LockOutlined style={{fontSize: 18, color: "#f5222d"}} />
                  </div>
                </div>
                <div style={cardBodyStyle}>
                  {usersLoading ? (
                    <Spin size="small" />
                  ) : usersError ? (
                    <div style={{color: "red", fontSize: "18px"}}>
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
        </>
      )}
      {/* recent Admin Management */}
      {roleName === "admin" && (
        <>
          <Divider>Users Activities</Divider>
          <Row gutter={[16, 16]} style={{marginBottom: "24px"}}>
            <Col xs={24} md={12}>
              <Card
                title="Recent Users Actions"
                bordered={true}
                style={{height: "100%"}}
              >
                {recentActionsLoading ? (
                  <div style={{textAlign: "center", padding: "20px"}}>
                    <Spin />
                  </div>
                ) : recentActionsError ? (
                  <div
                    style={{color: "red", textAlign: "center", padding: "20px"}}
                  >
                    {recentActionsError}
                  </div>
                ) : recentActions && recentActions.length > 0 ? (
                  <Space direction="vertical" style={{width: "100%"}}>
                    {recentActions.map((item, index) => {
                      const actionName =
                        item.userRecentAction.name.split(" in ")[0];
                      const period =
                        item.userRecentAction.name.split(" in ")[1] || "";
                      const count = item.userRecentAction.count;

                      let iconColor = "#1890ff"; 
                      let IconComponent = UserOutlined;

                      if (actionName.toLowerCase().includes("create")) {
                        iconColor = "#52c41a"; 
                        IconComponent = UserOutlined;
                      } else if (actionName.toLowerCase().includes("update")) {
                        iconColor = "#1890ff"; 
                        IconComponent = EditOutlined;
                      } else if (actionName.toLowerCase().includes("reset")) {
                        iconColor = "#fa8c16"; 
                        IconComponent = KeyOutlined;
                      }

                      return (
                        <React.Fragment key={index}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              padding: "8px",
                              backgroundColor:
                                index % 2 === 0 ? "#f9f9f9" : "#ffffff",
                              borderRadius: "4px",
                            }}
                          >
                            <Space>
                              <IconComponent
                                style={{fontSize: 18, color: iconColor}}
                              />
                              <Space direction="vertical" size={0}>
                                <Text strong style={{fontSize: "18px"}}>
                                  {actionName}
                                </Text>
                                <Text
                                  type="secondary"
                                  style={{fontSize: "13px"}}
                                >
                                  {period}
                                </Text>
                              </Space>
                            </Space>
                            <Text strong>{count}</Text>
                          </div>
                          {index < recentActions.length - 1 && (
                            <Divider style={{margin: "8px 0"}} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </Space>
                ) : (
                  <div style={{textAlign: "center", padding: "20px"}}>
                    No recent actions
                  </div>
                )}
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card title="Actions Distribution" bordered={true}>
                <RecentActionsChart
                  data={recentActions}
                  loading={recentActionsLoading}
                  error={recentActionsError}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
      <Divider>Healthcare Management</Divider>
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
                  style={{fontSize: 18, color: "rgba(0, 0, 0, 0.45)"}}
                />
              </div>
            </div>
            <div style={cardBodyStyle}>
              {loading ? (
                <Spin size="small" />
              ) : error ? (
                <div style={{color: "red", fontSize: "13px"}}>{error}</div>
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
                <FileTextOutlined style={{fontSize: 18, color: "#1890ff"}} />
              </div>
            </div>
            <div style={cardBodyStyle}>
              {declarationsLoading ? (
                <Spin size="small" />
              ) : declarationsError ? (
                <div style={{color: "red", fontSize: "18px"}}>
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
            bodyStyle={{padding: 0, cursor: "pointer"}}
            bordered={true}
            style={{height: "180px"}}
            onClick={handleOpenRequestModal}
            hoverable
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
                <MedicineBoxOutlined style={{fontSize: 18, color: "#52c41a"}} />
              </div>
            </div>
            <div style={cardBodyStyle}>
              {medicineLoading ? (
                <Spin size="small" />
              ) : medicineError ? (
                <div style={{color: "red", fontSize: "18px"}}>
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
                <AlertOutlined style={{fontSize: 18, color: "#f5222d"}} />
              </div>
            </div>
            <div style={cardBodyStyle}>
              {lowStockLoading ? (
                <Spin size="small" />
              ) : lowStockError ? (
                <div style={{color: "red", fontSize: "18px"}}>
                  {lowStockError}
                </div>
              ) : lowStockMedicals && lowStockMedicals.length > 0 ? (
                <>
                  <div style={{...metricValueStyle, color: "#f5222d"}}>
                    {lowStockMedicals.length}
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
                        alignItems: "flex-start",
                        marginBottom: 12,
                        padding: "8px",
                        backgroundColor: "#f6ffed",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleOpenHealthCheckModal("completed")}
                    >
                      <Space direction="vertical" size={0}>
                        <Space>
                          <div
                            style={{
                              ...statusDotStyle,
                              backgroundColor: "#52c41a",
                            }}
                          ></div>
                          <Text strong style={{fontSize: "16px"}}>
                            Completed
                          </Text>
                        </Space>
                        <Text
                          type="secondary"
                          style={{marginLeft: "18px", fontSize: "13px"}}
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
                        cursor: "pointer",
                      }}
                      onClick={() => handleOpenHealthCheckModal("pending")}
                    >
                      <Space direction="vertical" size={0}>
                        <Space>
                          <div
                            style={{
                              ...statusDotStyle,
                              backgroundColor: "#faad14",
                            }}
                          ></div>
                          <Text strong style={{fontSize: "16px"}}>
                            Pending
                          </Text>
                        </Space>
                        <Text
                          type="secondary"
                          style={{marginLeft: "18px", fontSize: "13px"}}
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
                        cursor: "pointer",
                      }}
                      onClick={() => handleOpenHealthCheckModal("failed")}
                    >
                      <Space direction="vertical" size={0}>
                        <Space>
                          <div
                            style={{
                              ...statusDotStyle,
                              backgroundColor: "#f5222d",
                            }}
                          ></div>
                          <Text strong style={{fontSize: "16px"}}>
                            Failed
                          </Text>
                        </Space>
                        <Text
                          type="secondary"
                          style={{marginLeft: "18px", fontSize: "13px"}}
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
                        cursor: "pointer",
                      }}
                      onClick={() => handleOpenHealthCheckModal("declined")}
                    >
                      <Space direction="vertical" size={0}>
                        <Space>
                          <div
                            style={{
                              ...statusDotStyle,
                              backgroundColor: "#8c8c8c",
                            }}
                          ></div>
                          <Text strong style={{fontSize: "16px"}}>
                            Declined
                          </Text>
                        </Space>
                        <Text
                          type="secondary"
                          style={{marginLeft: "18px", fontSize: "13px"}}
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

            {/* Health Checkups Charts */}
            <Col xs={24} lg={12}>
              <Card title="Health Checkup Participation" bordered={true}>
                <HealthCheckupChart
                  data={healthChecks}
                  loading={healthChecksLoading}
                  error={healthChecksError}
                />
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
                        cursor: "pointer",
                      }}
                      onClick={() => handleOpenVaccinationModal("completed")}
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
                          style={{marginLeft: "18px", fontSize: "16px"}}
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
                        cursor: "pointer",
                      }}
                      onClick={() => handleOpenVaccinationModal("pending")}
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
                          style={{marginLeft: "18px", fontSize: "16px"}}
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
                        cursor: "pointer",
                      }}
                      onClick={() => handleOpenVaccinationModal("failed")}
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
                          style={{marginLeft: "18px", fontSize: "16px"}}
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
                        cursor: "pointer",
                      }}
                      onClick={() => handleOpenVaccinationModal("notQualified")}
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
                          style={{marginLeft: "18px", fontSize: "16px"}}
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
                        cursor: "pointer",
                      }}
                      onClick={() => handleOpenVaccinationModal("declined")}
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
                          style={{marginLeft: "18px", fontSize: "16px"}}
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

            {/* Vaccination Charts */}
            <Col xs={24} lg={12}>
              <Card title="Vaccination Status" bordered={true}>
                <VaccinationChart
                  data={vaccinations}
                  loading={vaccinationsLoading}
                  error={vaccinationsError}
                />
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
                      const info = item[itemName];
                      const quantity = info.quantityInStock;
                      const minLevel = info.minimumStockLevel;

                      let bgColor = "#fffbe6"; 
                      let badgeColor = "#faad14";
                      let alertText = "Warning";

                      if (quantity <= minLevel) {
                        bgColor = "#fff1f0"; 
                        badgeColor = "#f5222d";
                        alertText = "Critical";
                      } else if (quantity <= minLevel + 5) {
                        bgColor = "#fff7e6"; 
                        badgeColor = "#fa8c16";
                        alertText = "Low";
                      }

                      return (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 12px",
                            backgroundColor: bgColor,
                            borderRadius: 8,
                            marginBottom:
                              index < lowStockMedicals.length - 1 ? 12 : 0,
                          }}
                        >
                          <div>
                            <Text strong>{itemName}</Text>
                            <div style={{fontSize: 12, color: "#888"}}>
                              In stock: <b>{quantity}</b> (Min: {minLevel})
                            </div>
                          </div>
                          <Badge
                            count={quantity}
                            style={{
                              backgroundColor: badgeColor,
                              color: "#fff",
                              fontWeight: 700,
                              boxShadow: `0 0 0 1px ${badgeColor} inset`,
                            }}
                            title={alertText}
                          />
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
                      const details = item[itemName];
                      const {daysLeft} = details;
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
                      <CheckCircleOutlined style={{fontSize: 26}} />
                      <Text>No expiring items in the next 30 days</Text>
                    </Space>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      <Modal
        open={healthCheckModal.open}
        onCancel={() => setHealthCheckModal({...healthCheckModal, open: false})}
        footer={null}
        title={`Health Check Results - ${
          healthCheckModal.status.charAt(0).toUpperCase() +
          healthCheckModal.status.slice(1)
        }`}
        width={1000} 
      >
        {healthCheckModal.loading ? (
          <Spin />
        ) : (
          <div style={{maxHeight: 400, overflowY: "auto"}}>
            {(() => {
              const statusMap = {
                completed: 0,
                pending: 1,
                failed: 2,
                declined: 3,
              };
              const apiDataIdx = statusMap[healthCheckModal.status];
              const apiData = healthChecksRaw?.[apiDataIdx]?.item || {};
              const details = apiData.details || [];
              const isFailed = healthCheckModal.status === "failed";
              const getValue = (val) =>
                isFailed && (val === null || val === undefined || val === "")
                  ? "Failed"
                  : val ?? "";

              // Group by student name
              const grouped = {};
              details.forEach((detail) => {
                const studentName = detail.name;
                if (!grouped[studentName]) grouped[studentName] = [];
                grouped[studentName].push(detail);
              });

              return Object.entries(grouped).map(
                ([studentName, studentDetails], idx) => {
                  const detail = studentDetails[0];
                  const item =
                    healthCheckModal.data.find(
                      (d) => d && d.resultId == detail.id
                    ) || {};
                  return (
                    <div key={idx} style={{marginBottom: 24}}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 16,
                          color: "#22336b",
                          marginBottom: 8,
                        }}
                      >
                        {studentName}
                      </div>
                      <Table
                        dataSource={[
                          {
                            key: 1,
                            datePerformed: getValue(
                              item.datePerformed
                                ? dayjs(item.datePerformed).format("DD/MM/YYYY")
                                : ""
                            ),
                            recordedBy: getValue(
                              item.recordedBy?.nurseName || ""
                            ),
                            height: getValue(item.height),
                            weight: getValue(item.weight),
                            visionLeft: getValue(item.visionLeft),
                            visionRight: getValue(item.visionRight),
                            hearing: getValue(item.hearing),
                            nose: getValue(item.nose),
                            bloodPressure: getValue(item.bloodPressure),
                            status: item.status || healthCheckModal.status,
                          },
                        ]}
                        columns={[
                          {
                            title: "Date",
                            dataIndex: "datePerformed",
                            key: "datePerformed",
                          },
                          {
                            title: "Recorded By",
                            dataIndex: "recordedBy",
                            key: "recordedBy",
                          },
                          {title: "Height", dataIndex: "height", key: "height"},
                          {title: "Weight", dataIndex: "weight", key: "weight"},
                          {
                            title: "Vision Left",
                            dataIndex: "visionLeft",
                            key: "visionLeft",
                          },
                          {
                            title: "Vision Right",
                            dataIndex: "visionRight",
                            key: "visionRight",
                          },
                          {
                            title: "Hearing",
                            dataIndex: "hearing",
                            key: "hearing",
                          },
                          {title: "Nose", dataIndex: "nose", key: "nose"},
                          {
                            title: "Blood Pressure",
                            dataIndex: "bloodPressure",
                            key: "bloodPressure",
                          },
                          {
                            title: "Status",
                            dataIndex: "status",
                            key: "status",
                            render: (status) => {
                              let color = "default";
                              let text = status;
                              if (
                                status === true ||
                                status === "Completed" ||
                                status === "completed"
                              ) {
                                color = "#52c41a";
                                text = "Completed";
                              } else if (
                                status === false ||
                                status === "failed" ||
                                status === "Failed"
                              ) {
                                color = "#f5222d";
                                text = "Failed";
                              } else if (
                                status === "Pending" ||
                                status === "pending"
                              ) {
                                color = "#faad14";
                                text = "Pending";
                              } else if (
                                status === "Declined" ||
                                status === "declined"
                              ) {
                                color = "#8c8c8c";
                                text = "Declined";
                              }
                              return (
                                <Tag
                                  color={
                                    color !== "default" ? color : undefined
                                  }
                                >
                                  {text}
                                </Tag>
                              );
                            },
                          },
                        ]}
                        pagination={false}
                        bordered
                        size="small"
                      />
                    </div>
                  );
                }
              );
            })()}
          </div>
        )}
      </Modal>

      <Modal
        open={requestModalOpen}
        onCancel={() => setRequestModalOpen(false)}
        footer={null}
        title="Medical Request Detail"
        width={1000} 
      >
        {requestLoading ? (
          <Spin />
        ) : (
          <div style={{maxHeight: 400, overflowY: "auto"}}>
            {(() => {
              const grouped = {};
              requestDetail.forEach((item) => {
                const nurseName = item.nurseInfo?.fullName || "Unknown Nurse";
                if (!grouped[nurseName]) grouped[nurseName] = [];
                grouped[nurseName].push(item);
              });

              return Object.entries(grouped).map(([nurseName, items], idx) => (
                <div key={idx} style={{marginBottom: 24}}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 16,
                      color: "#22336b",
                      marginBottom: 8,
                    }}
                  >
                    {nurseName}
                  </div>
                  <Table
                    dataSource={items.map((item, i) => ({
                      key: i,
                      itemName: item.medicalInfo?.itemName,
                      quantity: item.medicalInfo?.requestQuantity,
                      requestedDate: item.medicalInfo?.requestDate
                        ? dayjs(item.medicalInfo.requestDate).format(
                            "DD/MM/YYYY"
                          )
                        : "",
                    }))}
                    columns={[
                      {
                        title: "Item Name",
                        dataIndex: "itemName",
                        key: "itemName",
                      },
                      {
                        title: "Quantity",
                        dataIndex: "quantity",
                        key: "quantity",
                      },
                      {
                        title: "Requested Date",
                        dataIndex: "requestedDate",
                        key: "requestedDate",
                      },
                    ]}
                    pagination={false}
                    bordered
                    size="small"
                  />
                </div>
              ));
            })()}
          </div>
        )}
      </Modal>

      <Modal
        open={vaccinationModal.open}
        onCancel={() => setVaccinationModal({...vaccinationModal, open: false})}
        footer={null}
        title={`Vaccination Results - ${
          vaccinationModal.status.charAt(0).toUpperCase() +
          vaccinationModal.status.slice(1)
        }`}
        width={1000}
      >
        {vaccinationModal.loading ? (
          <Spin />
        ) : (
          <div style={{maxHeight: 400, overflowY: "auto"}}>
            {(() => {
              const statusMap = {
                completed: 0,
                pending: 1,
                failed: 2,
                declined: 3,
                notQualified: 4,
              };
              const apiDataIdx = statusMap[vaccinationModal.status];
              const apiData = vaccinationsRaw?.[apiDataIdx]?.item || {};
              const details = apiData.details || [];
              const isFailed = vaccinationModal.status === "failed";
              const isNotQualified = vaccinationModal.status === "notQualified";
              const renderStatusTag = (status) => {
                let color = "default";
                let text = status;
                if (
                  status === true ||
                  status === "Completed" ||
                  status === "completed"
                ) {
                  color = "#52c41a";
                  text = "Completed";
                } else if (
                  status === false ||
                  status === "failed" ||
                  status === "Failed"
                ) {
                  color = "#f5222d";
                  text = "Failed";
                } else if (status === "Pending" || status === "pending") {
                  color = "#faad14";
                  text = "Pending";
                } else if (status === "Declined" || status === "declined") {
                  color = "#8c8c8c";
                  text = "Declined";
                } else if (
                  status === "Not Qualified" ||
                  status === "notQualified"
                ) {
                  color = "#fa8c16";
                  text = "Not Qualified";
                }
                return (
                  <Tag color={color !== "default" ? color : undefined}>
                    {text}
                  </Tag>
                );
              };
              const getValue = (val) => {
                if (
                  isFailed &&
                  (val === null || val === undefined || val === "")
                ) {
                  return renderStatusTag("Failed");
                }
                if (
                  isNotQualified &&
                  (val === null || val === undefined || val === "")
                ) {
                  return renderStatusTag("Not Qualified");
                }
                return val ?? "";
              };

              const resultMap = {};
              vaccinationModal.data.forEach((item) => {
                if (item?.resultResponse?.vaccinationResultId) {
                  resultMap[item.resultResponse.vaccinationResultId] = item;
                } else if (item?.id) {
                  resultMap[item.id] = item;
                }
              });

              const grouped = {};
              details.forEach((detail) => {
                const studentName = detail.name;
                if (!grouped[studentName]) grouped[studentName] = [];
                grouped[studentName].push(detail);
              });

              return Object.entries(grouped).map(
                ([studentName, studentDetails], idx) => {
                  const detail = studentDetails[0];
                  const item = resultMap[detail.id] || {};
                  const result = item.resultResponse || {};
                  const obs = item.vaccinationObservation || {};

                  return (
                    <div key={idx} style={{marginBottom: 24}}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 16,
                          color: "#22336b",
                          marginBottom: 8,
                        }}
                      >
                        {studentName}
                      </div>
                      <Table
                        dataSource={[
                          {
                            key: 1,
                            vaccinatedDate: getValue(
                              result.vaccinatedDate
                                ? dayjs(result.vaccinatedDate).format(
                                    "YYYY-MM-DD"
                                  )
                                : ""
                            ),
                            injectionSite: getValue(result.injectionSite),
                            parentConfirmed: getValue(
                              result.parentConfirmed !== undefined
                                ? result.parentConfirmed
                                  ? "Yes"
                                  : "No"
                                : ""
                            ),
                            healthQualified: getValue(
                              result.healthQualified !== undefined
                                ? result.healthQualified
                                  ? "Yes"
                                  : "No"
                                : ""
                            ),
                            status: result.status || vaccinationModal.status,
                            observedBy: getValue(obs.observedBy),
                            reactionType: getValue(obs.reactionType),
                            severityLevel: getValue(obs.severityLevel),
                            immediateReaction: getValue(obs.immediateReaction),
                            intervention: getValue(obs.intervention),
                          },
                        ]}
                        columns={[
                          {
                            title: "Date",
                            dataIndex: "vaccinatedDate",
                            key: "vaccinatedDate",
                          },
                          {
                            title: "Injection Site",
                            dataIndex: "injectionSite",
                            key: "injectionSite",
                          },
                          {
                            title: "Parent Confirmed",
                            dataIndex: "parentConfirmed",
                            key: "parentConfirmed",
                          },
                          {
                            title: "Health Qualified",
                            dataIndex: "healthQualified",
                            key: "healthQualified",
                          },
                          {
                            title: "Observed By",
                            dataIndex: "observedBy",
                            key: "observedBy",
                          },
                          {
                            title: "Reaction Type",
                            dataIndex: "reactionType",
                            key: "reactionType",
                          },
                          {
                            title: "Severity Level",
                            dataIndex: "severityLevel",
                            key: "severityLevel",
                          },
                          {
                            title: "Immediate Reaction",
                            dataIndex: "immediateReaction",
                            key: "immediateReaction",
                          },
                          {
                            title: "Intervention",
                            dataIndex: "intervention",
                            key: "intervention",
                          },
                          {
                            title: "Status",
                            dataIndex: "status",
                            key: "status",
                            render: (status) => renderStatusTag(status),
                          },
                        ]}
                        pagination={false}
                        bordered
                        size="small"
                      />
                    </div>
                  );
                }
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagerDashboard;
