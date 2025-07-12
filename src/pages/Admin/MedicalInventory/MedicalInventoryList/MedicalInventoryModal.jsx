import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, DatePicker, Select, Spin } from "antd";
import axiosInstance from "../../../../api/axios";
import Swal from "sweetalert2";
import dayjs from "dayjs";

const { Option } = Select;

const MedicalInventoryModal = ({ open, itemId, onClose, onSaved }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (open && itemId) {
        setLoading(true);
        try {
          const res = await axiosInstance.get(`/api/medical-inventories/${itemId}`);
          const data = res.data;
          setOriginalData(data);
          form.setFieldsValue({
            ...data,
            expiryDate: data.expiryDate ? dayjs(data.expiryDate) : null,
            lastImportDate: data.lastImportDate ? dayjs(data.lastImportDate) : null,
            lastExportDate: data.lastExportDate ? dayjs(data.lastExportDate) : null,
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
  }, [open, itemId]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      let payload = {
        ...originalData,
        ...values,
        expiryDate: values.expiryDate ? values.expiryDate.format("YYYY-MM-DD") : null,
        lastImportDate: values.lastImportDate ? values.lastImportDate.format("YYYY-MM-DD") : null,
        lastExportDate: values.lastExportDate ? values.lastExportDate.format("YYYY-MM-DD") : null,
        status: values.status === true || values.status === "true",
      };
      if (itemId) {
        // Edit
        await axiosInstance.put(`/api/medical-inventories/${itemId}`, payload);
      } else {
        // Create
        await axiosInstance.post(`/api/medical-inventories`, payload);
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
      title={itemId ? "Edit Medical Inventory" : "Create Medical Inventory"}
      onCancel={onClose}
      onOk={handleSave}
      okText="Save"
      confirmLoading={saving}
      destroyOnClose
      bodyStyle={{ maxHeight: 500, overflowY: "auto" }}
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical">
          <Form.Item label="Item Name" name="itemName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Category" name="category" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input />
          </Form.Item>
          <Form.Item label="Unit Of Measure" name="unitOfMeasure" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Expiry Date" name="expiryDate">
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item label="Maximum Stock Level" name="maximumStockLevel" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Minimum Stock Level" name="minimumStockLevel" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Quantity In Stock" name="quantityInStock" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Status" name="status">
            <Select>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default MedicalInventoryModal;