import React, { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, Select, Spin, message } from "antd";
import axiosInstance from "../../../../api/axios";
import dayjs from "dayjs";
import Swal from "sweetalert2";

const { Option } = Select;

const EditVaccineCampaignModal = ({ open, campaign, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [vaccineList, setVaccineList] = useState([]);
  console.log("EditVaccineCampaignModal - campaign:", campaign);

  // Fetch vaccine list for dropdown
  useEffect(() => {
    if (open) {
      axiosInstance
        .get("/api/vaccination-details/all")
        .then((res) => setVaccineList(res.data || []))
        .catch(() => setVaccineList([]));
    }
  }, [open]);

  // Set form values from campaign prop
  useEffect(() => {
    if (open && campaign) {
      const values = {
        vaccineId: campaign.vaccineId,
        title: campaign.title,
        description: campaign.description,
        startDate: campaign.startDate ? dayjs(campaign.startDate) : null,
        endDate: campaign.endDate ? dayjs(campaign.endDate) : null,
      };
      form.setFieldsValue(values);
    }
  }, [open, campaign, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const scheduleId = campaign.vaccinationScheduleResponseDto.scheduleId;
      const createdBy = localStorage.getItem("userId") || "";

      const payload = {
        scheduleId,
        vaccineId: values.vaccineId,
        title: values.title,
        description: values.description,
        startDate: values.startDate
          ? values.startDate.format("YYYY-MM-DD")
          : null,
        endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
        createdBy,
      };

      console.log("PUT payload:", payload);

      await axiosInstance.put(
        `/api/vaccinations/schedules/${scheduleId}`,
        payload
      );

      // Hiển thị SweetAlert khi thành công
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Update campaign successfully!",
        timer: 2000,
        showConfirmButton: false,
      });

      onClose(true);
    } catch (err) {
      console.error("Update campaign error:", err?.response?.data || err);
      message.error("Update failed. Please check your input.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose(false);
    form.resetFields();
  };

  return (
    <Modal
      open={open}
      title="Edit Vaccination Campaign"
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Save"
      cancelText="Cancel"
      confirmLoading={loading}
      destroyOnClose
    >
      {!campaign ? (
        <Spin />
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item
            label="Vaccine"
            name="vaccineId"
            rules={[{ required: true, message: "Please select vaccine!" }]}
          >
            <Select
              showSearch
              placeholder="Select vaccine"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {vaccineList.map((vaccine) => (
                <Option key={vaccine.vaccineId} value={vaccine.vaccineId}>
                  {vaccine.vaccineName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please input title!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            label="Start Date"
            name="startDate"
            rules={[{ required: true, message: "Please select start date!" }]}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item
            label="End Date"
            name="endDate"
            rules={[{ required: true, message: "Please select end date!" }]}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default EditVaccineCampaignModal;