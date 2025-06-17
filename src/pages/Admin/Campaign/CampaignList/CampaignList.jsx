import React, {useEffect, useState} from "react";
import axiosInstance from "../../../../api/axios";
import {Card, Table, Tag, Spin, Button} from "antd";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";

const CampaignList = () => {
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
      dataIndex: ["vaccinationScheduleResponseDto", "title"],
      key: "title",
    },
    {
      title: "Description",
      dataIndex: ["vaccinationScheduleResponseDto", "description"],
      key: "description",
    },
    {
      title: "Start Date",
      dataIndex: ["vaccinationScheduleResponseDto", "startDate"],
      key: "startDate",
    },
    {
      title: "End Date",
      dataIndex: ["vaccinationScheduleResponseDto", "endDate"],
      key: "endDate",
    },
    {
      title: "Parent Notification Start",
      dataIndex: [
        "vaccinationScheduleResponseDto",
        "parentNotificationStartDate",
      ],
      key: "parentNotificationStartDate",
    },
    {
      title: "Parent Notification End",
      dataIndex: [
        "vaccinationScheduleResponseDto",
        "parentNotificationEndDate",
      ],
      key: "parentNotificationEndDate",
    },
    {
      title: "Status",
      dataIndex: ["vaccinationScheduleResponseDto", "status"],
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
      dataIndex: ["vaccinationScheduleResponseDto", "createdAt"],
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
              "vaccinationScheduleId",
              record.vaccinationScheduleResponseDto.scheduleId
            );
            navigate(`/${roleName}/campaign/vaccine-schedule-details/`);
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
      .get("/api/vaccinations/schedules")
      .then((res) => {
        // Sắp xếp dữ liệu theo createdAt (mới nhất lên đầu)
        const sortedData = [...(res.data?.items || [])].sort((a, b) => {
          const dateA = new Date(a.vaccinationScheduleResponseDto.createdAt);
          const dateB = new Date(b.vaccinationScheduleResponseDto.createdAt);
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
    <Card title="Vaccination Campaign List" style={{margin: 24}}>
      {loading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={data}
          rowKey={(record) => record.vaccinationScheduleResponseDto.scheduleId}
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

export default CampaignList;
