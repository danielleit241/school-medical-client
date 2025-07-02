import React, {useState, useEffect, useCallback} from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Typography,
  Spin,
  Badge,
  Descriptions,
  Input,
  Row,
  Col,
  message,
  Tag,
  Drawer,
  Empty,
  Select,
} from "antd";
import {
  SearchOutlined,
  SyncOutlined,
  EyeOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  IdcardOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../../api/axios";
import dayjs from "dayjs";

const {Title, Text} = Typography;

const MedicalRequest = () => {
  const [requests, setRequests] = useState([]);
  const [medicalEvents, setMedicalEvents] = useState({}); // eventId -> event data
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedNurse, setSelectedNurse] = useState(null);
  const [nurses, setNurses] = useState([]);

  // Fetch medical requests and their events
  const fetchRequests = useCallback(
    async (page = 1, pageSize = 10) => {
      try {
        setLoading(true);

        // Build query parameters
        const params = {
          pageIndex: page,
          pageSize: pageSize,
        };

        if (searchKeyword.trim()) {
          params.keyword = searchKeyword.trim();
        }
        if (selectedNurse) {
          params.nurseId = selectedNurse;
        }

        const response = await axiosInstance.get("/api/medical-requests", {
          params,
        });

        if (response.data) {
          setRequests(response.data.items);
          setPagination({
            current: response.data.pageIndex,
            pageSize: response.data.pageSize,
            total: response.data.count,
          });

          const eventIds = [
            ...new Set(
              response.data.items
                .map((item) => item.eventInfo?.eventId)
                .filter(Boolean)
            ),
          ];
          // Only fetch events not already in state
          const missingEventIds = eventIds.filter(
            (id) => !medicalEvents[id]
          );
          if (missingEventIds.length > 0) {
            const eventData = {};
            await Promise.all(
              missingEventIds.map(async (eventId) => {
                try {
                  const res = await axiosInstance.get(
                    `/api/medical-events/${eventId}`
                  );
                  eventData[eventId] = res.data;
                } catch {
                  eventData[eventId] = null;
                }
              })
            );
            setMedicalEvents((prev) => ({ ...prev, ...eventData }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch medical requests:", error);
        message.error("Failed to load medical requests");
      } finally {
        setLoading(false);
      }
    },
    [searchKeyword, selectedNurse, medicalEvents]
  );

  // Fetch request details and its event
  const fetchRequestDetails = async (requestId) => {
    try {
      setDetailLoading(true);
      const response = await axiosInstance.get(
        `/api/medical-requests/${requestId}`
      );
      if (response.data) {
        setSelectedRequest(response.data);
        setDrawerVisible(true);

        const eventId = response.data.eventInfo?.eventId;
        if (eventId) {
          try {
            const res = await axiosInstance.get(
              `/api/medical-events/${eventId}`
            );
            setSelectedEvent(res.data);
          } catch {
            setSelectedEvent(null);
          }
        } else {
          setSelectedEvent(null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch request details:", error);
      message.error("Failed to load request details");
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle table pagination change
  const handleTableChange = (pagination) => {
    fetchRequests(pagination.current, pagination.pageSize);
  };

  // Apply filters (search & nurse filter)
  const applyFilters = () => {
    fetchRequests(1, pagination.pageSize);
  };

  // Reset all filters and refresh data
  const handleReset = () => {
    setSearchKeyword("");
    setSelectedNurse(null);
    fetchRequests(1, pagination.pageSize);
  };

  // Fetch nurses for filter dropdown
  const fetchNurses = async () => {
    try {
      const response = await axiosInstance.get("/api/nurses");
      if (response.data) {
        setNurses(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch nurses:", error);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchRequests();
    fetchNurses();
  }, [fetchRequests]);

  // Table columns (đã sắp xếp lại thứ tự hợp lý: Student Code, Student Name, Event Type, Location, Severity, Item Name, Quantity, Requested By, Request Date, Actions)
  const columns = [
    {
      title: "Student Code",
      key: "studentCode",
      render: (_, record) => {
        const eventId = record.eventInfo?.eventId;
        const event = eventId ? medicalEvents[eventId] : null;
        return event?.studentInfo?.studentCode || <i>None</i>;
      },
    },
    {
      title: "Student Name",
      key: "studentName",
      render: (_, record) => {
        const eventId = record.eventInfo?.eventId;
        const event = eventId ? medicalEvents[eventId] : null;
        return event?.studentInfo?.fullName || <i>None</i>;
      },
    },
    {
      title: "Event Type",
      key: "eventType",
      render: (_, record) => {
        const eventId = record.eventInfo?.eventId;
        const event = eventId ? medicalEvents[eventId] : null;
        return event?.medicalEvent?.eventType || <i>None</i>;
      },
    },
    {
      title: "Location",
      key: "location",
      render: (_, record) => {
        const eventId = record.eventInfo?.eventId;
        const event = eventId ? medicalEvents[eventId] : null;
        return event?.medicalEvent?.location || <i>None</i>;
      },
    },
    {
      title: "Severity",
      key: "severityLevel",
      render: (_, record) => {
        const eventId = record.eventInfo?.eventId;
        const event = eventId ? medicalEvents[eventId] : null;
        return event?.medicalEvent?.severityLevel || <i>None</i>;
      },
    },
    {
      title: "Item Name",
      dataIndex: ["medicalInfo", "itemName"],
      key: "itemName",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Quantity",
      dataIndex: ["medicalInfo", "requestQuantity"],
      key: "quantity",
      render: (quantity) => (
        <Badge
          count={quantity}
          style={{
            backgroundColor: quantity > 5 ? "#f5222d" : "#1890ff",
            fontSize: "12px",
          }}
        />
      ),
    },
    {
      title: "Requested By",
      dataIndex: ["nurseInfo", "fullName"],
      key: "requestedBy",
    },
    {
      title: "Request Date",
      dataIndex: ["medicalInfo", "requestDate"],
      key: "requestDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => fetchRequestDetails(record.medicalInfo.requestId)}
            size="small"
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{padding: "24px"}}>
      <Card>
        <Title level={4}>
          <MedicineBoxOutlined style={{marginRight: 8}} />
          Medical Supply Requests
        </Title>

        {/* Filter section */}
        <Row gutter={16} style={{marginBottom: 16}}>
          <Col span={8}>
            <Input
              placeholder="Search by item name"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col span={10}>
            <Select
              style={{width: "100%"}}
              placeholder="Filter by nurse"
              value={selectedNurse}
              onChange={(value) => setSelectedNurse(value)}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={nurses.map((nurse) => ({
                value: nurse.staffNurseId,
                label: nurse.fullName,
              }))}
            />
          </Col>
          <Col span={6}>
            <Space>
              <Button type="primary" onClick={applyFilters}>
                Apply Filters
              </Button>
              <Button
                icon={<SyncOutlined style={{margin: 0}} />}
                onClick={handleReset}
              ></Button>
            </Space>
          </Col>
        </Row>

        {/* Requests table */}
        <Table
          columns={columns}
          dataSource={requests}
          rowKey={(record) => record.medicalInfo.requestId}
          pagination={pagination}
          onChange={handleTableChange}
          loading={loading}
          locale={{
            emptyText: <Empty description="No medical requests found" />,
          }}
        />
      </Card>

      {/* Request details drawer */}
      <Drawer
        title={
          <Space>
            <MedicineBoxOutlined />
            <span>Medical Request Details</span>
          </Space>
        }
        width={600}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {detailLoading ? (
          <div style={{textAlign: "center", padding: "40px 0"}}>
            <Spin size="large" />
          </div>
        ) : selectedRequest ? (
          <>
            <Descriptions
              title="Student Information"
              bordered
              column={1}
              style={{marginBottom: 24}}
            >
              <Descriptions.Item label="Student Code">
                <IdcardOutlined style={{marginRight: 8}} />
                {selectedEvent?.studentInfo?.studentCode || <i>None</i>}
              </Descriptions.Item>
              <Descriptions.Item label="Student Name">
                <TeamOutlined style={{marginRight: 8}} />
                {selectedEvent?.studentInfo?.fullName || <i>None</i>}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions
              title="Event Information"
              bordered
              column={1}
              style={{marginBottom: 24}}
            >
              <Descriptions.Item label="Event Type">
                <ExclamationCircleOutlined style={{marginRight: 8}} />
                {selectedEvent?.medicalEvent?.eventType || <i>None</i>}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                <EnvironmentOutlined style={{marginRight: 8}} />
                {selectedEvent?.medicalEvent?.location || <i>None</i>}
              </Descriptions.Item>
              <Descriptions.Item label="Severity">
                <ExclamationCircleOutlined style={{marginRight: 8, color: "#faad14"}} />
                {selectedEvent?.medicalEvent?.severityLevel || <i>None</i>}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions
              title="Request Information"
              bordered
              column={1}
              style={{marginBottom: 24}}
            >
              <Descriptions.Item label="Item Name">
                <Tag color="blue" style={{fontSize: 16}}>
                  {selectedRequest.medicalInfo.itemName}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Quantity Requested">
                <Badge
                  count={selectedRequest.medicalInfo.requestQuantity}
                  style={{
                    backgroundColor:
                      selectedRequest.medicalInfo.requestQuantity > 5
                        ? "#f5222d"
                        : "#1890ff",
                    fontSize: "14px",
                  }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Request Date">
                <CalendarOutlined style={{marginRight: 8}} />
                {dayjs(selectedRequest.medicalInfo.requestDate).format(
                  "DD MMMM YYYY"
                )}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions
              title="Nurse Information"
              bordered
              column={1}
              style={{marginBottom: 24}}
            >
              <Descriptions.Item label="Nurse Name">
                <Space>
                  <UserOutlined />
                  <Text strong copyable>
                    {selectedRequest.nurseInfo.fullName}
                  </Text>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </>
        ) : (
          <Empty description="No request details available" />
        )}
      </Drawer>
    </div>
  );
};

export default MedicalRequest;
