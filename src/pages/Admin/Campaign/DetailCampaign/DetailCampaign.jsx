import React, {useEffect, useState} from "react";
import {
  Card,
  Row,
  Col,
  Descriptions,
  Tag,
  Spin,
  Typography,
  Button,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Dropdown,
} from "antd";
import axiosInstance from "../../../../api/axios";
import dayjs from "dayjs";
import {useNavigate} from "react-router-dom";
import {
  ArrowLeftOutlined,
  EyeOutlined,
  PlusOutlined,
  TeamOutlined,
  DownOutlined,
} from "@ant-design/icons";
import {useSelector} from "react-redux";
import Swal from "sweetalert2";

const {Title, Paragraph} = Typography;

const DetailCampaign = () => {
  const roleName = useSelector((state) => state.user?.role);
  const scheduleId = localStorage.getItem("vaccinationScheduleId");
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [roundDetail, setRoundDetail] = useState(null);
  const [roundLoading, setRoundLoading] = useState(false);

  // Add round modal state
  const [addRoundModalVisible, setAddRoundModalVisible] = useState(false);
  const [addRoundLoading, setAddRoundLoading] = useState(false);
  const [nurses, setNurses] = useState([]);
  const [formAddRound] = Form.useForm();

  const [toParentData, setToParentData] = useState([]);
  const [toNurseData, setToNurseData] = useState([]);
  const [roundsWithNurse, setRoundsWithNurse] = useState([]);
  const [classes, setClasses] = useState([]); // Thêm state để lưu danh sách lớp

  // Thêm hàm lấy profile nurse cho từng round
  const fetchRoundsWithNurse = async (rounds) => {
    const roundsData = await Promise.all(
      rounds.map(async (round) => {
        if (round.nurseId) {
          try {
            const nurseRes = await axiosInstance.get(
              `/api/user-profile/${round.nurseId}`
            );
            return {...round, nurseProfile: nurseRes.data};
          } catch {
            return {...round, nurseProfile: null};
          }
        }
        return {...round, nurseProfile: null};
      })
    );
    setRoundsWithNurse(roundsData);
  };

  // 1. Thêm useEffect để đọc dữ liệu từ localStorage
  useEffect(() => {
    if (scheduleId) {
      // Load notification data from localStorage
      try {
        const savedToParent = localStorage.getItem(
          `toParentData_${scheduleId}`
        );
        const savedToNurse = localStorage.getItem(`toNurseData_${scheduleId}`);

        if (savedToParent) {
          setToParentData(JSON.parse(savedToParent));
        }

        if (savedToNurse) {
          setToNurseData(JSON.parse(savedToNurse));
        }
      } catch (error) {
        console.error(
          "Error loading notification data from localStorage:",
          error
        );
      }

      // Fetch schedule data
      axiosInstance
        .get(`/api/vaccinations/schedules/${scheduleId}`)
        .then(async (res) => {
          setDetail(res.data);
          const rounds = res.data.vaccinationRounds || [];
          await fetchRoundsWithNurse(rounds);
        })
        .finally(() => setLoading(false));
    }
  }, [scheduleId]);

  // Fetch danh sách lớp khi component mount
  useEffect(() => {
    axiosInstance
      .get("/api/students/classes")
      .then((res) => {
        // Xử lý dữ liệu để loại bỏ khoảng trắng thừa
        const formattedClasses = res.data.map((cls) => cls.trim());
        setClasses(formattedClasses);
      })
      .catch((err) => {
        console.error("Error fetching classes:", err);
        setClasses([]);
      });
  }, []);

  const handleBack = () => {
    localStorage.removeItem("scheduleId");
    navigate(`/${roleName}/vaccine/vaccine-schedule`);
  };

  const handleRoundDetail = (roundId) => {
    setModalVisible(true);
    setRoundLoading(true);

    axiosInstance
      .get(`/api/vaccination-rounds/${roundId}`)
      .then((res) => {
        setRoundDetail(res.data);
        // Không cần gọi API lấy profile nurse nữa vì đã có trong response
      })
      .finally(() => setRoundLoading(false));
  };

  // Removed duplicate handleModalClose function to fix redeclaration error

  // Thêm state để quản lý loại modal
  const [modalType, setModalType] = useState("new"); // "new" hoặc "supplement"

  // Add round
  const openAddRoundModal = async (type) => {
    setModalType(type); // "new" hoặc "supplement"
    setAddRoundModalVisible(true);

    // Nếu là supplement round, tự động set targetGrade là "Supplement"
    if (type === "supplement") {
      formAddRound.setFieldsValue({
        roundName: `Supplement Round`,
        targetGrade: "Supplement",
      });
    } else {
      // Đối với new round, chỉ cần reset form mà không cần set targetGrade
      formAddRound.resetFields();
    }

    // Lấy danh sách nurse
    try {
      const res = await axiosInstance.get("/api/nurses");
      setNurses(res.data || []);
    } catch {
      setNurses([]);
    }
  };

  const handleAddRound = async () => {
    try {
      setAddRoundLoading(true);
      const values = await formAddRound.validateFields();
      await axiosInstance.post("/api/schedules/vaccination-rounds", {
        scheduleId,
        roundName: values.roundName,
        targetGrade: values.targetGrade,
        description: values.description,
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
        nurseId: values.nurseId,
      });
      message.success("Add round successfully!");
      setAddRoundModalVisible(false);
      formAddRound.resetFields();

      // Reload data with loading indicator
      setLoading(true);

      try {
        // Get updated schedule details
        const scheduleRes = await axiosInstance.get(
          `/api/vaccinations/schedules/${scheduleId}`
        );
        setDetail(scheduleRes.data);

        // Update rounds with nurse data
        if (scheduleRes.data && scheduleRes.data.vaccinationRounds) {
          await fetchRoundsWithNurse(scheduleRes.data.vaccinationRounds);
        }

        // ĐÃ XÓA: không reset notification data nữa
        // setToParentData([]);
        // setToNurseData([]);

        // Add any other data refresh needed
      } catch (refreshErr) {
        console.error("Error refreshing data:", refreshErr);
        message.error(
          "Failed to refresh data. Please reload the page manually."
        );
      } finally {
        setLoading(false);
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      message.error("Add round failed!");
    } finally {
      setAddRoundLoading(false);
    }
  };

  // Hàm add student, chỉ lưu lại dữ liệu notification
  const handleAddStudent = async () => {
    try {
      const res = await axiosInstance.post(
        "/api/vaccination/schedules/add-students",
        scheduleId
      );
      const {toParent = [], toNurse = []} = res.data || {};

      // Lưu vào state
      setToParentData(toParent);
      setToNurseData(toNurse);

      // Lưu vào localStorage để tránh mất dữ liệu khi refresh
      localStorage.setItem(
        `toParentData_${scheduleId}`,
        JSON.stringify(toParent)
      );
      localStorage.setItem(
        `toNurseData_${scheduleId}`,
        JSON.stringify(toNurse)
      );

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
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Add students failed!",
        text: err?.response?.data?.message || "An error occurred.",
      });
    }
  };

  // Hàm gửi notification chung
  const sendNotification = async (type, data) => {
    if (!Array.isArray(data) || data.length === 0) return;
    const url =
      type === "parent"
        ? "/api/notifications/vaccinations/to-parent"
        : "/api/notifications/vaccinations/to-nurse";
    await axiosInstance.post(url, data);
  };

  // Hàm gửi notification cho nurse
  const handleSendNotiNurse = async (dataToSend = null) => {
    try {
      // Sử dụng dữ liệu được truyền vào hoặc từ state
      const data = dataToSend || toNurseData;

      if (data.length > 0) {
        await sendNotification("nurse", data);
        Swal.fire({
          icon: "success",
          title: "Sent notifications to nurses successfully!",
          showConfirmButton: false,
          timer: 1800,
        });
        setToNurseData([]);
        // Xóa khỏi localStorage sau khi gửi thành công
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

  // Hàm gửi notification cho parent
  const handleSendNotiParent = async (dataToSend = null) => {
    try {
      // Sử dụng dữ liệu được truyền vào hoặc từ state
      const data = dataToSend || toParentData;

      if (data.length > 0) {
        await sendNotification("parent", data);
        Swal.fire({
          icon: "success",
          title: "Sent notifications to parents successfully!",
          showConfirmButton: false,
          timer: 1800,
        });
        setToParentData([]);
        // Xóa khỏi localStorage sau khi gửi thành công
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

  // 3. Sửa hàm handleModalClose để không làm mất dữ liệu thông báo
  const handleModalClose = () => {
    setModalVisible(false);
    setRoundDetail(null);
    // KHÔNG reset các state toParentData và toNurseData ở đây
  };

  // 4. Khi hàm handleShowStudentList được gọi, cần đảm bảo không mất dữ liệu thông báo
  const handleShowStudentList = (roundId) => {
    localStorage.setItem("selectedVaccinationRoundId", roundId);
    // Lưu state hiện tại của các notification trước khi chuyển trang
    localStorage.setItem(
      `toParentData_${scheduleId}`,
      JSON.stringify(toParentData)
    );
    localStorage.setItem(
      `toNurseData_${scheduleId}`,
      JSON.stringify(toNurseData)
    );
    navigate(`/${roleName}/vaccine/vaccine-round/student-list`);
  };

  if (loading) {
    return (
      <div style={{textAlign: "center", marginTop: 40}}>
        <Spin size="large" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div style={{textAlign: "center", marginTop: 40}}>No data found.</div>
    );
  }

  const vaccine = detail.vaccinationDetailsResponse;

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
          <span>Vaccination Campaign Details</span>
        </div>
      }
      style={{maxWidth: 1200, margin: "32px auto"}}
      extra={
        <Space>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddStudent}
          >
            Add Student
          </Button>

          <Dropdown
            menu={{
              items: [
                {
                  key: "1",
                  label: "Add New Round",
                  onClick: () => openAddRoundModal("new"),
                },
                {
                  key: "2",
                  label: "Add Supplement Round",
                  onClick: () => openAddRoundModal("supplement"),
                },
              ],
            }}
          >
            <Button type="dashed" icon={<PlusOutlined />}>
              Add Round <DownOutlined />
            </Button>
          </Dropdown>

          <Button
            type="primary"
            onClick={() => {
              // Đọc dữ liệu từ localStorage nếu state rỗng
              if (toNurseData.length === 0) {
                try {
                  const savedData = localStorage.getItem(
                    `toNurseData_${scheduleId}`
                  );
                  if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    setToNurseData(parsedData);
                    handleSendNotiNurse(parsedData);
                    return;
                  }
                } catch (error) {
                  console.error("Error parsing nurse data:", error);
                }
              }
              handleSendNotiNurse(toNurseData);
            }}
            disabled={
              toNurseData.length === 0 &&
              !localStorage.getItem(`toNurseData_${scheduleId}`)
            }
          >
            Send to Nurse
          </Button>

          <Button
            type="primary"
            onClick={() => {
              // Đọc dữ liệu từ localStorage nếu state rỗng
              if (toParentData.length === 0) {
                try {
                  const savedData = localStorage.getItem(
                    `toParentData_${scheduleId}`
                  );
                  if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    setToParentData(parsedData);
                    handleSendNotiParent(parsedData);
                    return;
                  }
                } catch (error) {
                  console.error("Error parsing parent data:", error);
                }
              }
              handleSendNotiParent(toParentData);
            }}
            disabled={
              toParentData.length === 0 &&
              !localStorage.getItem(`toParentData_${scheduleId}`)
            }
          >
            Send to Parent
          </Button>
        </Space>
      }
    >
      <Row gutter={32}>
        {/* Vaccine Information */}
        <Col span={12}>
          <Title level={4}>Vaccine Information</Title>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Vaccine Name">
              {vaccine.vaccineName}
            </Descriptions.Item>
            <Descriptions.Item label="Vaccine Code">
              {vaccine.vaccineCode}
            </Descriptions.Item>
            <Descriptions.Item label="Manufacturer">
              {vaccine.manufacturer}
            </Descriptions.Item>
            <Descriptions.Item label="Vaccine Type">
              {vaccine.vaccineType}
            </Descriptions.Item>
            <Descriptions.Item label="Age Recommendation">
              {vaccine.ageRecommendation}
            </Descriptions.Item>
            <Descriptions.Item label="Batch Number">
              {vaccine.batchNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Expiration Date">
              {vaccine.expirationDate}
            </Descriptions.Item>
            <Descriptions.Item label="Contraindication Notes">
              {vaccine.contraindicationNotes}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {vaccine.description}
            </Descriptions.Item>
          </Descriptions>
        </Col>

        {/* Vaccination Rounds */}
        <Col span={12}>
          <Title level={4}>Vaccination Rounds</Title>
          {roundsWithNurse.length === 0 && (
            <Paragraph>No rounds available.</Paragraph>
          )}
          {roundsWithNurse.map((round, idx) => (
            <Card
              key={round.roundId}
              type="inner"
              title={`Round ${idx + 1}: ${round.roundName}`}
              style={{marginBottom: 16, background: "#E6F7FF"}}
              extra={
                <Space>
                  {round.status ? (
                    <Tag color="green">Completed</Tag>
                  ) : (
                    <Tag color="orange">Not completed</Tag>
                  )}
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleRoundDetail(round.roundId)}
                  >
                    Detail
                  </Button>
                  <Button
                    size="small"
                    icon={<TeamOutlined />}
                    onClick={() => handleShowStudentList(round.roundId)}
                  >
                    List Students
                  </Button>
                </Space>
              }
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Target Grade">
                  {round.targetGrade}
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {round.description || "None"}
                </Descriptions.Item>
                <Descriptions.Item label="Start Time">
                  {round.startTime
                    ? dayjs(round.startTime).format("YYYY-MM-DD HH:mm")
                    : ""}
                </Descriptions.Item>
                <Descriptions.Item label="End Time">
                  {round.endTime
                    ? dayjs(round.endTime).format("YYYY-MM-DD HH:mm")
                    : ""}
                </Descriptions.Item>
                <Descriptions.Item label="Nurse">
                  {round.nurseProfile?.fullName || "Not assigned yet"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          ))}
        </Col>
      </Row>

      {/* Modal for round detail */}
      <Modal
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        title="Vaccination Round Detail"
      >
        {roundLoading ? (
          <Spin />
        ) : roundDetail ? (
          <>
            <Descriptions
              column={1}
              bordered
              size="small"
              title="Round Information"
            >
              <Descriptions.Item label="Round Name">
                {roundDetail.vaccinationRoundInformation?.roundName}
              </Descriptions.Item>
              <Descriptions.Item label="Target Grade">
                {roundDetail.vaccinationRoundInformation?.targetGrade}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {roundDetail.vaccinationRoundInformation?.description || "None"}
              </Descriptions.Item>
              <Descriptions.Item label="Start Time">
                {roundDetail.vaccinationRoundInformation?.startTime
                  ? dayjs(
                      roundDetail.vaccinationRoundInformation.startTime
                    ).format("YYYY-MM-DD HH:mm")
                  : ""}
              </Descriptions.Item>
              <Descriptions.Item label="End Time">
                {roundDetail.vaccinationRoundInformation?.endTime
                  ? dayjs(
                      roundDetail.vaccinationRoundInformation.endTime
                    ).format("YYYY-MM-DD HH:mm")
                  : ""}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {roundDetail.vaccinationRoundInformation?.status ? (
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
              <Descriptions.Item label="Nurse Name">
                {roundDetail.nurse?.nurseName || "Not assigned"}
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                {roundDetail.nurse?.phoneNumber || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </>
        ) : (
          <Paragraph>No data found.</Paragraph>
        )}
      </Modal>

      {/* Modal for add round */}
      <Modal
        open={addRoundModalVisible}
        title={
          modalType === "new"
            ? "Add New Vaccination Round"
            : "Add Supplement Vaccination Round"
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

          {/* Thay đổi target grade thành Select cho new round hoặc Input disabled cho supplement round */}
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
    </Card>
  );
};

export default DetailCampaign;
