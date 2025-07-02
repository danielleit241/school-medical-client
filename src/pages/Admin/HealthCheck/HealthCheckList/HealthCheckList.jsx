import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import axiosInstance from "../../../../api/axios";
import {
  Card,
  Tag,
  Button,
  Spin,
  Descriptions,
  Typography,
  Space,
  Row,
  Col,
  Progress,
  Collapse,
  Empty,
  message,
  Tabs,
  Tooltip,
} from "antd";
import {
  TeamOutlined,
  InfoCircleOutlined,
  DownOutlined,
  UpOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  EditOutlined,
  ReloadOutlined,
  PlusOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import EditHealthCheckCampaignModal from "./EditHealthCheckCampaignModal";
import Swal from "sweetalert2";
import {Plus, RefreshCcw} from "lucide-react";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const {Title, Text} = Typography;
const {Panel} = Collapse;
const {TabPane} = Tabs;

const HealthCheckList = () => {
  const roleName = useSelector((state) => state.user?.role);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  // eslint-disable-next-line no-unused-vars
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roundsData, setRoundsData] = useState({});
  const [loadingRounds, setLoadingRounds] = useState({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [completing, setCompleting] = useState({});
  const navigate = useNavigate();

  // Fetch rounds data for a specific schedule
  const fetchRounds = async (scheduleId, forceRefresh = false) => {
    if (roundsData[scheduleId] && !forceRefresh) return;

    setLoadingRounds((prev) => ({...prev, [scheduleId]: true}));
    try {
      const response = await axiosInstance.get(
        `/api/health-checks/schedules/${scheduleId}`
      );

      // CHỈ lấy rounds, KHÔNG lấy status từ detail
      const rounds = Array.isArray(response.data) ? response.data : [];

      // Enhance rounds with student data
      const roundsWithProgress = await Promise.all(
        rounds.map(async (round) => {
          try {
            const studentsRes = await axiosInstance.get(
              `/api/managers/health-check-rounds/${round.healthCheckRoundInformation.roundId}/students`
            );
            const students = studentsRes.data.items || [];
            const totalStudents = students.length;
            const completedStudents = students.filter(
              (student) => student.studentsOfRoundResponse?.healthCheckResultId
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
              `Error fetching students for round ${round.healthCheckRoundInformation.roundId}:`,
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

      // Lưu rounds vào roundsData, KHÔNG lưu status
      setRoundsData((prev) => ({
        ...prev,
        [scheduleId]: roundsWithProgress,
      }));
    } catch (error) {
      console.error(`Error fetching rounds for schedule ${scheduleId}:`, error);
    } finally {
      setLoadingRounds((prev) => ({...prev, [scheduleId]: false}));
    }
  };

  const refreshAllRoundData = () => {
    setRefreshing(true);

    // Reset state to show loading indicators
    const initialLoadingState = {};
    data.forEach((item) => {
      const scheduleId = item.healthCheckScheduleResponseDto.scheduleId;
      initialLoadingState[scheduleId] = true;
    });

    setLoadingRounds(initialLoadingState);
    setRoundsData({});

    Promise.all(
      data.map((item) =>
        fetchRounds(item.healthCheckScheduleResponseDto.scheduleId, true)
      )
    ).finally(() => {
      setRefreshing(false);
      message.success("All health check data refreshed successfully");
    });
  };

  const getStatusConfig = (record) => {
    // Lấy status từ list (không lấy từ roundsData/detail)
    const status = record.healthCheckScheduleResponseDto.status;

    const now = dayjs();
    const startDate = dayjs(record.healthCheckScheduleResponseDto.startDate);
    const endDate = dayjs(record.healthCheckScheduleResponseDto.endDate);

    if (status === true) {
      return {
        color: "#52c41a",
        bgColor: "#f6ffed",
        text: "Completed",
        status: "completed",
        icon: <CheckCircleOutlined />,
      };
    }
    if (now.isAfter(startDate) && now.isBefore(endDate)) {
      return {
        color: "#1890ff",
        bgColor: "#e6f7ff",
        text: "In Progress",
        status: "inProgress",
        // icon: <PlayCircleOutlined />,
      };
    }
    if (now.isBefore(startDate)) {
      return {
        color: "#faad14",
        bgColor: "#fff7e6",
        text: "Scheduled",
        status: "scheduled",
        // icon: <ClockCircleOutlined />,
      };
    }
    return {
      color: "#f5222d",
      bgColor: "#fff1f0",
      text: "Expired",
      status: "expired",
      // icon: <ClockCircleOutlined />,
    };
  };

  const fetchData = () => {
    setLoading(true);
    axiosInstance
      .get("/api/health-checks/schedules")
      .then((res) => {
        // Sort data by createdAt (newest first)
        const sortedData = [...(res.data?.items || [])].sort((a, b) => {
          const dateA = new Date(a.healthCheckScheduleResponseDto.createdAt);
          const dateB = new Date(b.healthCheckScheduleResponseDto.createdAt);
          return dateB - dateA; // Sort descending (newest first)
        });

        const mapSchedule = (
          Array.isArray(res.data?.items) ? res.data.items : []
        ).map((item) => ({
          title: item.healthCheckScheduleResponseDto.title,
          healthCheckType: item.healthCheckScheduleResponseDto.healthCheckType,
          description: item.healthCheckScheduleResponseDto.description,
          startDate: item.healthCheckScheduleResponseDto.startDate,
          endDate: item.healthCheckScheduleResponseDto.endDate,
          scheduleId: item.healthCheckScheduleResponseDto.scheduleId,
          createdBy: item.healthCheckScheduleResponseDto.createdBy,
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
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      data.forEach((item) => {
        const scheduleId = item.healthCheckScheduleResponseDto.scheduleId;
        // Có thể chỉ fetch cho status inProgress để tối ưu
        if (item.healthCheckScheduleResponseDto.status === false) {
          fetchRounds(scheduleId);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

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
    navigate(`/${roleName}/health-check/create`);
  };

  const handleCompleteSchedule = async (scheduleId) => {
    setCompleting((prev) => ({...prev, [scheduleId]: true}));
    try {
      // Kiểm tra học sinh bổ sung
      const res = await axiosInstance.get(
        `/api/schedules/${scheduleId}/health-check-rounds/supplementary/total-students`
      );
      const supplementStudents = res.data?.supplementStudents ?? 0;

      if (supplementStudents > 0) {
        // Cảnh báo xác nhận
        await Swal.fire({
          title: "Warning",
          text: `${supplementStudents} supplementary students remain unchecked. Continue?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Continue",
          cancelButtonText: "Cancel",
          reverseButtons: true,
        }).then(async (result) => {
          if (result.isConfirmed) {
            await completeScheduleApi(scheduleId);
          } else {
            setCompleting((prev) => ({...prev, [scheduleId]: false}));
          }
        });
      } else {
        await completeScheduleApi(scheduleId);
      }
    } catch (err) {
      console.error("Error checking supplementary students:", err);
      setCompleting((prev) => ({...prev, [scheduleId]: false}));
    }
  };

  const completeScheduleApi = async (scheduleId) => {
    try {
      await axiosInstance.put("/api/health-checks/schedules/finished", {
        scheduleId,
        status: true,
      });
      Swal.fire({
        title: "Success",
        text: "The health check schedule has been completed!",
        icon: "success",
        confirmButtonText: "OK",
      });
      fetchData();
    } catch (err) {
      console.error("Error completing schedule:", err);
    } finally {
      setCompleting((prev) => ({...prev, [scheduleId]: false}));
    }
  };

  const HealthCheckCard = ({record}) => {
    const scheduleId = record.healthCheckScheduleResponseDto.scheduleId;
    const rounds = roundsData[scheduleId] || [];
    const isLoadingRounds = loadingRounds[scheduleId];
    const statusConfig = getStatusConfig(record);
    const [expanded, setExpanded] = useState(false);

    const startDate = dayjs(record.healthCheckScheduleResponseDto.startDate);
    const endDate = dayjs(record.healthCheckScheduleResponseDto.endDate);
    const now = dayjs();
    const isInRange =
      now.isSameOrAfter(startDate, "day") && now.isSameOrBefore(endDate, "day");

    const toggleExpand = () => {
      setExpanded(!expanded);
      if (!expanded && !roundsData[scheduleId]) {
        fetchRounds(scheduleId);
      }
    };

    return (
      <Card
        className="health-check-card"
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
          // Only toggle when clicking on areas without buttons
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
                  {record.healthCheckScheduleResponseDto.title}
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
                    localStorage.setItem(
                      "healthCheckScheduleId",
                      record.healthCheckScheduleResponseDto.scheduleId
                    );
                    navigate(`/${roleName}/health-check/details`);
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
                        item.healthCheckScheduleResponseDto.scheduleId ===
                        scheduleId
                    );
                    setEditCampaign(found);
                    setEditModalOpen(true);
                  }}
                  style={{borderRadius: 6}}
                >
                  Edit
                </Button>
                {statusConfig.status === "inProgress" &&
                  isInRange &&
                  Array.isArray(rounds) &&
                  rounds.length > 0 &&
                  rounds.every(
                    (r) => r.healthCheckRoundInformation?.status === true
                  ) && (
                    <Button
                      type="primary"
                      style={{
                        borderRadius: 6,
                        background: "#52c41a",
                        borderColor: "#52c41a",
                        color: "#fff",
                        fontWeight: 500,
                        boxShadow: "0 2px 8px rgba(82,196,26,0.08)",
                        marginLeft: 8,
                      }}
                      loading={!!completing[scheduleId]}
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleCompleteSchedule(scheduleId);
                      }}
                    >
                      Complete
                    </Button>
                  )}
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
            {record.healthCheckScheduleResponseDto.description}
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
                    Time Period
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
                <FileTextOutlined style={{color: "#faad14"}} />
                <div>
                  <Text
                    type="secondary"
                    style={{fontSize: 12, display: "block"}}
                  >
                    Created At
                  </Text>
                  <Text strong style={{fontSize: 13}}>
                    {dayjs(
                      record.healthCheckScheduleResponseDto.createdAt
                    ).format("DD/MM/YYYY")}
                  </Text>
                </div>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Expanded Content - Only visible when expanded */}
        {expanded && (
          <div style={{padding: "20px 24px"}} className="expanded-content">
            {/* Rounds List - Keep this section */}
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
                      Rounds List ({rounds.length} rounds)
                    </Text>
                  }
                  key="rounds"
                >
                  <div style={{padding: "8px 0"}}>
                    {rounds.map((round, index) => {
                      // eslint-disable-next-line no-unused-vars
                      const roundStatusConfig =
                        round.status === true
                          ? {color: "#52c41a", text: "Completed"}
                          : round.progress > 0
                          ? {color: "#1890ff", text: "In Progress"}
                          : {color: "#faad14", text: "Scheduled"};
                      return (
                        <div
                          key={round.healthCheckRoundInformation.roundId}
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
                              Round {index + 1}:{" "}
                              {round.healthCheckRoundInformation.roundName}
                            </Text>
                            <Tag
                              color={
                                round.healthCheckRoundInformation.status
                                  ? "green"
                                  : "orange"
                              }
                              style={{
                                marginLeft: 8,
                                borderRadius: 12,
                                fontSize: 11,
                              }}
                            >
                              {round.healthCheckRoundInformation.status
                                ? "Completed"
                                : "In Progress"}
                            </Tag>
                          </div>
                          <div style={{textAlign: "right"}}>
                            <Text style={{fontSize: 12, color: "#666"}}>
                              Target:{" "}
                              {round.healthCheckRoundInformation.targetGrade}
                            </Text>
                            <div style={{marginTop: 4}}>
                              <Button
                                size="small"
                                type="link"
                                icon={<TeamOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  localStorage.setItem(
                                    "selectedHealthCheckRoundId",
                                    round.healthCheckRoundInformation.roundId
                                  );
                                  navigate(
                                    `/${roleName}/health-check/details/student-list`
                                  );
                                }}
                                style={{padding: 0, fontSize: 12}}
                              >
                                Student List
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
                  Loading rounds...
                </div>
              </div>
            ) : (
              <div style={{textAlign: "center", padding: "40px 0"}}>
                <Empty description="No rounds found for this health check campaign" />
              </div>
            )}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div style={{padding: 24, background: "#f5f7fa", minHeight: "100vh"}}>
      {/* Updated Header Section to match the reference */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={2} style={{margin: 0, fontSize: 28, color: "#333"}}>
            Health Check Schedule Overview
          </Title>
          <Text type="secondary" style={{fontSize: 14}}>
            Monitor progress of health check campaigns
          </Text>
        </div>
        <Space size="middle">
          <Button
            icon={<RefreshCcw style={{display: "flex", padding: 4}} />}
            onClick={refreshAllRoundData}
            loading={refreshing}
          >
            Refresh Data
          </Button>
          <Button
            icon={<Plus style={{display: "flex", padding: 4}} />}
            onClick={handleAddNewCampaign}
            style={{
              color: "#fff",
              backgroundColor: "#355383",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
            }}
          >
            New Campaign
          </Button>
        </Space>
      </div>

      {/* Modern Tab Navigation */}
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          marginBottom: 24,
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          style={{padding: "0 16px"}}
        >
          <TabPane
            tab={
              <span
                style={{
                  padding: "12px 0",
                  borderBottom:
                    activeTab === "all" ? "2px solid #1890ff" : "none",
                  fontWeight: activeTab === "all" ? 500 : 400,
                }}
              >
                All
              </span>
            }
            key="all"
          />
          <TabPane
            tab={
              <span
                style={{
                  padding: "12px 0",
                  borderBottom:
                    activeTab === "scheduled" ? "2px solid #faad14" : "none",
                  fontWeight: activeTab === "scheduled" ? 500 : 400,
                }}
              >
                <ClockCircleOutlined
                  style={{color: "#faad14", marginRight: 6}}
                />
                Scheduled
              </span>
            }
            key="scheduled"
          />
          <TabPane
            tab={
              <span
                style={{
                  padding: "12px 0",
                  borderBottom:
                    activeTab === "inProgress" ? "2px solid #1890ff" : "none",
                  fontWeight: activeTab === "inProgress" ? 500 : 400,
                }}
              >
                <PlayCircleOutlined
                  style={{color: "#1890ff", marginRight: 6}}
                />
                In Progress
              </span>
            }
            key="inProgress"
          />
          <TabPane
            tab={
              <span
                style={{
                  padding: "12px 0",
                  borderBottom:
                    activeTab === "completed" ? "2px solid #52c41a" : "none",
                  fontWeight: activeTab === "completed" ? 500 : 400,
                }}
              >
                <CheckCircleOutlined
                  style={{color: "#52c41a", marginRight: 6}}
                />
                Completed
              </span>
            }
            key="completed"
          />
          <TabPane
            tab={
              <span
                style={{
                  padding: "12px 0",
                  borderBottom:
                    activeTab === "expired" ? "2px solid #f5222d" : "none",
                  fontWeight: activeTab === "expired" ? 500 : 400,
                }}
              >
                <ClockCircleOutlined
                  style={{color: "#f5222d", marginRight: 6}}
                />
                Expired
              </span>
            }
            key="expired"
          />
        </Tabs>
      </div>

      {/* Rest of your component remains the same */}
      {loading ? (
        <div style={{textAlign: "center", padding: "60px 0"}}>
          <Spin size="large" />
          <div style={{marginTop: 16, color: "#666", fontSize: 16}}>
            Loading health check campaigns...
          </div>
        </div>
      ) : filteredData.length > 0 ? (
        <div>
          {filteredData.map((record) => (
            <HealthCheckCard
              key={record.healthCheckScheduleResponseDto.scheduleId}
              record={record}
            />
          ))}
        </div>
      ) : (
        <Empty
          description="No health check campaigns available"
          style={{
            padding: "60px 0",
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #f0f0f0",
          }}
        />
      )}

      <EditHealthCheckCampaignModal
        open={editModalOpen}
        campaign={editCampaign}
        onClose={handleEditModalClose}
      />

      {/* Keep your existing CSS */}
      <style jsx="true">{`
        .health-check-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .health-check-card .ant-card-body {
          padding: 0;
        }

        .campaign-icons {
          transition: all 0.3s;
        }

        .health-check-card:hover .campaign-icons {
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

export default HealthCheckList;
