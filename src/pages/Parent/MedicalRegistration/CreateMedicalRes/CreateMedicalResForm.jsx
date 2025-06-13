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
      className="animate__animated animate__fadeIn"
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f8fa",
      }}
    >
      <Card
        style={{
          maxWidth: 1200,
          width: "100%",
          borderRadius: 20,
          boxShadow: "0 8px 32px 0 rgba(53,83,131,0.10)",
          padding: 0,
          border: "none",
          overflow: "hidden",
        }}
        bodyStyle={{padding: 0}}
      >
        {/* Header gradient */}
        <div
          style={{
            background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
            padding: "20px 36px 10px 36px",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 32,
              color: "#fff",
              letterSpacing: 1,
            }}
          >
            Medication Registration
          </span>
        </div>
        <Row
          gutter={0}
          style={{
            background: "#fff",
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            boxShadow: "0 2px 8px rgba(53,83,131,0.04)",
          }}
        >
          {/* Main form */}
          <Col xs={24} md={14} style={{padding: "32px 32px 32px 36px"}}>
            <div
              style={{
                fontWeight: 600,
                fontSize: 22,
                marginBottom: 18,
                color: "#222",
              }}
            >
              Medication Information
            </div>
            <Form
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                dateSubmitted: dayjs(),
                parentConsent: false,
                totalDosages: "1",
              }}
            >
              <Form.Item
                label="Student"
                name="studentId"
                rules={[{required: true, message: "Please select your child"}]}
              >
                <Select placeholder="Select student" allowClear size="large">
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
                <Select placeholder="Select nurse" allowClear size="large">
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
                <Input size="large" />
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
                  size="large"
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
                <DatePicker style={{width: "100%"}} size="large" />
              </Form.Item>

              <Form.Item label="Notes" name="notes">
                <Input.TextArea
                  rows={2}
                  size="large"
                  placeholder="Additional notes (optional)"
                />
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
                <Checkbox style={{fontWeight: 500}}>
                  I consent to the school administering this medication to my
                  child
                </Checkbox>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  style={{
                    width: 140,
                    background:
                      "linear-gradient(90deg, #2B5DC4 0%, #355383 100%)",
                    border: "none",
                    fontWeight: 600,
                    fontSize: 17,
                    borderRadius: 8,
                    marginTop: 8,
                  }}
                >
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </Col>

          {/* Dose details form */}
          <Col
            xs={24}
            md={10}
            style={{
              background: "#f8fafd",
              borderTopRightRadius: 20,
              borderBottomRightRadius: 20,
              padding: "32px 32px 32px 24px",
              borderLeft: "2px solid #f0f0f0",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 22,
                marginBottom: 18,
                color: "#222",
                letterSpacing: 0.5,
              }}
            >
              Dose Sessions
            </div>
            {doseDetails.slice(0, Number(totalDosages)).map((item, idx) => (
              <div
                key={item.doseNumber}
                style={{
                  background: "#fff",
                  padding: 18,
                  borderRadius: 12,
                  marginBottom: 18,
                  border: "1.5px solid #e0e0e0",
                  boxShadow: "0 2px 8px rgba(53,83,131,0.04)",
                }}
              >
                <b style={{color: "#355383"}}>Dose {item.doseNumber}</b>
                <Form.Item
                  label="Dose Time"
                  style={{marginBottom: 8, marginTop: 10}}
                  required
                >
                  <Select
                    value={item.doseTime}
                    onChange={(val) => handleDoseTimeChange(idx, val)}
                    style={{width: "100%"}}
                    size="large"
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
                    onChange={(e) => handleDoseNoteChange(idx, e.target.value)}
                    size="large"
                  />
                </Form.Item>
              </div>
            ))}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default CreateMedicalResForm;
