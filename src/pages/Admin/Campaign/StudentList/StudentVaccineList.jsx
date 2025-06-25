import React, {useState, useEffect, useCallback} from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Input,
  Space,
  Spin,
  Typography,
  message,
  Modal,
  Descriptions,
} from "antd";
import {
  ArrowLeftOutlined,
  SearchOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import axiosInstance from "../../../../api/axios";
import dayjs from "dayjs";

const {Title} = Typography;

const StudentVaccineList = () => {
  const navigate = useNavigate();
  const roleName = useSelector((state) => state.user?.role);
  const roundId = localStorage.getItem("selectedVaccinationRoundId");

  const [loading, setLoading] = useState(true);
  const [roundInfo, setRoundInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  // States for detail modal
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultDetail, setResultDetail] = useState(null);
  const [resultLoading, setResultLoading] = useState(false);

  // Function to fetch students with search
  const fetchStudents = useCallback(
    (searchText = "") => {
      setLoading(true);

      axiosInstance
        .get(`/api/managers/vaccination-rounds/${roundId}/students`, {
          params: {
            Search: searchText,
          },
        })
        .then((res) => {
          setStudents(res.data.items || []);
        })
        .catch((err) => {
          console.error("Error fetching students:", err);
          message.error("Failed to fetch students");
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [roundId]
  );

  // Fetch round details and students
  useEffect(() => {
    if (!roundId) {
      message.error("Round ID not found");
      navigate(`/${roleName}/vaccine/vaccine-schedule-details/`);
      return;
    }

    // Fetch round details
    axiosInstance
      .get(`/api/vaccination-rounds/${roundId}`)
      .then((res) => {
        setRoundInfo(res.data);
      })
      .catch((err) => {
        console.error("Error fetching round details:", err);
        message.error("Failed to fetch round details");
      });

    // Fetch students list
    fetchStudents();
  }, [roundId, navigate, roleName, fetchStudents]);

  // Handle search
  const handleSearch = () => {
    fetchStudents(search);
  };

  // Handle back button
  const handleBack = () => {
    localStorage.removeItem("selectedVaccinationRoundId");
    navigate(`/${roleName}/vaccine/vaccine-schedule-details/`);
  };

  // Export to Excel (placeholder function)
  const handleExport = () => {
    message.info("Export functionality will be implemented here");
  };

  // Handle view detail of vaccination result
  const handleViewResult = (resultId) => {
    if (!resultId) {
      message.error("Vaccination result ID not found");
      return;
    }

    setResultLoading(true);
    setResultModalVisible(true);

    axiosInstance
      .get(`/api/vaccination-results/${resultId}`)
      .then((res) => {
        setResultDetail(res.data);
        console.log("resultDetail", res.data);
      })
      .catch((err) => {
        console.error("Error fetching vaccination result:", err);
        message.error("Failed to fetch vaccination result details");
      })
      .finally(() => {
        setResultLoading(false);
      });
  };

  // Table columns
  const columns = [
    {
      title: "No.",
      render: (_, __, index) => index + 1,
      width: 70,
    },
    {
      title: "Student Code",
      dataIndex: ["studentsOfRoundResponse", "studentCode"],
      key: "studentCode",
    },
    {
      title: "Full Name",
      dataIndex: ["studentsOfRoundResponse", "fullName"],
      key: "fullName",
    },
    {
      title: "Date of Birth",
      dataIndex: ["studentsOfRoundResponse", "dayOfBirth"],
      key: "dayOfBirth",
      render: (text) => (text ? dayjs(text).format("DD/MM/YYYY") : ""),
    },
    {
      title: "Gender",
      dataIndex: ["studentsOfRoundResponse", "gender"],
      key: "gender",
    },
    {
      title: "Grade",
      dataIndex: ["studentsOfRoundResponse", "grade"],
      key: "grade",
      render: (text) => text?.trim(),
    },
    {
      title: "Parent Phone",
      dataIndex: ["parentsOfStudent", "phoneNumber"],
      key: "parentPhone",
      render: (text) => text || "N/A",
    },
    {
      title: "Parent Confirm",
      dataIndex: ["parentsOfStudent", "parentConfirm"],
      key: "parentConfirm",
      render: (confirmed) => (
        <Tag color={confirmed ? "green" : "orange"}>
          {confirmed ? "Confirmed" : "Pending"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          style={{
            backgroundColor: "#355383",
            borderColor: "#355383",
            color: "#fff",
            padding: "0 15px",
          }}
          size="small"
          onClick={() =>
            handleViewResult(
              record.studentsOfRoundResponse?.vaccinationResultId
            )
          }
        >
          Detail
        </Button>
      ),
    },
  ];

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
          <span>
            Students of Vaccination Round
            {roundInfo &&
              `: ${roundInfo.vaccinationRoundInformation?.roundName}`}
          </span>
        </div>
      }
      extra={
        <Space>
          <Input
            placeholder="Search student"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            style={{width: 250}}
          />
          <Button onClick={handleSearch} type="primary">
            Search
          </Button>
          <Button
            icon={<FileExcelOutlined />}
            onClick={handleExport}
            type="primary"
            style={{background: "#52c41a", borderColor: "#52c41a"}}
          >
            Export
          </Button>
        </Space>
      }
      style={{margin: 24}}
    >
      {loading && !students.length ? (
        <div style={{textAlign: "center", margin: "50px 0"}}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {roundInfo && (
            <div style={{marginBottom: 20}}>
              <Title level={5}>Round Information</Title>
              <p>
                <strong>Target Grade:</strong>{" "}
                {roundInfo.vaccinationRoundInformation?.targetGrade}
              </p>
              <p>
                <strong>Time:</strong>{" "}
                {roundInfo.vaccinationRoundInformation?.startTime
                  ? `${dayjs(
                      roundInfo.vaccinationRoundInformation.startTime
                    ).format("DD/MM/YYYY HH:mm")} - 
                 ${dayjs(roundInfo.vaccinationRoundInformation.endTime).format(
                   "HH:mm"
                 )}`
                  : "N/A"}
              </p>
              <p>
                <strong>Nurse:</strong>{" "}
                {roundInfo.nurse?.nurseName || "Not assigned"}
              </p>
            </div>
          )}

          <Table
            columns={columns}
            dataSource={students}
            pagination={{pageSize: 10}}
            rowKey={(record) =>
              record.studentsOfRoundResponse?.studentId || Math.random()
            }
            bordered
          />

          {/* Vaccination Result Detail Modal */}
          <Modal
            title="Vaccination Result Detail"
            open={resultModalVisible}
            onCancel={() => {
              setResultModalVisible(false);
              setResultDetail(null);
            }}
            footer={[
              <Button
                key="close"
                onClick={() => {
                  setResultModalVisible(false);
                  setResultDetail(null);
                }}
              >
                Close
              </Button>,
            ]}
            width={700}
          >
            {resultLoading ? (
              <div style={{textAlign: "center", padding: "20px"}}>
                <Spin />
              </div>
            ) : resultDetail?.resultResponse ? (
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Parent Confirmed">
                  <Tag
                    color={
                      resultDetail.resultResponse.parentConfirmed
                        ? "green"
                        : "orange"
                    }
                  >
                    {resultDetail.resultResponse.parentConfirmed
                      ? "Confirmed"
                      : "Pending"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Health Qualified">
                  {resultDetail.resultResponse.healthQualified === null ? (
                    <Tag color="blue">Checking</Tag>
                  ) : resultDetail.resultResponse.healthQualified ? (
                    <Tag color="green">Qualified</Tag>
                  ) : (
                    <Tag color="red">Not qualified</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Record">
                  <Tag
                    color={
                      resultDetail.resultResponse.status === "Completed"
                        ? "green"
                        : resultDetail.resultResponse.status === "Pending"
                        ? "orange"
                        : "blue"
                    }
                  >
                    {resultDetail.resultResponse.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Vaccinated">
                  <Tag
                    color={
                      resultDetail.resultResponse.vaccinated
                        ? "green"
                        : "orange"
                    }
                  >
                    {resultDetail.resultResponse.vaccinated ? "Yes" : "No"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Vaccinated Date">
                  {resultDetail.resultResponse.vaccinatedDate
                    ? dayjs(resultDetail.resultResponse.vaccinatedDate).format(
                        "DD/MM/YYYY"
                      )
                    : "Not vaccinated yet"}
                </Descriptions.Item>
                <Descriptions.Item label="Vaccinated Time">
                  {resultDetail.resultResponse.vaccinatedTime ||
                    "Not vaccinated yet"}
                </Descriptions.Item>
                <Descriptions.Item label="Injection Site">
                  {resultDetail.resultResponse.injectionSite || "Not specified"}
                </Descriptions.Item>
                <Descriptions.Item label="Observation">
                  {resultDetail.vaccinationObservation
                    ? resultDetail.vaccinationObservation
                    : "No observations recorded"}
                </Descriptions.Item>
                <Descriptions.Item label="Notes">
                  {resultDetail.resultResponse.notes || "No notes"}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <div style={{textAlign: "center"}}>No result data available</div>
            )}
          </Modal>
        </>
      )}
    </Card>
  );
};

export default StudentVaccineList;
