import React, { useState } from "react";
import { Modal, Form, Input, Button, Row, Col, Typography, DatePicker, Select, message } from "antd";
import dayjs from "dayjs";
import axiosInstance from "../../../../api/axios";

const { Title } = Typography;

const RecordFormModal = ({ open, onCancel, student, onOk }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showHearingOrder, setShowHearingOrder] = useState(false);
  const [showNoseOrder, setShowNoseOrder] = useState(false);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        healthCheckResultId: student?.healthCheckResultId,
        datePerformed: values.datePerformed.format("YYYY-MM-DD"), // chỉ gửi datePerformed là "YYYY-MM-DD"
        height: Number(values.height),
        weight: Number(values.weight),
        visionLeft: Number(values.visionLeft),
        visionRight: Number(values.visionRight),
        hearing: values.hearing === "order" ? values.hearingOrderDetail : values.hearing,
        nose: values.nose === "order" ? values.noseOrderDetail : values.nose,
        bloodPressure: values.bloodPressure,
        status: values.status, // boolean
        notes: values.notes,
      };

      console.log("Payload gửi lên:", payload);
      await axiosInstance.post("/api/health-check-results", payload);
      message.success("Saved successfully!");
      onOk();
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Save failed!");
    }
    setLoading(false);
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
      <Row gutter={32}>
        {/* Bên trái: Form nhập */}
        <Col xs={24} md={14}>
          <Title level={5}>Vaccination Record</Title>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{
              datePerformed: dayjs(),
              status: "pending",
              hearing: "normal",
              nose: "normal",
            }}
          >
            <Row gutter={32} style={{ width: "100%" }}>
              <Col xs={24} md={12} style={{ width: "100%" }}>
                <Form.Item
                  label="Date Performed"
                  name="datePerformed"
                  rules={[{ required: true, message: "Please select date" }]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="YYYY-MM-DD"
                    picker="date" // chỉ cho chọn ngày
                    showTime={false} // không cho chọn giờ
                  />
                </Form.Item>
                <Form.Item
                  label="Height (cm)"
                  name="height"
                  rules={[
                    { required: true, message: "Please enter height" },
                    { pattern: /^\d+(\.\d+)?$/, message: "Height must be a number" },
                  ]}
                  style={{ width: "100%" }}
                >
                  <Input suffix="cm" />
                </Form.Item>
                <Form.Item
                  label="Weight (kg)"
                  name="weight"
                  rules={[
                    { required: true, message: "Please enter weight" },
                    { pattern: /^\d+(\.\d+)?$/, message: "Weight must be a number" },
                  ]}
                  style={{ width: "100%" }}
                >
                  <Input suffix="kg" />
                </Form.Item>
                <Form.Item
                  label="Vision Left (/10)"
                  name="visionLeft"
                  rules={[
                    { required: true, message: "Please enter vision left" },
                    { pattern: /^\d+(\.\d+)?$/, message: "Vision left must be a number" },
                  ]}
                  style={{ width: "100%" }}
                >
                  <Input suffix="/10" />
                </Form.Item>
                <Form.Item
                  label="Vision Right (/10)"
                  name="visionRight"
                  rules={[
                    { required: true, message: "Please enter vision right" },
                    { pattern: /^\d+(\.\d+)?$/, message: "Vision right must be a number" },
                  ]}
                  style={{ width: "100%" }}
                >
                  <Input suffix="/10" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} style={{ width: "100%" }}>
                <Form.Item
                  label="Hearing"
                  name="hearing"
                  rules={[{ required: true, message: "Please select hearing" }]}
                  style={{ width: "100%" }}
                >
                  <Select
                    onChange={val => setShowHearingOrder(val === "order")}
                    options={[
                      { label: "Normal", value: "normal" },
                      { label: "Order", value: "order" },
                    ]}
                  />
                </Form.Item>
                {showHearingOrder && (
                  <Form.Item
                    label="Hearing Order Detail"
                    name="hearingOrderDetail"
                    rules={[{ required: true, message: "Please enter hearing order detail" }]}
                    style={{ width: "100%" }}
                  >
                    <Input />
                  </Form.Item>
                )}
                <Form.Item
                  label="Nose"
                  name="nose"
                  rules={[{ required: true, message: "Please select nose" }]}
                  style={{ width: "100%" }}
                >
                  <Select
                    onChange={val => setShowNoseOrder(val === "order")}
                    options={[
                      { label: "Normal", value: "normal" },
                      { label: "Order", value: "order" },
                    ]}
                  />
                </Form.Item>
                {showNoseOrder && (
                  <Form.Item
                    label="Nose Order Detail"
                    name="noseOrderDetail"
                    rules={[{ required: true, message: "Please enter nose order detail" }]}
                    style={{ width: "100%" }}
                  >
                    <Input />
                  </Form.Item>
                )}
                <Form.Item
                  label="Blood Pressure (mg)"
                  name="bloodPressure"
                  rules={[
                    { required: true, message: "Please enter blood pressure" },
                    { pattern: /^\d+\/\d+$/, message: "Format: number/number" },
                  ]}
                  style={{ width: "100%" }}
                >
                  <Input suffix="mg" placeholder="120/80" />
                </Form.Item>
                <Form.Item label="Notes" name="notes" style={{ width: "100%" }}>
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item
                  label="Status"
                  name="status"
                  rules={[{ required: true, message: "Please select status" }]}
                >
                  <Select
                    options={[
                      { label: "Pending", value: "pending" },
                      { label: "Done", value: "done" },
                    ]}
                  />
                </Form.Item>
                <Form.Item style={{ width: "100%" }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ width: "100%" }}
                    loading={loading} // giữ loading khi submit
                  >
                    Save
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Col>
      
      </Row>
    </Modal>
  );
};

export default RecordFormModal;