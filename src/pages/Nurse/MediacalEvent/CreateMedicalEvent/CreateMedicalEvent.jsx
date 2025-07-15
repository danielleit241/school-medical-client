import React, {useEffect, useState} from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  Row,
  Col,
  Checkbox,
  InputNumber,
  Spin,
} from "antd";
import Swal from "sweetalert2";
import axiosInstance from "../../../../api/axios";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {setListStudent} from "../../../../redux/feature/studentSlice";

const SEVERITY_OPTIONS = [
  {label: "Low", value: "Low"},
  {label: "Medium", value: "Medium"},
  {label: "High", value: "High"},
];

const EVENT_TYPE_OPTIONS = [
  {label: "Accident/Injury", value: "Accident/Injury"},
  {label: "Headache", value: "Headache"},
  {label: "Fever", value: "Fever"},
  {label: "Stomachache", value: "Stomachache"},
  {label: "Common Cold", value: "Common Cold"},
  {label: "Mild Indigestion", value: "Mild Indigestion"},
];

const CreateMedicalEvent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const nurseId = useSelector((state) => state.user?.userId);
  const [students, setStudents] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [medicalRequests, setMedicalRequests] = useState([
    {itemId: undefined, requestQuantity: 1, purpose: ""},
  ]);
  const [parentNotified, setParentNotified] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    // Fetch students
    const fetchStudents = async () => {
      try {
        const res = await axiosInstance.get("/api/students/no-paged");
        setStudents(Array.isArray(res.data) ? res.data : []);
        dispatch(setListStudent(Array.isArray(res.data) ? res.data : []));
      } catch {
        setStudents([]);
      }
    };
    // Fetch inventory items from /api/medical-inventories
    const fetchItems = async () => {
      try {
        const res = await axiosInstance.get("/api/medical-inventories");
        setItems(Array.isArray(res.data.items) ? res.data.items : []);
      } catch {
        setItems([]);
      }
    };
    fetchStudents();
    fetchItems();
  }, [dispatch]);

  const handleAddRequest = () => {
    setMedicalRequests((prev) => [
      ...prev,
      {itemId: undefined, requestQuantity: 1, purpose: ""},
    ]);
  };
  const handleRemoveRequest = (idx) => {
    setMedicalRequests((prev) => prev.filter((_, i) => i !== idx));
  };
  const handleRequestChange = (idx, field, value) => {
    setMedicalRequests((prev) =>
      prev.map((item, i) => (i === idx ? {...item, [field]: value} : item))
    );
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        medicalEvent: {
          studentCode: values.studentCode,
          staffNurseId: nurseId,
          eventType: values.eventType,
          eventDescription: values.eventDescription,
          location: values.location,
          severityLevel: values.severityLevel,
          parentNotified: parentNotified,
          notes: values.notes,
        },
        medicalRequests: medicalRequests
          .filter((req) => req.itemId && req.requestQuantity > 0)
          .map((req) => ({
            itemId: req.itemId,
            requestQuantity: req.requestQuantity,
            purpose: req.purpose,
          })),
      };

      const response = await axiosInstance.post(
        "/api/nurses/students/medical-events",
        payload
      );
      console.log(
        "Medical event created successfully:",
        response.data.toParent
      );
      const {notificationTypeId, senderId, receiverId} = response.data.toParent;
      const {
        notificationTypeId: managerNotificationTypeId,
        senderId: managerSenderId,
        receiverId: managerReceiverId,
      } = response.data.toManager;
      console.log(
        "hi",
        managerNotificationTypeId,
        managerSenderId,
        managerReceiverId
      );
      await axiosInstance.post("/api/notifications/medical-events/to-parent", {
        notificationTypeId,
        senderId,
        receiverId,
      });
      await axiosInstance.post("/api/notifications/medical-events/to-manager", {
        notificationTypeId: managerNotificationTypeId,
        senderId: managerSenderId,
        receiverId: managerReceiverId,
      });
      Swal.fire({
        icon: "success",
        title: "Medical event created!",
        showConfirmButton: false,
        timer: 1500,
      });
      navigate("/nurse/medical-event/medical-event-list");
      setLoading(false);
    } catch (error) {
      console.error("Error creating medical event:", error);
      setTimeout(() => {
        Swal.fire({
          icon: "error",
          title: "Create failed!",
          text: "Please check your information and try again.",
        });
        setLoading(false);
      }, 600);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        padding: "0 0 32px 0",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
          padding: "20px 0 20px 0",
          marginBottom: "18px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          borderRadius: "20px 20px 0 0",
        }}
      >
        <h1
          style={{
            fontSize: 40,
            fontWeight: 800,
            margin: "0 0 4px 0",
            textShadow: "2px 2px 4px rgba(0,0,0,0.18)",
            letterSpacing: "1px",
          }}
        >
          Create Medical Event
        </h1>
        <p
          style={{
            fontSize: 15,
            fontWeight: 500,
            margin: "0 0 6px 0", 
            opacity: 0.9,
            maxWidth: 480,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Please fill details below to create a new medical event for a student.
        </p>
      </div>
      <div
        style={{
          width: "100%",
          margin: "0 auto",
          padding: "32px",
        }}
      >
        <Card
          style={{
            borderRadius: 16,
            boxShadow: "0 8px 32px 0 rgba(53,83,131,0.15)",
            padding: "32px 0 0 0",
            border: "none",
            background: "#fff",
          }}
        >
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            style={{width: "100%"}}
            autoComplete="off"
          >
            <Row gutter={36}>
              <Col xs={24} md={14}>
                <Form.Item
                  label={<span style={{fontWeight: 600}}>Student</span>}
                  name="studentCode"
                  rules={[{required: true, message: "Please select student"}]}
                >
                  <Select
                    placeholder="Select student"
                    style={{width: "100%"}}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      String(option.children)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {students.map((student) => (
                      <Select.Option
                        key={student.studentCode}
                        value={student.studentCode}
                      >
                        {student.fullName} ({student.studentCode})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  label={<span style={{fontWeight: 600}}>Event Type</span>}
                  name="eventType"
                  rules={[{required: true, message: "Please enter event type"}]}
                >
                  <Select placeholder="Select event type">
                    {EVENT_TYPE_OPTIONS.map((opt) => (
                      <Select.Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  label={
                    <span style={{fontWeight: 600}}>Event Description</span>
                  }
                  name="eventDescription"
                  rules={[
                    {required: true, message: "Please enter description"},
                  ]}
                >
                  <Input.TextArea rows={2} />
                </Form.Item>
                <Form.Item>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={<span style={{fontWeight: 600}}>Location</span>}
                        name="location"
                        rules={[
                          {required: true, message: "Please enter location"},
                        ]}
                        style={{marginBottom: 0}}
                      >
                        <Input placeholder="ex: Medical Center dh2T, etc." />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={
                          <span style={{fontWeight: 600}}>Severity Level</span>
                        }
                        name="severityLevel"
                        rules={[
                          {required: true, message: "Please select severity"},
                        ]}
                        style={{marginBottom: 0}}
                      >
                        <Select placeholder="Select severity">
                          {SEVERITY_OPTIONS.map((opt) => (
                            <Select.Option key={opt.value} value={opt.value}>
                              {opt.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form.Item>
                <Form.Item
                  label={<span style={{fontWeight: 600}}>Notes</span>}
                  name="notes"
                >
                  <Input.TextArea rows={2} />
                </Form.Item>
                <Form.Item>
                  <Checkbox
                    checked={parentNotified}
                    onChange={(e) => setParentNotified(e.target.checked)}
                  >
                    Parent Notified
                  </Checkbox>
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    style={{
                      width: 140,
                      fontWeight: 600,
                      fontSize: 16,
                      borderRadius: 8,
                      background:
                        "linear-gradient(90deg, #3058A4 0%, #2563eb 100%)",
                      border: "none",
                      boxShadow: "0 2px 8px #3058A433",
                    }}
                  >
                    Submit
                  </Button>
                </Form.Item>
              </Col>
              <Col xs={24} md={10}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 17,
                    marginBottom: 16,
                    color: "#3058A4",
                  }}
                >
                  Medical Requests
                </div>
                {medicalRequests.map((req, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#f6f6f6",
                      padding: 16,
                      borderRadius: 10,
                      marginBottom: 18,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Form.Item
                      label="Item"
                      required
                      style={{marginBottom: 8, fontWeight: 500}}
                    >
                      <Select
                        placeholder="Select item"
                        value={req.itemId}
                        onChange={(val) =>
                          handleRequestChange(idx, "itemId", val)
                        }
                        style={{width: "100%"}}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          String(option.children)
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      >
                        {items.map((item) => (
                          <Select.Option key={item.itemId} value={item.itemId}>
                            {item.itemName} ({item.unitOfMeasure}) - Stock:{" "}
                            {item.quantityInStock}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      label="Quantity"
                      required
                      style={{marginBottom: 8, fontWeight: 500}}
                    >
                      <InputNumber
                        min={1}
                        value={req.requestQuantity}
                        onChange={(val) =>
                          handleRequestChange(idx, "requestQuantity", val)
                        }
                        style={{width: "100%"}}
                      />
                    </Form.Item>
                    <Form.Item label="Purpose" style={{marginBottom: 0}}>
                      <Input.TextArea
                        rows={1}
                        placeholder="Purpose for this item"
                        value={req.purpose}
                        onChange={(e) =>
                          handleRequestChange(idx, "purpose", e.target.value)
                        }
                      />
                    </Form.Item>
                    {medicalRequests.length > 1 && (
                      <Button
                        danger
                        style={{marginTop: 8}}
                        onClick={() => handleRemoveRequest(idx)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={handleAddRequest}
                  block
                  style={{fontWeight: 600}}
                >
                  + Add Medical Request
                </Button>
              </Col>
            </Row>
          </Form>
          {loading && (
            <div style={{textAlign: "center", marginTop: 24}}>
              <Spin size="large" />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CreateMedicalEvent;
