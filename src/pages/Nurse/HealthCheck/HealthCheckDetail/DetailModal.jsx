import React, { useEffect, useState } from "react";
import { Modal, Spin, Typography, Tag, Card, Row, Col } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import axiosInstance from '../../../../api/axios';

const { Title, Text } = Typography;
const DetailModal = ({ open, onCancel, student }) => {
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nurseName, setNurseName] = useState("");
  

  useEffect(() => {
    if (!open && !student?.healthCheckResultId) {
      setLoading(false);
      setDetailData(null);     
    }
    setLoading(true);
    try {
      const fetchDetail = async () => {
        if (!student?.healthCheckResultId) return;
        const response = await axiosInstance.get(`/api/health-check-results/${student?.healthCheckResultId}`);
        setDetailData(response.data);
        console.log("Health Check Result Detail:", response.data);    
        setNurseName(response.data?.recordedBy.nurseName || "Unknown Nurse");
        setLoading(false);
      };
      fetchDetail();
    } catch (error) {
      console.error("Error fetching health check result detail:", error);
      setDetailData(null);
    }
  }, [open, student?.healthCheckResultId]);
  return (
    <Modal
          open={open}
          title={
            <Row align="middle" gutter={12}>
              <Col>
                <InfoCircleOutlined style={{ color: "#1677ff", fontSize: 24 }} />
              </Col>
              <Col>
                <Title level={4} style={{ margin: 0, color: "#1677ff" }}>
                  Health Check Result Detail
                </Title>
              </Col>
            </Row>
          }
          onCancel={onCancel}
          footer={null}
          bodyStyle={{
            maxHeight: 500,
            overflowY: "auto",
            background: "#f4f8fb",
            padding: 32,
          }}
          width={600}
          centered
        >
          {loading ? (
            <Spin />
          ) : detailData ? (
            <Card
              bordered={false}
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 4px 16px #e6f7ff",
              }}
              bodyStyle={{ padding: 28 }}
            >
              <Title level={5} style={{ marginBottom: 16, color: "#52c41a" }}>
                General Information
              </Title>
              <Row gutter={[0, 12]}>
                <Col span={12}><Text type="secondary">Date Performed:</Text></Col>
                <Col span={12}><Text>{detailData?.datePerformed || "N/A"}</Text></Col>
                <Col span={12}><Text type="secondary">Height:</Text></Col>
                <Col span={12}><Text>{detailData?.height || "N/A"}</Text></Col>
                <Col span={12}><Text type="secondary">Weight:</Text></Col>
                <Col span={12}><Text>{detailData?.weight || "N/A"}</Text></Col>
              </Row>
              <Row>
                <Col span={12}><Text type="secondary">Nurse Name:</Text></Col>
                <Col span={12}><Text>{nurseName || "Unknown Nurse"}</Text></Col>
              </Row>
              <Row gutter={[0, 12]}>                                   
                <Col span={12}><Text type="secondary">Vision Left:</Text></Col>
                <Col span={12}><Text>{detailData.visionLeft + "/10" || "N/A"}</Text></Col>
                <Col span={12}><Text type="secondary">Vision Right:</Text></Col>
                <Col span={12}><Text>{detailData.visionRight + "/10" || "N/A"}</Text></Col>
                <Col span={12}><Text type="secondary">Hearing:</Text></Col>
                <Col span={12}><Text>{detailData.hearing || "N/A"}</Text></Col>
                <Col span={12}><Text type="secondary">Nose:</Text></Col>
                <Col span={12}><Text>{detailData.nose || "N/A"}</Text></Col>
                <Col span={12}><Text type="secondary">Blood Pressure:</Text></Col>
                <Col span={12}><Text>{detailData.bloodPressure || "N/A"}</Text></Col>
                <Col span={12}><Text type="secondary">Notes:</Text></Col>
                <Col span={12}><Text>{detailData.notes || "N/A"}</Text></Col>
              </Row> 
            </Card>
          ) : (
            <p>No data.</p>
          )}
        </Modal>
  )
}

export default DetailModal