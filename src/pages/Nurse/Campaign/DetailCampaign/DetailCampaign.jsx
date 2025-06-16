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
          `/api/nurses/${staffNurseId}/vaccination-rounds/${roundId}/students`,
          { params }
        );
        
        const mappedStudents = (Array.isArray(res.data.items) ? res.data.items : []).map(item => ({
          studentCode: item.studentsOfRoundResponse.studentCode,
          studentName: item.studentsOfRoundResponse.fullName,
          grade: item.studentsOfRoundResponse.grade,
          gender: item.studentsOfRoundResponse.gender,
          dateOfBirth: item.studentsOfRoundResponse.dayOfBirth,
          parentPhoneNumber: item.parentsOfStudent.phoneNumber,
          ...item,
        }));
        setStudents(mappedStudents);
        console.log("Fetched students:", res.data);
        console.log("Fetched students:", mappedStudents);
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
    { title: "Student Code", dataIndex: "studentCode" },
    { title: "Student Name", dataIndex: "studentName" },
    { title: "Grade", dataIndex: "grade" },
    { title: "Gender", dataIndex: "gender" },
    { title: "Date of Birth", dataIndex: "dateOfBirth" },
    { title: "Parent Phone", dataIndex: "parentPhoneNumber" },
    {
      title: "Status",
      render: (_, student) => {
        const status = getStatus(student);
        if (status === "not_recorded") return <Tag color="red">Not Yet</Tag>;
        if (status === "recorded") return <Tag color="blue">Observating</Tag>;
        return <Tag color="green">Completed</Tag>;
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
          setLoading(true);
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
        student={roundId}
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