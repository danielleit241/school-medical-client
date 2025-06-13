import {useEffect, useState} from "react";
import {
  Form,
  Input,
  DatePicker,
  Button,
  Card,
  Switch,
  Modal,
  Row,
  Col,
} from "antd";
import dayjs from "dayjs";
import axiosInstance from "../../../../api/axios";
import Swal from "sweetalert2";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";

const DeclarationForm = () => {
  const selectedStudentId = JSON.parse(localStorage.getItem("selectedStudent"));
  const studentId = selectedStudentId?.studentId || "";
  // const selectedListStudent = JSON.parse(localStorage.getItem("students"));
  const selectedListStudent = useSelector(
    (state) => state.listStudentPersist.listStudentParent
  );
  const student = selectedListStudent.find((s) => s.studentId === studentId);

  const [healthDeclaration, setHealthDeclaration] = useState(null);
  const [showVaccine, setShowVaccine] = useState(false);
  const [vaccineData, setVaccineData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentVaccine, setCurrentVaccine] = useState({
    vaccineName: "",
    batchNumber: "",
    vaccinatedDate: null,
    notes: "",
  });

  const [form] = Form.useForm();
  const [vaccineForm] = Form.useForm();
  const navigate = useNavigate();

  const handleAddVaccine = () => {
    setCurrentVaccine({
      vaccineName: "",
      batchNumber: "",
      vaccinatedDate: null,
      notes: "",
    });
    setModalVisible(true);
    vaccineForm.resetFields();
  };

  const handleEditVaccine = (index) => {
    setCurrentVaccine({...vaccineData[index], index});
    setModalVisible(true);
    vaccineForm.setFieldsValue({
      ...vaccineData[index],
      vaccinatedDate: vaccineData[index].vaccinatedDate
        ? dayjs(vaccineData[index].vaccinatedDate)
        : null,
    });
  };

  const handleRemoveVaccine = (index) => {
    setVaccineData(vaccineData.filter((_, i) => i !== index));
  };

  const handleModalOk = () => {
    vaccineForm
      .validateFields()
      .then((values) => {
        const newVaccine = {
          ...values,
          vaccinatedDate: values.vaccinatedDate,
        };
        if (currentVaccine.index !== undefined) {
          const updated = [...vaccineData];
          updated[currentVaccine.index] = newVaccine;
          setVaccineData(updated);
        } else {
          setVaccineData([...vaccineData, newVaccine]);
        }
        setModalVisible(false);
        setCurrentVaccine({
          vaccineName: "",
          batchNumber: "",
          vaccinatedDate: null,
          notes: "",
        });
      })
      .catch(() => {});
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setCurrentVaccine({
      vaccineName: "",
      batchNumber: "",
      vaccinatedDate: null,
      notes: "",
    });
  };

  useEffect(() => {
    const fetchHealthDeclaration = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/students/${studentId}/health-declarations`
        );
        setHealthDeclaration(response.data.healthDeclaration);
      } catch (error) {
        console.error("Error fetching health declaration:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch health declaration data.",
        });
      }
    };
    fetchHealthDeclaration();
  }, [studentId]);

  useEffect(() => {
    if (healthDeclaration) {
      form.setFieldsValue({
        fullName: student?.fullName || "",
        declarationDate: healthDeclaration.declarationDate
          ? dayjs(healthDeclaration.declarationDate)
          : dayjs(),
        chronicDiseases: healthDeclaration.chronicDiseases || "",
        drugAllergies: healthDeclaration.drugAllergies || "",
        foodAllergies: healthDeclaration.foodAllergies || "",
        notes: healthDeclaration.notes || "",
      });
    }
  }, [healthDeclaration, form, student]);

  const onFinish = (values) => {
    const healthDeclaration = {
      studentId: studentId,
      declarationDate: values.declarationDate.format("YYYY-MM-DD"),
      chronicDiseases: values.chronicDiseases,
      drugAllergies: values.drugAllergies,
      foodAllergies: values.foodAllergies,
      notes: values.notes,
    };
    const data = {
      healthDeclaration,
      vaccinations: showVaccine
        ? vaccineData.map((vaccine) => ({
            vaccineName: vaccine.vaccineName,
            doseNumber: vaccine.doseNumber,
            vaccinatedDate: vaccine.vaccinatedDate
              ? vaccine.vaccinatedDate.format("YYYY-MM-DD")
              : null,
            notes: vaccine.notes,
          }))
        : [],
    };
    console.log("Submitted data:", data);
    const fetchApi = async () => {
      try {
        // eslint-disable-next-line no-unused-vars
        const response = await axiosInstance.post(
          "/api/students/health-declarations",
          data
        );
        Swal.fire({
          icon: "success",
          title: "Submitted successfully!",
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          navigate("/parent/health-declaration/detail", {
            state: {studentId: studentId},
          });
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Submit failed!",
          text: "Please check your information and try again.",
        });
        console.error("Error submitting health declaration:", error);
      }
    };
    fetchApi();
  };

  return (
    <div style={{padding: "24px", background: "#f5f7fa", minHeight: "100vh"}}>
      <Card
        title={
          <span
            style={{
              fontWeight: 700,
              fontSize: 28,
              color: "#355383",
              letterSpacing: 1,
            }}
          >
            Health Declaration
          </span>
        }
        style={{
          maxWidth: showVaccine ? 1400 : 800,
          margin: "0 auto",
          borderRadius: 24,
          boxShadow: "0 8px 32px 0 rgba(53,83,131,0.10)",
          border: "none",
          background: "#fff",
          transition: "all 0.3s ease",
        }}
        bodyStyle={{padding: "40px"}}
      >
        <span
          style={{
            color: "#e74c3c",
            fontWeight: 500,
            marginBottom: 24,
            display: "block",
            fontSize: 15,
          }}
        >
          <i>Note: You can only fill out this form once per school year</i>
        </span>

        <Row gutter={[32, 0]} style={{marginTop: 16}}>
          {/* Main Form Column */}
          <Col xs={24} lg={showVaccine ? 14 : 24}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                declarationDate: dayjs(),
              }}
            >
              <Form.Item
                label={
                  <span
                    style={{fontWeight: 600, color: "#355383", fontSize: 16}}
                  >
                    Full Name
                  </span>
                }
                name="fullName"
                initialValue={student?.fullName || ""}
              >
                <Input
                  size="large"
                  style={{
                    backgroundColor: "#f4f6fa",
                    border: "1.5px solid #e0e0e0",
                    borderRadius: 12,
                    fontWeight: 500,
                  }}
                  disabled
                />
              </Form.Item>

              <Form.Item
                label={
                  <span
                    style={{fontWeight: 600, color: "#355383", fontSize: 16}}
                  >
                    Declaration Date
                  </span>
                }
                name="declarationDate"
                rules={[
                  {required: true, message: "Please select declaration date"},
                ]}
              >
                <DatePicker
                  size="large"
                  style={{
                    width: "100%",
                    background: "#f4f6fa",
                    border: "1.5px solid #e0e0e0",
                    borderRadius: 12,
                  }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span
                    style={{fontWeight: 600, color: "#355383", fontSize: 16}}
                  >
                    Chronic Diseases
                  </span>
                }
                name="chronicDiseases"
                rules={[
                  {required: true, message: "Please enter chronic diseases"},
                ]}
              >
                <Input
                  size="large"
                  placeholder="Enter chronic diseases or 'None' if applicable"
                  style={{
                    backgroundColor: "#f4f6fa",
                    border: "1.5px solid #e0e0e0",
                    borderRadius: 12,
                  }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span
                    style={{fontWeight: 600, color: "#355383", fontSize: 16}}
                  >
                    Drug Allergies
                  </span>
                }
                name="drugAllergies"
                rules={[
                  {required: true, message: "Please enter drug allergies"},
                ]}
              >
                <Input
                  size="large"
                  placeholder="Enter drug allergies or 'None' if applicable"
                  style={{
                    backgroundColor: "#f4f6fa",
                    border: "1.5px solid #e0e0e0",
                    borderRadius: 12,
                  }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span
                    style={{fontWeight: 600, color: "#355383", fontSize: 16}}
                  >
                    Food Allergies
                  </span>
                }
                name="foodAllergies"
                rules={[
                  {required: true, message: "Please enter food allergies"},
                ]}
              >
                <Input
                  size="large"
                  placeholder="Enter food allergies or 'None' if applicable"
                  style={{
                    backgroundColor: "#f4f6fa",
                    border: "1.5px solid #e0e0e0",
                    borderRadius: 12,
                  }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span
                    style={{fontWeight: 600, color: "#355383", fontSize: 16}}
                  >
                    Additional Notes
                  </span>
                }
                name="notes"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Any additional health information..."
                  style={{
                    backgroundColor: "#f4f6fa",
                    border: "1.5px solid #e0e0e0",
                    borderRadius: 12,
                  }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span
                    style={{fontWeight: 600, color: "#355383", fontSize: 16}}
                  >
                    Has Vaccination Records?
                  </span>
                }
                style={{marginBottom: 24}}
              >
                <div style={{display: "flex", alignItems: "center", gap: 12}}>
                  <Switch
                    checked={showVaccine}
                    onChange={setShowVaccine}
                    style={{background: showVaccine ? "#355383" : undefined}}
                  />
                  <span style={{color: "#666", fontSize: 14}}>
                    {showVaccine
                      ? "Vaccination section enabled"
                      : "Enable to add vaccination records"}
                  </span>
                </div>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  style={{
                    width: 200,
                    height: 48,
                    fontWeight: 600,
                    fontSize: 16,
                    background:
                      "linear-gradient(135deg, #355383 0%, #4a6fa5 100%)",
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 4px 12px rgba(53, 83, 131, 0.3)",
                  }}
                >
                  Submit Declaration
                </Button>
              </Form.Item>
            </Form>
          </Col>

          {/* Vaccination Column */}
          {showVaccine && (
            <Col xs={24} lg={10}>
              <Card
                title={
                  <div style={{display: "flex", alignItems: "center", gap: 8}}>
                    <span
                      style={{
                        color: "#159eec",
                        fontWeight: 600,
                        fontSize: 18,
                        letterSpacing: 0.5,
                      }}
                    >
                      💉 Vaccination Records
                    </span>
                  </div>
                }
                style={{
                  background:
                    "linear-gradient(135deg, #f6fafd 0%, #e8f4fd 100%)",
                  borderRadius: 16,
                  border: "2px solid #e3f2fd",
                  height: "fit-content",
                  top: 24,
                }}
                bodyStyle={{padding: 24}}
              >
                {vaccineData.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "#666",
                      background: "#fff",
                      borderRadius: 12,
                      border: "2px dashed #d0d7de",
                    }}
                  >
                    <div style={{fontSize: 48, marginBottom: 16}}>💉</div>
                    <div
                      style={{fontSize: 16, fontWeight: 500, marginBottom: 8}}
                    >
                      No vaccination records yet
                    </div>
                    <div style={{fontSize: 14, color: "#888"}}>
                      Click the button below to add vaccination information
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      maxHeight: "500px",
                      overflowY: "auto",
                      paddingRight: 8,
                    }}
                  >
                    {vaccineData.map((vaccine, index) => (
                      <div
                        key={index}
                        style={{
                          marginBottom: 16,
                          padding: 20,
                          background: "#fff",
                          borderRadius: 12,
                          border: "1px solid #e8f0fe",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 12,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              color: "#355383",
                              fontSize: 16,
                            }}
                          >
                            Vaccine #{index + 1}
                          </span>
                          <div style={{display: "flex", gap: 8}}>
                            <Button
                              size="small"
                              onClick={() => handleEditVaccine(index)}
                              style={{
                                background: "#e6f7ee",
                                color: "#1bbf83",
                                border: "none",
                                fontWeight: 500,
                                borderRadius: 6,
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              danger
                              size="small"
                              onClick={() => handleRemoveVaccine(index)}
                              style={{
                                fontWeight: 500,
                                borderRadius: 6,
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          <div>
                            <span style={{fontWeight: 500, color: "#666"}}>
                              Name:{" "}
                            </span>
                            <span style={{color: "#333"}}>
                              {vaccine.vaccineName}
                            </span>
                          </div>
                          <div>
                            <span style={{fontWeight: 500, color: "#666"}}>
                              Dose:{" "}
                            </span>
                            <span style={{color: "#333"}}>
                              {vaccine.doseNumber}
                            </span>
                          </div>
                          <div>
                            <span style={{fontWeight: 500, color: "#666"}}>
                              Date:{" "}
                            </span>
                            <span style={{color: "#333"}}>
                              {vaccine.vaccinatedDate
                                ? dayjs(vaccine.vaccinatedDate).format(
                                    "MMM DD, YYYY"
                                  )
                                : "Not specified"}
                            </span>
                          </div>
                          {vaccine.notes && (
                            <div>
                              <span style={{fontWeight: 500, color: "#666"}}>
                                Notes:{" "}
                              </span>
                              <span style={{color: "#333"}}>
                                {vaccine.notes}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  type="dashed"
                  onClick={handleAddVaccine}
                  block
                  size="large"
                  style={{
                    borderColor: "#159eec",
                    color: "#159eec",
                    fontWeight: 600,
                    height: 48,
                    borderRadius: 12,
                    marginTop: 16,
                    background: "#fff",
                  }}
                >
                  + Add Vaccination Record
                </Button>
              </Card>
            </Col>
          )}
        </Row>

        {/* Vaccination Modal */}
        <Modal
          title={
            <span style={{fontSize: 18, fontWeight: 600, color: "#355383"}}>
              Vaccination Information
            </span>
          }
          open={modalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText="Save Record"
          cancelText="Cancel"
          width={500}
          bodyStyle={{paddingTop: 24}}
          okButtonProps={{
            style: {
              background: "#355383",
              borderColor: "#355383",
              fontWeight: 500,
            },
          }}
        >
          <Form
            form={vaccineForm}
            layout="vertical"
            initialValues={currentVaccine}
          >
            <Form.Item
              label={<span style={{fontWeight: 500}}>Vaccine Name</span>}
              name="vaccineName"
              rules={[{required: true, message: "Please enter vaccine name"}]}
            >
              <Input
                placeholder="e.g., COVID-19, Hepatitis B, etc."
                style={{borderRadius: 8}}
              />
            </Form.Item>
            <Form.Item
              label={<span style={{fontWeight: 500}}>Dose Number</span>}
              name="doseNumber"
              rules={[{required: true, message: "Please enter dose number"}]}
            >
              <Input
                placeholder="e.g., 1st dose, 2nd dose, Booster"
                style={{borderRadius: 8}}
              />
            </Form.Item>
            <Form.Item
              label={<span style={{fontWeight: 500}}>Vaccination Date</span>}
              name="vaccinatedDate"
              rules={[
                {required: true, message: "Please select vaccination date"},
              ]}
            >
              <DatePicker
                style={{width: "100%", borderRadius: 8}}
                placeholder="Select date"
              />
            </Form.Item>
            <Form.Item
              label={<span style={{fontWeight: 500}}>Additional Notes</span>}
              name="notes"
            >
              <Input.TextArea
                rows={3}
                placeholder="Any additional information about this vaccination..."
                style={{borderRadius: 8}}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default DeclarationForm;
