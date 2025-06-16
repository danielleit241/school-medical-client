import React, { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, Button } from "antd";
import axiosInstance from "../../../../api/axios";

const ObservationModal = ({ open, student, onOk, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student && student.vaccinationResultId) {
      axiosInstance
        .get(`/api/vaccination-results/observations/${student.vaccinationResultId}`)
        .then(res => {
          form.setFieldsValue(res.data);
        });
    } else {
      form.resetFields();
    }
  }, [student, form]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      await axiosInstance.post(`/api/vaccination-results/observations`, {
        ...values,
        vaccinationResultId: student.vaccinationResultId,
      });
      onOk();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Observation"
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="observationStartTime" label="Observation Start Time" rules={[{ required: true }]}>
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="observationEndTime" label="Observation End Time" rules={[{ required: true }]}>
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="reactionStartTime" label="Reaction Start Time">
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="reactionType" label="Reaction Type">
          <Input />
        </Form.Item>
        <Form.Item name="severityLevel" label="Severity Level">
          <Input />
        </Form.Item>
        <Form.Item name="immediateReaction" label="Immediate Reaction">
          <Input />
        </Form.Item>
        <Form.Item name="intervention" label="Intervention">
          <Input />
        </Form.Item>
        <Form.Item name="observedBy" label="Observed By">
          <Input />
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Save
        </Button>
      </Form>
    </Modal>
  );
};

export default ObservationModal;