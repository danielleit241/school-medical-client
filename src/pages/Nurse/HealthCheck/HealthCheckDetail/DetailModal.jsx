import React, { useEffect, useState } from "react";
import { Modal, Spin, Typography, Table, Row, Col, Tag } from "antd";
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

  const renderFailed = (value, status) => {
    if (
      status === "Failed" &&
      (value === null ||
        value === undefined ||
        value === 0 ||
        value === "0" ||
        value === "no" ||
        value === "")
    ) {
      return (
        <Tag color="error" style={{ fontWeight: 600, fontSize: 15, borderRadius: 8 }}>
          Failed
        </Tag>
      );
    }
    return value;
  };

  const tableData = detailData
    ? [
        {
          key: "datePerformed",
          label: "Date Performed",
          value: renderFailed(detailData.datePerformed, detailData.status),
        },
        {
          key: "height",
          label: "Height",
          value: renderFailed(detailData.height, detailData.status),
        },
        {
          key: "weight",
          label: "Weight",
          value: renderFailed(detailData.weight, detailData.status),
        },
        {
          key: "nurseName",
          label: "Nurse Name",
          value: renderFailed(nurseName, detailData.status),
        },
        {
          key: "visionLeft",
          label: "Vision Left",
          value: renderFailed(
            detailData.visionLeft != null ? detailData.visionLeft + "/10" : null,
            detailData.status
          ),
        },
        {
          key: "visionRight",
          label: "Vision Right",
          value: renderFailed(
            detailData.visionRight != null ? detailData.visionRight + "/10" : null,
            detailData.status
          ),
        },
        {
          key: "hearing",
          label: "Hearing",
          value: renderFailed(detailData.hearing, detailData.status),
        },
        {
          key: "nose",
          label: "Nose",
          value: renderFailed(detailData.nose, detailData.status),
        },
        {
          key: "bloodPressure",
          label: "Blood Pressure",
          value: renderFailed(detailData.bloodPressure, detailData.status),
        },
        {
          key: "notes",
          label: "Notes",
          value: renderFailed(detailData.notes, detailData.status),
        },
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