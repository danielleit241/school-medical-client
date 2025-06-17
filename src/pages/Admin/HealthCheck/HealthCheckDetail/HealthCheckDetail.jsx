import React, {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Descriptions,
  Spin,
  Empty,
  Button,
  Tag,
  Modal,
  Space,
  message,
  Popconfirm,
} from "antd";
import {
  ArrowLeftOutlined,
  EyeOutlined,
  TeamOutlined,
  UserOutlined,
  PhoneOutlined,
  UserAddOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axiosInstance from "../../../../api/axios";
import Swal from "sweetalert2";

const {Title} = Typography;

const HealthCheckDetail = () => {
  const scheduleId = localStorage.getItem("healthCheckScheduleId");
  const navigate = useNavigate();
  const roleName = useSelector((state) => state.user?.role);

  const [loading, setLoading] = useState(true);
  const [rounds, setRounds] = useState([]);

  // Modal states
  const [roundDetail, setRoundDetail] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Student list state
  const [studentListVisible, setStudentListVisible] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [studentListLoading, setStudentListLoading] = useState(false);
  const [selectedRoundId, setSelectedRoundId] = useState(null);

  // Notification data states
  const [toParentData, setToParentData] = useState([]);
  const [toNurseData, setToNurseData] = useState([]);

  // Fetch health check schedule details
  useEffect(() => {
    if (scheduleId) {
      setLoading(true);
      axiosInstance
        .get(`/api/health-checks/schedules/${scheduleId}`)
        .then((res) => {
          setRounds(res.data || []);
        })
        .catch((err) => {
          console.error("Error fetching health check details:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [scheduleId]);

  // Handle viewing round details
  const handleRoundDetail = (roundId) => {
    const round = rounds.find(
      (r) => r.healthCheckRoundInformation.roundId === roundId
    );
    if (round) {
      setRoundDetail(round);
      setModalVisible(true);
    }
  };

  // Handle adding students to a schedule and sending notifications
  const handleAddStudent = async () => {
    if (!scheduleId) {
      message.error("Health check schedule ID not found");
      return;
    }

    try {
      const res = await axiosInstance.post(
        "/api/health-checks/schedules/add-students",
        scheduleId
      );

      const {toParent = [], toNurse = res.data?.toNurse} = res.data || {};
      setToParentData(toParent);
      setToNurseData(toNurse);

      console.log("To Parent Data:", toParent);
      console.log("To Nurse Data:", toNurse);

      Swal.fire({
        icon: "success",
        title: "Students added!",
        html: `
          <div>
            <b>To Parent:</b> ${toParent.length} notification(s)<br/>
            <b>To Nurse:</b> ${toNurse.length} notification(s)<br/>
            <span style="color:#1677ff">Now you can send notifications below.</span>
          </div>
        `,
        showConfirmButton: true,
      });

      // Refresh the rounds data
      if (scheduleId) {
        const updatedData = await axiosInstance.get(
          `/api/health-checks/schedules/${scheduleId}`
        );
        setRounds(updatedData.data || []);
      }
    } catch (error) {
      console.error("Error adding students:", error);
      Swal.fire({
        icon: "error",
        title: "Add students failed!",
        text: error?.response?.data?.message || "An error occurred.",
      });
    }
  };

  // Send notification to parents
  const handleSendNotiParent = async () => {
    try {
      if (toParentData.length > 0) {
        await axiosInstance.post(
          "/api/notifications/health-checks/to-parent",
          toParentData
        );

        Swal.fire({
          icon: "success",
          title: "Sent notifications to parents successfully!",
          showConfirmButton: false,
          timer: 1800,
        });

        setToParentData([]);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Send notifications to parents failed!",
        text: err?.response?.data?.message || "An error occurred.",
      });
    }
  };

  // Send notification to nurses
  const handleSendNotiNurse = async () => {
    try {
      if (toNurseData.length > 0) {
        await axiosInstance.post(
          "/api/notifications/health-checks/to-nurse",
          toNurseData
        );

        Swal.fire({
          icon: "success",
          title: "Sent notifications to nurses successfully!",
          showConfirmButton: false,
          timer: 1800,
        });

        setToNurseData([]);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Send notifications to nurses failed!",
        text: err?.response?.data?.message || "An error occurred.",
      });
    }
  };

  // Handle showing student list
  const handleShowStudentList = (roundId) => {
    setSelectedRoundId(roundId);
    setStudentListVisible(true);
    setStudentListLoading(true);

    axiosInstance
      .get(`/api/managers/health-check-rounds/${roundId}/students`)
      .then((res) => setStudentList(res.data?.items || [])) // Sửa từ item thành items
      .catch((err) => {
        console.error("Error fetching students:", err);
        message.error("Failed to fetch student list");
      })
      .finally(() => setStudentListLoading(false));
  };

  // Handle closing student list modal
  const handleCloseStudentList = () => {
    setStudentListVisible(false);
    setStudentList([]);
    setSelectedRoundId(null);
  };

  const handleBack = () => {
    localStorage.removeItem("healthCheckScheduleId");
    navigate(`/${roleName}/health-check/schedules`);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card
      title={
        <div style={{display: "flex", alignItems: "center"}}>
          <span>Health Check Details</span>
        </div>
      }
      style={{margin: 24}}
      extra={
        <Space>
          <Button style={{marginRight: 16}} onClick={handleBack}>
            Back
          </Button>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddStudent}
          >
            Add Student
          </Button>
          <Button
            type="primary"
            onClick={handleSendNotiNurse}
            disabled={toNurseData.length === 0}
          >
            Send to Nurse
          </Button>
          <Button
            type="primary"
            onClick={handleSendNotiParent}
            disabled={toParentData.length === 0}
          >
            Send to Parent
          </Button>
        </Space>
      }
    >
      {/* Health Check Rounds */}
      <Title level={4}>Health Check Rounds</Title>
      {rounds.length === 0 && <Empty description="No rounds available" />}

      <Row gutter={[16, 16]}>
        {rounds.map((round, idx) => (
          <Col xs={24} md={12} key={round.healthCheckRoundInformation.roundId}>
            <Card
              type="inner"
              title={`Round ${idx + 1}: ${
                round.healthCheckRoundInformation.roundName
              }`}
              style={{background: "#E6F7FF"}}
              extra={
                <Space>
                  {round.healthCheckRoundInformation.status ? (
                    <Tag color="green">Completed</Tag>
                  ) : (
                    <Tag color="orange">Not completed</Tag>
                  )}
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() =>
                      handleRoundDetail(
                        round.healthCheckRoundInformation.roundId
                      )
                    }
                  >
                    Detail
                  </Button>
                  <Button
                    size="small"
                    icon={<TeamOutlined />}
                    onClick={() =>
                      handleShowStudentList(
                        round.healthCheckRoundInformation.roundId
                      )
                    }
                  >
                    List Students
                  </Button>
                </Space>
              }
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Target Grade">
                  {round.healthCheckRoundInformation.targetGrade}
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {round.healthCheckRoundInformation.description || "None"}
                </Descriptions.Item>
                <Descriptions.Item label="Start Time">
                  {round.healthCheckRoundInformation.startTime
                    ? dayjs(round.healthCheckRoundInformation.startTime).format(
                        "YYYY-MM-DD HH:mm"
                      )
                    : ""}
                </Descriptions.Item>
                <Descriptions.Item label="End Time">
                  {round.healthCheckRoundInformation.endTime
                    ? dayjs(round.healthCheckRoundInformation.endTime).format(
                        "YYYY-MM-DD HH:mm"
                      )
                    : ""}
                </Descriptions.Item>
                <Descriptions.Item label="Nurse">
                  {round.nurse?.nurseName || "Not assigned yet"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Round Detail Modal */}
      <Modal
        title={`Round Details: ${
          roundDetail?.healthCheckRoundInformation?.roundName || ""
        }`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Descriptions bordered>
          <Descriptions.Item label="Round Name" span={3}>
            {roundDetail?.healthCheckRoundInformation?.roundName || ""}
          </Descriptions.Item>
          <Descriptions.Item label="Target Grade" span={3}>
            {roundDetail?.healthCheckRoundInformation?.targetGrade || ""}
          </Descriptions.Item>
          <Descriptions.Item label="Start Time" span={3}>
            {roundDetail?.healthCheckRoundInformation?.startTime
              ? dayjs(roundDetail.healthCheckRoundInformation.startTime).format(
                  "YYYY-MM-DD HH:mm"
                )
              : ""}
          </Descriptions.Item>
          <Descriptions.Item label="End Time" span={3}>
            {roundDetail?.healthCheckRoundInformation?.endTime
              ? dayjs(roundDetail.healthCheckRoundInformation.endTime).format(
                  "YYYY-MM-DD HH:mm"
                )
              : ""}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={3}>
            {roundDetail?.healthCheckRoundInformation?.description ||
              "No description"}
          </Descriptions.Item>
          <Descriptions.Item label="Status" span={3}>
            {roundDetail?.healthCheckRoundInformation?.status ? (
              <Tag color="green">Completed</Tag>
            ) : (
              <Tag color="orange">Not completed</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>

        <Descriptions
          column={1}
          bordered
          size="small"
          title="Nurse Information"
          style={{marginTop: 16}}
        >
          <Descriptions.Item
            label={
              <>
                <UserOutlined /> Nurse Name
              </>
            }
          >
            {roundDetail?.nurse?.nurseName || "Not assigned"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <>
                <PhoneOutlined /> Phone Number
              </>
            }
          >
            {roundDetail?.nurse?.phoneNumber || "N/A"}
          </Descriptions.Item>
        </Descriptions>
      </Modal>

      {/* Student List Modal */}
      <Modal
        title={`Students of ${
          rounds.find(
            (r) => r.healthCheckRoundInformation.roundId === selectedRoundId
          )?.healthCheckRoundInformation?.roundName || "Round"
        }`}
        open={studentListVisible}
        onCancel={handleCloseStudentList}
        footer={null}
        width={700}
      >
        {studentListLoading ? (
          <div style={{textAlign: "center", padding: "20px"}}>
            <Spin />
          </div>
        ) : studentList.length === 0 ? (
          <Empty description="No students found" />
        ) : (
          <table style={{width: "100%", borderCollapse: "collapse"}}>
            <thead>
              <tr>
                <th style={{border: "1px solid #eee", padding: 6}}>No.</th>
                <th style={{border: "1px solid #eee", padding: 6}}>
                  Student Code
                </th>
                <th style={{border: "1px solid #eee", padding: 6}}>
                  Full Name
                </th>
                <th style={{border: "1px solid #eee", padding: 6}}>
                  Date of Birth
                </th>
                <th style={{border: "1px solid #eee", padding: 6}}>Gender</th>
                <th style={{border: "1px solid #eee", padding: 6}}>Grade</th>
                <th style={{border: "1px solid #eee", padding: 6}}>Parent</th>
                <th style={{border: "1px solid #eee", padding: 6}}>Status</th>
              </tr>
            </thead>
            <tbody>
              {studentList.map((item, idx) => (
                <tr key={idx} style={{border: "1px solid #eee"}}>
                  <td style={{border: "1px solid #eee", padding: 6}}>
                    {idx + 1}
                  </td>
                  <td style={{border: "1px solid #eee", padding: 6}}>
                    {item.studentsOfRoundResponse?.studentCode}
                  </td>
                  <td style={{border: "1px solid #eee", padding: 6}}>
                    {item.studentsOfRoundResponse?.fullName}
                  </td>
                  <td style={{border: "1px solid #eee", padding: 6}}>
                    {item.studentsOfRoundResponse?.dayOfBirth
                      ? dayjs(item.studentsOfRoundResponse.dayOfBirth).format(
                          "DD/MM/YYYY"
                        )
                      : ""}
                  </td>
                  <td style={{border: "1px solid #eee", padding: 6}}>
                    {item.studentsOfRoundResponse?.gender}
                  </td>
                  <td style={{border: "1px solid #eee", padding: 6}}>
                    {item.studentsOfRoundResponse?.grade?.trim()}
                  </td>
                  <td style={{border: "1px solid #eee", padding: 6}}>
                    {item.parentOfStudent?.phoneNumber || "N/A"}
                  </td>
                  <td style={{border: "1px solid #eee", padding: 6}}>
                    <Tag
                      color={
                        item.parentOfStudent?.parentConfirm ? "green" : "orange"
                      }
                    >
                      {item.parentOfStudent?.parentConfirm
                        ? "Confirmed"
                        : "Pending"}
                    </Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Modal>
    </Card>
  );
};

export default HealthCheckDetail;
