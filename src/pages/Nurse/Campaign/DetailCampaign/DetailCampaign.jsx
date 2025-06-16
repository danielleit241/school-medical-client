import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../api/axios';
import { Button, Table, Tag, Spin, Input } from "antd";
import RecordFormModal from './RecordFormModal';
import ObservationModal from "./ObservationModal";


const DetailCampaign = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const staffNurseId = useSelector((state) => state.user?.userId);
  const roundId = location.state?.roundId || localStorage.getItem("roundId");
  console.log("DetailCampaign - staffNurseId:", staffNurseId);
  console.log("DetailCampaign - roundId:", roundId);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalType, setModalType] = useState(""); // "record" | "observation"
  const [searchText, setSearchText] = useState("");

  // Lấy danh sách student
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const params = {
          PageSize: 10,
          PageIndex: 1,
        };
        if (searchText) params.Search = searchText;

        const res = await axiosInstance.get(
          `/api/nurses/${staffNurseId}/vaccination-rounds`,
          { params }
        );
        // Đảm bảo students luôn là mảng
        setStudents(Array.isArray(res.data.items) ? res.data.items : []);
        console.log("Fetched students:", res.data);
      } catch {
        setStudents([]);
      }
      setLoading(false);
    };
    fetchStudents();
  }, [staffNurseId, roundId, searchText]);

 
  const getStatus = (student) => {
    if (!student.vaccinationResultId) return "not_recorded";
    if (!student.observationDone) return "recorded";
    return "done";
  };


  const openRecordModal = (student) => {
    setSelectedStudent(student);
    setModalType("record");
  };

  const openObservationModal = (student) => {
    setSelectedStudent(student);
    setModalType("observation");
  };

  
  const handleModalOk = () => {
    setModalType("");
    setSelectedStudent(null);
   
  };

  const columns = [
    { title: "Student Name", dataIndex: "studentName" },
    {
      title: "Status",
      render: (_, student) => {
        const status = getStatus(student);2
        if (status === "not_recorded") return <Tag color="red">Chưa ghi nhận</Tag>;
        if (status === "recorded") return <Tag color="blue">Đã ghi nhận</Tag>;
        return <Tag color="green">Hoàn thành</Tag>;
      },
    },
    {
      title: "Action",
      render: (_, student) => {
        const status = getStatus(student);
        if (status === "not_recorded")
          return (
            <Button type="primary" onClick={() => openRecordModal(student)}>
              Record Form
            </Button>
          );
        if (status === "recorded")
          return (
            <Button type="primary" onClick={() => openObservationModal(student)}>
              Observation
            </Button>
          );
        return <Tag color="green">Done</Tag>;
      },
    },
  ];

  return (
    <div>
      <Input.Search
        placeholder="Search by campaign name"
        allowClear
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onSearch={() => {
          setSearchText(1);
          // Gọi lại hàm fetchRounds hoặc set trigger để useEffect chạy lại
        }}
        style={{ width: 300, marginBottom: 24 }}
      />

      {loading ? (
        <Spin />
      ) : (
        <Table
          rowKey="studentId"
          columns={columns}
          dataSource={Array.isArray(students) ? students : []}
          loading={loading}
          pagination={false}
        />
      )}

      <RecordFormModal
        open={modalType === "record"}
        student={selectedStudent}
        onOk={handleModalOk}
        onCancel={() => setModalType("")}
      />

      <ObservationModal
        open={modalType === "observation"}
        student={selectedStudent}
        onOk={handleModalOk}
        onCancel={() => setModalType("")}
      />
      <Button
        type="default"
        onClick={() => navigate("/nurse/campaign/campaign-list")}
        style={{ marginBottom: 16 }}
      >
        Back
      </Button>
    </div>
  );
};

export default DetailCampaign