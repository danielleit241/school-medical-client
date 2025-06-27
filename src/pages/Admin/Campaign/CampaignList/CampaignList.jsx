import React, {useEffect, useState} from "react";
import axiosInstance from "../../../../api/axios";
import {
  Card,
  Spin,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Progress,
  Tag,
  Collapse,
  Empty,
  message,
  Tabs,
  Tooltip,
} from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PlayCircleOutlined,
  UpOutlined,
  DownOutlined,
  FileTextOutlined,
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import EditVaccineCampaignModal from "./EditVaccineCampaignModal";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const {Text, Title} = Typography;
const {Panel} = Collapse;
const {TabPane} = Tabs;

const CampaignList = () => {
  const roleName = useSelector((state) => state.user?.role);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  // eslint-disable-next-line no-unused-vars
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [roundData, setRoundData] = useState({});
  const [loadingRounds, setLoadingRounds] = useState({});
  const navigate = useNavigate();

  const fetchRoundDetails = async (scheduleId, forceRefresh = false) => {
    if (roundData[scheduleId] && !forceRefresh) return;

    setLoadingRounds((prev) => ({...prev, [scheduleId]: true}));

    try {
      const response = await axiosInstance.get(
        `/api/vaccinations/schedules/${scheduleId}`
      );
      const rounds = response.data.vaccinationRounds || [];

      const roundsWithProgress = await Promise.all(
        rounds.map(async (round) => {
          try {
            const studentsRes = await axiosInstance.get(
              `/api/managers/vaccination-rounds/${round.roundId}/students`
            );

            const students = studentsRes.data.items || [];
            const totalStudents = students.length;
            const completedStudents = students.filter(
              (student) =>
                student.studentsOfRoundResponse?.vaccinationStatus ===
                "Completed"
            ).length;

            return {
              ...round,
              students,
              totalStudents,
              completedStudents,
              progress: totalStudents
                ? Math.round((completedStudents / totalStudents) * 100)
                : 0,
            };
          } catch (error) {
            console.error(
              `Error fetching students for round ${round.roundId}:`,
              error
            );
            return {
              ...round,
              students: [],
              totalStudents: 0,
              completedStudents: 0,
              progress: 0,
              error: true,
            };
          }
        })
      );

      setRoundData((prev) => ({
        ...prev,
        [scheduleId]: roundsWithProgress,
      }));
    } catch (error) {
      console.error("Error fetching round details:", error);
    } finally {
      setLoadingRounds((prev) => ({...prev, [scheduleId]: false}));
    }
  };

  const refreshAllRoundData = () => {
    setRefreshing(true);

    // Reset state để tất cả hiển thị loading
    const initialLoadingState = {};
    data.forEach((item) => {
      const scheduleId = item.vaccinationScheduleResponseDto.scheduleId;
      initialLoadingState[scheduleId] = true;
    });

    setLoadingRounds(initialLoadingState);
    setRoundData({});

    Promise.all(
      data.map((item) =>
        fetchRoundDetails(item.vaccinationScheduleResponseDto.scheduleId, true)
      )
    ).finally(() => {
      setRefreshing(false);
      message.success("All vaccination data refreshed successfully");
    });
  };

  const getStatusConfig = (record) => {
    // Lấy trạng thái từ response data
    const status = record.vaccinationScheduleResponseDto.status;

    // Lấy ngày hiện tại và các ngày từ response
    const now = dayjs();
    const startDate = dayjs(record.vaccinationScheduleResponseDto.startDate);
    const endDate = dayjs(record.vaccinationScheduleResponseDto.endDate);

    // Nếu status là true, đây là trạng thái "Completed"
    if (status === true) {
      return {
        color: "#52c41a",
        bgColor: "#f6ffed",
        text: "Completed",
        status: "completed",
      };
    }
    // Nếu status là false, phân loại thành "In Progress" hoặc "Scheduled" dựa trên ngày
    else {
      // Nếu ngày hiện tại nằm trong khoảng thời gian của lịch tiêm
      if (now.isAfter(startDate) && now.isBefore(endDate)) {
        return {
          color: "#1890ff",
          bgColor: "#e6f7ff",
          text: "In Progress",
          status: "inProgress",
        };
      }
      // Nếu chưa đến ngày bắt đầu
      else if (now.isBefore(startDate)) {
        return {
          color: "#faad14",
          bgColor: "#fff7e6",
          text: "Scheduled",
          status: "scheduled",
        };
      }
      // Nếu đã qua ngày kết thúc nhưng status vẫn là false
      else {
        return {
          color: "#f5222d",
          bgColor: "#fff1f0",
          text: "Expired",
          status: "expired",
        };
      }
    }
  };

  const fetchData = () => {
    setLoading(true);
    axiosInstance
      .get("/api/vaccinations/schedules")
      .then((res) => {
        // Sắp xếp dữ liệu theo createdAt (mới nhất lên đầu)
        const sortedData = [...(res.data?.items || [])].sort((a, b) => {
          const dateA = new Date(a.vaccinationScheduleResponseDto.createdAt);
          const dateB = new Date(b.vaccinationScheduleResponseDto.createdAt);
          return dateB - dateA;
        });

        const mapSchedule = (
          Array.isArray(res.data?.items) ? res.data.items : []
        ).map((item) => ({
          vaccineId: item.vaccinationScheduleResponseDto.vaccineId,
          title: item.vaccinationScheduleResponseDto.title,
          description: item.vaccinationScheduleResponseDto.description,
          startDate: item.vaccinationScheduleResponseDto.startDate,
          endDate: item.vaccinationScheduleResponseDto.endDate,
          scheduleId: item.vaccinationScheduleResponseDto.scheduleId,
          createdBy: item.vaccinationScheduleResponseDto.createdBy,
          ...item,
        }));

        setSchedule(mapSchedule);
        setData(sortedData);
        filterDataByTab(sortedData, activeTab);
        setPagination({
          current: res.data?.pageIndex || 1,
          pageSize: res.data?.pageSize || 10,
          total: res.data?.count || 0,
        });

        // Fetch round details for all campaigns
        sortedData.forEach((item) => {
          fetchRoundDetails(item.vaccinationScheduleResponseDto.scheduleId);
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditModalClose = (reload = false) => {
    setEditModalOpen(false);
    setEditCampaign(null);
    if (reload) fetchData();
  };

  const filterDataByTab = (data, tab) => {
    if (tab === "all") {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter((record) => {
      const statusConfig = getStatusConfig(record);
      return statusConfig.status === tab;
    });

    setFilteredData(filtered);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    filterDataByTab(data, key);
  };

  const handleAddNewCampaign = () => {
    navigate(`/${roleName}/vaccine/create`);
  };

  const CampaignCard = ({record}) => {
    const scheduleId = record.vaccinationScheduleResponseDto.scheduleId;
    const rounds = roundData[scheduleId] || [];
    const isLoadingRounds = loadingRounds[scheduleId];
    const statusConfig = getStatusConfig(record);
    const [expanded, setExpanded] = useState(false);

    const startDate = dayjs(record.vaccinationScheduleResponseDto.startDate);
    const endDate = dayjs(record.vaccinationScheduleResponseDto.endDate);
    const now = dayjs();
    const isInRange =
      now.isSameOrAfter(startDate, "day") && now.isSameOrBefore(endDate, "day");

    const toggleExpand = () => {
      setExpanded(!expanded);
      if (!expanded && !roundData[scheduleId]) {
        fetchRoundDetails(scheduleId);
      }
    };

    return (
      <Card
        className="campaign-card"
        style={{
          marginBottom: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          border: "1px solid #f0f0f0",
          overflow: "hidden",
          transition: "all 0.3s ease",
          cursor: "pointer",
        }}
        bodyStyle={{padding: 0}}
        onClick={(e) => {
          // Chỉ toggle khi click vào vùng không có button
          if (
            !e.target.closest("button") &&
            !e.target.closest(".ant-progress") &&
            !e.target.closest(".campaign-icons")
          ) {
            toggleExpand();
          }
        }}
      >
        {/* Header Section */}
        <div
          style={{
            padding: "14px 24px 14px",
            background: "linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%)",
            borderBottom: expanded ? "1px solid #f0f0f0" : "none",
          }}
        >
          <Row
            justify="space-between"
            align="middle"
            style={{marginBottom: 12}}
          >
            <Col>
              <Space align="center">
                <Title level={4} style={{margin: 0, color: "#262626"}}>
                  {record.vaccinationScheduleResponseDto.title}
                </Title>
                <Tag
                  color={statusConfig.color}
                  icon={statusConfig.icon}
                  style={{
                    borderRadius: 16,
                    padding: "4px 12px",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {statusConfig.text}
                </Tag>
              </Space>
            </Col>
            <Col>
              <Space size="small">
                <Button
                  style={{borderRadius: 6}}
                  icon={<InfoCircleOutlined style={{margin: 0}} />}
                  onClick={() => {
                    localStorage.setItem("vaccinationScheduleId", scheduleId);
                    navigate(`/${roleName}/vaccine/vaccine-schedule-details/`);
                  }}
                >
                  Details
                </Button>
                <Button
                  icon={<EditOutlined style={{margin: 0}} />}
                  disabled={isInRange}
                  onClick={() => {
                    const found = schedule.find(
                      (item) =>
                        item.vaccinationScheduleResponseDto.scheduleId ===
                        scheduleId
                    );
                    setEditCampaign(found);
                    setEditModalOpen(true);
                  }}
                  style={{borderRadius: 6}}
                >
                  Edit
                </Button>
                <Button
                  type={expanded ? "default" : "default"}
                  size="middle"
                  onClick={toggleExpand}
                  icon={
                    expanded ? (
                      <UpOutlined style={{margin: 0}} />
                    ) : (
                      <DownOutlined style={{margin: 0}} />
                    )
                  }
                  loading={isLoadingRounds && !expanded}
                  style={{borderRadius: 6, fontWeight: 500}}
                >
                  {expanded ? "Hide" : "View More"}
                </Button>
              </Space>
            </Col>
          </Row>

          <Text
            type="secondary"
            style={{fontSize: 14, display: "block", marginBottom: 10}}
          >
            {record.vaccinationScheduleResponseDto.description}
          </Text>

          <Row gutter={24} className="campaign-icons">
            <Col span={8}>
              <Space>
                <CalendarOutlined style={{color: "#1890ff"}} />
                <div>
                  <Text
                    type="secondary"
                    style={{fontSize: 12, display: "block"}}
                  >
                    Time
                  </Text>
                  <Text strong style={{fontSize: 13}}>
                    {startDate.format("DD/MM/YYYY")} -{" "}
                    {endDate.format("DD/MM/YYYY")}
                  </Text>
                </div>
              </Space>
            </Col>

            <Col span={8}>
              <Space>
                <EnvironmentOutlined style={{color: "#52c41a"}} />
                <div>
                  <Text
                    type="secondary"
                    style={{fontSize: 12, display: "block"}}
                  >
                    Location
                  </Text>
                  <Text strong style={{fontSize: 13}}>
                    School Health Room
                  </Text>
                </div>
              </Space>
            </Col>

            <Col span={8}>
              <Space>
                <UserOutlined style={{color: "#faad14"}} />
                <div>
                  <Text
                    type="secondary"
                    style={{fontSize: 12, display: "block"}}
                  >
                    Target
                  </Text>
                  <Text strong style={{fontSize: 13}}>
                    Students
                  </Text>
                </div>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Progress Section - Only visible when expanded */}
        {expanded && (
          <div style={{padding: "20px 24px"}} className="expanded-content">
            {/* Rounds List */}
            {rounds.length > 0 ? (
              <Collapse
                ghost
                expandIconPosition="end"
                style={{
                  background: "#fafafa",
                  borderRadius: 8,
                  border: "1px solid #f0f0f0",
                }}
                defaultActiveKey={["rounds"]}
              >
                <Panel
                  header={
                    <Text strong style={{fontSize: 14}}>
                      Class List ({rounds.length} classes)
                    </Text>
                  }
                  key="rounds"
                >
                  <div style={{padding: "8px 0"}}>
                    {rounds.map((round, index) => {
                      const roundStatusConfig =
                        round.progress >= 100
                          ? {color: "#52c41a", text: "Completed"}
                          : round.progress > 0
                          ? {color: "#1890ff", text: "In Progress"}
                          : {color: "#faad14", text: "Scheduled"};

                      return (
                        <div
                          key={round.roundId}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px 16px",
                            background: "#fff",
                            borderRadius: 6,
                            marginBottom: 8,
                            border: "1px solid #f0f0f0",
                          }}
                        >
                          <div>
                            <Text strong style={{fontSize: 13}}>
                              Round: {round.roundName || `${index + 1}`}
                            </Text>
                            <Tag
                              color={roundStatusConfig.color}
                              style={{
                                marginLeft: 8,
                                borderRadius: 12,
                                fontSize: 11,
                              }}
                            >
                              {roundStatusConfig.text}
                            </Tag>
                          </div>
                          <div style={{textAlign: "right"}}>
                            <Text style={{fontSize: 12, color: "#666"}}>
                              Target: {round.targetGrade}
                            </Text>
                            <div style={{marginTop: 4}}>
                              <Button
                                size="small"
                                type="link"
                                icon={<TeamOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const btn = e.currentTarget;
                                  btn.innerHTML = "Loading...";
                                  btn.disabled = true;
                                  setTimeout(() => {
                                    localStorage.setItem(
                                      "selectedVaccinationRoundId",
                                      round.roundId
                                    );
                                    navigate(
                                      `/${roleName}/vaccine/vaccine-round/student-list`
                                    );
                                  }, 300);
                                }}
                                style={{padding: 0, fontSize: 12}}
                              >
                                View List
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Panel>
              </Collapse>
            ) : isLoadingRounds ? (
              <div style={{textAlign: "center", padding: "20px 0"}}>
                <Spin size="small" />
                <div style={{marginTop: 8, fontSize: 12, color: "#666"}}>
                  Loading classes...
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px 0",
                  background: "#f9f9f9",
                  borderRadius: 8,
                }}
              >
                <Text type="secondary">No classes available</Text>
              </div>
            )}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div style={{padding: 24, background: "#f5f7fa", minHeight: "100vh"}}>
      {/* Header */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Title level={2} style={{margin: 0, color: "#262626"}}>
            Vaccination Schedule Overview
          </Title>
          <Text type="secondary" style={{fontSize: 14}}>
            Monitor progress of vaccination campaigns
          </Text>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={refreshAllRoundData}
            loading={refreshing}
          >
            Refresh Data
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddNewCampaign}
          >
            New Campaign
          </Button>
        </Space>
      </div>

      {/* Tab Filter */}
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        style={{
          marginBottom: 16,
          backgroundColor: "#fff",
          padding: "8px 16px 0",
          borderRadius: 8,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <TabPane
          tab={
            <>
              <span>All</span>
            </>
          }
          key="all"
        />
        <TabPane
          tab={
            <span>
              <ClockCircleOutlined style={{color: "#faad14", marginRight: 4}} />
              <span>Scheduled</span>
            </span>
          }
          key="scheduled"
        />
        <TabPane
          tab={
            <span>
              <PlayCircleOutlined style={{color: "#1890ff", marginRight: 4}} />
              <span>In Progress</span>
            </span>
          }
          key="inProgress"
        />
        <TabPane
          tab={
            <span>
              <CheckCircleOutlined style={{color: "#52c41a", marginRight: 4}} />
              <span>Completed</span>
            </span>
          }
          key="completed"
        />
        <TabPane
          tab={
            <span>
              <ClockCircleOutlined style={{color: "#f5222d", marginRight: 4}} />
              <span>Expired</span>
            </span>
          }
          key="expired"
        />
      </Tabs>

      {loading ? (
        <div style={{textAlign: "center", padding: "60px 0"}}>
          <Spin size="large" />
          <div style={{marginTop: 16, color: "#666", fontSize: 16}}>
            Loading vaccination campaigns...
          </div>
        </div>
      ) : filteredData.length > 0 ? (
        <div>
          {filteredData.map((record) => (
            <CampaignCard
              key={record.vaccinationScheduleResponseDto.scheduleId}
              record={record}
            />
          ))}
        </div>
      ) : (
        <Empty
          description="No vaccination campaigns available"
          style={{
            padding: "60px 0",
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #f0f0f0",
          }}
        />
      )}

      <EditVaccineCampaignModal
        open={editModalOpen}
        campaign={editCampaign}
        onClose={handleEditModalClose}
      />

      {/* Add CSS */}
      <style jsx="true">{`
        .campaign-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .campaign-card .ant-card-body {
          padding: 0;
        }

        .campaign-icons {
          transition: all 0.3s;
        }

        .campaign-card:hover .campaign-icons {
          transform: translateY(-2px);
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

        .expanded-content {
          animation: fadeIn 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default CampaignList;
