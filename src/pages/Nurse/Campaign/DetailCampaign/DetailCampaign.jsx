import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../../../api/axios";
import { Button, Table, Tag, Spin, Input, message } from "antd";
import RecordFormModal from "./RecordFormModal";
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
  const [qualifiedMap] = useState({});
  const [loadingMap] = useState({});
  const [status, setStatus] = useState(false); // trạng thái round
  const [loadingComplete, setLoadingComplete] = useState(false);

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

      const mappedStudents = (Array.isArray(res.data.items)
        ? res.data.items
        : []
      ).map((item) => ({
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

  // Khi load round, lấy status
  useEffect(() => {
    const fetchRound = async () => {
      try {
        const res = await axiosInstance.get(`/api/vaccination-rounds/${roundId}`);
        setStatus(res.data.vaccinationRoundInformation.status);
        console.log("Fetched round status:", res.data.vaccinationRoundInformation.status);
      } catch {
        setStatus(false);
      }
    };
    fetchRound();
  }, [roundId]);

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
      // Kiểm tra qualified
      const qualifiedRes = await axiosInstance.get(`/api/vaccination-results/${student.vaccinationResultId}/health-quilified`);
      const qualified =
        typeof qualifiedRes.data === "boolean"
          ? qualifiedRes.data
          : qualifiedRes.data?.qualified;
      if (qualified === false) return "cancel";
      const res = await axiosInstance.get(`/api/vaccination-results/${student.vaccinationResultId}`);
      const result = res.data;
      for (const key in result) {
        if (result[key] === null && key !== "observation") {
          return "not_recorded";
        } else if (result[key] === null) {
          return "recorded";
        }
      }
      return "done";
    } catch {
      return "not_recorded";
    }
  };

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
    if (status === "cancel") return "cancel";
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
    fetchStudents();
    Swal.fire({
      title: "Success",
      text: "Completed successfully!",
      icon: "success",
      confirmButtonText: "OK",
    });
  };

  const handleComplete = async () => {
    setLoadingComplete(true);
    try {
      const res = await axiosInstance.put(`/api/vaccination-rounds/${roundId}/finished`, true);  
      setStatus(res.data);
      console.log("Round completed successfully!", res.data);
      Swal.fire({
        title: "Success",
        text: "Round completed successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch {
      message.error("Failed to complete round!");
    }
    setLoadingComplete(false);
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
        if (status === "cancel") return <Tag color="orange"><i>Does not meet the requirements</i></Tag>;
        return <Tag color="green">Completed</Tag>;
      },
    },
    {
      title: "Action",
      render: (_, student) => {
        const id = student.vaccinationResultId;
        const qualified = qualifiedMap[id];
        const loading = loadingMap[id];
        const status = getStatus(student);

        if (qualified === false) {
          return <i style={{ color: "#faad14" }}>Does not meet the requirements</i>;
        }

        if ((qualified === null || qualified === undefined) && status === "not_recorded") {
          return (
            <Button type="primary" onClick={() => openRecordModal(student)} disabled={loading}>
              Record Form
            </Button>
          );
        }

        if ( status === "recorded") {
          return (
            <Button type="primary" onClick={() => openObservationModal(student)} disabled={loading}>
              Observation
            </Button>
          );
        }

        if ( status === "done") {
          return (
            <Button type="primary" onClick={() => openDetailModal(student)} disabled={loading}>
              Detail
            </Button>
          );
        }

        // Trường hợp qualified === true && status === "not_recorded"
        if (qualified === true && status === "not_recorded") {
          return (
            <Button type="primary" onClick={() => openRecordModal(student)} disabled={loading}>
              Record Form
            </Button>
          );
        }

        return null;
      },
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <Input.Search
          placeholder="Search students"
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 320, marginRight: 8 }}
        />
        {!status && (
          <Button
            type="primary"
            onClick={handleComplete}
            loading={loadingComplete}
            style={{ borderRadius: 8, fontWeight: 600 }}
          >
            Complete
          </Button>
        )}
        {status && (
          <Tag color="green" style={{ fontSize: 16, fontWeight: 600, borderRadius: 8 }}>
            Round Completed
          </Tag>
        )}
      </div>

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
        onReload={fetchStudents}
      />

      <ObservationModal
        open={modalType === "observation"}
        student={selectedStudent}
        onOk={handleModalOk}
        onCancel={() => setModalType("")}
      />
      <DetailModal
        open={modalType === "detail"}
        student={selectedStudent}
        onOk={handleModalOk}
        onCancel={() => {
          setModalType("");
        }}
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

export default DetailCampaign;