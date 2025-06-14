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

  useEffect(() => {
    if (scheduleId) {
      axiosInstance
        .get(`/api/vaccinations/schedules/${scheduleId}`)
        .then((res) => setDetail(res.data))
        .finally(() => setLoading(false));
    }
  }, [scheduleId]);

  const handleBack = () => {
    localStorage.removeItem("scheduleId");
    navigate(-1);
  };

  const handleEdit = () => {
    navigate(`/${roleName}/campaign/vaccine-schedule-edit/${scheduleId}`);
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

  const handleAddStudent = async () => {
    try {
      const res = await axiosInstance.post(
        "/api/vaccination/schedules/add-students",
        scheduleId,
        {headers: {"Content-Type": "application/json"}}
      );
      const {toParent = [], toNurse = []} = res.data || {};

      // Gửi thông báo cho nurse
      if (toNurse.length > 0) {
        await axiosInstance.post(
          "/api/notifications/vaccinations/to-nurse",
          toNurse,
          {headers: {"Content-Type": "application/json"}}
        );
      }

      // Gửi thông báo cho parent
      if (toParent.length > 0) {
        await axiosInstance.post(
          "/api/notifications/vaccinations/to-parent",
          toParent,
          {headers: {"Content-Type": "application/json"}}
        );
      }

      Swal.fire({
        icon: "success",
        title: "Add students and send notifications successfully!",
        html: `
        <div>
          <b>To Parent:</b> ${toParent.length} notification(s)<br/>
          <b>To Nurse:</b> ${toNurse.length} notification(s)
        </div>
      `,
        showConfirmButton: false,
        timer: 2500,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Add students or send notifications failed!",
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
  const rounds = detail.vaccinationRounds || [];

  return (
    <Card
      title="Vaccination Campaign Details"
      style={{maxWidth: 1000, margin: "32px auto"}}
      extra={
        <Space>
          <Button onClick={handleBack} type="primary">
            Back
          </Button>
          <Button onClick={handleEdit}>Edit</Button>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddStudent}
          >
            Add Student
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
          {rounds.length === 0 && <Paragraph>No rounds available.</Paragraph>}
          {rounds.map((round, idx) => (
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
                  {nurseProfile && <span>{nurseProfile.fullName}</span>}
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
                <th style={{border: "1px solid #eee", padding: 6}}>#</th>
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
                  Parent Name
                </th>
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
                    {item.parentsOfStudent?.fullName}
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
    </Card>
  );
};

export default DetailCampaign;
