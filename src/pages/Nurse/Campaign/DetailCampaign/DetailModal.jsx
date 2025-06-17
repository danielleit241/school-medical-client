import React, { useEffect, useState } from "react";
import { Modal, Spin, Typography, Tag, Divider, Card, Row, Col } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import axiosInstance from '../../../../api/axios';

const { Title, Text } = Typography;

const DetailModal = ({ open, onCancel, student }) => {
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open && !student?.vaccinationResultId) {
      setLoading(false);
      setDetailData(null);     
    }
    setLoading(true);
    try {
      const fetchDetail = async () => {
        if (!student?.vaccinationResultId) return;
        const response = await axiosInstance.get(`/api/vaccination-results/${student?.vaccinationResultId}`);
        setDetailData(response.data);
        console.log("Fetched vaccination result detail:", response.data);
        setLoading(false);
      };
      fetchDetail();
    } catch (error) {
      console.error("Error fetching vaccination result detail:", error);
      setDetailData(null);
    }
  }, [open, student?.vaccinationResultId]);

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
              Vaccination Result Detail
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
            <Col span={12}><Text type="secondary">Vaccination Result ID:</Text></Col>
            <Col span={12}><Text strong>{detailData.vaccinationResultId}</Text></Col>
            <Col span={12}><Text type="secondary">Recorder ID:</Text></Col>
            <Col span={12}><Text>{detailData.recorderId}</Text></Col>
            <Col span={12}><Text type="secondary">Vaccinated Date:</Text></Col>
            <Col span={12}><Text>{detailData.vaccinatedDate}</Text></Col>
            <Col span={12}><Text type="secondary">Notes:</Text></Col>
            <Col span={12}><Text>{detailData.notes || <span style={{ color: "#aaa" }}>No notes</span>}</Text></Col>
            <Col span={12}><Text type="secondary">Health Profile ID:</Text></Col>
            <Col span={12}><Text>{detailData.healthProfileId}</Text></Col>
            <Col span={12}><Text type="secondary">Round ID:</Text></Col>
            <Col span={12}><Text>{detailData.roundId}</Text></Col>
            <Col span={12}><Text type="secondary">Parent Confirmed:</Text></Col>
            <Col span={12}>
              <Tag color={detailData.parentConfirmed ? "green" : "red"}>
                {detailData.parentConfirmed ? "Yes" : "No"}
              </Tag>
            </Col>
            <Col span={12}><Text type="secondary">Vaccinated:</Text></Col>
            <Col span={12}>
              <Tag color={detailData.vaccinated ? "green" : "red"}>
                {detailData.vaccinated ? "Yes" : "No"}
              </Tag>
            </Col>
            <Col span={12}><Text type="secondary">Status:</Text></Col>
            <Col span={12}>
              <Tag color="blue" style={{ textTransform: "capitalize" }}>
                {detailData.status}
              </Tag>
            </Col>
            <Col span={12}><Text type="secondary">Injection Site:</Text></Col>
            <Col span={12}><Text>{detailData.injectionSite}</Text></Col>
          </Row>
          {detailData.observation && (
            <>
              <Divider orientation="left" style={{ marginTop: 32 }}>
                <b>Observation</b>
              </Divider>
              <Row gutter={[0, 12]}>
                <Col span={12}><Text type="secondary">Observation Start Time:</Text></Col>
                <Col span={12}><Text>{detailData.observation.observationStartTime}</Text></Col>
                <Col span={12}><Text type="secondary">Observation End Time:</Text></Col>
                <Col span={12}><Text>{detailData.observation.observationEndTime}</Text></Col>
                <Col span={12}><Text type="secondary">Reaction Start Time:</Text></Col>
                <Col span={12}><Text>{detailData.observation.reactionStartTime}</Text></Col>
                <Col span={12}><Text type="secondary">Reaction Type:</Text></Col>
                <Col span={12}><Text>{detailData.observation.reactionType}</Text></Col>
                <Col span={12}><Text type="secondary">Severity Level:</Text></Col>
                <Col span={12}><Tag color="red">{detailData.observation.severityLevel}</Tag></Col>
                <Col span={12}><Text type="secondary">Immediate Reaction:</Text></Col>
                <Col span={12}><Text>{detailData.observation.immediateReaction}</Text></Col>
                <Col span={12}><Text type="secondary">Intervention:</Text></Col>
                <Col span={12}><Text>{detailData.observation.intervention}</Text></Col>
                <Col span={12}><Text type="secondary">Observed By:</Text></Col>
                <Col span={12}><Text>{detailData.observation.observedBy}</Text></Col>
                <Col span={12}><Text type="secondary">Notes:</Text></Col>
                <Col span={12}><Text>{detailData.observation.notes}</Text></Col>
              </Row>
            </>
          )}
        </Card>
      ) : (
        <p>No data.</p>
      )}
    </Modal>
  );
};

export default DetailModal;