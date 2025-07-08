import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Row, Col, Typography, DatePicker, Select, message } from "antd";
import dayjs from "dayjs";
import axiosInstance from "../../../../api/axios";
import Swal from "sweetalert2";


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
      form.resetFields();
      setNoseOrderValue("");
      setHearingOrderValue("");
      form.setFieldsValue({
        status:
          typeof student?.status === "string"
            ? student.status
            : student?.status === true
            ? "Completed"
            : student?.status === false
            ? "Pending"
            : "Failed", 
      });
    }
  }, [open, student, form]);


  const handleFinish = async (values) => {
    if (values.status === "Failed") {
    const result = await Swal.fire({
      icon: "warning",
      title: "Save with status 'Failed'?",
      text: "Some required health check information is missing. Are you sure you want to save?",
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "Back",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#aaa",
    });
    if (!result.isConfirmed) {
      setLoading(false);
      return;
    }
  }
    setLoading(true);
    try {
      const { healthCheckResultId } = student;
      const bloodPressure = `${values.systolic}/${values.diastolic}`;
      const payload = {
        healthCheckResultId,
        datePerformed: values.datePerformed.format("YYYY-MM-DD"),
        height: Number(values.height),
        weight: Number(values.weight),
        visionLeft: Number(values.visionLeft),
        visionRight: Number(values.visionRight),
        hearing: values.hearing === "order" ? values.hearingOrderDetail : values.hearing,
        nose: values.nose === "order" ? values.noseOrderDetail : values.nose,
        bloodPressure, 
        status: values.status, 
        notes: values.notes,
      };    
      const res = await axiosInstance.post("/api/health-check-results", payload);
      
      const { notificationTypeId, senderId, receiverId } = res.data;
      await axiosInstance.post("/api/notifications/health-checks/results/to-parent", {
        notificationTypeId,
        senderId,
        receiverId,
      });
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
      width={700} 
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
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              initialValues={{
                datePerformed: dayjs(),
                status: "Failed",
                hearing: "no",
                nose: "no",
                bloodPressure: "0/0",
                height: 0,
                weight: 0,
                visionLeft: 0,
                visionRight: 0,
                systolic: 0,
                diastolic: 0,
              }}
              onValuesChange={() => {
                const values = form.getFieldsValue();
                const isFailed =
                  Number(values.height) === 0 &&
                  Number(values.weight) === 0 &&
                  Number(values.visionLeft) === 0 &&
                  Number(values.visionRight) === 0 &&
                  (Number(values.systolic) === 0 || Number(values.diastolic) === 0) &&
                  (values.hearing === "no" || !values.hearing) &&
                  (values.nose === "no" || !values.nose);

                if (isFailed) {
                  form.setFieldsValue({ status: "Failed" });
                } else {
                  const isCompleted =
                    Number(values.height) > 0 &&
                    Number(values.weight) > 0 &&
                    Number(values.visionLeft) > 0 &&
                    Number(values.visionRight) > 0 &&
                    Number(values.systolic) > 0 &&
                    Number(values.diastolic) > 0 &&
                    values.hearing &&
                    values.hearing !== "no" &&
                    values.nose &&
                    values.nose !== "no";
                  if (isCompleted) {
                    form.setFieldsValue({ status: "Completed" });
                  }
                }
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
                  <Form.Item label="Blood Pressure">
                    <Input.Group compact>
                      <Form.Item
                        name="systolic"
                        noStyle
                        rules={[
                          { required: true, message: "Enter systolic" },
                          { pattern: /^\d+$/, message: "Must be a number" },
                        ]}
                      >
                        <Input
                          style={{
                            width: 70,
                            textAlign: "center",
                            borderRadius: 8,
                            marginRight: 1, 
                          }}
                          placeholder="SYS"
                          maxLength={3}
                        />
                      </Form.Item>
                      <span
                        style={{
                          display: "inline-block",
                          width: 18,
                          textAlign: "center",
                          fontWeight: 600,
                          fontSize: 18,
                          background: "none", 
                          border: "none",     
                          lineHeight: "32px",
                          marginRight: 1,     
                          marginLeft: 1,      
                        }}
                      >/</span>
                      <Form.Item
                        name="diastolic"
                        noStyle
                        rules={[
                          { required: true, message: "Enter diastolic" },
                          { pattern: /^\d+$/, message: "Must be a number" },
                        ]}
                      >
                        <Input
                          style={{
                            width: 70,
                            textAlign: "center",
                            borderRadius: 8,
                            borderLeft: 0,
                          }}
                          placeholder="DIA"
                          maxLength={3}
                        />
                      </Form.Item>
                      <span style={{ marginLeft: 8, color: "#555" }}>mmHg</span>
                    </Input.Group>
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
                        { label: "None", value: "no" },
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
                        { label: "None", value: "no" },
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
              </Row>
              {/* Notes full width */}
              <Form.Item label="Notes" name="notes" style={{ marginTop: 8 }}>
                <Input.TextArea rows={3} style={{ borderRadius: 8, width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="Status"
                shouldUpdate={(prev, curr) => prev.status !== curr.status}
              >
                {({ getFieldValue }) => {
                  const status = getFieldValue("status");
                    return (
                      <Input
                        readOnly
                        strong
                        value={status}
                        style={{
                          color: status === "Completed" ? "#22c55e" : "#ef4444",
                          fontWeight: 600,
                          fontSize: 16,
                        }}
                      />                        
                      );
                }}
              </Form.Item>
              <Form.Item name="status" hidden>
                <Input />
              </Form.Item>
              {/* Save button center */}
              <Form.Item style={{ textAlign: "center", marginTop: 8 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    width: 200,
                    borderRadius: 8,
                    background: "linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)",
                    fontWeight: 600,
                    fontSize: 16,
                    boxShadow: "0 2px 8px #2563eb22",
                  }}
                  loading={loading}
                >
                  Save
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default RecordFormModal;