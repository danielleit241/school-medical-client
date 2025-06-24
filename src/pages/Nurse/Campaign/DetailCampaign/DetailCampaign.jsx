import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../../../api/axios";
import { Button, Table, Tag, Spin, Input, Select } from "antd";
import RecordFormModal from "./RecordFormModal";
import ObservationModal from "./ObservationModal";
import DetailModal from "./DetailModal";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import {
  CheckCircleTwoTone,
  ClockCircleTwoTone,
  CalendarTwoTone,
  CloseCircleTwoTone,
  StopTwoTone,
  ExclamationCircleTwoTone,
} from "@ant-design/icons";


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
  const [completedCount, setCompletedCount] = useState(0);

  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [statusFilter, setStatusFilter] = useState("all");

  const statusOptions = [
    { value: "all", label: "All status" },
    { value: "done", label: "Completed" },
    { value: "recorded", label: "Observation" },
    { value: "cancel", label: "Does not meet the requirements" },
    { value: "not_recorded", label: "Not Yet" },
  ];

  useEffect(() => {
  const fetchCompletedCount = async () => {
    try {
      const res = await axiosInstance.get(
        `/api/v2/nurses/${staffNurseId}/vaccination-rounds/${roundId}/students`
      );
      // Đếm số lượng student có status "done" hoặc "cancel"
      const studentsArr = Array.isArray(res.data) ? res.data : [];
      let count = 0;
      for (const item of studentsArr) {
        const status = statusMap[item.studentsOfRoundResponse?.vaccinationResultId];
        if (status === "done" || status === "cancel") count++;
      }
      setCompletedCount(count);
    } catch {
      setCompletedCount(0);
    }
  };
  if (staffNurseId && roundId && Object.keys(statusMap).length > 0) {
    fetchCompletedCount();
  }
}, [staffNurseId, roundId, statusMap]);

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

  useEffect(() => {
    const fetchRound = async () => {
      try {
        const res = await axiosInstance.get(`/api/vaccination-rounds/${roundId}`);
        setStatus(res.data.vaccinationRoundInformation.status);
        setDateRange({
          start: res.data.vaccinationRoundInformation.startTime,
          end: res.data.vaccinationRoundInformation.endTime,
        });
        console.log("Fetched round status:", res.data.vaccinationRoundInformation.startTime);
      } catch {
        setStatus(false);
        setDateRange({ start: null, end: null })
      }
    };
    fetchRound();
  }, [roundId]);

  const isOutOfRange = (() => {
    if (!dateRange.start || !dateRange.end) return false;
    const now = dayjs().startOf("day");
    return now.isBefore(dayjs(dateRange.start).startOf("day")) || now.isAfter(dayjs(dateRange.end).endOf("day"));
  })();

  const fetchData = async () => {
    setLoading(true);
    try {
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
      const qualifiedRes = await axiosInstance.get(`/api/vaccination-results/${student.vaccinationResultId}/health-qualified`);
      const qualified =
        typeof qualifiedRes.data === "boolean"
          ? qualifiedRes.data
          : qualifiedRes.data?.qualified;
      if (qualified === false) return "cancel";
      const res = await axiosInstance.get(`/api/vaccination-results/${student.vaccinationResultId}`);
      const result = res.data;
      console.log("Vaccination result:", result);
      const hasNullInResultResponse =
        result.resultResponse &&
        typeof result.resultResponse === "object" &&
        Object.values(result.resultResponse).some(val => val == null);

      if (hasNullInResultResponse && !result.vaccinationObservation) {
        return "not_recorded";
      }
      if (!result.vaccinationObservation) {
        return "recorded";
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

  const percent = students.length > 0 ? Math.round((completedCount / students.length) * 100) : 0;

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


  // Thống kê số lượng theo trạng thái
  const statusSummary = students.reduce(
    (acc, student) => {
      const status = getStatus(student);
      if (status === "done") acc.done += 1;
      else if (status === "not_recorded") acc.notYet += 1;
      else if (status === "recorded") acc.observating += 1;
      else if (status === "cancel") acc.cancel += 1;
      return acc;
    },
    { done: 0, notYet: 0, observating: 0, cancel: 0 }
  );


  const statusTag = (status) => {
    switch (status) {
      case "done":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <CheckCircleTwoTone
              twoToneColor="#22c55e"
              style={{
                background: "#fff",
                borderRadius: "50%",
                fontSize: 18,
                padding: 2,
                marginRight: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
            <span
              style={{
                background: "#bbf7d0",
                color: "#16a34a",
                borderRadius: 8,
                padding: "2px 12px",
                fontWeight: 600,
                fontSize: 15,
                display: "inline-block",
                minWidth: 90,
                textAlign: "center",
              }}
            >
              Completed
            </span>
          </span>
        );
      case "not_recorded":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <ExclamationCircleTwoTone
              twoToneColor="#eab308"
              style={{
                background: "#fff",
                borderRadius: "50%",
                fontSize: 18,
                padding: 2,
                marginRight: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
            <span
              style={{
                background: "#fef9c3",
                color: "#eab308",
                borderRadius: 8,
                padding: "2px 12px",
                fontWeight: 600,
                fontSize: 15,
                display: "inline-block",
                minWidth: 90,
                textAlign: "center",
              }}
            >
              Not Yet
            </span>
          </span>
        );
      case "cancel":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <CloseCircleTwoTone
              twoToneColor="#ef4444"
              style={{
                background: "#fff",
                borderRadius: "50%",
                fontSize: 18,
                padding: 2,
                marginRight: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
            <span
              style={{
                background: "#fecaca",
                color: "#dc2626",
                borderRadius: 8,
                padding: "2px 12px",
                fontWeight: 600,
                fontSize: 15,
                display: "inline-block",
                minWidth: 170,
                textAlign: "center",
              }}
            >
              Does not meet the requirements
            </span>
          </span>
        );
      case "recorded":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <CalendarTwoTone
              twoToneColor="#2563eb"
              style={{
                background: "#fff",
                borderRadius: "50%",
                fontSize: 18,
                padding: 2,
                marginRight: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
            <span
              style={{
                background: "#dbeafe",
                color: "#2563eb",
                borderRadius: 8,
                padding: "2px 12px",
                fontWeight: 600,
                fontSize: 15,
                display: "inline-block",
                minWidth: 90,
                textAlign: "center",
              }}
            >
              Observating
            </span>
          </span>
        );
      default:
        return null;
    }
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
        return statusTag(status);
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
            <Button type="primary" onClick={() => openRecordModal(student)} disabled={loading || isOutOfRange }>
              Record Form
            </Button>
          );
        }

        if ( status === "recorded") {
          return (
            <Button type="primary" onClick={() => openObservationModal(student)} disabled={loading || isOutOfRange}>
              Observation
            </Button>
          );
        }

        if ( status === "done") {
          return (
            <Button type="primary" onClick={() => openDetailModal(student)} disabled={loading || isOutOfRange}>
              Detail
            </Button>
          );
        }

        // Trường hợp qualified === true && status === "not_recorded"
        if (qualified === true && status === "not_recorded") {
          return (
            <Button type="primary" onClick={() => openRecordModal(student)} disabled={loading || isOutOfRange}>
              Record Form
            </Button>
          );
        }

        return null;
      },
    },
  ];

  const filteredStudents = Array.isArray(students)
    ? students.filter((student) => {
        const status = getStatus(student);
        if (statusFilter === "all") return true;
        return status === statusFilter;
      })
    : [];

  return (
    <div>
      {/* Summary Cards */}
      <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
        <div style={{
          flex: 1,
          background: "#f6ffed",
          border: "1px solid #b7eb8f",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          alignItems: "center",
          gap: 12
        }}>
          <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 32 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 22 }}>{statusSummary.done}</div>
            <div style={{ color: "#389e0d", fontWeight: 500 }}>Completed</div>
          </div>
        </div>
        <div style={{
          flex: 1,
          background: "#fffbe6",
          border: "1px solid #ffe58f",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          alignItems: "center",
          gap: 12
        }}>
          <ClockCircleTwoTone twoToneColor="#faad14" style={{ fontSize: 32 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 22 }}>{statusSummary.notYet}</div>
            <div style={{ color: "#d48806", fontWeight: 500 }}>Not Yet</div>
          </div>
        </div>
        <div style={{
          flex: 1,
          background: "#e6f4ff",
          border: "1px solid #91d5ff",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          alignItems: "center",
          gap: 12
        }}>
          <CalendarTwoTone twoToneColor="#1677ff" style={{ fontSize: 32 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 22 }}>{statusSummary.observating}</div>
            <div style={{ color: "#1677ff", fontWeight: 500 }}>Observating</div>
          </div>
        </div>
        <div style={{
          flex: 1,
          background: "#fff1f0",
          border: "1px solid #ffa39e",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          alignItems: "center",
          gap: 12
        }}>
          <StopTwoTone twoToneColor="#ff4d4f" style={{ fontSize: 32 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 22 }}>{statusSummary.cancel}</div>
            <div style={{ color: "#cf1322", fontWeight: 500 }}>Does not meet the requirements</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <Input.Search
          placeholder="Search students"
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 320, marginRight: 8 }}
        />
        <Select
          value={statusFilter}
          options={statusOptions}
          style={{ width: 220 }}
          onChange={setStatusFilter}
        />
        {/* Bỏ nút Complete, thay bằng thông báo */}
        {!status && percent === 100 && (
          <span
            style={{
              color: "#2563eb",
              fontWeight: 600,
              fontSize: 16,
              background: "#e0e7ff",
              borderRadius: 8,
              padding: "6px 18px"
            }}
          >
            Please go back to completed round
          </span>
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
          rowKey="studentCode"
          columns={columns}
          dataSource={filteredStudents}
          loading={loading}
          pagination={false}
          bordered
          style={{ background: "#fff", borderRadius: 12 }}
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