import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, DatePicker, Select, Spin } from "antd";
import axiosInstance from "../../../../api/axios";
import Swal from "sweetalert2";
import dayjs from "dayjs";

const { Option } = Select;
const StudentModal = ({ open, studentId, onClose, onSaved }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [originalData, setOriginalData] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            if(open && studentId){
                setLoading(true);
                try{
                    const res = await axiosInstance.get(`/api/students/${studentId}`);
                    const data = res.data;
                    setOriginalData(data);
                    form.setFieldsValue({
                        ...data,
                        dayOfBirth: data.dayOfBirth ? dayjs(data.dayOfBirth) : null,
                    });                  
                }catch (error) {
                    console.error("Failed to fetch student data:", error);
                    Swal.fire({
                        icon: "error",
                        title: "Failed to load student data",
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
            } else if(open) {
                form.resetFields();
                setOriginalData({});
            }
        }
        fetchData();
        // eslint-disable-next-line
    },[open, studentId]);

    const handleSave = async () => {
        try{
            const values = await form.validateFields();
            setSaving(true);
            let payload = {
                ...originalData,
                ...values,
                dayOfBirth: values.dayOfBirth ? values.dayOfBirth.format("YYYY-MM-DD") : null,

            };
            await axiosInstance.put(`/api/students/${studentId}`, payload);
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

        }catch (error) {
          if (error && error.errorFields) return;
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
          title="Edit Student"
          onCancel={onClose}
          onOk={handleSave}
          okText="Save"
          confirmLoading={saving}
          destroyOnClose
          bodyStyle={{ maxHeight: 500, overflowY: "auto" }}
        >
          <Spin spinning={loading}>
            <Form form={form} layout="vertical">
              <Form.Item label="Student Code" name="studentCode" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Full Name" name="fullName" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Date of Birth" name="dayOfBirth">
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
              <Form.Item label="Gender" name="gender" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Grade" name="grade" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Address" name="address" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Parent Phone Number" name="parentPhoneNumber" rules={[{ required: true }]}>
                  <Input />
              </Form.Item>
              <Form.Item label="Parent Email" name="parentEmailAddress" rules={[{ required: true }]}>
                  <Input />
              </Form.Item>
            </Form>
          </Spin>
        </Modal>
  )
}

export default StudentModal