import React, { useEffect, useState } from "react";
import { Modal, Spin, Typography, Tag, Card, Table } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import axiosInstance from '../../../../api/axios';

const { Title } = Typography;

const DetailModal = ({ open, onCancel, student, roundId }) => {
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [healthDeclaration, setHealthDeclaration] = useState(null);
  const [nurseName, setNurseName] = useState("");
  const [dynamicStaffNurseId, setDynamicStaffNurseId] = useState("");
  const [failedResultIds, setFailedResultIds] = useState([]);

  // Fetch all failed vaccinationResultIds for this round
  useEffect(() => {
    const fetchFailedIds = async () => {
      if (!open || !dynamicStaffNurseId || !roundId) return;
      try {
        const res = await axiosInstance.get(
          `/api/v2/nurses/${dynamicStaffNurseId}/vaccination-rounds/${roundId}/students`
        );
        const studentsArr = Array.isArray(res.data) ? res.data : [];
        const ids = studentsArr
          .map((item) => item.studentsOfRoundResponse?.vaccinationResultId)
          .filter(Boolean);

        // Check which ids have resultResponse.status === "Failed"
        const failedIds = [];
        await Promise.all(
          ids.map(async (resultId) => {
            try {
              const resultRes = await axiosInstance.get(
                `/api/vaccination-results/${resultId}`
              );
              if (
                resultRes.data &&
                resultRes.data.resultResponse &&
                resultRes.data.resultResponse.status === "Failed"
              ) {
                failedIds.push(resultId);
              }
            } catch {
              return;
            }
          })
        );
        setFailedResultIds(failedIds);
      } catch {
        setFailedResultIds([]);
      }
    };
    fetchFailedIds();
  }, [open, dynamicStaffNurseId, roundId]);

  useEffect(() => {
    const fetchHealthDeclaration = async () => {
      if (open && student?.studentsOfRoundResponse?.studentId) {
        try {
          const response = await axiosInstance.get(
            `/api/students/${student.studentsOfRoundResponse.studentId}/health-declarations`
          );
          setHealthDeclaration(response.data?.healthDeclaration || null);
        } catch {
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
        const response = await axiosInstance.get(
          `/api/vaccination-results/${student?.vaccinationResultId}`
        );
        console.log("Vaccination result detail:", response.data);
        setDetailData(response.data);
        // Lấy staffNurseId từ recorderId
        setDynamicStaffNurseId(response.data.resultResponse.recorderId);
        const res = await axiosInstance.get(
          `/api/user-profile/${response.data.resultResponse.recorderId}`
        );
        setNurseName(res.data?.fullName || "Unknown Nurse");
      } catch {
        setDetailData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [open, student?.vaccinationResultId]);

  // Helper: nếu trường null và id nằm trong failedResultIds thì trả về "Failed"
  const showValue = (value) => {
    if (
      value == null &&
      failedResultIds.includes(student?.vaccinationResultId)
    ) {
      return <Tag color="red">Failed</Tag>;
    }
    if (value == null) {
      return <Tag color="orange">Not Qualified</Tag>;
    }
    return value;
  };

  // Table data
  const healthProfileData = [
    {
      key: "chronicDiseases",
      label: "Chronic Diseases",
      value: showValue(healthDeclaration?.chronicDiseases),
    },
    {
      key: "drugAllergies",
      label: "Drug Allergies",
      value: showValue(healthDeclaration?.drugAllergies),
    },
    {
      key: "foodAllergies",
      label: "Food Allergies",
      value: showValue(healthDeclaration?.foodAllergies),
    },
  ];

  const vaccinationResult = detailData?.resultResponse || {};
  const vaccinationResultData = [
    {
      key: "nurseName",
      label: "Nurse Name",
      value: showValue(nurseName),
    },
    {
      key: "vaccinatedDate",
      label: "Vaccinated Date",
      value: showValue(vaccinationResult.vaccinatedDate),
    },
    {
      key: "notes",
      label: "Notes",
      value: showValue(detailData?.notes),
    },
    {
      key: "parentConfirmed",
      label: "Parent Confirmed",
      value: showValue(
        vaccinationResult.parentConfirmed == null
          ? null
          : vaccinationResult.parentConfirmed
          ? <Tag color="green">Yes</Tag>
          : <Tag color="red">No</Tag>
      ),
    },
    {
      key: "vaccinated",
      label: "Vaccinated",
      value: showValue(
        vaccinationResult.vaccinated == null
          ? null
          : vaccinationResult.vaccinated
          ? <Tag color="green">Yes</Tag>
          : <Tag color="red">No</Tag>
      ),
    },
    {
      key: "status",
      label: "Status",
      value: showValue(
        vaccinationResult.status == null
          ? null
          : <Tag color="blue" style={{ textTransform: "capitalize" }}>
              {vaccinationResult.status}
            </Tag>
      ),
    },
    {
      key: "injectionSite",
      label: "Injection Site",
      value: showValue(vaccinationResult.injectionSite),
    },
  ];

  const observation = detailData?.vaccinationObservation;
  const observationData = [
    {
      key: "observationStartTime",
      label: "Observation Start Time",
      value: showValue(observation?.observationStartTime),
    },
    {
      key: "observationEndTime",
      label: "Observation End Time",
      value: showValue(observation?.observationEndTime),
    },
    {
      key: "reactionStartTime",
      label: "Reaction Start Time",
      value: showValue(observation?.reactionStartTime),
    },
    {
      key: "reactionType",
      label: "Reaction Type",
      value: showValue(observation?.reactionType),
    },
    {
      key: "severityLevel",
      label: "Severity Level",
      value: showValue(observation?.severityLevel),
    },
    {
      key: "immediateReaction",
      label: "Immediate Reaction",
      value: showValue(observation?.immediateReaction),
    },
    {
      key: "intervention",
      label: "Intervention",
      value: showValue(observation?.intervention),
    },
    {
      key: "observedBy",
      label: "Observed By",
      value: showValue(observation?.observedBy),
    },
    {
      key: "notes",
      label: "Notes",
      value: showValue(observation?.notes),
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
          ) : failedResultIds.includes(student?.vaccinationResultId) ? (
            <Tag color="red" style={{ fontSize: 16, padding: "4px 16px" }}>Failed</Tag>
          ) : (
            <Tag color="orange" style={{ fontSize: 16, padding: "4px 16px" }}>Not Qualified</Tag>
          )}
        </Card>
      ) : (
        <p>No data.</p>
      )}
    </Modal>
  );
};

export default DetailModal;