import React, {useState, useEffect} from "react";
import {
  Card,
  Select,
  Button,
  Spin,
  Tag,
  Typography,
  DatePicker,
  Radio,
  Space,
  Empty,
  Row,
  Col,
  Descriptions,
  Tabs,
  Divider,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  BookOutlined,
  ReloadOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axiosInstance from "../../../api/axios";

const {Title, Text, Paragraph} = Typography;
const {Option} = Select;
const {TabPane} = Tabs;

// Function to generate weeks in a year
const generateWeekRanges = () => {
  const currentYear = new Date().getFullYear();
  const weeks = [];

  // Start from January 1st of the year
  let currentDate = new Date(currentYear, 0, 1);

  // Find the first Monday of the year
  const dayOfWeek = currentDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  currentDate.setDate(currentDate.getDate() + daysToMonday);

  while (currentDate.getFullYear() === currentYear) {
    const startOfWeek = new Date(currentDate);
    const endOfWeek = new Date(currentDate);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startFormatted = startOfWeek.toISOString().split("T")[0];
    const endFormatted = endOfWeek.toISOString().split("T")[0];

    // Format for display
    const startDisplay = `${startOfWeek
      .getDate()
      .toString()
      .padStart(2, "0")}/${(startOfWeek.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    const endDisplay = `${endOfWeek.getDate().toString().padStart(2, "0")}/${(
      endOfWeek.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}`;

    weeks.push({
      display: `${startDisplay} to ${endDisplay}`,
      startDate: startFormatted,
      endDate: endFormatted,
      value: `${startFormatted}_${endFormatted}`,
    });

    // Move to next week
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return weeks;
};

// Function to find the week containing the current date
const getCurrentWeek = (weekRanges) => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  return weekRanges.find((week) => {
    const startDate = new Date(week.startDate);
    const endDate = new Date(week.endDate);
    const currentDate = new Date(todayStr);

    return currentDate >= startDate && currentDate <= endDate;
  });
};

const Timeable = () => {
  const [selectedWeek, setSelectedWeek] = useState("");
  const [weekRanges, setWeekRanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vaccinationRounds, setVaccinationRounds] = useState([]);
  const [healthCheckRounds, setHealthCheckRounds] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewMode, setViewMode] = useState("week");
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("vaccination"); // New state for tab selection
  const userId = localStorage.getItem("userId");

  // Function to call Vaccination API
  const fetchVaccinationRounds = async (userId, start, end) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(
        `/api/parents/${userId}/vaccination-rounds/students?start=${start}&end=${end}`
      );
      setVaccinationRounds(response.data);
    } catch (error) {
      console.error("Error fetching vaccination rounds:", error);
      setError(
        "An error occurred while loading vaccination data. Please try again later."
      );
      setVaccinationRounds([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to call Health Check API
  const fetchHealthCheckRounds = async (userId, start, end) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(
        `/api/parents/${userId}/health-check-rounds/students?start=${start}&end=${end}`
      );
      setHealthCheckRounds(response.data);
    } catch (error) {
      console.error("Error fetching health check rounds:", error);
      setError(
        "An error occurred while loading health check data. Please try again later."
      );
      setHealthCheckRounds([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch data based on active tab
  const fetchData = (userId, start, end) => {
    if (activeTab === "vaccination") {
      fetchVaccinationRounds(userId, start, end);
    } else {
      fetchHealthCheckRounds(userId, start, end);
    }
  };

  // Update when selecting a week from dropdown
  const handleWeekChange = (weekValue) => {
    setSelectedWeek(weekValue);

    // Find the selected week from the list
    const selectedWeekData = weekRanges.find(
      (week) => week.value === weekValue
    );
    if (selectedWeekData) {
      // Call API with startDate and endDate based on active tab
      fetchData(userId, selectedWeekData.startDate, selectedWeekData.endDate);

      // Update state for custom date range
      setStartDate(selectedWeekData.startDate);
      setEndDate(selectedWeekData.endDate);
    }
  };

  // Handle custom date range selection
  const handleCustomDateRange = () => {
    if (startDate && endDate) {
      fetchData(userId, startDate, endDate);
    }
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    // Reload data for the selected tab
    if (startDate && endDate) {
      if (key === "vaccination") {
        fetchVaccinationRounds(userId, startDate, endDate);
      } else {
        fetchHealthCheckRounds(userId, startDate, endDate);
      }
    }
  };

  // Format time
  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    return dayjs(dateTimeStr).format("HH:mm");
  };

  // Format date
  const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    return dayjs(dateTimeStr).format("DD/MM/YYYY");
  };

  useEffect(() => {
    // Generate list of weeks in the year
    const weeks = generateWeekRanges();
    setWeekRanges(weeks);

    // Find the current week
    const currentWeek = getCurrentWeek(weeks);
    if (currentWeek) {
      setSelectedWeek(currentWeek.value);
      setStartDate(currentWeek.startDate);
      setEndDate(currentWeek.endDate);

      // Fetch data for the current week based on active tab
      if (activeTab === "vaccination") {
        fetchVaccinationRounds(
          userId,
          currentWeek.startDate,
          currentWeek.endDate
        );
      } else {
        fetchHealthCheckRounds(
          userId,
          currentWeek.startDate,
          currentWeek.endDate
        );
      }
    }
  }, [userId, activeTab]);

  // Vaccination Rounds Component
  const VaccinationRoundsContent = () => (
    <div className="space-y-4">
      {vaccinationRounds.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Empty
              description="No vaccination schedules found in this date range"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        </Card>
      ) : (
        vaccinationRounds.map((round, index) => (
          <Card key={index} className="mb-4">
            <Row gutter={24}>
              {/* Vaccination Round Information */}
              <Col xs={24} lg={16}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <Title level={4} style={{marginBottom: 8}}>
                      {round.vaccinationRoundInformation.roundName}
                    </Title>
                    <Space className="mb-2">
                      <div>
                        <ClockCircleOutlined />
                        <Text>
                          {formatDate(
                            round.vaccinationRoundInformation.startTime
                          )}{" "}
                          -
                          {formatTime(
                            round.vaccinationRoundInformation.startTime
                          )}{" "}
                          to{" "}
                          {formatTime(
                            round.vaccinationRoundInformation.endTime
                          )}
                        </Text>
                      </div>
                      <div>
                        <BookOutlined />
                        <Text>
                          Class {round.vaccinationRoundInformation.targetGrade}
                        </Text>
                      </div>
                    </Space>
                  </div>
                  <Tag
                    color={
                      round.vaccinationRoundInformation.status
                        ? "green" // Complete
                        : "orange" // Pending
                    }
                    style={{
                      fontWeight: 600,
                      fontSize: 12,
                      padding: "2px 10px",
                      borderRadius: 12,
                    }}
                  >
                    {round.vaccinationRoundInformation.status
                      ? "Complete"
                      : "Pending"}
                  </Tag>
                </div>
                <div
                  style={{
                    background: "#F9F9F9",
                    borderRadius: 8,
                    padding: "10px 10px",
                  }}
                >
                  <Paragraph
                    style={{
                      margin: 0,
                      color: "#444",
                      fontSize: 15,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <p style={{margin: 0, fontWeight: 600}}>Description:</p>
                    {round.vaccinationRoundInformation.description || (
                      <span style={{color: "#aaa"}}>
                        No description available
                      </span>
                    )}
                  </Paragraph>
                </div>
                {/* Student Information */}
                <Card type="inner" title="Student Information" className="mt-4">
                  <Descriptions column={{xs: 1, sm: 2}} size="small">
                    <Descriptions.Item label="Full Name">
                      {round.student.fullName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Student ID">
                      {round.student.studentCode}
                    </Descriptions.Item>
                    <Descriptions.Item label="Date of Birth">
                      {formatDate(round.student.dayOfBirth)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Gender">
                      {round.student.gender}
                    </Descriptions.Item>
                    <Descriptions.Item label="Class">
                      {round.student.grade?.trim()}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              {/* Nurse and Parent Information */}
              <Col xs={24} lg={8}>
                {/* Nurse Information */}
                <Card
                  type="inner"
                  title={
                    <Space>
                      <UserOutlined />
                      <span>Nurse in Charge</span>
                    </Space>
                  }
                  className="mb-4"
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Name">
                      {round.nurse.nurseName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                      <Space>
                        <PhoneOutlined />
                        <span>{round.nurse.phoneNumber}</span>
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                {/* Parent Information */}
                <Card type="inner" title="Parent Information">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Name">
                      {round.parent.fullName || "Not updated"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                      <Space>
                        <PhoneOutlined />
                        <span>{round.parent.phoneNumber}</span>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Confirmation">
                      <Tag
                        color={round.parent.parentConfirm ? "success" : "error"}
                      >
                        {round.parent.parentConfirm
                          ? "Confirmed"
                          : "Declined"}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </Card>
        ))
      )}
    </div>
  );

  // Health Check Rounds Component
  const HealthCheckRoundsContent = () => (
    <div className="space-y-4">
      {healthCheckRounds.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Empty
              description="No health check schedules found in this date range"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        </Card>
      ) : (
        healthCheckRounds.map((round, index) => (
          <Card key={index} className="mb-4">
            <Row gutter={24}>
              {/* Health Check Round Information */}
              <Col xs={24} lg={16}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Title level={4} style={{marginBottom: 8}}>
                      {round.healthCheckRoundInformationResponse.roundName}
                    </Title>
                    <Space className="mb-2">
                      <ClockCircleOutlined />
                      <Text>
                        {formatDate(
                          round.healthCheckRoundInformationResponse.startTime
                        )}{" "}
                        -
                        {formatTime(
                          round.healthCheckRoundInformationResponse.startTime
                        )}{" "}
                        to{" "}
                        {formatTime(
                          round.healthCheckRoundInformationResponse.endTime
                        )}
                      </Text>
                      <BookOutlined />
                      <Text>
                        Class{" "}
                        {round.healthCheckRoundInformationResponse.targetGrade}
                      </Text>
                    </Space>
                  </div>
                  <Tag
                    color={
                      round.healthCheckRoundInformationResponse.status
                        ? "success"
                        : "default"
                    }
                  >
                    {round.healthCheckRoundInformationResponse.status
                      ? "Active"
                      : "Inactive"}
                  </Tag>
                </div>

                <Paragraph>
                  {round.healthCheckRoundInformationResponse.description ||
                    "No description available"}
                </Paragraph>

                {/* Student Information */}
                <Card type="inner" title="Student Information" className="mt-4">
                  <Descriptions column={{xs: 1, sm: 2}} size="small">
                    <Descriptions.Item label="Full Name">
                      {round.student.fullName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Student ID">
                      {round.student.studentCode}
                    </Descriptions.Item>
                    <Descriptions.Item label="Date of Birth">
                      {formatDate(round.student.dayOfBirth)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Gender">
                      {round.student.gender}
                    </Descriptions.Item>
                    <Descriptions.Item label="Class">
                      {round.student.grade?.trim()}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              {/* Nurse and Parent Information */}
              <Col xs={24} lg={8}>
                {/* Nurse Information */}
                <Card
                  type="inner"
                  title={
                    <Space>
                      <UserOutlined />
                      <span>Nurse in Charge</span>
                    </Space>
                  }
                  className="mb-4"
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Name">
                      {round.healthCheckRoundNurseInformationResponse.nurseName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                      <Space>
                        <PhoneOutlined />
                        <span>
                          {
                            round.healthCheckRoundNurseInformationResponse
                              .phoneNumber
                          }
                        </span>
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                {/* Parent Information */}
                <Card type="inner" title="Parent Information">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Name">
                      {round.parent.fullName || "Not updated"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                      <Space>
                        <PhoneOutlined />
                        <span>{round.parent.phoneNumber}</span>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Confirmation">
                      <Tag
                        color={round.parent.parentConfirm ? "success" : "error"}
                      >
                        {round.parent.parentConfirm
                          ? "Confirmed"
                          : "Not confirmed"}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="container mx-auto py-4 px-4">
      {/* Header Card */}
      <Card className="mb-4">
        <div className="flex flex-wrap justify-between items-center">
          <Title level={4} style={{margin: 0}}>
            <CalendarOutlined style={{marginRight: 8}} />
            Schedules
          </Title>

          <div className="flex flex-wrap items-center gap-4 mt-4 md:mt-0">
            {/* Toggle View Mode */}
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button
                style={{
                  background: viewMode === "week" ? "#355383" : "transparent",
                  border: "1px solid #355383",
                }}
                value="week"
              >
                Weekly View
              </Radio.Button>
              <Radio.Button
                style={{
                  background: viewMode === "custom" ? "#355383" : "transparent",
                  border: "1px solid #355383",
                }}
                value="custom"
              >
                Custom Range
              </Radio.Button>
            </Radio.Group>

            {viewMode === "week" ? (
              /* Week View */
              <Select
                style={{width: 200}}
                value={selectedWeek}
                onChange={handleWeekChange}
                placeholder="Select week"
              >
                {weekRanges.map((week, index) => (
                  <Option key={index} value={week.value}>
                    {week.display}
                  </Option>
                ))}
              </Select>
            ) : (
              /* Custom Date Range */
              <Space align="center">
                <DatePicker
                  value={startDate ? dayjs(startDate) : null}
                  onChange={(date) =>
                    setStartDate(date ? date.format("YYYY-MM-DD") : "")
                  }
                  placeholder="Start date"
                />
                <DatePicker
                  value={endDate ? dayjs(endDate) : null}
                  onChange={(date) =>
                    setEndDate(date ? date.format("YYYY-MM-DD") : "")
                  }
                  placeholder="End date"
                />
                <Button
                  style={{
                    background: "#355383",
                    border: "1px solid #355383",
                    color: "#fff",
                  }}
                  onClick={handleCustomDateRange}
                  disabled={!startDate || !endDate}
                >
                  Search
                </Button>
              </Space>
            )}
          </div>
        </div>

        {/* Display current date range */}
        <div style={{marginTop: 16}}>
          {viewMode === "week" && selectedWeek && (
            <Text type="secondary">
              Date range:{" "}
              {weekRanges.find((w) => w.value === selectedWeek)?.display || ""}
            </Text>
          )}
          {viewMode === "custom" && startDate && endDate && (
            <Text type="secondary">
              From {formatDate(startDate)} to {formatDate(endDate)}
            </Text>
          )}
        </div>
      </Card>

      {/* Tabs to switch between Vaccination and Health Check */}
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane
          tab={
            <span style={{color: "#355383"}}>
              <MedicineBoxOutlined /> Vaccination
            </span>
          }
          key="vaccination"
        >
          {/* Content */}
          {loading ? (
            <div className="text-center py-12">
              <Spin size="large" />
              <div className="mt-3">Loading vaccination data...</div>
            </div>
          ) : error ? (
            <Card>
              <div className="text-center py-12">
                <Title level={5} type="danger">
                  {error}
                </Title>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    if (viewMode === "week" && selectedWeek) {
                      handleWeekChange(selectedWeek);
                    } else if (viewMode === "custom" && startDate && endDate) {
                      handleCustomDateRange();
                    }
                  }}
                  style={{marginTop: 16}}
                >
                  Try Again
                </Button>
              </div>
            </Card>
          ) : (
            <VaccinationRoundsContent />
          )}
        </TabPane>

        <TabPane
          tab={
            <span style={{color: "#355383"}}>
              <HeartOutlined /> Health Check
            </span>
          }
          key="healthCheck"
        >
          {/* Content */}
          {loading ? (
            <div className="text-center py-12">
              <Spin size="large" />
              <div className="mt-3">Loading health check data...</div>
            </div>
          ) : error ? (
            <Card>
              <div className="text-center py-12">
                <Title level={5} type="danger">
                  {error}
                </Title>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    if (viewMode === "week" && selectedWeek) {
                      handleWeekChange(selectedWeek);
                    } else if (viewMode === "custom" && startDate && endDate) {
                      handleCustomDateRange();
                    }
                  }}
                  style={{marginTop: 16}}
                >
                  Try Again
                </Button>
              </div>
            </Card>
          ) : (
            <HealthCheckRoundsContent />
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Timeable;
