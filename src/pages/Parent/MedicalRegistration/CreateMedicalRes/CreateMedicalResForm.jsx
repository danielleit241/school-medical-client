import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import axiosInstance from "../../../../api/axios";
import {setListStudentParent} from "../../../../redux/feature/listStudentParent";
import {Form, Input, DatePicker, Button, Checkbox, Card, Select} from "antd";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import {useNavigate} from "react-router-dom";

const MedicalRegistrationList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const parentId = useSelector((state) => state.user?.userId);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/parents/${parentId}/students`
        );
        setStudents(response.data);
        dispatch(setListStudentParent(response.data));
      } catch (error) {
        console.error("Error fetching children data:", error);
        setStudents([]);
      }
    };
    if (parentId) fetchStudents();
  }, [parentId, dispatch]);

  const onFinish = async (values) => {
    const data = {
      studentId: values.studentId,
      userId: parentId,
      dateSubmitted: values.dateSubmitted.format("YYYY-MM-DD"),
      medicationName: values.medicationName,
      dosage: values.dosage,
      notes: values.notes,
      parentConsent: values.parentConsent,
    };
    setLoading(true);
    try {
      await axiosInstance.post("/api/parents/medical-registrations", data);
      Swal.fire({
        icon: "success",
        title: "Medication registration submitted!",
        showConfirmButton: false,
        timer: 1500,
      });
      navigate("/parent/medical-registration/list");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Submit failed!",
        text: "Please check your information and try again.",
      });
      console.error("Error submitting medication registration:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Medication Registration"
      style={{maxWidth: 500, margin: "0 auto"}}
    >
      <Form
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          dateSubmitted: dayjs(),
          parentConsent: false,
        }}
      >
        <Form.Item
          label="Student"
          name="studentId"
          rules={[{required: true, message: "Please select your child"}]}
        >
          <Select placeholder="Select student" allowClear>
            {students.map((s) => (
              <Select.Option key={s.studentId} value={s.studentId}>
                {s.fullName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Medication Name"
          name="medicationName"
          rules={[{required: true, message: "Please enter medication name"}]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Dosage"
          name="dosage"
          rules={[{required: true, message: "Please enter dosage"}]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Date Submitted"
          name="dateSubmitted"
          rules={[{required: true, message: "Please select date"}]}
        >
          <DatePicker style={{width: "100%"}} />
        </Form.Item>

        <Form.Item label="Notes" name="notes">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item
          name="parentConsent"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject("You must consent to give medication"),
            },
          ]}
        >
          <Checkbox>
            I consent to the school administering this medication to my child
          </Checkbox>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{width: 120}}
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default MedicalRegistrationList;
