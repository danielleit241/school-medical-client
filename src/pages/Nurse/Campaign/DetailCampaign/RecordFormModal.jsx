import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Spin, Row, Col, Typography, Divider, DatePicker, TimePicker,Switch, Card, Tag, Space } from "antd";
import { MedicineBoxOutlined } from "@ant-design/icons";
import axiosInstance from "../../../../api/axios";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const RecordFormModal = ({ open, onCancel, student, onOk, round }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [healthDeclaration, setHealthDeclaration] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  

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

  fetchHealthDeclaration();
}, [open, student?.studentsOfRoundResponse?.studentId]);

  useEffect(() => {
    if (open) {
      form.resetFields();     
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, student]);

  // Validate Vaccinated Date nằm trong khoảng round
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
      // Nếu đã có vaccinatedTime, chỉ giữ lại giờ, đổi ngày thành ngày mới
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


  // Xử lý submit form như cũ
  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const vaccinationResultId =
        student?.vaccinationResultId;
      console.log("RecordFormModal student", vaccinationResultId);
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
      bodyStyle={{ padding: 32 }}
    >
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
                  <Divider orientation="left" style={{ margin: "18px 0 10px 0" }}>
                    <span style={{ color: "#1677ff" }}>Vaccinations</span>
                  </Divider>
                  {Array.isArray(healthDeclaration.vaccinations) && healthDeclaration.vaccinations.length > 0 ? (
                    <div>
                      {healthDeclaration.vaccinations.map((v, idx) => (
                        <Card
                          key={idx}
                          size="small"
                          bordered
                          style={{
                            marginBottom: 12,
                            borderRadius: 10,
                            background: "#fff",
                            borderColor: "#e6f7ff",
                          }}
                          bodyStyle={{ padding: 14 }}
                        >
                          <Space direction="vertical" size={2} style={{ width: "100%" }}>
                            <div>
                              <Text strong>Name:</Text> <Text>{v.vaccineName}</Text>
                            </div>
                            <div>
                              <Text strong>Dose:</Text>{" "}
                              <Tag color="blue">{v.doseNumber}</Tag>
                            </div>
                            <div>
                              <Text strong>Date:</Text>{" "}
                              <Tag color="geekblue">
                                {v.vaccinatedDate ? new Date(v.vaccinatedDate).toLocaleDateString() : "N/A"}
                              </Tag>
                            </div>
                            <div>
                              <Text strong>Notes:</Text>{" "}
                              <Text>{v.notes || <span style={{ color: "#aaa" }}>N/A</span>}</Text>
                            </div>
                          </Space>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Text type="secondary">No vaccination data.</Text>
                  )}
                </div>
              ) : (
                <Text type="secondary">No health declaration data.</Text>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};

export default RecordFormModal;