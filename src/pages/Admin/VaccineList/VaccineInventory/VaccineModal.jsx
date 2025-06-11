import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, DatePicker, Select, Spin } from "antd";
import axiosInstance from "../../../../api/axios";
import Swal from "sweetalert2";
import dayjs from "dayjs";

const { Option } = Select;

const VaccineModal = ({ open, vaccineId, onClose, onSaved }) => {
    const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (open && vaccineId) {
        setLoading(true);
        try {
          const res = await axiosInstance.get(`/api/vaccination-details/${vaccineId}`);
          const data = res.data;
          console.log("Fetched vaccination detail:", data);
          setOriginalData(data);
          form.setFieldsValue({
            ...data,
            expirationDate: data.expirationDate ? dayjs(data.expirationDate) : null,
            createAt: data.createAt ? dayjs(data.createAt) : null,
            updateAt: data.updateAt ? dayjs(data.updateAt) : null,
          });
        } catch {
          Swal.fire({
            icon: "error",
            title: "Failed to load item",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          });
          onClose();
        } finally {
          setLoading(false);
        }
      } else if (open) {
        form.resetFields();
        setOriginalData({});
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [open, vaccineId]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      let payload = {
        ...originalData,
        ...values,
        expirationDate: values.expirationDate ? values.expirationDate.format("YYYY-MM-DD") : null,
        createAt: values.createAt ? values.createAt.format("YYYY-MM-DD") : null,
        updateAt: values.updateAt ? values.updateAt.format("YYYY-MM-DD") : null,
      };
      if (vaccineId) {
        // Edit
        await axiosInstance.put(`/api/vaccination-details/${vaccineId}`, payload);
      } else {
        // Create
        await axiosInstance.post(`/api/vaccination-details`, payload);
      }
      Swal.fire({
        icon: "success",
        title: "Saved successfully",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      onSaved && onSaved();
      onClose();
    } catch (err) {
      if (err && err.errorFields) return;
      Swal.fire({
        icon: "error",
        title: "Save failed",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Edit Medical Inventory"
      onCancel={onClose}
      onOk={handleSave}
      okText="Save"
      confirmLoading={saving}
      destroyOnClose
      bodyStyle={{ maxHeight: 500, overflowY: "auto" }}
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical">
          <Form.Item label="vaccineCode" name="vaccineCode" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Vaccine Name" name="vaccineName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Manufacturer" name="manufacturer" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Vaccine Type" name="vaccineType" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Age Recommendation" name="ageRecommendation" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Batch Number" name="batchNumber" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Expiration Date" name="expirationDate">
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item label="Contraindication Notes" name="contraindicationNotes">
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input />
          </Form.Item>
          <Form.Item label="Create At" name="createAt">
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item label="Update At" name="updateAt">
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
          
        </Form>
      </Spin>
    </Modal>
  )
}

export default VaccineModal