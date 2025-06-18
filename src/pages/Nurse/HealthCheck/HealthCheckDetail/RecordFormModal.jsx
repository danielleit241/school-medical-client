import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Row, Col, Typography, DatePicker, Select, message } from "antd";
import dayjs from "dayjs";
import axiosInstance from "../../../../api/axios";

const { Title } = Typography;

const RecordFormModal = ({ open, onCancel, student, onOk }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hearingModalOpen, setHearingModalOpen] = useState(false);
  const [hearingOrderValue, setHearingOrderValue] = useState("");
  const [noseModalOpen, setNoseModalOpen] = useState(false);
  const [noseOrderValue, setNoseOrderValue] = useState("");

  useEffect(() => {
    if (open) {
      setNoseOrderValue("");
      setHearingOrderValue("");
      form.resetFields();
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const { healthCheckResultId } = student;
      const payload = {
        healthCheckResultId,
        datePerformed: values.datePerformed.format("YYYY-MM-DD"),
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
      title={null}
      onCancel={onCancel}
      footer={null}
      width={700} // mở rộng modal ra cho cân đối
      centered
      destroyOnClose
    >
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <span style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#355383",
          letterSpacing: 1,
          textShadow: "0 2px 8px #35538322"
        }}>
          Health Check Record
        </span>
      </div>
      <Row gutter={32}>
        <Col xs={24} md={24}>
          <div style={{
            background: "#fff",
            padding: 32,
            maxWidth: 900,
            margin: "0 auto"
          }}>
            <Title level={5} style={{ color: "#355383", marginBottom: 24 }}>Health Check Record</Title>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              initialValues={{
                datePerformed: dayjs(),
                status: true,
                hearing: "normal",
                nose: "normal",
              }}
            >
              <Row gutter={32}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={<b style={{ color: "#355383" }}>Date Performed</b>}
                    name="datePerformed"
                    rules={[{ required: true, message: "Please select date" }]}
                    disabled
                  >
                    <DatePicker
                      disabled
                      style={{ width: "100%", borderRadius: 8 }}
                      format="YYYY-MM-DD"
                      picker="date"
                      showTime={false}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Height (cm)"
                    name="height"
                    rules={[
                      { required: true, message: "Please enter height" },
                      { pattern: /^\d+(\.\d+)?$/, message: "Height must be a number" },
                    ]}
                  >
                    <Input suffix="cm" style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item
                    label="Weight (kg)"
                    name="weight"
                    rules={[
                      { required: true, message: "Please enter weight" },
                      { pattern: /^\d+(\.\d+)?$/, message: "Weight must be a number" },
                    ]}
                  >
                    <Input suffix="kg" style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item
                    label="Vision Left (/10)"
                    name="visionLeft"
                    rules={[
                      { required: true, message: "Please enter vision left" },
                      { pattern: /^\d+(\.\d+)?$/, message: "Vision left must be a number" },
                    ]}
                  >
                    <Input suffix="/10" style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item
                    label="Vision Right (/10)"
                    name="visionRight"
                    rules={[
                      { required: true, message: "Please enter vision right" },
                      { pattern: /^\d+(\.\d+)?$/, message: "Vision right must be a number" },
                    ]}
                  >
                    <Input suffix="/10" style={{ borderRadius: 8 }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Hearing"
                    name="hearing"
                    rules={[{ required: true, message: "Please select hearing" }]}
                  >
                    <Select
                      value={hearingOrderValue ? hearingOrderValue : form.getFieldValue("hearing")}
                      onSelect={val => {
                        if (val === "order") {
                          setHearingModalOpen(true);
                        } else {
                          setHearingOrderValue("");
                          form.setFieldsValue({ hearing: val });
                        }
                      }}
                      options={[
                        { label: "Normal", value: "normal" },
                        { label: hearingOrderValue || "Order", value: "order" },
                      ]}
                    />
                  </Form.Item>
                  <Modal
                    open={hearingModalOpen}
                    title="Enter Hearing Order Detail"
                    onCancel={() => setHearingModalOpen(false)}
                    footer={null}
                    destroyOnClose
                  >
                    <Form
                      onFinish={vals => {
                        setHearingOrderValue(vals.hearingOrderDetail);
                        form.setFieldsValue({ hearing: vals.hearingOrderDetail });
                        setHearingModalOpen(false);
                      }}
                    >
                      <Form.Item
                        name="hearingOrderDetail"
                        rules={[{ required: true, message: "Please enter detail" }]}
                      >
                        <Input autoFocus />
                      </Form.Item>
                      <Form.Item>
                        <Button htmlType="submit" type="primary" style={{ width: "100%" }}>
                          Save
                        </Button>
                      </Form.Item>
                    </Form>
                  </Modal>
                  <Form.Item
                    label="Nose"
                    name="nose"
                    rules={[{ required: true, message: "Please select nose" }]}
                  >
                    <Select
                      value={noseOrderValue ? noseOrderValue : form.getFieldValue("nose")}
                      onSelect={val => {
                        if (val === "order") {
                          setNoseModalOpen(true);
                        } else {
                          setNoseOrderValue("");
                          form.setFieldsValue({ nose: val });
                        }
                      }}
                      options={[
                        { label: "Normal", value: "normal" },
                        { label: noseOrderValue || "Order", value: "order" },
                      ]}
                    />
                  </Form.Item>
                  {/* Modal nhập chi tiết Nose */}
                  <Modal
                    open={noseModalOpen}
                    title="Enter Nose Order Detail"
                    onCancel={() => setNoseModalOpen(false)}
                    footer={null}
                    destroyOnClose
                  >
                    <Form
                      onFinish={vals => {
                        setNoseOrderValue(vals.noseOrderDetail);
                        form.setFieldsValue({ nose: vals.noseOrderDetail });
                        setNoseModalOpen(false);
                      }}
                    >
                      <Form.Item
                        name="noseOrderDetail"
                        rules={[{ required: true, message: "Please enter detail" }]}
                      >
                        <Input autoFocus />
                      </Form.Item>
                      <Form.Item>
                        <Button htmlType="submit" type="primary" style={{ width: "100%" }}>
                          Save
                        </Button>
                      </Form.Item>
                    </Form>
                  </Modal>
                  <Form.Item
                    label="Blood Pressure (mg)"
                    name="bloodPressure"
                    rules={[
                      { required: true, message: "Please enter blood pressure" },
                      { pattern: /^\d+\/\d+$/, message: "Format: number/number" },
                    ]}
                  >
                    <Input suffix="mg" placeholder="120/80" style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item label="Notes" name="notes">
                    <Input.TextArea rows={3} style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item label="Status" initialValue={true} name="status">
                    <span style={{ color: "#22c55e", fontWeight: 600 }}>Done</span>
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{
                        width: "100%",
                        borderRadius: 8,
                        background: "linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)",
                        fontWeight: 600,
                        fontSize: 16,
                        boxShadow: "0 2px 8px #2563eb22",
                        marginTop: 8,
                      }}
                      loading={loading}
                    >
                      Save
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default RecordFormModal;