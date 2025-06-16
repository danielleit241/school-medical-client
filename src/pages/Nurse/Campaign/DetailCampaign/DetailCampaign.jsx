import React, { useState, useEffect} from 'react'
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../api/axios';
import { Button, Table, Tag, Spin, Input } from "antd";
import RecordFormModal from './RecordFormModal';
import ObservationModal from "./ObservationModal";
import DetailModal from "./DetailModal";
import Swal from "sweetalert2";


const DetailCampaign = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const staffNurseId = useSelector((state) => state.user?.userId);
  const roundId = location.state?.roundId || localStorage.getItem("roundId");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalType, setModalType] = useState(""); 
  const [searchText, setSearchText] = useState("");
  const [statusMap, setStatusMap] = useState({});
  const [selectedRound, setSelectedRound] = useState(null);
  const [result, setResult] = useState(null);
  // Lấy danh sách student
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
          vaccinationResultId: item.studentsOfRoundResponse.vaccinationResultId,
          ...item,
        }));
        
        setStudents(mappedStudents);
        console.log("Fetched students:", mappedStudents);
      } catch {
        setStudents([]);
      }
      setLoading(false);
    };

    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy thông tin chiến dịch (round)
        const campaignRes = await axiosInstance.get(`/api/vaccination-rounds/${roundId}`);
        setSelectedRound(campaignRes.data);
      } catch {
        setSelectedRound(null);
      }
      setLoading(false);
    };

  useEffect(() => {
    fetchData();
    fetchStudents();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffNurseId, roundId, searchText]);

  const checkVaccinationResult = async (student) => {
    if (!student.vaccinationResultId) return "not_recorded";
    
    try {
      const res = await axiosInstance.get(`/api/vaccination-results/${student.vaccinationResultId}`);
      const result = res.data;
      setResult(result);
      for (const key in result) {
        if (result[key] === null && key !== "observation") {
          return "not_recorded";
        } else if ( result[key] === null) {
          return "recorded";
        }
      }
      return "done";
    } catch {
      return "not_recorded";
    }
  };
  
  useEffect(() => {
    checkVaccinationResult();
  }, [students]);

  useEffect(() => {
    const fetchStatuses = async () => {
      const newStatusMap = {};
      for (const student of students) {
        const status = await checkVaccinationResult(student);
        newStatusMap[student.vaccinationResultId] = status;
      }
      setStatusMap(newStatusMap);
    };
    fetchStatuses();
  }, [students]);

  const getStatus = (student) => {
    const status = statusMap[student.vaccinationResultId];
    if (status === "not_recorded") return "not_recorded";
    if (status === "recorded") return "recorded";
    if (status === "done") return "done";
  };


  const openRecordModal = (student) => {
    setSelectedStudent(student);
    setModalType("record");
  };

  const openObservationModal = (student) => {
    setSelectedStudent(student);
    setModalType("observation");
  };
  const openDetailModal = (student) => {
    setSelectedStudent(student);
    setModalType("detail");
  };
 
  const handleModalOk = () => {
    setModalType("");
    setSelectedStudent(null);
    Swal.fire({
      icon: "success",
      title: "Saved!",
      text: "Save successfully!",
      timer: 1500,
      showConfirmButton: false,
    });
    // Nếu muốn reload lại danh sách sau khi lưu:
    checkVaccinationResult(selectedStudent);
    fetchStudents();
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
        if (status === "done")
          return (
            <Button type="primary" onClick={() => openDetailModal(student)}>
              Detail
            </Button>
          );
        return null;
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
        student={selectedStudent}
        onOk={handleModalOk}
        round={selectedRound}
        onCancel={() => setModalType("")}
      />

      <ObservationModal
        open={modalType === "observation"}
        student={selectedStudent}
        onOk={handleModalOk}
        result={result}
        onCancel={() => setModalType("")}
      />
      <DetailModal
        open={modalType === "detail"}
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