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
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  BookOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axiosInstance from "../../../api/axios";

const {Title, Text, Paragraph} = Typography;
const {Option} = Select;

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

const VaccineTimeable = () => {
  const [selectedWeek, setSelectedWeek] = useState("");
  const [weekRanges, setWeekRanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vaccinationRounds, setVaccinationRounds] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewMode, setViewMode] = useState("week");
  const [error, setError] = useState(null);
  const userId =
    localStorage.getItem("userId") || "4BE8652A-C665-423C-9092-631003922F0A";

  // Function to call API
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
      setError("An error occurred while loading data. Please try again later.");
      setVaccinationRounds([]);
    } finally {
      setLoading(false);
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
      // Call API with startDate and endDate
      fetchVaccinationRounds(
        userId,
        selectedWeekData.startDate,
        selectedWeekData.endDate
      );

      // Update state for custom date range
      setStartDate(selectedWeekData.startDate);
      setEndDate(selectedWeekData.endDate);
    }
  };

  // Handle custom date range selection
  const handleCustomDateRange = () => {
    if (startDate && endDate) {
      fetchVaccinationRounds(userId, startDate, endDate);
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
    return dayjs(dateTimeStr).format("MM/DD/YYYY");
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

      // Fetch data for the current week
      fetchVaccinationRounds(
        userId,
        currentWeek.startDate,
        currentWeek.endDate
      );
    }
  }, [userId]);

  return (
    <div className="container mx-auto py-4 px-4">
      {/* Header Card */}
      <Card className="mb-4">
        <div className="flex flex-wrap justify-between items-center">
          <Title level={4} style={{margin: 0}}>
            <CalendarOutlined style={{marginRight: 8}} />
            Vaccination Schedule
          </Title>

          <div className="flex flex-wrap items-center gap-4 mt-4 md:mt-0">
            {/* Toggle View Mode */}
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="week">Weekly View</Radio.Button>
              <Radio.Button value="custom">Custom Range</Radio.Button>
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
                  type="primary"
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

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <Spin size="large" />
          <div className="mt-3">Loading data...</div>
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
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Title level={4} style={{marginBottom: 8}}>
                          {round.vaccinationRoundInformation.roundName}
                        </Title>
                        <Space className="mb-2">
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
                          <BookOutlined />
                          <Text>
                            Class{" "}
                            {round.vaccinationRoundInformation.targetGrade}
                          </Text>
                        </Space>
                      </div>
                      <Tag
                        color={
                          round.vaccinationRoundInformation.status
                            ? "success"
                            : "default"
                        }
                      >
                        {round.vaccinationRoundInformation.status
                          ? "Active"
                          : "Inactive"}
                      </Tag>
                    </div>

                    <Paragraph>
                      {round.vaccinationRoundInformation.description ||
                        "No description available"}
                    </Paragraph>

                    {/* Student Information */}
                    <Card
                      type="inner"
                      title="Student Information"
                      className="mt-4"
                    >
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
                            color={
                              round.parent.parentConfirm ? "success" : "error"
                            }
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
      )}
    </div>
  );
};

export default VaccineTimeable;
