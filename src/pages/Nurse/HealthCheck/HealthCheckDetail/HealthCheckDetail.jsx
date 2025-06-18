import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../../../api/axios";
import { Button, Table, Tag, Spin, Input, message } from "antd";
import RecordFormModal from "./RecordFormModal";
import DetailModal from "./DetailModal";
import Swal from "sweetalert2";
import dayjs from "dayjs";

const HealthCheckDetail = () => {
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
  const [loadingMap] = useState({});
  const [status, setStatus] = useState(false); // trạng thái round
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {
        PageSize: 10,
        PageIndex: 1,
      };
      if (searchText) params.Search = searchText;

      const res = await axiosInstance.get(
        `/api/nurses/${staffNurseId}/health-check-rounds/${roundId}/students`,
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
        parentPhoneNumber: item.parentOfStudent.phoneNumber,
        healthCheckResultId: item.studentsOfRoundResponse.healthCheckResultId,
        ...item,
      }));

      setStudents(mappedStudents);
      console.log("Fetched students:", mappedStudents);
      console.log("Round ID:", res.data);
    } catch {
      setStudents([]);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchStudents();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundId, searchText, staffNurseId]);
  useEffect(() => {
    const fetchRound = async () => {
      try {
        const res = await axiosInstance.get(`/api/health-check-rounds/${roundId}`);
        setStatus(res.data.healthCheckRoundInformation.status);
        setSelectedRound(res.data.healthCheckRoundInformation);
        setDateRange({
          start: res.data.healthCheckRoundInformation.startTime,
          end: res.data.healthCheckRoundInformation.endTime,
        });
        console.log("Fetched round information:", res.data.healthCheckRoundInformation.startTime);
      } catch {
        setStatus(false);
        setSelectedRound(null);
        setDateRange({ start: null, end: null });
      }
    };
    fetchRound();
  }, [roundId, staffNurseId]);

  const checkHealthCheckResult = async (student) => {
    if (!student.healthCheckResultId) return "not_recorded";
    try {
      const res = await axiosInstance.get(
        `/api/health-check-results/${student.healthCheckResultId}`
      );
      console.log("Health check result response:", res.data.datePerformed);
      if (!res.data.datePerformed) {
        return "not_recorded";
      }
      return "done";

    } catch (error) {
      console.error("Error checking health check result:", error);
      return "not_recorded";
    }
  }
  useEffect(() => {
      const fetchStatuses = async () => {
        const newStatusMap = {};
        for (const student of students) {
          const status = await checkHealthCheckResult(student);
          newStatusMap[student.healthCheckResultId] = status;
        }
        setStatusMap(newStatusMap);
      };
      fetchStatuses();
    }, [students]);

  const getStatus = (student) => {
    const status = statusMap[student.healthCheckResultId];
    if (status === "not_recorded") return "not_recorded";
    if (status === "done") return "done";
  };

  const openRecordModal = (student) => {
    setSelectedStudent(student);
    setModalType("record");
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
      const res = await axiosInstance.put(`/api/health-check-rounds/${roundId}/finished`, true);
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

  // Thêm hàm kiểm tra ngày hiện tại có nằm trong khoảng cho phép không
  const isOutOfRange = (() => {
    if (!dateRange.start || !dateRange.end) return false;
    const now = dayjs().startOf("day");
    return now.isBefore(dayjs(dateRange.start).startOf("day")) || now.isAfter(dayjs(dateRange.end).endOf("day"));
  })();

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
          return <Tag color="green">Completed</Tag>;
        },
      },
      {
        title: "Action",
        render: (_, student) => {
          const id = student.healthCheckResultId;
          const loading = loadingMap[id];
          const status = getStatus(student);

          if (status === "not_recorded") {
            return (
              <Button
                type="primary"
                onClick={() => openRecordModal(student)}
                disabled={loading || isOutOfRange}
              >
                Record Form
              </Button>
            );
          }

          if (status === "done") {
            return (
              <Button type="primary" onClick={() => openDetailModal(student)} disabled={loading}>
                Detail
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
            disabled={isOutOfRange}
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

      {isOutOfRange && (
        <div style={{ color: "#eab308", fontWeight: 600, marginBottom: 16 }}>
          It's not allowed at this time. Please check the round date range.
        </div>
      )}

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
        isOutOfRange={isOutOfRange}
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

export default HealthCheckDetail;
