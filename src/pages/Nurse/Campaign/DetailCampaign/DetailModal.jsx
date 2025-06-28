import React, { useEffect, useState } from "react";
import { Modal, Spin, Typography, Tag, Divider, Card, Table } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import axiosInstance from '../../../../api/axios';

const { Title } = Typography;

const DetailModal = ({ open, onCancel, student }) => {
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [healthDeclaration, setHealthDeclaration] = useState(null);
  const [nurseName, setNurseName] = useState("");

  useEffect(() => {
    const fetchHealthDeclaration = async () => {
      if (open && student?.studentsOfRoundResponse?.studentId) {
        try {
          const response = await axiosInstance.get(
            `/api/students/${student.studentsOfRoundResponse.studentId}/health-declarations`
          );
          setHealthDeclaration(response.data?.healthDeclaration || null);
        } catch (error) {
          console.error("Error fetching health declaration:", error);
          setHealthDeclaration(null);
        }
      }
    };
    fetchHealthDeclaration();
  }, [open, student?.studentsOfRoundResponse?.studentId]);

  useEffect(() => {
    if (!open && !student?.vaccinationResultId) {
      setLoading(false);
      setDetailData(null);
    }
    setLoading(true);
    const fetchDetail = async () => {
      try {
        if (!student?.vaccinationResultId) return;
        const response = await axiosInstance.get(`/api/vaccination-results/${student?.vaccinationResultId}`);
        setDetailData(response.data);
        const res = await axiosInstance.get(`/api/user-profile/${response.data.resultResponse.recorderId}`);
        setNurseName(res.data?.fullName || "Unknown Nurse");
      } catch (error) {
        console.error("Error fetching vaccination result detail:", error);
        setDetailData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [open, student?.vaccinationResultId]);

  // Table data
  const healthProfileData = [
    {
      key: "chronicDiseases",
      label: "Chronic Diseases",
      value: healthDeclaration?.chronicDiseases ?? "Not Qualified",
    },
    {
      key: "drugAllergies",
      label: "Drug Allergies",
      value: healthDeclaration?.drugAllergies ?? "Not Qualified",
    },
    {
      key: "foodAllergies",
      label: "Food Allergies",
      value: healthDeclaration?.foodAllergies ?? "Not Qualified",
    },
  ];

  const vaccinationResult = detailData?.resultResponse || {};
  const vaccinationResultData = [
    {
      key: "nurseName",
      label: "Nurse Name",
      value: nurseName || "Not Qualified",
    },
    {
      key: "vaccinatedDate",
      label: "Vaccinated Date",
      value: vaccinationResult.vaccinatedDate ?? "Not Qualified",
    },
    {
      key: "notes",
      label: "Notes",
      value: detailData?.notes ?? "Not Qualified",
    },
    {
      key: "parentConfirmed",
      label: "Parent Confirmed",
      value: (
        <Tag color={vaccinationResult.parentConfirmed === null ? "red" : vaccinationResult.parentConfirmed ? "green" : "red"}>
          {vaccinationResult.parentConfirmed === null
            ? "Not Qualified"
            : vaccinationResult.parentConfirmed
            ? "Yes"
            : "No"}
        </Tag>
      ),
    },
    {
      key: "vaccinated",
      label: "Vaccinated",
      value: (
        <Tag color={vaccinationResult.vaccinated === null ? "red" : vaccinationResult.vaccinated ? "green" : "red"}>
          {vaccinationResult.vaccinated === null
            ? "Not Qualified"
            : vaccinationResult.vaccinated
            ? "Yes"
            : "No"}
        </Tag>
      ),
    },
    {
      key: "status",
      label: "Status",
      value: (
        <Tag color={vaccinationResult.status == null ? "red" : "blue"} style={{ textTransform: "capitalize" }}>
          {vaccinationResult.status == null ? "Not Qualified" : vaccinationResult.status}
        </Tag>
      ),
    },
    {
      key: "injectionSite",
      label: "Injection Site",
      value: vaccinationResult.injectionSite ?? "Not Qualified",
    },
  ];

  const observation = detailData?.vaccinationObservation;
  const observationData = [
    {
      key: "observationStartTime",
      label: "Observation Start Time",
      value: observation?.observationStartTime ?? "Not Qualified",
    },
    {
      key: "observationEndTime",
      label: "Observation End Time",
      value: observation?.observationEndTime ?? "Not Qualified",
    },
    {
      key: "reactionStartTime",
      label: "Reaction Start Time",
      value: observation?.reactionStartTime ?? "Not Qualified",
    },
    {
      key: "reactionType",
      label: "Reaction Type",
      value: observation?.reactionType ?? "Not Qualified",
    },
    {
      key: "severityLevel",
      label: "Severity Level",
      value: (
        <Tag color={observation?.severityLevel == null ? "red" : "red"}>
          {observation?.severityLevel == null
            ? "Not Qualified"
            : observation?.severityLevel}
        </Tag>
      ),
    },
    {
      key: "immediateReaction",
      label: "Immediate Reaction",
      value: observation?.immediateReaction ?? "Not Qualified",
    },
    {
      key: "intervention",
      label: "Intervention",
      value: observation?.intervention ?? "Not Qualified",
    },
    {
      key: "observedBy",
      label: "Observed By",
      value: observation?.observedBy ?? "Not Qualified",
    },
    {
      key: "notes",
      label: "Notes",
      value: observation?.notes ?? "Not Qualified",
    },
  ];

  const columns = [
    {
      title: "Field",
      dataIndex: "label",
      key: "label",
      width: 200,
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
    },
  ];

  return (
    <Modal
      open={open}
      title={
        <span>
          <InfoCircleOutlined style={{ color: "#1677ff", fontSize: 24, marginRight: 8 }} />
          <Title level={4} style={{ margin: 0, color: "#1677ff", display: "inline" }}>
            Vaccination Result Detail
          </Title>
        </span>
      }
      onCancel={onCancel}
      footer={null}
      bodyStyle={{
        maxHeight: 500,
        overflowY: "auto",
        background: "#f4f8fb",
        padding: 32,
      }}
      width={650}
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
          bodyStyle={{ padding: 20 }}
        >
          <Title level={5} style={{ marginBottom: 12, color: "#52c41a" }}>
            Health Profile
          </Title>
          <Table
            columns={columns}
            dataSource={healthProfileData}
            pagination={false}
            size="small"
            rowKey="key"
            style={{ marginBottom: 24 }}
            bordered
          />

          <Title level={5} style={{ marginBottom: 12, color: "#1677ff" }}>
            Vaccination Result
          </Title>
          <Table
            columns={columns}
            dataSource={vaccinationResultData}
            pagination={false}
            size="small"
            rowKey="key"
            style={{ marginBottom: 24 }}
            bordered
          />

          <Title level={5} style={{ marginBottom: 12, color: "#faad14" }}>
            Observation
          </Title>
          {detailData.vaccinationObservation ? (
            <Table
              columns={columns}
              dataSource={observationData}
              pagination={false}
              size="small"
              rowKey="key"
              bordered
            />
          ) : (
            <p>Is it not qualified.</p>
          )}
        </Card>
      ) : (
        <p>No data.</p>
      )}
    </Modal>
  );
};

export default DetailModal;