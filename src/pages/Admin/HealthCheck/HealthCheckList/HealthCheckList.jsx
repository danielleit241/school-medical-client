import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import axiosInstance from "../../../../api/axios";
import {Card, Table, Tag, Button, Spin} from "antd"; // Thiếu import này

const HealthCheckList = () => {
  const roleName = useSelector((state) => state.user?.role);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const columns = [
    {
      title: "Title",
      dataIndex: ["healthCheckScheduleResponseDto", "title"],
      key: "title",
    },
    {
      title: "Description",
      dataIndex: ["healthCheckScheduleResponseDto", "description"],
      key: "description",
    },
    {
      title: "Start Date",
      dataIndex: ["healthCheckScheduleResponseDto", "startDate"],
      key: "startDate",
    },
    {
      title: "End Date",
      dataIndex: ["healthCheckScheduleResponseDto", "endDate"],
      key: "endDate",
    },
    {
      title: "Parent Notification Start",
      dataIndex: [
        "healthCheckScheduleResponseDto",
        "parentNotificationStartDate",
      ],
      key: "parentNotificationStartDate",
    },
    {
      title: "Parent Notification End",
      dataIndex: [
        "healthCheckScheduleResponseDto",
        "parentNotificationEndDate",
      ],
      key: "parentNotificationEndDate",
    },
    {
      title: "Status",
      dataIndex: ["healthCheckScheduleResponseDto", "status"],
      key: "status",
      render: (status) =>
        status ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Inactive</Tag>
        ),
    },
    {
      title: "Created At",
      dataIndex: ["healthCheckScheduleResponseDto", "createdAt"],
      key: "createdAt",
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Button
          type="primary"
          onClick={() => {
            localStorage.setItem(
              "healthCheckScheduleId",
              record.healthCheckScheduleResponseDto.scheduleId
            );
            navigate(`/${roleName}/health-check/details`);
          }}
        >
          Detail
        </Button>
      ),
    },
  ];

  const fetchData = () => {
    setLoading(true);
    axiosInstance
      .get("/api/health-checks/schedules")
      .then((res) => {
        // Sắp xếp dữ liệu theo createdAt (mới nhất lên đầu)
        const sortedData = [...(res.data?.items || [])].sort((a, b) => {
          const dateA = new Date(a.healthCheckScheduleResponseDto.createdAt);
          const dateB = new Date(b.healthCheckScheduleResponseDto.createdAt);
          return dateB - dateA; // Sắp xếp giảm dần (mới nhất lên đầu)
        });

        setData(sortedData);
        setPagination({
          current: res.data?.pageIndex || 1,
          pageSize: res.data?.pageSize || 10,
          total: res.data?.count || 0,
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTableChange = (pagination) => {
    fetchData(pagination.current, pagination.pageSize);
  };

  return (
    <Card title="Health Check Campaign List" style={{margin: 24}}>
      {loading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={data}
          rowKey={(record) => record.healthCheckScheduleResponseDto.scheduleId}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
          }}
          onChange={handleTableChange}
        />
      )}
    </Card>
  );
};

export default HealthCheckList;
