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

  useEffect(() => {
    // Fetch students
    const fetchStudents = async () => {
      try {
        setTimeout(async () => {
          //Thay api endpoint này bằng endpoint lấy danh sách học sinh
          const res = await axiosInstance.get("/api/students/no-paged");
          console.log("Students: ", res.data);
          setStudents(Array.isArray(res.data) ? res.data : []);
          dispatch(setListStudent(Array.isArray(res.data) ? res.data : []));
        }, 500);
      } catch {
        setStudents([]);
      }
    };
    // Fetch inventory items from /api/medical-inventories
    const fetchItems = async () => {
      try {
        setTimeout(async () => {
          const res = await axiosInstance.get("/api/medical-inventories");
          setItems(Array.isArray(res.data.items) ? res.data.items : []);
        }, 500);
      } catch {
        setItems([]);
      }
    };
    fetchStudents();
    fetchItems();
  }, [dispatch]);

  // Thêm/xóa request vật tư
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

      // Gửi request tạo medical event
      const response = await axiosInstance.post(
        "/api/nurses/students/medical-events",
        payload
      );
      // console.log("CreateMedicalEvent response: ", response.data);
      // Lấy thông tin từ response
      const {notificationTypeId, senderId, receiverId} = response.data;

      // Gửi notification cho parent
      // eslint-disable-next-line no-unused-vars
      const notificationResponse = await axiosInstance.post(
        "/api/notifications/medical-events/to-parent",
        {
          notificationTypeId,
          senderId,
          receiverId,
        }
      );
      // console.log("noti: ", notificationResponse.data);
      Swal.fire({
        icon: "success",
        title: "Medical event created!",
        showConfirmButton: false,
        timer: 1500,
      });
      navigate("/nurse/medical-event/medical-event-list");
      setLoading(false);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
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
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        title="Create Medical Event"
        style={{maxWidth: 1200, width: "100%"}}
      >
        <Form layout="vertical" onFinish={onFinish}>
          <Row gutter={24}>
            {/* Main event info */}
            <Col xs={24} md={14}>
              <Form.Item
                label="Student"
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
                label="Event Type"
                name="eventType"
                rules={[{required: true, message: "Please enter event type"}]}
              >
                <Input placeholder="ex: Headache, Common cold, Mild indigestion, etc." />
              </Form.Item>
              <Form.Item
                label="Event Description"
                name="eventDescription"
                rules={[{required: true, message: "Please enter description"}]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>
              <Form.Item
                label="Location"
                name="location"
                rules={[{required: true, message: "Please enter location"}]}
              >
                <Input placeholder="ex: Medical Center dh2T, etc." />
              </Form.Item>
              <Form.Item
                label="Severity Level"
                name="severityLevel"
                rules={[{required: true, message: "Please select severity"}]}
              >
                <Select placeholder="Select severity">
                  {SEVERITY_OPTIONS.map((opt) => (
                    <Select.Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Checkbox
                  checked={parentNotified}
                  onChange={(e) => setParentNotified(e.target.checked)}
                >
                  Parent Notified
                </Checkbox>
              </Form.Item>
              <Form.Item label="Notes" name="notes">
                <Input.TextArea rows={2} />
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
            {/* Medical Requests */}
            <Col xs={24} md={10}>
              <div style={{fontWeight: 500, marginBottom: 12}}>
                Medical Requests
              </div>
              {medicalRequests.map((req, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#f6f6f6",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 16,
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <Form.Item label="Item" required style={{marginBottom: 8}}>
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
                    style={{marginBottom: 8}}
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
              <Button type="dashed" onClick={handleAddRequest} block>
                + Add Medical Request
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default CreateMedicalEvent;
