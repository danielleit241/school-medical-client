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
} from "antd";
import axiosInstance from "../../../../api/axios";
import dayjs from "dayjs";
import {useNavigate} from "react-router-dom";
import {EyeOutlined, PlusOutlined, TeamOutlined} from "@ant-design/icons";
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
  const [nurseProfile, setNurseProfile] = useState(null);

  // Student list state
  const [studentListVisible, setStudentListVisible] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [studentListLoading, setStudentListLoading] = useState(false);

  // Add round modal state
  const [addRoundModalVisible, setAddRoundModalVisible] = useState(false);
  const [addRoundLoading, setAddRoundLoading] = useState(false);
  const [nurses, setNurses] = useState([]);
  const [formAddRound] = Form.useForm();

  const [toParentData, setToParentData] = useState([]);
  const [toNurseData, setToNurseData] = useState([]);
  const [roundsWithNurse, setRoundsWithNurse] = useState([]);

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

  useEffect(() => {
    if (scheduleId) {
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

  const handleBack = () => {
    localStorage.removeItem("scheduleId");
    navigate(`/${roleName}/campaign/vaccine-schedule`);
  };

  const handleRoundDetail = (roundId, nurseId) => {
    setModalVisible(true);
    setRoundLoading(true);
    setNurseProfile(null);
    axiosInstance
      .get(`/api/vaccination-rounds/${roundId}`)
      .then((res) => {
        setRoundDetail(res.data);
        // Lấy profile nurse nếu có nurseId
        const nurseIdToFetch = res.data.nurse?.nurseId || nurseId;
        if (nurseIdToFetch) {
          axiosInstance
            .get(`/api/user-profile/${nurseIdToFetch}`)
            .then((nurseRes) => setNurseProfile(nurseRes.data));
        }
      })
      .finally(() => setRoundLoading(false));
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setRoundDetail(null);
  };

  // Add round
  const openAddRoundModal = async () => {
    setAddRoundModalVisible(true);
    // Lấy danh sách nurse (nếu cần)
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
      // Reload rounds
      setLoading(true);
      axiosInstance
        .get(`/api/vaccinations/schedules/${scheduleId}`)
        .then((res) => setDetail(res.data))
        .finally(() => setLoading(false));
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
  const handleSendNotiNurse = async () => {
    try {
      if (toNurseData.length > 0) {
        await sendNotification("nurse", toNurseData);
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

  // Hàm gửi notification cho parent
  const handleSendNotiParent = async () => {
    try {
      if (toParentData.length > 0) {
        await sendNotification("parent", toParentData);
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

  const handleShowStudentList = (roundId) => {
    setStudentListVisible(true);
    setStudentListLoading(true);
    axiosInstance
      .get(`/api/manager/vaccination-rounds/${roundId}/students`)
      .then((res) => setStudentList(res.data.items || []))
      .finally(() => setStudentListLoading(false));
  };

  const handleCloseStudentList = () => {
    setStudentListVisible(false);
    setStudentList([]);
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
      title="Vaccination Campaign Details"
      style={{maxWidth: 1200, margin: "32px auto"}}
      extra={
        <Space>
          <Button onClick={handleBack} type="primary">
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
            type="dashed"
            icon={<PlusOutlined />}
            onClick={openAddRoundModal}
          >
            Add Round
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
              style={{marginBottom: 16, background: "#f6ffed"}}
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
                    onClick={() =>
                      handleRoundDetail(round.roundId, round.nurseId)
                    }
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
                {roundDetail.nurse?.nurseName}
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                {roundDetail.nurse?.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Nurse">
                {nurseProfile && <span>{nurseProfile.fullName}</span>}
              </Descriptions.Item>
            </Descriptions>
          </>
        ) : (
          <Paragraph>No data found.</Paragraph>
        )}
      </Modal>

      {/* Modal for student list */}
      <Modal
        open={studentListVisible}
        onCancel={handleCloseStudentList}
        footer={null}
        title="Students of this Round"
        width={700}
      >
        {studentListLoading ? (
          <Spin />
        ) : studentList.length === 0 ? (
          <Paragraph>No students found.</Paragraph>
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
                <th style={{border: "1px solid #eee", padding: 6}}>
                  Parent Phone
                </th>
              </tr>
            </thead>
            <tbody>
              {studentList.map((item, idx) => (
                <tr
                  key={item.studentsOfRoundResponse.studentId + idx}
                  style={{border: "1px solid #eee"}}
                >
                  <td style={{border: "1px solid #eee", padding: 6}}>
                    {idx + 1}
                  </td>
                  <td style={{border: "1px solid #eee", padding: 6}}>
                    {item.studentsOfRoundResponse.studentCode}
                  </td>
                  <td style={{border: "1px solid #eee", padding: 6}}>
                    {item.studentsOfRoundResponse.fullName}
                  </td>
                  <td style={{border: "1px solid #eee", padding: 6}}>
                    {item.studentsOfRoundResponse.dayOfBirth}
                  </td>
                  <td style={{border: "1px solid #eee", padding: 6}}>
                    {item.studentsOfRoundResponse.gender}
                  </td>
                  <td style={{border: "1px solid #eee", padding: 6}}>
                    {item.studentsOfRoundResponse.grade?.trim()}
                  </td>
                  <td style={{border: "1px solid #eee", padding: 6}}>
                    {item.parentsOfStudent?.phoneNumber}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Modal>

      {/* Modal for add round */}
      <Modal
        open={addRoundModalVisible}
        title="Add Vaccination Round"
        onCancel={() => setAddRoundModalVisible(false)}
        onOk={handleAddRound}
        confirmLoading={addRoundLoading}
        okText="Add"
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
            rules={[{required: true, message: "Please input target grade!"}]}
          >
            <Input />
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
