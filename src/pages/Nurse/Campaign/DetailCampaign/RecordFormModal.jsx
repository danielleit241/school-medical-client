import React, {useEffect, useState} from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Spin,
  Row,
  Col,
  Typography,
  Divider,
  DatePicker,
  TimePicker,
  Switch,
  Card,
  Tag,
  Space,
  Steps,
  message,
  Select
} from "antd";
import {Syringe} from "lucide-react"
import {MedicineBoxOutlined} from "@ant-design/icons";
import axiosInstance from "../../../../api/axios";
import dayjs from "dayjs";
import Swal from "sweetalert2";

const {Title, Text} = Typography;

const RecordFormModal = ({open, onCancel, student, onOk, round, onReload}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [healthDeclaration, setHealthDeclaration] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [qualified, setQualified] = useState(null);
  const [vaccineDetails, SetVaccineDetails] = useState(null);
  const [vaccinationDate, setVaccinationDate] = useState(() => dayjs());
  console.log("RecordFormModal student:", student?.vaccineId);

  useEffect(() => {
    if(!student?.vaccineId) return;
    const fetchVaccineDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/vaccination-details/${student.vaccineId}`
        );
        console.log("Fetched vaccine details:", response.data);
        SetVaccineDetails(response.data);
      } catch (error) {
        console.error("Error fetching vaccine details:", error);
        SetVaccineDetails(null);
      }
    };
    fetchVaccineDetails();
  }, [student?.vaccineId]);

  useEffect(() => {
      if (open) {
        form.setFieldsValue({
          status:
            student && typeof student.status !== "string"
              ? student.status === true
                ? "Completed"
                : student.status === false
                ? "Pending"
                : "Completed"
              : "Completed",
        });
      }
    }, [open, student, form]);


  useEffect(() => {
    const fetchHealthDeclaration = async () => {
      if (open && student?.studentsOfRoundResponse?.studentId) {
        setHealthLoading(true);
        try {
          const response = await axiosInstance.get(
            `/api/students/${student.studentsOfRoundResponse.studentId}/health-declarations`
          );
          setHealthDeclaration(response.data);
        } catch (error) {
          console.error("Error fetching health declaration:", error);
          setHealthDeclaration(null);
        } finally {
          setHealthLoading(false);
        }
      }
    };

    if (open && student?.vaccinationResultId) {
      axiosInstance
        .get(
          `/api/vaccination-results/${student.vaccinationResultId}/health-qualified`
        )
        .then((res) => {
          const qualified =
            typeof res.data === "boolean" ? res.data : res.data?.qualified;
          setQualified(qualified);
          if (qualified === true) setStep(1);
          else setStep(0);
        })
        .catch(() => {
          setQualified(null);
          setStep(0);
        });
    }

    if (open) {
      setStep(0);
      fetchHealthDeclaration();
      setQualified(null);
      setLoading(false);
      form.resetFields();
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, student]);

  useEffect(() => {
    if (qualified === true) setStep(1);
    if (qualified === false) {
      setStep(0);
      setTimeout(() => {
        onCancel();
      }, 1000);
    }
  }, [qualified, onCancel]);

  useEffect(() => {
    if (!open) {
      setQualified(null);
      setStep(0);
    }
  }, [open]);

  useEffect(() => {
    const interval = setInterval(() => {
      const today = dayjs();
      setVaccinationDate((prev) => {
        if (!prev || !prev.isSame(today, "day")) return today;
        return prev;
      });
    }, 60 * 1000); // kiểm tra mỗi phút
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      setVaccinationDate(dayjs());
    }
  }, [open]);

  // Step 1: Xác nhận đủ điều kiện
  const handleQualified = async (isQualified) => {
    if (!student?.vaccinationResultId) return;
    setLoading(true);
    try {
      const res = await axiosInstance.put(
        `/api/vaccination-results/${student.vaccinationResultId}/health-qualified`,
        isQualified
      );
      if (!isQualified) {
        message.info("Student is not qualified for vaccination.");
        if (onReload) await onReload();
        const {notificationTypeId, senderId, receiverId} = res.data;
        await axiosInstance.post(`/api/notifications/vaccinations/results/to-parent`, {
          notificationTypeId,
          senderId,
          receiverId,
        });
        onCancel();

        return;
      }
      setTimeout(async () => {
        try {
          const res = await axiosInstance.get(
            `/api/vaccination-results/${student.vaccinationResultId}/health-qualified`
          );
          setQualified(res.data);
          console.log("Fetched qualified status:", res.data);
          if (res.data === true) {
            setStep(1);
          } else if (res.data === false) {
            message.info("Student is not qualified for vaccination.");
            setTimeout(() => {}, 100);
          }
        } catch (err) {
          console.error("Error fetching qualified status:", err);
          if (!isQualified) {
            setQualified(false);
            message.info("Student is not qualified for vaccination.");
            setTimeout(() => {
              onCancel();
            }, 1000);
          }
        }
      }, 300); // delay 300ms
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Form nhập kết quả tiêm chủng
  const validateVaccinatedDate = (_, value) => {
    if (!value) return Promise.resolve();
    const start = round?.vaccinationRoundInformation?.startTime
      ? dayjs(round.vaccinationRoundInformation.startTime).startOf("day")
      : null;
    const end = round?.vaccinationRoundInformation?.endTime
      ? dayjs(round.vaccinationRoundInformation.endTime).endOf("day")
      : null;
    if (start && end) {
      if (value.isBefore(start) || value.isAfter(end)) {
        return Promise.reject(
          new Error(
            `Vaccinated Date must be between ${start.format(
              "YYYY-MM-DD"
            )} and ${end.format("YYYY-MM-DD")}`
          )
        );
      }
    }
    return Promise.resolve();
  };
  const validateVaccinatedTime = (_, value) => {
    const vaccinatedDate = form.getFieldValue("vaccinatedDate");
    if (!vaccinatedDate || !value) return Promise.resolve();
    const selectedDate = vaccinatedDate.format("YYYY-MM-DD");
    const selectedTime = value.format("YYYY-MM-DD");
    if (selectedDate !== selectedTime) {
      return Promise.reject(
        new Error("Vaccinated Time must be on the same day as Vaccinated Date")
      );
    }
    return Promise.resolve();
  };

  const handleFinish = async (values) => {
    const vaccinated = values.vaccinated;
    const status = vaccinated ? "Completed" : "Failed";
    if (status === "Failed") {
      const result = await Swal.fire({
        icon: "warning",
        title: "Save with vaccination status 'Failed'?",
        text: "Vaccination status is missing. Are you sure you want to save?",
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "Back",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#aaa",
    });
    if (!result.isConfirmed) {
      setLoading(false);
      return;
    }
  }
    setLoading(true);
    try {
      const vaccinationResultId = student?.vaccinationResultId;

      const vaccinatedDate = values.vaccinatedDate;
      const vaccinatedTime = values.vaccinatedTime;

      // Gộp ngày và giờ thành 1 DateTime ISO string
      const vaccinatedDateTime = vaccinatedDate
        .hour(vaccinatedTime.hour())
        .minute(vaccinatedTime.minute())
        .second(0)
        .millisecond(0)
        .format("YYYY-MM-DDTHH:mm:ss");

      const payload = {
        vaccinationResultId,
        vaccinatedDate: vaccinatedDate.format("YYYY-MM-DD"),
        vaccinatedTime: vaccinatedDateTime,
        vaccinated: values.vaccinated,
        injectionSite: values.injectionSite,
        notes: values.notes,
        status: values.vaccinated ? "Completed" : "Failed", 
      };

      const res = await axiosInstance.post("/api/vaccination-results", payload);    
        form.resetFields();
        onOk();
        const {notificationTypeId, senderId, receiverId} = res.data;
        await axiosInstance.post(`/api/notifications/vaccinations/results/to-parent`, {
          notificationTypeId,
          senderId,
          receiverId,
        });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Record Vaccination"
      onCancel={onCancel}
      footer={null}
      width={990}
      styles={{body: {padding: 32}}}
      destroyOnClose
    >
      <Steps
        current={step}
        items={[{title: "Health Declaration"}, {title: "Vaccination Record"}]}
        style={{marginBottom: 32}}
      />
      {step === 0 && (
        <>
          <Row gutter={32}>
            {/* Health Declaration */}
            <Col xs={24} md={12}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 14,
                  background: "#f9fbfd",
                  minHeight: 220,
                  boxShadow: "0 2px 12px #e6f7ff",
                }}
                bodyStyle={{ padding: 28 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                  <MedicineBoxOutlined style={{ color: "#1677ff", fontSize: 22 }} />
                  <span style={{ color: "#1677ff", fontWeight: 600, fontSize: 17 }}>Health Declaration</span>
                </div>
                {healthLoading ? (
                  <Spin />
                ) : healthDeclaration && healthDeclaration.healthDeclaration ? (
                  <div>
                    <Row style={{ marginBottom: 12 }}>
                      <Col flex="auto"><Text strong>Chronic Diseases:</Text></Col>
                      <Col>
                        <Text style={{ color: "#444" }}>
                          {healthDeclaration.healthDeclaration.chronicDiseases || "N/A"}
                        </Text>
                      </Col>
                    </Row>
                    <Row style={{ marginBottom: 12 }}>
                      <Col flex="auto"><Text strong>Drug Allergies:</Text></Col>
                      <Col>
                        <Text style={{ color: "#444" }}>
                          {healthDeclaration.healthDeclaration.drugAllergies || "N/A"}
                        </Text>
                      </Col>
                    </Row>
                    <Row style={{ marginBottom: 12 }}>
                      <Col flex="auto"><Text strong>Food Allergies:</Text></Col>
                      <Col>
                        <Text style={{ color: "#444" }}>
                          {healthDeclaration.healthDeclaration.foodAllergies || "N/A"}
                        </Text>                       
                      </Col>
                    </Row>
                    <Row style={{ marginBottom: 15 }}>
                      <Col flex="auto"><Text strong>Additional Notes:</Text></Col>
                      <Col>
                        <Text style={{ color: "#444" }}>
                          {healthDeclaration.healthDeclaration.notes || "N/A"}
                        </Text>
                      </Col>
                    </Row>
                  </div>
                ) : (
                  <Text type="secondary">No health declaration data.</Text>
                )}
              </Card>
            </Col>
            {/* Vaccine Details */}
            <Col xs={24} md={12}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 14,
                  background: "#f9fbfd",
                  minHeight: 220,
                  boxShadow: "0 2px 12px #e6f7ff",
                }}
                bodyStyle={{ padding: 28 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 15 }}>
                  <Syringe style={{ color: "#1677ff", width: 20, height: 20, verticalAlign: "middle" }} />
                  <span style={{ color: "#1677ff", fontWeight: 600, fontSize: 17 }}>Vaccine Details</span>
                </div>
                {vaccineDetails ? (
                  <div>
                    <Row style={{ marginBottom: 12 }}>
                      <Col flex="auto"><Text strong>Vaccine Code:</Text></Col>
                      <Col><Text>{vaccineDetails.vaccineCode || "N/A"}</Text></Col>
                    </Row>
                    <Row style={{ marginBottom: 12 }}>
                      <Col flex="auto"><Text strong>Vaccine Name:</Text></Col>
                      <Col><Text>{vaccineDetails.vaccineName || "N/A"}</Text></Col>
                    </Row>
                    <Row style={{ marginBottom: 12 }}>
                      <Col flex="auto"><Text strong>Manufacturer:</Text></Col>
                      <Col><Text>{vaccineDetails.manufacturer || "N/A"}</Text></Col>
                    </Row>
                    <Row>
                      <Col flex="auto" style={{ marginBottom: 12 }}><Text strong>Age Recommendation:</Text></Col>
                      <Col><Text>{vaccineDetails.ageRecommendation || "N/A"}</Text></Col>
                    </Row>
                    <Row>
                      <Col flex="auto"><Text strong>Contraindication Notes:</Text></Col>
                      <Col><Text>{vaccineDetails.contraindicationNotes || "N/A"}</Text></Col>
                    </Row>
                  </div>
                ) : (
                  <Text type="secondary">No vaccine details available.</Text>
                )}
              </Card>
            </Col>
          </Row>
          {/* Nút Cancel/Confirm ra ngoài, căn phải */}
          <Row justify="end" style={{ marginTop: 40 }}>
            <Space size={16}>
              <Button
                danger
                loading={loading}
                onClick={() => handleQualified(false)}
                style={{ minWidth: 110, fontWeight: 500 }}
              >
                Not Qualified
              </Button>
              <Button
                type="primary"
                loading={loading}
                onClick={() => handleQualified(true)}
                style={{ minWidth: 110, fontWeight: 500 }}
              >
                Qualified
              </Button>
            </Space>
          </Row>
        </>
      )}
      {step === 1 && (
        <Row gutter={32}>
          {/* Bên trái: Form nhập */}
          <Col xs={24} md={14}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              initialValues={{
                vaccinatedDate: vaccinationDate,
              }}
            >
              <Form.Item
                label="Vaccinated Date"
                name="vaccinatedDate"
                rules={[
                  { required: true, message: "Please select date" },
                  { validator: validateVaccinatedDate },
                ]}
                initialValue={vaccinationDate}
              >
                <DatePicker
                  disabled
                  style={{ width: "100%" }}
                  value={vaccinationDate}
                />
              </Form.Item>
              <Form.Item
                label="Vaccinated Time"
                name="vaccinatedTime"
                rules={[
                  { required: true, message: "Please select time" },
                  { validator: validateVaccinatedTime },
                ]}
              >
                <TimePicker
                  style={{ width: "100%" }}
                  format="HH:mm"
                  minuteStep={5}
                  allowClear={false}
                />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Vaccinated"
                    name="vaccinated"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Injection Site"
                    name="injectionSite"
                    initialValue="None"
                    rules={[
                      { required: true, message: "Please enter injection site" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const vaccinated = getFieldValue("vaccinated");
                          if (vaccinated && value === "None") {
                            return Promise.reject(
                              new Error("Injection site is required if vaccinated is checked.")
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <Select placeholder="Select injection site">
                      <Select.Option value="Left Deltoid">Left Deltoid</Select.Option>
                      <Select.Option value="Right Deltoid">Right Deltoid</Select.Option>
                      <Select.Option value="Right Thigh">Right Thigh</Select.Option>
                      <Select.Option value="Left Thigh">Left Thigh</Select.Option>
                      <Select.Option value="None">None</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Notes" name="notes"
               rules={[
                      { required: true, message: "Please enter notes" },
                    ]}
              >
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item
                label="Status"
                shouldUpdate={(prev, curr) => prev.vaccinated !== curr.vaccinated}
              >
                {({ getFieldValue }) => {
                  const vaccinated = getFieldValue("vaccinated");
                  const status = vaccinated ? "Completed" : "Failed";
                  return (
                    <Input
                      readOnly
                      value={status}
                      style={{
                        color: vaccinated ? "#22c55e" : "#ef4444",
                        fontWeight: 600,
                      }}
                    />
                  );
                }}
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{ width: "100%" }}
                >
                  Save
                </Button>
              </Form.Item>
            </Form>
          </Col>
          {/* Bên phải: Health Declaration & Vaccine Details */}
          <Col xs={24} md={10}>
            <Card
              bordered={false}
              style={{
                borderRadius: 14,
                boxShadow: "0 2px 12px #e6f7ff",
                background: "#f9fbfd",
                minHeight: 320,
                marginBottom: 18,
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Space direction="vertical" style={{ width: "100%" }} size={16}>
                {/* Health Declaration */}
                <Title level={5} style={{ margin: 0, color: "#1677ff", display: "flex", alignItems: "center", gap: 8 }}>
                  <MedicineBoxOutlined /> Health Declaration
                </Title>
                <Divider style={{ margin: "8px 0" }} />
                {healthLoading ? (
                  <Spin />
                ) : healthDeclaration && healthDeclaration.healthDeclaration ? (
                  <div style={{ lineHeight: 2, fontSize: 15 }}>
                    <div>
                      <Text strong>Chronic Diseases:</Text>{" "}
                      <Tag
                        color={
                          healthDeclaration.healthDeclaration
                            .chronicDiseases === "no"
                            ? "green"
                            : "red"
                        }
                        style={{ minWidth: 38, textAlign: "center" }}
                      >
                        {healthDeclaration.healthDeclaration.chronicDiseases || "N/A"}
                      </Tag>
                    </div>
                    <div>
                      <Text strong>Drug Allergies:</Text>{" "}
                      <Tag
                        color={
                          healthDeclaration.healthDeclaration.drugAllergies ===
                          "no"
                            ? "green"
                            : "red"
                        }
                        style={{ minWidth: 38, textAlign: "center" }}
                      >
                        {healthDeclaration.healthDeclaration.drugAllergies || "N/A"}
                      </Tag>
                    </div>
                    <div>
                      <Text strong>Food Allergies:</Text>{" "}
                      <Tag
                        color={
                          healthDeclaration.healthDeclaration.foodAllergies ===
                          "no"
                            ? "green"
                            : "red"
                        }
                        style={{ minWidth: 38, textAlign: "center" }}
                      >
                        {healthDeclaration.healthDeclaration.foodAllergies || "N/A"}
                      </Tag>
                    </div>
                    <div>
                      <Text strong>Additional Notes:</Text>{" "}
                      <Text>
                        {healthDeclaration.healthDeclaration.notes || (
                          <span style={{ color: "#aaa" }}>N/A</span>
                        )}
                      </Text>
                    </div>
                  </div>
                ) : (
                  <Text type="secondary">No health declaration data.</Text>
                )}
                {/* Vaccine Details */}
                <Title level={5} style={{ margin: "18px 0 0 0", color: "#1677ff", display: "flex", alignItems: "center", gap: 8 }}>
                  <Syringe style={{ color: "#1677ff", width: 20, height: 20, verticalAlign: "middle" }} />
                  Vaccine Details
                </Title>
                <Divider style={{ margin: "8px 0" }} />
                {vaccineDetails ? (
                  <div style={{ fontSize: 15 }}>
                    <div>
                      <Text strong>Vaccine Code:</Text>{" "}
                      <Text>{vaccineDetails.vaccineCode || "N/A"}</Text>
                    </div>
                    <div>
                      <Text strong>Vaccine Name:</Text>{" "}
                      <Text>{vaccineDetails.vaccineName || "N/A"}</Text>
                    </div>
                    <div>
                      <Text strong>Manufacturer:</Text>{" "}
                      <Text>{vaccineDetails.manufacturer || "N/A"}</Text>
                    </div>
                    <div>
                      <Text strong>Age Recommendation:</Text>{" "}
                      <Text>{vaccineDetails.ageRecommendation || "N/A"}</Text>
                    </div>
                    <div>
                      <Text strong>Contraindication Notes:</Text>{" "}
                      <Text>{vaccineDetails.contraindicationNotes || "N/A"}</Text>
                    </div>
                  </div>
                ) : (
                  <Text type="secondary">No vaccine details available.</Text>
                )}
              </Space>
            </Card>
          </Col>
        </Row>
      )}
    </Modal>
  );
};

export default RecordFormModal;
