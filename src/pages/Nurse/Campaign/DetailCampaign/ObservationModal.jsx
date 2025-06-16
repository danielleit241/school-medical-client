import React, {  useState } from "react";
import { Modal, Form, Input, DatePicker, Button, Select, Col, Row, TimePicker } from "antd";
import axiosInstance from "../../../../api/axios";
import dayjs from "dayjs";

const ObservationModal = ({ open, student, onOk, onCancel, result }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  console.log("ObservationModal - student:", result?.vaccinatedDate);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const vaccinationResultId =
        student?.vaccinationResultId;

      const payload = {
        vaccinationResultId,
        observationStartTime: values.observationStartTime
          ? values.observationStartTime.toISOString()
          : null,
        observationEndTime: values.observationEndTime
          ? values.observationEndTime.toISOString()
          : null,
        reactionStartTime: values.reactionStartTime
          ? values.reactionStartTime.toISOString()
          : null,
        reactionType: values.reactionType,
        severityLevel: values.severityLevel,
        immediateReaction: values.immediateReaction,
        intervention: values.intervention,
        observedBy: values.observedBy,
        notes: values.notes,
      };
      const res = await axiosInstance.post("/api/vaccination-results/observations", payload);
      const { notificationTypeId, senderId, receiverId } = res.data;

      
      await axiosInstance.post("/api/notifications/vaccinations/observations/to-parent", {
        notificationTypeId,
        senderId,
        receiverId,
      });

      onOk();
    } catch (error) {
      console.error("Error saving observation:", error);
    }
    finally {
      setLoading(false);
    }
  };

  const handleObservationEndTimeChange = (time) => {
    const obsStart = form.getFieldValue("observationStartTime");
    if (obsStart && time) {
      const newTime = obsStart.clone().hour(time.hour()).minute(time.minute()).second(0);
      form.setFieldsValue({ observationEndTime: newTime });
    } else {
      form.setFieldsValue({ observationEndTime: null });
    }
  };

  const handleReactionStartTimeChange = (time) => {
    const obsStart = form.getFieldValue("observationStartTime");
    if (obsStart && time) {
      const newTime = obsStart.clone().hour(time.hour()).minute(time.minute()).second(0);
      form.setFieldsValue({ reactionStartTime: newTime });
    } else {
      form.setFieldsValue({ reactionStartTime: null });
    }
  };

  // Validate reactionStartTime phải cùng ngày và nằm trong khoảng observationStartTime và observationEndTime
  const validateReactionStartTime = (_, value) => {
    const obsStart = form.getFieldValue("observationStartTime");
    const obsEnd = form.getFieldValue("observationEndTime");
    if (!obsStart || !obsEnd || !value) return Promise.resolve();

    // So sánh ngày
    const obsStartDay = obsStart.format("YYYY-MM-DD");
    const obsEndDay = obsEnd.format("YYYY-MM-DD");
    const reactStartDay = value.format("YYYY-MM-DD");
    if (obsStartDay !== reactStartDay || obsEndDay !== reactStartDay) {
      return Promise.reject(new Error("Reaction Start Time must be on the same day as Observation Start/End Time"));
    }

    // So sánh giờ
    if (value.isBefore(obsStart) || value.isAfter(obsEnd)) {
      return Promise.reject(new Error("Reaction Start Time must be between Observation Start and End Time"));
    }
    return Promise.resolve();
  };

  // Validate observationStartTime phải cùng ngày với result?.vaccinatedDate
  const validateObservationStartTime = (_, value) => {
    if (!value || !result?.vaccinatedDate) return Promise.resolve();
    const obsDate = value.format("YYYY-MM-DD");
    const vaccinatedDate = dayjs(result.vaccinatedDate).format("YYYY-MM-DD");
    if (obsDate !== vaccinatedDate) {
      return Promise.reject(
        new Error("Observation Start Time must be on the same day as Vaccinated Date")
      );
    }
    return Promise.resolve();
  };

  if (!student) return null;

  return (
    <Modal
      open={open}
      title="Observation"
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      bodyStyle={{ maxHeight: 400, overflowY: "auto" }} // Thêm dòng này để có thể lăn chuột trong modal
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Observation Start Time"
              name="observationStartTime"
              rules={[
                { required: true, message: "Please select start date & time" },
                { validator: validateObservationStartTime },
              ]}
            >
              <DatePicker
                showTime={{ format: "HH:mm" }}
                format="YYYY-MM-DD HH:mm"
                style={{ width: "100%" }}
                onChange={() => form.validateFields(['observationStartTime'])}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Observation End Time"
              name="observationEndTime"
              rules={[{ required: true, message: "Please select end time" }]}
            >
              <TimePicker
                format="HH:mm"
                style={{ width: "100%" }}
                onChange={handleObservationEndTimeChange}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Reaction Start Time"
              name="reactionStartTime"
              rules={[
                { required: true, message: "Please select reaction start time" },
                { validator: validateReactionStartTime },
              ]}
            >
              <TimePicker
                format="HH:mm"
                style={{ width: "100%" }}
                onChange={handleReactionStartTimeChange}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="reactionType" label="Reaction Type">
          <Input />
        </Form.Item>
        <Form.Item
          name="severityLevel"
          label="Severity Level"
          rules={[{ required: true, message: "Please select severity level" }]}
        >
          <Select placeholder="Select severity level">
            <Select.Option value="high">High</Select.Option>
            <Select.Option value="medium">Medium</Select.Option>
            <Select.Option value="low">Low</Select.Option>
          </Select>
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