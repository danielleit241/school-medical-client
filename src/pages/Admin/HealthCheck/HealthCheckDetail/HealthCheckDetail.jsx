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
  Form,
  Input,
  DatePicker,
  Select,
  Dropdown,
} from "antd";
import {
  ArrowLeftOutlined,
  EyeOutlined,
  TeamOutlined,
  UserOutlined,
  PhoneOutlined,
  PlusOutlined,
  DownOutlined,
  EditOutlined,
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
  const [supplementStudents, setSupplementStudents] = useState(null);

  // Modal states
  const [roundDetail, setRoundDetail] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addRoundModalVisible, setAddRoundModalVisible] = useState(false);
  const [editRoundModalVisible, setEditRoundModalVisible] = useState(false);
  const [addRoundLoading, setAddRoundLoading] = useState(false);
  const [editRoundLoading, setEditRoundLoading] = useState(false);
  const [modalType, setModalType] = useState("new"); // "new" hoặc "supplement"
  const [formAddRound] = Form.useForm();
  const [editRoundData, setEditRoundData] = useState(null);
  const [formEditRound] = Form.useForm();

  // Notification data states
  const [toParentData, setToParentData] = useState([]);
  const [toNurseData, setToNurseData] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [classes, setClasses] = useState([]);

  // Fetch health check schedule details
  useEffect(() => {
    if (scheduleId) {
      const savedToParent = localStorage.getItem(`toParentData_${scheduleId}`);
      const savedToNurse = localStorage.getItem(`toNurseData_${scheduleId}`);
      if (savedToParent) {
        setToParentData(JSON.parse(savedToParent));
      }
      if (savedToNurse) {
        setToNurseData(JSON.parse(savedToNurse));
      }
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

      localStorage.setItem(
        `toParentData_${scheduleId}`,
        JSON.stringify(toParent)
      );
      localStorage.setItem(
        `toNurseData_${scheduleId}`,
        JSON.stringify(toNurse)
      );

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
        localStorage.removeItem(`toParentData_${scheduleId}`);
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
        localStorage.removeItem(`toNurseData_${scheduleId}`);
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
    localStorage.setItem("selectedHealthCheckRoundId", roundId);
    localStorage.setItem(
      `toParentData_${scheduleId}`,
      JSON.stringify(toParentData)
    );
    localStorage.setItem(
      `toNurseData_${scheduleId}`,
      JSON.stringify(toNurseData)
    );
    navigate(`/${roleName}/health-check/details/student-list`);
  };

  const handleBack = () => {
    localStorage.removeItem("healthCheckScheduleId");
    navigate(`/${roleName}/health-check/schedules`);
  };

  useEffect(() => {
    axiosInstance.get("/api/nurses").then((res) => setNurses(res.data || []));
    axiosInstance
      .get("/api/students/classes")
      .then((res) => setClasses(res.data.map((cls) => cls.trim())))
      .catch(() => setClasses([]));
  }, []);

  const openAddRoundModal = (type) => {
    setModalType(type);
    setAddRoundModalVisible(true);
    if (type === "supplement") {
      formAddRound.setFieldsValue({
        roundName: "Supplement Round",
        targetGrade: "Supplement",
      });
    } else {
      formAddRound.resetFields();
    }
  };

  const handleAddRound = async () => {
    try {
      setAddRoundLoading(true);
      const values = await formAddRound.validateFields();
      const res = await axiosInstance.get(
        `/api/health-checks/schedules/${scheduleId}`
      );
      const rounds = Array.isArray(res.data) ? res.data : [];

      // Validate targetGrade trùng
      const existed = rounds.some(
        (r) =>
          r.healthCheckRoundInformation?.targetGrade?.trim().toLowerCase() ===
          values.targetGrade.trim().toLowerCase()
      );
      if (existed) {
        formAddRound.setFields([
          {
            name: "targetGrade",
            errors: ["This target grade already exists in another round!"],
          },
        ]);
        setAddRoundLoading(false);
        return;
      }

      // Validate startTime, endTime
      let maxEndTime = null;
      if (rounds.length > 0) {
        maxEndTime = rounds
          .map((r) => r.healthCheckRoundInformation?.endTime)
          .filter(Boolean)
          .map((t) => dayjs(t))
          .sort((a, b) => b.valueOf() - a.valueOf())[0];

        const newStart = values.startTime;
        const newEnd = values.endTime;

        if (modalType === "supplement") {
          if (
            !newStart.isAfter(maxEndTime, "day") ||
            !newEnd.isAfter(maxEndTime, "day")
          ) {
            formAddRound.setFields([
              {
                name: "startTime",
                errors: [
                  "Start time must be after all existing rounds (next day).",
                ],
              },
              {
                name: "endTime",
                errors: [
                  "End time must be after all existing rounds (next day).",
                ],
              },
            ]);
            setAddRoundLoading(false);
            return;
          }
        }
        if (modalType === "new") {
          if (
            newStart.isSame(maxEndTime, "day") ||
            newEnd.isSame(maxEndTime, "day")
          ) {
            const overlap = rounds.some((r) => {
              const rNurseId = String(r.nurseId || r.nurse?.nurseId || "");
              const formNurseId = String(values.nurseId || "");
              const rStart = r.healthCheckRoundInformation?.startTime
                ? dayjs(r.healthCheckRoundInformation.startTime)
                : null;
              const rEnd = r.healthCheckRoundInformation?.endTime
                ? dayjs(r.healthCheckRoundInformation.endTime)
                : null;
              return (
                rNurseId === formNurseId &&
                rStart &&
                rEnd &&
                newStart.isBefore(rEnd) &&
                newEnd.isAfter(rStart)
              );
            });
            if (overlap) {
              formAddRound.setFields([
                {
                  name: "startTime",
                  errors: [
                    "This nurse already has a round in this time range.",
                  ],
                },
                {
                  name: "endTime",
                  errors: [
                    "This nurse already has a round in this time range.",
                  ],
                },
              ]);
              setAddRoundLoading(false);
              return;
            }
          }
        }
      }
      await axiosInstance.post("/api/schedules/health-check-rounds", {
        scheduleId,
        roundName: values.roundName,
        targetGrade: values.targetGrade,
        description: values.description,
        startTime: values.startTime.format("YYYY-MM-DDTHH:mm:ss"),
        endTime: values.endTime.format("YYYY-MM-DDTHH:mm:ss"),
        nurseId: values.nurseId,
      });
      message.success("Add round successfully!");
      setAddRoundModalVisible(false);
      formAddRound.resetFields();
      // Reload rounds
      const updated = await axiosInstance.get(
        `/api/health-checks/schedules/${scheduleId}`
      );
      setRounds(updated.data || []);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      message.error("Add round failed!");
    } finally {
      setAddRoundLoading(false);
    }
  };

  // Handle open edit round modal
  const handleEditRound = async (round) => {
    setEditRoundData(round);
    setEditRoundModalVisible(true);
    try {
      const res = await axiosInstance.get("/api/nurses");
      setNurses(res.data || []);
    } catch {
      setNurses([]);
    }
    console.log("Nurses data:", round);
    setTimeout(() => {
      formEditRound.setFieldsValue({
        roundName: round.healthCheckRoundInformation.roundName,
        targetGrade: round.healthCheckRoundInformation.targetGrade,
        description: round.healthCheckRoundInformation.description,
        startTime: dayjs(round.healthCheckRoundInformation.startTime),
        endTime: dayjs(round.healthCheckRoundInformation.endTime),
        nurseId:
          round.nurse?.staffNurseId ||
          round.nurse?.nurseId ||
          round.nurseId ||
          round.healthCheckRoundInformation.nurseId ||
          undefined,
      });
    }, 0);
  };

  // Handle submit edit round
  const handleSubmitEditRound = async () => {
    try {
      setEditRoundLoading(true);
      const values = await formEditRound.validateFields();
      const isSupplementRound =
        values.roundName?.trim().toLowerCase() === "supplement round";
      if (isSupplementRound) {
        // Lấy maxEndTime của các round khác (trừ round đang sửa)
        const maxEndTime = rounds
          .filter(
            (r) =>
              r.healthCheckRoundInformation.roundId !==
              editRoundData.healthCheckRoundInformation.roundId
          )
          .map((r) =>
            r.healthCheckRoundInformation.endTime
              ? dayjs(r.healthCheckRoundInformation.endTime)
              : null
          )
          .filter(Boolean)
          .sort((a, b) => b.valueOf() - a.valueOf())[0];

        if (maxEndTime) {
          const newStart = values.startTime;
          const newEnd = values.endTime;
          if (
            !newStart.isAfter(maxEndTime, "day") ||
            !newEnd.isAfter(maxEndTime, "day")
          ) {
            formEditRound.setFields([
              {
                name: "startTime",
                errors: [
                  "Start time must be after all existing rounds (next day).",
                ],
              },
              {
                name: "endTime",
                errors: [
                  "End time must be after all existing rounds (next day).",
                ],
              },
            ]);
            setEditRoundLoading(false);
            return;
          }
        }
      }

      // Validate targetGrade trùng (trừ chính round đang sửa)
      const existed = rounds.some(
        (r) =>
          r.healthCheckRoundInformation.roundId !==
            editRoundData.healthCheckRoundInformation.roundId &&
          r.healthCheckRoundInformation.targetGrade?.trim().toLowerCase() ===
            values.targetGrade.trim().toLowerCase()
      );
      if (existed) {
        formEditRound.setFields([
          {
            name: "targetGrade",
            errors: ["This target grade already exists in another round!"],
          },
        ]);
        setEditRoundLoading(false);
        return;
      }

      // Không cho sửa thành Supplement nếu đã có Supplement Round khác
      const isEditingToSupplement =
        values.targetGrade.trim().toLowerCase() === "supplement";
      const hasOtherSupplement = rounds.some(
        (r) =>
          r.healthCheckRoundInformation.roundId !==
            editRoundData.healthCheckRoundInformation.roundId &&
          r.healthCheckRoundInformation.targetGrade?.trim().toLowerCase() ===
            "supplement"
      );
      if (isEditingToSupplement && hasOtherSupplement) {
        formEditRound.setFields([
          {
            name: "targetGrade",
            errors: ["There is already a Supplement round!"],
          },
        ]);
        setEditRoundLoading(false);
        return;
      }
      const overlap = rounds.some((r) => {
        if (
          r.healthCheckRoundInformation.roundId ===
          editRoundData.healthCheckRoundInformation.roundId
        )
          return false;

        let rNurseId =
          r.nurse?.staffNurseId ||
          r.nurseId ||
          r.healthCheckRoundInformation.nurseId ||
          "";

        if (!rNurseId && r.nurse?.nurseName && nurses.length > 0) {
          const found = nurses.find((n) => n.fullName === r.nurse.nurseName);
          if (found) rNurseId = found.staffNurseId;
        }

        if (
          !rNurseId &&
          r.healthCheckRoundInformation.nurseName &&
          nurses.length > 0
        ) {
          const found = nurses.find(
            (n) => n.fullName === r.healthCheckRoundInformation.nurseName
          );
          if (found) rNurseId = found.staffNurseId;
        }

        if (nurses.length > 0 && rNurseId) {
          const found = nurses.find(
            (n) =>
              String(n.nurseId) === String(rNurseId) ||
              String(n.staffNurseId) === String(rNurseId)
          );
          if (found) rNurseId = found.staffNurseId;
        }

        const formNurseId = String(values.nurseId || "");
        const rStart = r.healthCheckRoundInformation.startTime
          ? dayjs(r.healthCheckRoundInformation.startTime)
          : null;
        const rEnd = r.healthCheckRoundInformation.endTime
          ? dayjs(r.healthCheckRoundInformation.endTime)
          : null;
        const newStart = values.startTime;
        const newEnd = values.endTime;

        const isSameDay = rStart && newStart && rStart.isSame(newStart, "day");
        const isOverlap =
          rStart && rEnd && newStart.isBefore(rEnd) && newEnd.isAfter(rStart);

        return rNurseId && rNurseId === formNurseId && isSameDay && isOverlap;
      });
      if (overlap) {
        formEditRound.setFields([
          {
            name: "startTime",
            errors: [
              "This nurse already has a round in this time range on this day.",
            ],
          },
          {
            name: "endTime",
            errors: [
              "This nurse already has a round in this time range on this day.",
            ],
          },
        ]);
        setEditRoundLoading(false);
        return;
      }
      await axiosInstance.put(
        `/api/health-check-rounds/${editRoundData.healthCheckRoundInformation.roundId}`,
        {
          roundName: values.roundName,
          targetGrade: values.targetGrade,
          description: values.description,
          startTime: values.startTime.format("YYYY-MM-DDTHH:mm:ss"),
          endTime: values.endTime.format("YYYY-MM-DDTHH:mm:ss"),
          nurseId: values.nurseId,
        }
      );
      Swal.fire({
        icon: "success",
        title: "Edit round successfully!",
        showConfirmButton: false,
        timer: 1800,
      });
      setEditRoundModalVisible(false);
      formEditRound.resetFields();
      // Reload rounds
      const updated = await axiosInstance.get(
        `/api/health-checks/schedules/${scheduleId}`
      );
      setRounds(updated.data || []);
    } catch (err) {
      console.error(err);
      message.error("Edit round failed!");
    } finally {
      setEditRoundLoading(false);
    }
  };

  useEffect(() => {
    if (scheduleId) {
      axiosInstance
        .get(
          `/api/schedules/${scheduleId}/health-check-rounds/supplementary/total-students`
        )
        .then((res) => setSupplementStudents(res.data?.supplementStudents ?? 0))
        .catch(() => setSupplementStudents(0));
    }
  }, [scheduleId]);

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

  const disableSupplementRound =
    rounds.some((r) => r.healthCheckRoundInformation?.status === false) ||
    supplementStudents === 0;

  const hasSupplementRound = rounds.some(
    (r) =>
      r.healthCheckRoundInformation?.roundName?.trim().toLowerCase() ===
      "supplement round"
  );

  return (
    <Card
      title={
        <div style={{display: "flex", alignItems: "center"}}>
          <Button
            icon={<ArrowLeftOutlined style={{margin: 0, padding: 0}} />}
            onClick={handleBack}
            style={{
              marginRight: 16,
            }}
          />
          <span>Health Check Details</span>
        </div>
      }
      style={{margin: 24}}
      extra={
        <Space>
          <Dropdown
            menu={{
              items: [
                {
                  key: "1",
                  label: (
                    <span style={hasSupplementRound ? {color: "#aaa"} : {}}>
                      Add New Round
                    </span>
                  ),
                  onClick: () => {
                    if (!hasSupplementRound) openAddRoundModal("new");
                  },
                  disabled: hasSupplementRound,
                },
                {
                  key: "2",
                  label: (
                    <span
                      style={
                        hasSupplementRound || supplementStudents === 0
                          ? {color: "#aaa"}
                          : {}
                      }
                    >
                      Add Supplement Round
                    </span>
                  ),
                  onClick: () => {
                    if (!hasSupplementRound && !disableSupplementRound)
                      openAddRoundModal("supplement");
                  },
                  disabled: hasSupplementRound || disableSupplementRound,
                },
              ],
            }}
          >
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              disabled={hasSupplementRound}
            >
              Add Round <DownOutlined />
            </Button>
          </Dropdown>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddStudent}
          >
            Add Student
          </Button>
          <Button
            style={{
              background: toNurseData.length === 0 ? "#d9d9d9" : "#355383",
              color: toNurseData.length === 0 ? "#00000040" : "#fff",
            }}
            type="primary"
            onClick={handleSendNotiNurse}
            disabled={toNurseData.length === 0}
          >
            Send to Nurse
          </Button>
          <Button
            style={{
              background: toParentData.length === 0 ? "#d9d9d9" : "#355383",
              color: toParentData.length === 0 ? "#00000040" : "#fff",
            }}
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
        {rounds.map((round, idx) => {
          const now = dayjs();
          const start = dayjs(round.healthCheckRoundInformation.startTime);
          const end = dayjs(round.healthCheckRoundInformation.endTime);
          const isEditingDisabled =
            now.isSame(start, "day") ||
            now.isSame(end, "day") ||
            (now.isAfter(start) && now.isBefore(end)) ||
            round.healthCheckRoundInformation.status === true;

          return (
            <Col
              xs={24}
              md={12}
              key={round.healthCheckRoundInformation.roundId}
            >
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
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleEditRound(round)}
                      disabled={isEditingDisabled}
                      title={
                        isEditingDisabled
                          ? "Cannot edit during round time or after completed"
                          : "Edit"
                      }
                    >
                      Edit
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
                      ? dayjs(
                          round.healthCheckRoundInformation.startTime
                        ).format("YYYY-MM-DD HH:mm")
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
          );
        })}
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

      {/* Add Round Modal */}
      <Modal
        open={addRoundModalVisible}
        title={
          modalType === "new"
            ? "Add New Health Check Round"
            : "Add Supplement Health Check Round"
        }
        onCancel={() => setAddRoundModalVisible(false)}
        onOk={handleAddRound}
        confirmLoading={addRoundLoading}
        okText="Add"
        width={600}
      >
        <Form form={formAddRound} layout="vertical">
          <Form.Item
            label="Round Name"
            name="roundName"
            rules={[{required: true, message: "Please input round name!"}]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Target Grade"
            name="targetGrade"
            rules={[{required: true, message: "Please select target grade!"}]}
          >
            {modalType === "new" ? (
              <Select
                placeholder="Select class"
                showSearch
                filterOption={(input, option) =>
                  (option?.value ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {classes.map((cls) => (
                  <Select.Option key={cls} value={cls}>
                    {cls}
                  </Select.Option>
                ))}
              </Select>
            ) : (
              <Input disabled={true} />
            )}
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            label="Start Time"
            name="startTime"
            rules={[{required: true, message: "Please select start time!"}]}
          >
            <DatePicker showTime style={{width: "100%"}} />
          </Form.Item>
          <Form.Item
            label="End Time"
            name="endTime"
            rules={[{required: true, message: "Please select end time!"}]}
          >
            <DatePicker showTime style={{width: "100%"}} />
          </Form.Item>
          <Form.Item
            label="Nurse"
            name="nurseId"
            rules={[{required: true, message: "Please select nurse!"}]}
          >
            <Select placeholder="Select nurse">
              {nurses.map((nurse) => (
                <Select.Option
                  key={nurse.staffNurseId}
                  value={nurse.staffNurseId}
                >
                  {nurse.fullName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Round Modal */}
      <Modal
        open={editRoundModalVisible}
        title="Edit Health Check Round"
        onCancel={() => setEditRoundModalVisible(false)}
        onOk={handleSubmitEditRound}
        confirmLoading={editRoundLoading}
        okText="Save"
        width={600}
      >
        <Form form={formEditRound} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Round Name"
                name="roundName"
                rules={[{required: true, message: "Please input round name!"}]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Target Grade"
                name="targetGrade"
                rules={[
                  {required: true, message: "Please select target grade!"},
                ]}
              >
                <Select
                  placeholder="Select class"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.value ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {classes.map((cls) => (
                    <Select.Option key={cls} value={cls}>
                      {cls}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Start Time"
                name="startTime"
                rules={[{required: true, message: "Please select start time!"}]}
              >
                <DatePicker showTime style={{width: "100%"}} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="End Time"
                name="endTime"
                rules={[{required: true, message: "Please select end time!"}]}
              >
                <DatePicker showTime style={{width: "100%"}} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Nurse"
            name="nurseId"
            rules={[{required: true, message: "Please select nurse!"}]}
          >
            <Select placeholder="Select nurse">
              {nurses.map((nurse) => (
                <Select.Option
                  key={nurse.staffNurseId}
                  value={nurse.staffNurseId}
                >
                  {nurse.fullName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default HealthCheckDetail;
