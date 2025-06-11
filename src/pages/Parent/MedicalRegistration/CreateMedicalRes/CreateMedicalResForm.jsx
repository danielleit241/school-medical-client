import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import axiosInstance from "../../../../api/axios";
import {setListStudentParent} from "../../../../redux/feature/listStudentParent";
import {
  Form,
  Input,
  DatePicker,
  Button,
  Checkbox,
  Card,
  Select,
  Row,
  Col,
} from "antd";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import {useNavigate} from "react-router-dom";

const DOSE_TIME_OPTIONS = [
  {label: "Morning", value: "Morning"},
  {label: "Afternoon", value: "Afternoon"},
  {label: "Evening", value: "Evening"},
];

const CreateMedicalResForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const parentId = useSelector((state) => state.user?.userId);

  const [students, setStudents] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalDosages, setTotalDosages] = useState("1");
  // Mỗi phần tử: { doseNumber: "1", doseTime: "Morning", notes: "" }
  const [doseDetails, setDoseDetails] = useState([
    {doseNumber: "1", doseTime: "Morning", notes: ""},
  ]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/parents/${parentId}/students`
        );
        setStudents(response.data);
        dispatch(setListStudentParent(response.data));
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setStudents([]);
      }
    };
    if (parentId) fetchStudents();
  }, [parentId, dispatch]);
  useEffect(() => {
    const fetchNurses = async () => {
      try {
        const response = await axiosInstance.get("/api/nurses");
        setNurses(response.data);
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setNurses([]);
      }
    };
    fetchNurses();
  }, []);
  // Khi chọn lại số buổi, cập nhật lại form nhỏ
  const handleTotalDosagesChange = (value) => {
    setTotalDosages(value);
    setDoseDetails(
      Array.from({length: Number(value)}, (_, i) => ({
        doseNumber: String(i + 1),
        doseTime: DOSE_TIME_OPTIONS[i]?.value || "Morning",
        notes: "",
      }))
    );
  };

  // Khi chọn buổi cho từng dose
  const handleDoseTimeChange = (idx, val) => {
    setDoseDetails((prev) =>
      prev.map((item, i) => (i === idx ? {...item, doseTime: val} : item))
    );
  };

  // Khi nhập notes cho từng buổi
  const handleDoseNoteChange = (idx, val) => {
    setDoseDetails((prev) =>
      prev.map((item, i) => (i === idx ? {...item, notes: val} : item))
    );
  };

  const onFinish = async (values) => {
    const date = values.dateSubmitted.format("YYYY-MM-DD");
    const medicalRegistration = {
      studentId: values.studentId,
      userId: parentId,
      staffNurseId: values.staffNurseId,
      dateSubmitted: date,
      medicationName: values.medicationName,
      totalDosages: String(values.totalDosages),
      notes: values.notes,
      parentConsent: values.parentConsent,
    };
    const medicalRegistrationDetails = doseDetails.map((item) => ({
      doseNumber: item.doseNumber,
      doseTime: item.doseTime,
      notes: item.notes,
    }));
    console.log("Medical registration data:", medicalRegistration);
    setLoading(true);
    try {
      // Bước 1: Đăng ký thuốc
      const res = await axiosInstance.post(
        "/api/parents/medical-registrations",
        {
          medicalRegistration,
          medicalRegistrationDetails,
        }
      );
      console.log("Medical registration response:", res.data);
      // Bước 2: Gửi thông báo cho nurse
      await axiosInstance.post(
        "/api/notifications/medical-registrations/to-nurse",
        {
          notificationTypeId: res.data.notificationTypeId,
          senderId: res.data.senderId,
          receiverId: res.data.receiverId,
        }
      );

      Swal.fire({
        icon: "success",
        title: "Medication registration submitted!",
        showConfirmButton: false,
        timer: 1500,
      });
      navigate("/parent/medical-registration/list");
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Submit failed!",
        text: "Please check your information and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        title="Medication Registration"
        style={{maxWidth: 1200, width: "100%"}}
      >
        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            dateSubmitted: dayjs(),
            parentConsent: false,
            totalDosages: "1",
          }}
        >
          <Row gutter={24}>
            {/* Main form */}
            <Col xs={24} md={14}>
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
                label="Nurse"
                name="staffNurseId"
                rules={[{required: true, message: "Please select a nurse"}]}
              >
                <Select placeholder="Select nurse" allowClear>
                  {nurses.map((n) => (
                    <Select.Option key={n.staffNurseId} value={n.staffNurseId}>
                      {n.fullName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Medication Name"
                name="medicationName"
                rules={[
                  {required: true, message: "Please enter medication name"},
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Total Dosages (per day)"
                name="totalDosages"
                rules={[
                  {required: true, message: "Please select total dosages"},
                ]}
              >
                <Select
                  placeholder="Select number of dosages"
                  onChange={handleTotalDosagesChange}
                  value={totalDosages}
                  style={{width: 180}}
                >
                  <Select.Option value="1">1</Select.Option>
                  <Select.Option value="2">2</Select.Option>
                  <Select.Option value="3">3</Select.Option>
                </Select>
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
                  I consent to the school administering this medication to my
                  child
                </Checkbox>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{width: 120, backgroundColor: "#355383"}}
                >
                  Submit
                </Button>
              </Form.Item>
            </Col>

            {/* Dose details form */}
            <Col xs={24} md={10}>
              {doseDetails.slice(0, Number(totalDosages)).map((item, idx) => (
                <div
                  key={item.doseNumber}
                  style={{
                    background: "#f6f6f6",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 16,
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <b>Dose {item.doseNumber}</b>
                  <Form.Item
                    label="Dose Time"
                    style={{marginBottom: 8}}
                    required
                  >
                    <Select
                      value={item.doseTime}
                      onChange={(val) => handleDoseTimeChange(idx, val)}
                      style={{width: "100%"}}
                    >
                      {DOSE_TIME_OPTIONS.map((opt) => (
                        <Select.Option key={opt.value} value={opt.value}>
                          {opt.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item label="Notes" style={{marginBottom: 0}}>
                    <Input.TextArea
                      rows={1}
                      placeholder={`Notes for dose ${item.doseNumber} (optional)`}
                      value={item.notes}
                      onChange={(e) =>
                        handleDoseNoteChange(idx, e.target.value)
                      }
                    />
                  </Form.Item>
                </div>
              ))}
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default CreateMedicalResForm;
