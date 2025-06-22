import React, {useEffect, useState} from "react";
import axiosInstance from "../../../../api/axios";
import {Card, Table, Tag, Spin, Button} from "antd";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import EditVaccineCampaignModal from "./EditVaccineCampaignModal"; 
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);


const CampaignList = () => {
  const roleName = useSelector((state) => state.user?.role);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false); // Thêm state này
  const [editCampaign, setEditCampaign] = useState(null); // Thay cho editScheduleId
  const [schedule, setSchedule] = useState({});
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
      render: (text, record) => {
        const startDate = dayjs(record.vaccinationScheduleResponseDto.startDate);
        const endDate = dayjs(record.vaccinationScheduleResponseDto.endDate);
        const now = dayjs();

        
        const isInRange =
          now.isSameOrAfter(startDate, "day") && now.isSameOrBefore(endDate, "day");

        return (
          <>
            <Button
              type="primary"
              onClick={() => {
                localStorage.setItem(
                  "vaccinationScheduleId",
                  record.vaccinationScheduleResponseDto.scheduleId
                );
                navigate(`/${roleName}/campaign/vaccine-schedule-details/`);
              }}
              style={{ marginRight: 8 }}
            >
              Detail
            </Button>
            <Button
              type="default"
              disabled={isInRange}
              onClick={() => {
                // Tìm campaign đã map theo scheduleId
                const found = schedule.find(
                  (item) =>
                    item.vaccinationScheduleResponseDto.scheduleId ===
                    record.vaccinationScheduleResponseDto.scheduleId
                );
                setEditCampaign(found);
                setEditModalOpen(true);
              }}
            >
              Edit
            </Button>
          </>
        );
      },
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
        const mapSchedule = (Array.isArray(res.data?.items) 
          ? res.data.items 
          : []).map((item) => ({
            vaccineId: item.vaccinationScheduleResponseDto.vaccineId,
            title: item.vaccinationScheduleResponseDto.title,
            description: item.vaccinationScheduleResponseDto.description,
            startDate: item.vaccinationScheduleResponseDto.startDate,
            endDate: item.vaccinationScheduleResponseDto.endDate,
            scheduleId: item.vaccinationScheduleResponseDto.scheduleId,
            createdBy: item.vaccinationScheduleResponseDto.createdBy,
            ...item,
          }));
        setSchedule(mapSchedule);
        console.log("Fetched Campaign Data:", mapSchedule);

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

  // Hàm đóng modal và reload lại danh sách nếu cần
  const handleEditModalClose = (reload = false) => {
    setEditModalOpen(false);
    setEditCampaign(null);
    if (reload) fetchData();
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
      {/* Modal Edit */}
      <EditVaccineCampaignModal
        open={editModalOpen}
        campaign={editCampaign}
        onClose={handleEditModalClose}
      />
    </Card>
  );
};

export default CampaignList;
