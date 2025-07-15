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
  DownloadOutlined
} from "@ant-design/icons";
import Swal from "sweetalert2";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import axiosInstance from "../../../../api/axios";
import dayjs from "dayjs";

const {Title} = Typography;

const StudentHealthCheckList = () => {
  const navigate = useNavigate();
  const roleName = useSelector((state) => state.user?.role);
  const roundId = localStorage.getItem("selectedHealthCheckRoundId");
  console.log("Current roundId:", roundId);
  const [loading, setLoading] = useState(true);
  const [roundInfo, setRoundInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  // States for detail modal
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultDetail, setResultDetail] = useState(null);
  const [resultLoading, setResultLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  // Function to fetch students with search
  const fetchStudents = useCallback(
    (searchText = "") => {
      setLoading(true);

      axiosInstance
        .get(`/api/managers/health-check-rounds/${roundId}/students`, {
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
    const roundId = localStorage.getItem("selectedHealthCheckRoundId");
    console.log("Retrieved roundId from localStorage:", roundId);

    if (!roundId) {
      message.error("Round ID not found");
      navigate(`/${roleName}/health-check/details`);
      return;
    }

    // Fetch round details
    axiosInstance
      .get(`/api/health-check-rounds/${roundId}`)
      .then((res) => {
        setRoundInfo(res.data);
      })
      .catch((err) => {
        console.error("Error fetching round details:", err);
        message.error("Failed to fetch round details");
      });

    fetchStudents();
  }, [roleName, navigate, fetchStudents]);

  const handleSearch = () => {
    fetchStudents(search);
  };

  const handleBack = () => {
    localStorage.removeItem("selectedHealthCheckRoundId");
    navigate(`/${roleName}/health-check/schedules`);
  };

  const handleExport = () => {
    if (!roundId) {
      message.error("Round ID not found");
      return;
    }
    setDownloadLoading(true);
    axiosInstance
      .get(`/api/health-check-results/export-excel`, {
        params: { roundId }, 
        responseType: "blob",
      })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "HealthCheckRound.xlsx");
        document.body.appendChild(link);
        link.click();
        link.remove();
        message.success("Download successful!");
        Swal.fire({
          icon: "success",
          title: "Download successful!",
          showConfirmButton: false,
          timer: 1500,
        });
      })
      .catch(() => {
        message.error("Download failed");
      })
      .finally(() => {
        setDownloadLoading(false);
      });
  };

  const handleViewResult = (resultId) => {
    if (!resultId) {
      message.error("Health check result ID not found");
      return;
    }

    setResultLoading(true);
    setResultModalVisible(true);

    axiosInstance
      .get(`/api/health-check-results/${resultId}`)
      .then((res) => {
        setResultDetail(res.data);
      })
      .catch((err) => {
        console.error("Error fetching health check result:", err);
        message.error("Failed to fetch health check result details");
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
      dataIndex: ["parentOfStudent", "phoneNumber"], 
      key: "parentPhone",
      render: (text) => text || "N/A",
    },
    {
      title: "Parent Confirm",
      dataIndex: ["parentOfStudent", "parentConfirm"], 
      key: "parentConfirm",
      render: (confirmed) => {
        if (confirmed === true)
          return <Tag color="green">Confirmed</Tag>;
        if (confirmed === false)
          return <Tag color="red">Not Confirmed</Tag>;
        return <Tag color="orange">Pending</Tag>;
      },
    },
    {
      title: "Result Status",
      dataIndex: ["studentsOfRoundResponse", "resultStatus"],
      key: "resultStatus",
     render: (status, record) => {
      const parentConfirm = record?.parentOfStudent?.parentConfirm;
      if (parentConfirm === false) {
        return (
          <Tag color="red" style={{ fontWeight: 600 }}>
            Parent Not Confirmed
          </Tag>
        );
      }
      if (status === "Completed")
        return <Tag color="green">Completed</Tag>;
      if (status === "Failed")
        return <Tag color="red">Failed</Tag>;
      return <Tag color="orange">Pending</Tag>;
    },
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
              record.studentsOfRoundResponse?.healthCheckResultId
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
            Students of Health Check Round
            {roundInfo &&
              `: ${roundInfo.healthCheckRoundInformation?.roundName}`}
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
            loading={downloadLoading}
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
                {roundInfo.healthCheckRoundInformation?.targetGrade}
              </p>
              <p>
                <strong>Time:</strong>{" "}
                {roundInfo.healthCheckRoundInformation?.startTime
                  ? `${dayjs(
                      roundInfo.healthCheckRoundInformation.startTime
                    ).format("DD/MM/YYYY HH:mm")} - 
                 ${dayjs(roundInfo.healthCheckRoundInformation.endTime).format(
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
            title="Health Check Result Detail"
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
            ) : resultDetail ? (
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Record">
                  <Tag color={resultDetail.status ? "green" : "orange"}>
                    {resultDetail.status ? "Completed" : "Pending"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Date of recording">
                  {resultDetail.datePerformed
                    ? dayjs(resultDetail.datePerformed).format("DD/MM/YYYY")
                    : "Not performed yet"}
                </Descriptions.Item>

                {/* Physical measurements */}
                <Descriptions.Item label="Height">
                  {resultDetail.height
                    ? `${resultDetail.height} cm`
                    : "Not recorded"}
                </Descriptions.Item>
                <Descriptions.Item label="Weight">
                  {resultDetail.weight
                    ? `${resultDetail.weight} kg`
                    : "Not recorded"}
                </Descriptions.Item>

                {/* Vision measurements */}
                <Descriptions.Item label="Vision - Left Eye">
                  {resultDetail.visionLeft || "Not recorded"}
                </Descriptions.Item>
                <Descriptions.Item label="Vision - Right Eye">
                  {resultDetail.visionRight || "Not recorded"}
                </Descriptions.Item>

                {/* Other measurements */}
                <Descriptions.Item label="Hearing">
                  {resultDetail.hearing || "Not recorded"}
                </Descriptions.Item>
                <Descriptions.Item label="Nose">
                  {resultDetail.nose || "Not recorded"}
                </Descriptions.Item>
                <Descriptions.Item label="Blood Pressure">
                  {resultDetail.bloodPressure || "Not recorded"}
                </Descriptions.Item>

                <Descriptions.Item label="Notes">
                  {resultDetail.notes || "No notes"}
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

export default StudentHealthCheckList;
