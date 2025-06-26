import React, {useState, useEffect, useCallback} from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Modal,
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
} from "@ant-design/icons";
import axiosInstance from "../../../api/axios";
import dayjs from "dayjs";

const {Title, Text} = Typography;

const MedicalRequest = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
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
  const [nurseProfile, setNurseProfile] = useState(null);

  // Fetch medical requests
  const fetchRequests = useCallback(
    async (page = 1, pageSize = 10) => {
      try {
        setLoading(true);

        // Build query parameters
        const params = {
          pageIndex: page,
          pageSize: pageSize,
        };

        // Add search keyword if provided
        if (searchKeyword.trim()) {
          params.keyword = searchKeyword.trim();
        }

        // Add nurse filter if selected
        if (selectedNurse) {
          params.nurseId = selectedNurse;
        }

        const response = await axiosInstance.get("/api/medical-requests", {
          params,
        });

        if (response.data) {
          // Sort by requestDate descending (newest first)
          const sortedItems = [...response.data.items].sort((a, b) => {
            const dateA = new Date(a.medicalInfo.requestDate);
            const dateB = new Date(b.medicalInfo.requestDate);
            return dateB - dateA;
          });
          setRequests(sortedItems);
          setPagination({
            current: response.data.pageIndex,
            pageSize: response.data.pageSize,
            total: response.data.count,
          });
        }
      } catch (error) {
        console.error("Failed to fetch medical requests:", error);
        message.error("Failed to load medical requests");
      } finally {
        setLoading(false);
      }
    },
    [searchKeyword, selectedNurse]
  );

  // Fetch request details
  const fetchRequestDetails = async (requestId) => {
    try {
      setDetailLoading(true);
      const response = await axiosInstance.get(
        `/api/medical-requests/${requestId}`
      );
      if (response.data) {
        setSelectedRequest(response.data);
        setDrawerVisible(true);
        // Fetch nurse profile
        if (response.data.nurseInfo?.nurseId) {
          try {
            const nurseRes = await axiosInstance.get(
              `/api/user-profile/${response.data.nurseInfo.nurseId}`
            );
            setNurseProfile(nurseRes.data);
            // eslint-disable-next-line no-unused-vars
          } catch (err) {
            setNurseProfile(null);
          }
        } else {
          setNurseProfile(null);
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
    // Reset to first page and fetch fresh data
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

  // Table columns
  const columns = [
    {
      title: "Item Name",
      dataIndex: ["medicalInfo", "itemName"],
      key: "itemName",
      // render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Requested By",
      dataIndex: ["nurseInfo", "fullName"],
      key: "requestedBy",
    },
    {
      title: "Quantity",
      dataIndex: ["medicalInfo", "requestQuantity"],
      key: "quantity",
      render: (quantity) => (
        <Badge
          count={quantity}
          style={{
            backgroundColor:
              quantity > 7 ? "#f5222d" : quantity > 4 ? "#faad14" : "#1890ff",
            padding: "0 10px",
            fontSize: "12px",
          }}
        />
      ),
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
            // icon={<EyeOutlined />}
            onClick={() => fetchRequestDetails(record.medicalInfo.requestId)}
            size="middle"
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
              <Button
                style={{backgroundColor: "#355383", color: "#fff"}}
                onClick={applyFilters}
              >
                Search
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
              title="Request Information"
              bordered
              column={1}
              style={{marginBottom: 24}}
            >
              <Descriptions.Item label="Item Name">
                {selectedRequest.medicalInfo.itemName}
              </Descriptions.Item>
              <Descriptions.Item label="Quantity Requested">
                <Badge
                  count={selectedRequest.medicalInfo.requestQuantity}
                  style={{
                    backgroundColor:
                      selectedRequest.medicalInfo.requestQuantity > 7
                        ? "#f5222d"
                        : selectedRequest.medicalInfo.requestQuantity > 4
                        ? "#faad14"
                        : "#1890ff",
                    padding: "0 10px",
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
                    {nurseProfile?.fullName ||
                      selectedRequest.nurseInfo.fullName}
                  </Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                {nurseProfile?.phoneNumber || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {nurseProfile?.emailAddress || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                {nurseProfile?.address || "N/A"}
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
