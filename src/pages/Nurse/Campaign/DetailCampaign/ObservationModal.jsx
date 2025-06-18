import React, { useEffect, useState } from "react";
import { Modal, Form, DatePicker, TimePicker, Button, Select, Col, Row, Input } from "antd";
import dayjs from "dayjs";
import axiosInstance from "../../../../api/axios";

const ObservationModal = ({ open, onCancel, student, onOk, initialValues }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [vaccinatedDate, setVaccinatedDate] = useState(null);
  // Fetch vaccinatedDate khi mở modal
  useEffect(() => {
    const fetchVaccinatedDate = async () => {
      if (!student?.vaccinationResultId) {
        setVaccinatedDate(null);
        return;
      }
      try {
        const res = await axiosInstance.get(`/api/vaccination-results/${student.vaccinationResultId}`);
        setVaccinatedDate(res.data?.resultResponse?.vaccinatedDate || null);
        console.log("Vaccinated Date:", res.data?.resultResponse?.vaccinatedDate);
      } catch (error) {
        console.error("Error fetching vaccinated date:", error);
        setVaccinatedDate(null);
      }
    };
    if (open) fetchVaccinatedDate();
  }, [open, student]);

  useEffect(() => {
      if (open) {
        form.resetFields();
        form.setFieldsValue({ vaccinatedDate });
      }
      //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, student]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      // Giả sử bạn đã có vaccinatedDate là dayjs object (ngày tiêm chủng)
      // Các trường observationStartTime, observationEndTime, reactionStartTime là dayjs object (giờ phút)

      const baseDate = dayjs(vaccinatedDate); // ngày tiêm chủng

      const observationStartTime = baseDate
        .hour(values.observationStartTime.hour())
        .minute(values.observationStartTime.minute())
        .second(0)
        .millisecond(0)
        .format("YYYY-MM-DDTHH:mm:ss");

      const observationEndTime = baseDate
        .hour(values.observationEndTime.hour())
        .minute(values.observationEndTime.minute())
        .second(0)
        .millisecond(0)
        .format("YYYY-MM-DDTHH:mm:ss");

      const reactionStartTime = baseDate
        .hour(values.reactionStartTime.hour())
        .minute(values.reactionStartTime.minute())
        .second(0)
        .millisecond(0)
        .format("YYYY-MM-DDTHH:mm:ss");

      const payload = {
        vaccinationResultId: student?.vaccinationResultId,
        observationStartTime,
        observationEndTime,
        reactionStartTime,
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

  const handleObservationStartTimeChange = (value) => {
  if (value) {
    // observationEndTime = observationStartTime + 30 phút
    const endTime = value.clone().add(30, "minute");
    form.setFieldsValue({ observationEndTime: endTime });
  } else {
    form.setFieldsValue({ observationEndTime: null });
  }
};


 // Validate reactionStartTime phải cùng ngày và nằm trong khoảng observationStartTime và observationEndTime
const validateReactionStartTime = (_, value) => {
  const obsStart = form.getFieldValue("observationStartTime");
  const obsEnd = form.getFieldValue("observationEndTime");
  if (!obsStart || !obsEnd || !value) return Promise.resolve();

  // Nếu value chỉ là giờ, phút (không có ngày), thì phải gán ngày của obsStart
  const reactionDateTime = obsStart
    .clone()
    .hour(value.hour())
    .minute(value.minute())
    .second(0);

  if (reactionDateTime.isBefore(obsStart) || reactionDateTime.isAfter(obsEnd)) {
    return Promise.reject(new Error("Reaction Start Time must be between Observation Start and End Time"));
  }
  return Promise.resolve();
};

  // Validate observationStartTime phải cùng ngày với result?.vaccinatedDate
  const validateObservationStartTime = (_, value) => {
    if (!value || !vaccinatedDate) return Promise.resolve();
    const obsDate = value.format("YYYY-MM-DD");
    const vaxDate = dayjs(vaccinatedDate).format("YYYY-MM-DD");
    if (obsDate !== vaxDate) {
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
      onCancel={onCancel}
      footer={null}
      width={600}
      title="Observation"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={initialValues}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
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
                onChange={handleObservationStartTimeChange}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Observation End Time"
              name="observationEndTime"
              rules={[{ required: true, message: "Please select end time" }]}
            >
              <TimePicker
                format="HH:mm"
                style={{ width: "100%" }}
                value={form.getFieldValue("observationEndTime")}
                disabled
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Reaction Start Time"
              name="reactionStartTime"
              validateTrigger="onChange"
              rules={[
                { required: true, message: "Please select reaction start time" },
                { validator: validateReactionStartTime },
              ]}
            >
              <TimePicker
                format="HH:mm"
                style={{ width: "100%" }}
                onChange={(time) => {
                  const obsStart = form.getFieldValue("observationStartTime");
                  if (obsStart && time) {
                    const newTime = obsStart.clone().hour(time.hour()).minute(time.minute()).second(0);
                    form.setFieldsValue({ reactionStartTime: newTime });
                  } else {
                    form.setFieldsValue({ reactionStartTime: null });
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="reactionType" label="Reaction Type">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
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
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="immediateReaction" label="Immediate Reaction">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="intervention" label="Intervention">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="observedBy" label="Observed By">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ObservationModal;