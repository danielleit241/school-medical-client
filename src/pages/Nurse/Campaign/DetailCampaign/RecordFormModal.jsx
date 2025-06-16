import React, { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, Switch, Button } from "antd";
import axiosInstance from "../../../../api/axios";

const RecordFormModal = ({ open, student, onOk, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  console.log("RecordFormModal", student);

  useEffect(() => {
    if (student && student.vaccinationResultId) {
      // Lấy dữ liệu đã có nếu cần
      axiosInstance.get(`/api/vaccination-results/${student.vaccinationResultId}`).then(res => {
        form.setFieldsValue(res.data);
      });
    } else {
      form.resetFields();
    }
  }, [student, form]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      if (student.vaccinationResultId) {
        await axiosInstance.put(`/api/vaccination-results/${student.vaccinationResultId}`, values);
      } else {
        await axiosInstance.post(`/api/vaccination-results`, {
          ...values,
          studentId: student.studentId,
          roundId: student.roundId,
        });
      }
      onOk();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Record Form"
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="vaccinatedDate" label="Vaccinated Date" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="vaccinated" label="Vaccinated" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="injectionSite" label="Injection Site" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          name="status"
          label="Status"
          valuePropName="checked"
          rules={[{ required: true, message: "Please select status" }]}
        >
          <Switch checkedChildren="Confirmed" unCheckedChildren="Not Confirmed" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Save
        </Button>
      </Form>
    </Modal>
  );
};

export default RecordFormModal;