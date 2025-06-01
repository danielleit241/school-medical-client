import React, {useState} from "react";
import {
  Form,
  Input,
  DatePicker,
  Button,
  Card,
  Switch,
  Modal,
  Space,
} from "antd";
import dayjs from "dayjs";
import {useLocation} from "react-router-dom";
import {useSelector} from "react-redux";
import axiosInstance from "../../../../api/axios";
import Swal from "sweetalert2";
import {useNavigate} from "react-router-dom";

const DeclaretionForm = () => {
  const location = useLocation();
  const studentId = location.state?.studentId;
  const students =
    useSelector((state) => state.listStudentParent.listStudentParent) || [];
  const student = students.find((s) => s.studentId === studentId);
  console.log(student);
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
          // Edit
          const updated = [...vaccineData];
          updated[currentVaccine.index] = newVaccine;
          setVaccineData(updated);
        } else {
          // Add
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
            batchNumber: vaccine.batchNumber,
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
    <Card title="Health Declaration" style={{maxWidth: 700, margin: "0 auto"}}>
      <span style={{color: "red"}}>
        Note: You can only fill out this form once per school year
      </span>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          declarationDate: dayjs(),
        }}
      >
        <Form.Item
          label="Full Name"
          name="fullName"
          initialValue={student?.fullName || ""}
        >
          <Input style={{backgroundColor: "#f0f0f0"}} disabled />
        </Form.Item>
        <Form.Item
          label="Declaration Date"
          name="declarationDate"
          rules={[{required: true, message: "Please select declaration date"}]}
        >
          <DatePicker style={{width: "100%"}} />
        </Form.Item>
        <Form.Item
          label="Chronic Diseases"
          name="chronicDiseases"
          rules={[{required: true, message: "Please enter chronic diseases"}]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Drug Allergies"
          name="drugAllergies"
          rules={[{required: true, message: "Please enter drug allergies"}]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Food Allergies"
          name="foodAllergies"
          rules={[{required: true, message: "Please enter food allergies"}]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Notes" name="notes">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item label="Has Vaccination?">
          <Switch checked={showVaccine} onChange={setShowVaccine} />
        </Form.Item>

        {showVaccine && (
          <Card
            title="Vaccinations"
            style={{marginBottom: 16, background: "#f6f6f6"}}
          >
            {vaccineData.length === 0 && (
              <div style={{color: "#888", marginBottom: 8}}>
                No vaccine added yet.
              </div>
            )}
            {vaccineData.map((vaccine, index) => (
              <Space
                key={index}
                direction="vertical"
                style={{
                  display: "block",
                  marginBottom: 16,
                  padding: 12,
                  background: "#fff",
                  borderRadius: 8,
                  border: "1px solid #eee",
                }}
              >
                <b>Vaccine {index + 1}</b>
                <div>
                  <b>Name:</b> {vaccine.vaccineName}
                </div>
                <div>
                  <b>Batch:</b> {vaccine.batchNumber}
                </div>
                <div>
                  <b>Date:</b>{" "}
                  {vaccine.vaccinatedDate
                    ? dayjs(vaccine.vaccinatedDate).format("YYYY-MM-DD")
                    : ""}
                </div>
                <div>
                  <b>Notes:</b> {vaccine.notes}
                </div>
                <Button
                  size="small"
                  onClick={() => handleEditVaccine(index)}
                  style={{marginRight: 8}}
                >
                  Edit
                </Button>
                <Button
                  danger
                  size="small"
                  onClick={() => handleRemoveVaccine(index)}
                >
                  Remove
                </Button>
              </Space>
            ))}
            <Button type="dashed" onClick={handleAddVaccine} block>
              Add Vaccine
            </Button>
          </Card>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{width: 120}}>
            Submit
          </Button>
        </Form.Item>
      </Form>

      {/* Modal nhập vaccine */}
      <Modal
        title="Vaccine Information"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Save"
      >
        <Form
          form={vaccineForm}
          layout="vertical"
          initialValues={currentVaccine}
        >
          <Form.Item
            label="Vaccine Name"
            name="vaccineName"
            rules={[{required: true, message: "Please enter vaccine name"}]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Batch Number"
            name="batchNumber"
            rules={[{required: true, message: "Please enter batch number"}]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Vaccinated Date"
            name="vaccinatedDate"
            rules={[{required: true, message: "Please select vaccinated date"}]}
          >
            <DatePicker style={{width: "100%"}} />
          </Form.Item>
          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default DeclaretionForm;
