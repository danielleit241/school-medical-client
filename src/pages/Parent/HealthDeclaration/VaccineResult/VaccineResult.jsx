import React, {useState, useEffect} from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Tabs,
  Empty,
  Statistic,
  List,
  Space,
  Divider,
  Tag,
  Button,
} from "antd";
import {
  CalendarOutlined,
  ExperimentOutlined,
  MedicineBoxOutlined,
  NumberOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  BarcodeOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axiosInstance from "../../../../api/axios";
import {LuSyringe} from "react-icons/lu";
import {MdFactory} from "react-icons/md";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";

const {Title, Text} = Typography;
const {TabPane} = Tabs;

const VaccineResult = () => {
  const navigate = useNavigate();
  const roleName = useSelector((state) => state.user.role);
  const [loading, setLoading] = useState(true);
  const [vaccinationResults, setVaccinationResults] = useState([]);
  const student = localStorage.getItem("selectedStudent");
  const studentId = student ? JSON.parse(student).studentId : null;
  // Fetch vaccination results for the student
  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get(`/api/vaccination-results/students/${studentId}`)
      .then((res) => {
        setVaccinationResults(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching vaccination results:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [studentId]);

  const handleBack = () => {
    setTimeout(() => {
      localStorage.removeItem("selectedStudent");
    }, 60000 * 30);
    navigate(`/${roleName}/health-declaration/my-children`);
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Title level={3}>Vaccination Results</Title>
      <Text type="secondary" style={{display: "block", marginBottom: 24}}>
        Vaccination history and detailed information of vaccines
      </Text>
      <div style={{marginBottom: 16}}>
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
        >
          Back
        </Button>
      </div>

      {/* Vaccine List */}
      {vaccinationResults.length === 0 ? (
        <Empty description="No vaccination data found" />
      ) : (
        <List
          dataSource={vaccinationResults}
          renderItem={(item, index) => (
            <Card
              className="mb-4"
              key={index}
              title={
                <Space align="center">
                  <div
                    style={{
                      backgroundColor: index % 2 === 0 ? "#4CAF50" : "#2196F3",
                      color: "white",
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 8,
                    }}
                  >
                    {index + 1}
                  </div>
                  <span>{item.vaccineDoseSummary.vaccineName}</span>
                  <Tag
                    color={index % 2 === 0 ? "green" : "blue"}
                    style={{marginLeft: 8}}
                  >
                    {item.vaccineDoseSummary.totalDoseByVaccineName} doses
                  </Tag>
                </Space>
              }
            >
              {item.vaccineDoseSummary.vaccineResultDetails.map(
                (detail, detailIndex) => (
                  <div key={detailIndex} className="mb-3">
                    {detailIndex > 0 && <Divider />}
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={8}>
                        <Space direction="vertical" size="small">
                          <div>
                            <CalendarOutlined style={{marginRight: 8}} />
                            <Text strong>Vaccination date:</Text>
                          </div>
                          <Text className="ml-6">
                            {dayjs(detail.vaccinatedDate).format("DD/MM/YYYY")}
                          </Text>
                        </Space>
                      </Col>
                      <Col xs={24} md={8}>
                        <Space direction="vertical" size="small">
                          <div>
                            <EnvironmentOutlined style={{marginRight: 8}} />
                            <Text strong>Injection site:</Text>
                          </div>
                          <Text className="ml-6">{detail.injectionSite}</Text>
                        </Space>
                      </Col>
                      <Col xs={24} md={8}>
                        <Space direction="vertical" size="small">
                          <div className="flex items-center">
                            <MdFactory size={20} style={{marginRight: 8}} />
                            <Text strong>Manufacturer:</Text>
                          </div>
                          <Text className="ml-6">{detail.manufacturer}</Text>
                        </Space>
                      </Col>
                      <Col xs={24} md={8}>
                        <Space direction="vertical" size="small">
                          <div>
                            <BarcodeOutlined style={{marginRight: 8}} />
                            <Text strong>Batch number:</Text>
                          </div>
                          <Text className="ml-6">{detail.batchNumber}</Text>
                        </Space>
                      </Col>
                      <Col xs={24} md={8}>
                        <Space direction="vertical" size="small">
                          <div className="flex items-center">
                            <LuSyringe size={20} style={{marginRight: 8}} />
                            <Text strong>Dose number:</Text>
                          </div>
                          <Text className="ml-6">{detail.doseNumber}</Text>
                        </Space>
                      </Col>
                    </Row>
                  </div>
                )
              )}
            </Card>
          )}
        />
      )}
    </div>
  );
};

export default VaccineResult;
