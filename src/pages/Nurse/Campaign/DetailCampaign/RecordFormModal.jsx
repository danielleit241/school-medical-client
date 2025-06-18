import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Spin, Row, Col, Typography, Divider, DatePicker, TimePicker, Switch, Card, Tag, Space, Steps, message } from "antd";
import { MedicineBoxOutlined } from "@ant-design/icons";
import axiosInstance from "../../../../api/axios";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const RecordFormModal = ({ open, onCancel, student, onOk, round, onReload }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [healthDeclaration, setHealthDeclaration] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [qualified, setQualified] = useState(null);

  // Fetch health declaration & qualified status
  useEffect(() => {
    const fetchHealthDeclaration = async () => {
      if (open && student?.studentsOfRoundResponse?.studentId) {
        setHealthLoading(true);
        try {
          const response = await axiosInstance.get(
            `/api/students/${student.studentsOfRoundResponse.studentId}/health-declarations`
          );
          setHealthDeclaration(response.data);
        } catch (error) {
          console.error("Error fetching health declaration:", error);
          setHealthDeclaration(null);
        } finally {
          setHealthLoading(false);
        }
      }
    };

    if (open && student?.vaccinationResultId) {
      axiosInstance.get(`/api/vaccination-results/${student.vaccinationResultId}/health-quilified`)
        .then(res => {
          const qualified = typeof res.data === "boolean" ? res.data : res.data?.qualified;
          setQualified(qualified);
          if (qualified === true) setStep(1);
          else setStep(0);
        })
        .catch(() => {
          setQualified(null);
          setStep(0);
        });
    }

    if (open) {
      setStep(0);
      fetchHealthDeclaration();
      setQualified(null);
      setLoading(false);
      form.resetFields();
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, student]);

  
  useEffect(() => {
    if (qualified === true) setStep(1);
    if (qualified === false) {
      setStep(0);
      setTimeout(() => {
        onCancel();
      }, 1000);
    }
  }, [qualified, onCancel]);

  useEffect(() => {
    if (!open) {
      setQualified(null); 
      setStep(0);
    }
  }, [open]);

  // Step 1: Xác nhận đủ điều kiện
  const handleQualified = async (isQualified) => {
    if (!student?.vaccinationResultId) return;
    setLoading(true);
    try {
      await axiosInstance.put(
        `/api/vaccination-results/${student.vaccinationResultId}/health-qualified`,
        isQualified
      );
      if (!isQualified) {
        message.info("Student is not qualified for vaccination.");
        if (onReload) await onReload(); 
        onCancel(); 
        return;
      }
      setTimeout(async () => {
        try {
          const res = await axiosInstance.get(
            `/api/vaccination-results/${student.vaccinationResultId}/health-quilified`
          );
          setQualified(res.data);
          console.log("Fetched qualified status:", res.data);
          if (res.data === true) {
            setStep(1);
          } else if (res.data=== false) {
            message.info("Student is not qualified for vaccination.");
            setTimeout(() => {
            }, 100);
          }
        } catch (err) {
          console.error("Error fetching qualified status:", err);
          // Nếu GET trả về 404, xử lý thủ công
          if (!isQualified) {
            setQualified(false);
            message.info("Student is not qualified for vaccination.");
            setTimeout(() => {
              onCancel();
            }, 1000);
          }
        }
      }, 300); // delay 300ms
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Form nhập kết quả tiêm chủng
  const validateVaccinatedDate = (_, value) => {
    if (!value) return Promise.resolve();
    const start = round?.vaccinationRoundInformation?.startTime
      ? dayjs(round.vaccinationRoundInformation.startTime).startOf("day")
      : null;
    const end = round?.vaccinationRoundInformation?.endTime
      ? dayjs(round.vaccinationRoundInformation.endTime).endOf("day")
      : null;
    if (start && end) {
      if (value.isBefore(start) || value.isAfter(end)) {
        return Promise.reject(
          new Error(
            `Vaccinated Date must be between ${start.format("YYYY-MM-DD")} and ${end.format("YYYY-MM-DD")}`
          )
        );
      }
    }
    return Promise.resolve();
  };
  const validateVaccinatedTime = (_, value) => {
    const vaccinatedDate = form.getFieldValue("vaccinatedDate");
    if (!vaccinatedDate || !value) return Promise.resolve();
    const selectedDate = vaccinatedDate.format("YYYY-MM-DD");
    const selectedTime = value.format("YYYY-MM-DD");
    if (selectedDate !== selectedTime) {
      return Promise.reject(
        new Error("Vaccinated Time must be on the same day as Vaccinated Date")
      );
    }
    return Promise.resolve();
  };

  const handleVaccinatedDateChange = (date) => {
    if (date) {
      const time = form.getFieldValue("vaccinatedTime");
      if (time) {
        const newTime = date.hour(time.hour()).minute(time.minute()).second(0);
        form.setFieldsValue({ vaccinatedTime: newTime });
      } else {
        form.setFieldsValue({ vaccinatedTime: date.hour(0).minute(0).second(0) });
      }
    } else {
      form.setFieldsValue({ vaccinatedTime: null });
    }
  };

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const vaccinationResultId = student?.vaccinationResultId;
      const payload = {
        vaccinationResultId,
        vaccinatedDate: values.vaccinatedDate
          ? values.vaccinatedDate.format("YYYY-MM-DD")
          : null,
        vaccinatedTime: values.vaccinatedTime
          ? values.vaccinatedTime.toISOString()
          : null,
        vaccinated: values.vaccinated,
        injectionSite: values.injectionSite,
        notes: values.notes,
        status: values.status,
      };

      await axiosInstance.post("/api/vaccination-results", payload);
      setTimeout(() => {
        form.resetFields();
        onOk();
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Record Vaccination"
      onCancel={onCancel}
      footer={null}
      width={900}
      styles={{ body: { padding: 32 } }}
      destroyOnClose
    >
      <Steps
        current={step}
        items={[
          { title: "Health Declaration" },
          { title: "Vaccination Record" },
        ]}
        style={{ marginBottom: 32 }}
      />
      {step === 0 && (
        <Row gutter={32}>
          <Col xs={24} md={24}>
            <Card
              bordered={false}
              style={{
                borderRadius: 14,
                boxShadow: "0 2px 12px #e6f7ff",
                background: "#f9fbfd",
                minHeight: 320,
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Space direction="vertical" style={{ width: "100%" }} size={16}>
                <Title level={5} style={{ margin: 0, color: "#1677ff" }}>
                  <MedicineBoxOutlined /> Health Declaration
                </Title>
                <Divider style={{ margin: "8px 0" }} />
                {healthLoading ? (
                  <Spin />
                ) : healthDeclaration && healthDeclaration.healthDeclaration ? (
                  <div style={{ lineHeight: 2, fontSize: 15 }}>
                    <div>
                      <Text strong>Chronic Diseases:</Text>{" "}
                      <Tag color={healthDeclaration.healthDeclaration.chronicDiseases === "no" ? "green" : "red"}>
                        {healthDeclaration.healthDeclaration.chronicDiseases || "N/A"}
                      </Tag>
                    </div>
                    <div>
                      <Text strong>Drug Allergies:</Text>{" "}
                      <Tag color={healthDeclaration.healthDeclaration.drugAllergies === "no" ? "green" : "red"}>
                        {healthDeclaration.healthDeclaration.drugAllergies || "N/A"}
                      </Tag>
                    </div>
                    <div>
                      <Text strong>Food Allergies:</Text>{" "}
                      <Tag color={healthDeclaration.healthDeclaration.foodAllergies === "no" ? "green" : "red"}>
                        {healthDeclaration.healthDeclaration.foodAllergies || "N/A"}
                      </Tag>
                    </div>
                    <div>
                      <Text strong>Additional Notes:</Text>{" "}
                      <Text>{healthDeclaration.healthDeclaration.notes || <span style={{ color: "#aaa" }}>N/A</span>}</Text>
                    </div>
                  </div>
                ) : (
                  <Text type="secondary">No health declaration data.</Text>
                )}
                <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
                  <Button
                    danger
                    loading={loading}
                    onClick={() => handleQualified(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    loading={loading}
                    onClick={() => handleQualified(true)}
                  >
                    Confirm
                  </Button>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      )}
      {step === 1 && (
        <Row gutter={32}>
          {/* Bên trái: Form nhập */}
          <Col xs={24} md={14}>
            <Title level={5}>Vaccination Record</Title>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
            >
              <Form.Item
                label="Vaccinated Date"
                name="vaccinatedDate"
                rules={[
                  { required: true, message: "Please select date" },
                  { validator: validateVaccinatedDate },
                ]}
              >
                <DatePicker
                  disabled
                  style={{ width: "100%" }}
                  onChange={handleVaccinatedDateChange}
                />
              </Form.Item>
              <Form.Item
                label="Vaccinated Time"
                name="vaccinatedTime"
                rules={[
                  { required: true, message: "Please select time" },
                  { validator: validateVaccinatedTime },
                ]}
              >
                <TimePicker
                  style={{ width: "100%" }}
                  format="HH:mm"
                  minuteStep={5}
                  allowClear={false}
                />
              </Form.Item>
              <Form.Item
                label="Vaccinated"
                name="vaccinated"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Injection Site"
                name="injectionSite"
                rules={[{ required: true, message: "Please enter injection site" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item label="Notes" name="notes">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: "Please enter status" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{ width: "100%" }}
                >
                  Save
                </Button>
              </Form.Item>
            </Form>
          </Col>
          {/* Bên phải: Health Declaration */}
          <Col xs={24} md={10}>
            <Card
              bordered={false}
              style={{
                borderRadius: 14,
                boxShadow: "0 2px 12px #e6f7ff",
                background: "#f9fbfd",
                minHeight: 320,
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Space direction="vertical" style={{ width: "100%" }} size={16}>
                <Title level={5} style={{ margin: 0, color: "#1677ff" }}>
                  <MedicineBoxOutlined /> Health Declaration
                </Title>
                <Divider style={{ margin: "8px 0" }} />
                {healthLoading ? (
                  <Spin />
                ) : healthDeclaration && healthDeclaration.healthDeclaration ? (
                  <div style={{ lineHeight: 2, fontSize: 15 }}>
                    <div>
                      <Text strong>Chronic Diseases:</Text>{" "}
                      <Tag color={healthDeclaration.healthDeclaration.chronicDiseases === "no" ? "green" : "red"}>
                        {healthDeclaration.healthDeclaration.chronicDiseases || "N/A"}
                      </Tag>
                    </div>
                    <div>
                      <Text strong>Drug Allergies:</Text>{" "}
                      <Tag color={healthDeclaration.healthDeclaration.drugAllergies === "no" ? "green" : "red"}>
                        {healthDeclaration.healthDeclaration.drugAllergies || "N/A"}
                      </Tag>
                    </div>
                    <div>
                      <Text strong>Food Allergies:</Text>{" "}
                      <Tag color={healthDeclaration.healthDeclaration.foodAllergies === "no" ? "green" : "red"}>
                        {healthDeclaration.healthDeclaration.foodAllergies || "N/A"}
                      </Tag>
                    </div>
                    <div>
                      <Text strong>Additional Notes:</Text>{" "}
                      <Text>{healthDeclaration.healthDeclaration.notes || <span style={{ color: "#aaa" }}>N/A</span>}</Text>
                    </div>
                  </div>
                ) : (
                  <Text type="secondary">No health declaration data.</Text>
                )}
              </Space>
            </Card>
          </Col>
        </Row>
      )}
    </Modal>
  );
};

export default RecordFormModal;