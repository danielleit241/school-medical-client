import React, { useEffect, useState } from "react";
import { Modal, Spin, Typography, Table, Row, Col } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import axiosInstance from '../../../../api/axios';

const { Title } = Typography;

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
    const fetchDetail = async () => {
      try {
        if (!student?.healthCheckResultId) return;
        const response = await axiosInstance.get(`/api/health-check-results/${student?.healthCheckResultId}`);
        setDetailData(response.data);
        setNurseName(response.data?.recordedBy.nurseName || "Unknown Nurse");
      } catch (error) {
        console.error("Error fetching health check result detail:", error);
        setDetailData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [open, student?.healthCheckResultId]);

  const tableData = detailData
    ? [
        { key: "datePerformed", label: "Date Performed", value: detailData.datePerformed || "N/A" },
        { key: "height", label: "Height", value: detailData.height || "N/A" },
        { key: "weight", label: "Weight", value: detailData.weight || "N/A" },
        { key: "nurseName", label: "Nurse Name", value: nurseName || "Unknown Nurse" },
        { key: "visionLeft", label: "Vision Left", value: detailData.visionLeft ? detailData.visionLeft + "/10" : "N/A" },
        { key: "visionRight", label: "Vision Right", value: detailData.visionRight ? detailData.visionRight + "/10" : "N/A" },
        { key: "hearing", label: "Hearing", value: detailData.hearing || "N/A" },
        { key: "nose", label: "Nose", value: detailData.nose || "N/A" },
        { key: "bloodPressure", label: "Blood Pressure", value: detailData.bloodPressure || "N/A" },
        { key: "notes", label: "Notes", value: detailData.notes || "N/A" },
      ]
    : [];

  const columns = [
    {
      title: "Field",
      dataIndex: "label",
      key: "label",
      width: 180,
      render: text => <b>{text}</b>,
    },
    {
      title: "Result",
      dataIndex: "value",
      key: "value",
    },
  ];


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
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          bordered
          size="middle"
          rowKey="key"
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 16px #e6f7ff",
          }}
        />
      ) : (
        <p>No data.</p>
      )}
    </Modal>
  );
};

export default DetailModal;