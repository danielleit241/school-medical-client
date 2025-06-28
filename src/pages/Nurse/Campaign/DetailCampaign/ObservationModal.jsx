import React, {useEffect, useState } from "react";
import { Modal, Form, DatePicker, TimePicker, Button, Select, Col, Row, Input } from "antd";
import dayjs from "dayjs";
import axiosInstance from "../../../../api/axios";
import { useSelector } from "react-redux";

const ObservationModal = ({ open, onCancel, student, onOk, initialValues }) => {
  const nurseId = useSelector((state) => state.user?.userId);
  console.log("Nurse ID:", nurseId);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [vaccinatedDate, setVaccinatedDate] = useState(null);
  const [nurseName, setNurseName] = useState("");
  const [reactionTypeModalOpen, setReactionTypeModalOpen] = useState(false);
  const [reactionTypeValue, setReactionTypeValue] = useState("");
  const [interventionValue, setInterventionValue] = useState("");
  const [interventionModalOpen, setInterventionModalOpen] = useState(false);

  useEffect(() => {
    if(open){
      setReactionTypeValue("");
      setInterventionValue("");
      form.resetFields();
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!nurseId) return;
    const fetchNurseName = async () => {
      try {
        const res = await axiosInstance.get(`/api/user-profile/${nurseId}`);
        setNurseName(res.data?.fullName || "Unknown Nurse");
        console.log("Nurse Name:", res.data);
      } catch (error) {
        console.error("Error fetching nurse name:", error);
        setNurseName("Unknown Nurse");
      }
    };
    fetchNurseName();
  }, [nurseId]);

  useEffect(() => {
    const fetchVaccinatedDate = async () => {
      if (!student?.vaccinationResultId) {
        setVaccinatedDate(null);
        return;
      }
      try {
        const res = await axiosInstance.get(`/api/vaccination-results/${student.vaccinationResultId}`);
        setVaccinatedDate(res.data?.resultResponse?.vaccinatedDate || null);
        console.log("Vaccinated Date:", res.data);
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
      const baseDate = dayjs(vaccinatedDate); 

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
        reactionType: values.reactionType === "other" ? values.reactionDetail : values.reactionType,
        severityLevel: values.severityLevel,
        immediateReaction: values.immediateReaction,
        intervention: values.intervention === "other" ? values.interventionDetail : values.intervention,
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
        initialValues={{
          reactionType: "normal",
          severityLevel: "normal",
          immediateReaction: "no",
          intervention: "no",
          ...initialValues,
        }}
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
            <Form.Item name="reactionType" label="Reaction Type" rules={[{ required: true, message: "Please select reaction type" }]}>
             <Select
                value={reactionTypeValue ? reactionTypeValue : form.getFieldValue("reactionType")}
                onSelect={val => {
                  if (val === "other") {
                    setReactionTypeModalOpen(true);
                  } else {
                    setReactionTypeValue("");
                    form.setFieldsValue({ reactionType: val });
                  }
                }}
                placeholder="Select Reaction Type"
                options={[
                  { label: "Normal", value: "normal" },
                  { label: reactionTypeValue || "Other", value: "other" },
                ]}
              />
            </Form.Item>
              <Modal
                open={reactionTypeModalOpen}
                title="Enter Reaction Detail"
                onCancel={() => setReactionTypeModalOpen(false)}
                footer={null}
                destroyOnClose
              >
                <Form
                  onFinish={vals => {
                  setReactionTypeValue(vals.reactionDetail);
                  form.setFieldsValue({ reactionType: vals.reactionDetail });
                  setReactionTypeModalOpen(false);
                  }}
                >
                  <Form.Item
                    name="reactionDetail"
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
                <Select.Option value="normal">Normal</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="immediateReaction" label="Immediate Reaction" rules={[{ required: true, message: "Please select immediate reaction" }]}>
              <Select placeholder="Select immediate reaction">
                <Select.Option value="yes">Yes</Select.Option>
                <Select.Option value="no">No</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="intervention" label="Intervention" rules={[{ required: true, message: "Please select intervention type" }]}>
             <Select
                value={interventionValue ? interventionValue : form.getFieldValue("intervention")}
                onSelect={val => {
                  if (val === "other") {
                    setInterventionModalOpen(true);
                  } else {
                    setInterventionValue("");
                    form.setFieldsValue({ intervention: val });
                  }
                }}
                placeholder="Select Intervention Type"
                options={[
                  { label: "No", value: "no" },
                  { label: interventionValue || "Other", value: "other" },
                ]}
              />
            </Form.Item>
            <Modal
                open={interventionModalOpen}
                title="Enter Intervention Detail"
                onCancel={() => setInterventionModalOpen(false)}
                footer={null}
                destroyOnClose
              >
                <Form
                  onFinish={vals => {
                  setInterventionValue(vals.interventionDetail);
                  form.setFieldsValue({ intervention: vals.interventionDetail });
                  setInterventionModalOpen(false);
                  }}
                >
                  <Form.Item
                    name="interventionDetail"
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
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="observedBy" label="Observed By" initialValue={nurseName}>
              <Input readOnly />
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