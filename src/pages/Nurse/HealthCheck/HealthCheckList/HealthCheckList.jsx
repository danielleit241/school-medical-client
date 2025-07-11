import React, {useEffect, useState} from "react";
import {
  Button,
  Input,
  Pagination,
  Empty,
  Spin,
  Row,
  Col,
  Tag,
  Typography,
  Progress,
} from "antd";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import {CalendarOutlined, TeamOutlined} from "@ant-design/icons";
import axiosInstance from "../../../../api/axios";
import dayjs from "dayjs";
import Swal from "sweetalert2";

const HealthCheckList = () => {
  const staffNurseId = useSelector((state) => state.user?.userId);
  const [rounds, setRounds] = useState([]);
  const [total, setTotal] = useState(0); // total rounds for pagination
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [completedByRound, setCompletedByRound] = useState({});
  const [totalByRound, setTotalByRound] = useState({});
  const [loadingComplete, setLoadingComplete] = useState({});
  const navigate = useNavigate();

  // Fetch rounds (list of health check rounds)
  useEffect(() => {
    if (!staffNurseId) return;

    const fetchRounds = async () => {
      setLoading(true);
      try {
        const params = {
          PageSize: pageSize,
          PageIndex: pageIndex,
        };
        if (search) params.Search = search;
        const res = await axiosInstance.get(
          `/api/nurses/${staffNurseId}/health-check-rounds`,
          {params}
        );
        const mappedRounds = (res.data.items || []).map(
          (item) => item.healthCheckRoundInformation
        );
        setRounds(mappedRounds);
        setTotal(res.data.totalCount || mappedRounds.length);
      } catch (error) {
        console.error("Error fetching health check rounds:", error);
        setRounds([]);
        setTotal(0);
      }
      setLoading(false);
    };

    fetchRounds();
  }, [staffNurseId, pageIndex, pageSize, search]);

  const handleComplete = async (roundId) => {
    setLoadingComplete((prev) => ({...prev, [roundId]: true}));
    try {
      const res = await axiosInstance.put(
        `/api/health-check-rounds/${roundId}/finished`,
        true
      );
      Swal.fire({
        title: "Success",
        text: "Round completed successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
      const {notificationTypeId, senderId, receiverId} = res.data;
      await axiosInstance.post(`/api/notifications/health-checks/rounds/to-admin`, {
        notificationTypeId,
        senderId,
        receiverId,
      });

      setRounds((prev) =>
        prev.map((r) => (r.roundId === roundId ? {...r, status: true} : r))
      );
    } catch {
      console.error("Error completing round:", roundId);
    }
    setLoadingComplete((prev) => ({...prev, [roundId]: false}));
  };

  // Fetch students and completed count for each round
  useEffect(() => {
    if (!staffNurseId || !rounds.length) return;

    const fetchAllRounds = async () => {
      const completedObj = {};
      const totalObj = {};

      await Promise.all(
        rounds.map(async (round) => {
          try {
            // Lấy danh sách students
            const res = await axiosInstance.get(
              `/api/v2/nurses/${staffNurseId}/health-check-rounds/${round.roundId}/students`
            );
            const students = Array.isArray(res.data) ? res.data : [];

            // Lọc bỏ những student chưa được phụ huynh xác nhận
            const filteredStudents = students.filter(
              (student) => student.parentOfStudent?.parentConfirm !== null
            );
            totalObj[round.roundId] = filteredStudents.length;

            let completed = 0;
            await Promise.all(
              filteredStudents.map(async (student) => {
                const healthCheckResultId =
                  student.studentsOfRoundResponse?.healthCheckResultId;
                if (!healthCheckResultId) return;

                try {
                  const resultRes = await axiosInstance.get(
                    `/api/health-check-results/${healthCheckResultId}`
                  );
                  const status = resultRes.data?.status;
                  if (
                    status === true ||
                    status === "Completed" ||
                    status === "Failed"
                  ) {
                    completed += 1;
                  }
                } catch {
                  return;
                }
              })
            );
            completedObj[round.roundId] = completed;
          } catch (err) {
            console.error(
              "Error fetching students for round:",
              round.roundId,
              err
            );
            completedObj[round.roundId] = 0;
            totalObj[round.roundId] = 0;
          }
        })
      );

      setCompletedByRound(completedObj);
      setTotalByRound(totalObj);
    };

    fetchAllRounds();
  }, [staffNurseId, rounds]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          width: "100%",
          maxWidth: "100%",
          boxShadow: "0 8px 32px 0 rgba(53,83,131,0.10)",
          margin: 0,
          borderRadius: 0,
        }}
      >
        {/* Header gradient */}
        <div
          style={{
            width: "100%",
            background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
            padding: "16px 0 8px 0",
            marginBottom: "24px",
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            textAlign: "center",
            borderRadius: "20px 20px 0 0",
          }}
        >
          <h1
            style={{
              fontWeight: 800,
              color: "#fff",
              letterSpacing: 1,
              marginBottom: 4,
              marginTop: 0,
            }}
          >
            Health Check Campaign
          </h1>
          <div
            style={{
              color: "#e0e7ff",
              fontSize: 15,
              fontWeight: 500,
              marginBottom: 0,
            }}
          >
            Manage and view all health check rounds for your school
          </div>
          <div
            style={{marginTop: 12, display: "flex", justifyContent: "center"}}
          >
            <Input.Search
              placeholder="Search health check rounds"
              allowClear
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageIndex(1);
              }}
              style={{
                width: 260,
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 2px 2px #e6f7ff",
                fontSize: 14,
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div
          className="px-0 py-8"
          style={{
            maxHeight: "650px",
            overflowY: "auto",
            padding: "20px 0",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "100%",
              padding: "0 16px",
            }}
          >
            {loading ? (
              <div style={{textAlign: "center", marginTop: 40}}>
                <Spin size="large" />
              </div>
            ) : rounds && rounds.length > 0 ? (
              <div>
                {rounds.map((round) => {
                  const now = dayjs();
                  const startTime = round.startTime
                    ? dayjs(round.startTime)
                    : null;
                  const endTime = round.endTime ? dayjs(round.endTime) : null;

                  let statusLabel = "Unknown";
                  let statusBg = "#ef4444";
                  if (round.status === true) {
                    statusLabel = "Completed";
                    statusBg = "#22c55e";
                  } else if (round.status === false) {
                    if (
                      startTime &&
                      endTime &&
                      (now.isSame(startTime, "day") ||
                        now.isSame(endTime, "day") ||
                        (now.isAfter(startTime, "day") &&
                          now.isBefore(endTime, "day")))
                    ) {
                      statusLabel = "In Progress";
                      statusBg = "#f59e42";
                    } else {
                      statusLabel = "Not Active";
                      statusBg = "#ef4444";
                    }
                  }

                  const completed = completedByRound[round.roundId] ?? 0;
                  const total = totalByRound[round.roundId] ?? 0;
                  const percent =
                    total > 0 ? Math.round((completed / total) * 100) : 0;

                  return (
                    <div
                      key={round.roundId}
                      style={{
                        background: "",
                        borderRadius: 12,
                        boxShadow: "0 4px 16px 0 rgba(53,83,131,0.10)",
                        padding: `20px`,
                        marginBottom: 18,
                        width: "100%",
                        maxWidth: "100%",
                        marginLeft: 0,
                        marginRight: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: 0,
                        transition: "box-shadow 0.2s",
                      }}
                    >
                      {/* Top Row: Title, Status */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginTop: 0,
                          marginBottom: 2,
                        }}
                      >
                        {/* <CalendarOutlined
                          style={{color: "#3058A4", fontSize: 22}}
                        /> */}
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 18,
                            color: "#222",
                            marginLeft: 10,
                          }}
                        >
                          Round: {round.roundName || "No name"}
                        </span>
                        <span
                          style={{
                            background: statusBg,
                            color: "#fff",
                            fontWeight: 600,
                            borderRadius: 999,
                            padding: "2px 12px",
                            fontSize: 12,
                            marginLeft: 6,
                            minWidth: 70,
                            textAlign: "center",
                            display: "inline-block",
                          }}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      {/* Info Row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 36,
                          margin: "10px 0 0 0",
                          flexWrap: "wrap",
                          width: "100%",
                          boxSizing: "border-box",
                          justifyContent: "flex-start",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            color: "#2563eb",
                            fontSize: 14,
                            fontWeight: 600,
                            background: "#f0f7ff",
                            borderRadius: 6,
                            padding: "4px 10px",
                          }}
                        >
                          <CalendarOutlined style={{color: "#3058A4"}} />
                          <span>
                            {round.startTime
                              ? dayjs(round.startTime).format("DD/MM/YYYY")
                              : "N/A"}
                            {" - "}
                            {round.endTime
                              ? dayjs(round.endTime).format("DD/MM/YYYY")
                              : "N/A"}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            color: "#059669",
                            fontSize: 14,
                            fontWeight: 600,
                            background: "#ecfdf5",
                            borderRadius: 6,
                            padding: "4px 10px",
                          }}
                        >
                          <TeamOutlined style={{color: "#059669"}} />
                          <span>{round.location || "School medical room"}</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            color: "#f59e42",
                            fontSize: 14,
                            fontWeight: 600,
                            background: "#fff7ed",
                            borderRadius: 6,
                            padding: "4px 10px",
                          }}
                        >
                          <span style={{fontWeight: 700}}>Grade</span>
                          <span>{round.targetGrade || "N/A"}</span>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div
                        style={{
                          marginTop: 14,
                          marginBottom: 4,
                          width: "100%",
                          boxSizing: "border-box",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <Progress
                            percent={percent}
                            showInfo={false}
                            strokeColor={{
                              "0%": "#22c55e",
                              "50%": "#f59e42",
                              "100%": "#3058A4",
                            }}
                            trailColor="#f3f4f6"
                            style={{flex: 1, height: 12, minWidth: 120}}
                          />
                          <span
                            style={{
                              fontWeight: 500,
                              color: "#222",
                              minWidth: 80,
                              textAlign: "right",
                              fontSize: 13,
                            }}
                          >
                            {completed}/{total} students
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 12,
                            color: "#666",
                            marginTop: 2,
                          }}
                        >
                          <span>Completed: {percent}%</span>
                          <span>Remaining: {total - completed} students</span>
                        </div>
                      </div>
                      <hr
                        style={{
                          border: "none",
                          borderTop: "1px solid #e5e7eb",
                          margin: "12px 0 8px 0",
                          opacity: 0.6,
                        }}
                      />
                      {/* Details Button và Description */}
                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          gap: 8,
                          justifyContent: "space-between", // Thay đổi từ flex-end thành space-between
                          alignItems: "center", // Thêm để căn giữa theo chiều dọc
                          width: "100%",
                          boxSizing: "border-box",
                        }}
                      >
                        {/* Description - bên trái */}
                        <div
                          style={{
                            color: "#666",
                            fontSize: 13,
                            flex: 1, // Cho phép mở rộng
                            marginRight: 16, // Khoảng cách với buttons
                          }}
                        >
                          <span style={{fontWeight: 600}}>Description:</span>{" "}
                          {round.description || (
                            <span style={{color: "#aaa"}}>No description</span>
                          )}
                        </div>

                        {/* Buttons - bên phải */}
                        <div style={{display: "flex", gap: 8, flexShrink: 0}}>
                          <Button
                            type="primary"
                            size="middle"
                            onClick={() =>
                              navigate(`/nurse/health-check/round-campaign`, {
                                state: {
                                  roundId: round.roundId,
                                  roundName: round.roundName,
                                  ...(percent === 100 ? {percent} : {}),
                                },
                              })
                            }
                            style={{
                              borderRadius: 8,
                              fontWeight: 600,
                              fontSize: 13,
                              minWidth: 90,
                              background:
                                "linear-gradient(90deg, #3058A4 0%, #2563eb 100%)",
                              border: "none",
                              boxShadow: "0 2px 8px #3058A433",
                            }}
                          >
                            Details
                          </Button>
                          {!round.status && percent === 100 && (
                            <Button
                              type="primary"
                              loading={loadingComplete[round.roundId]}
                              style={{
                                borderRadius: 8,
                                fontWeight: 600,
                                fontSize: 13,
                                minWidth: 90,
                                background:
                                  "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)",
                                border: "none",
                                boxShadow: "0 2px 8px #22c55e33",
                              }}
                              onClick={() => handleComplete(round.roundId)}
                            >
                              Complete
                            </Button>
                          )}
                          {round.status && (
                            <span
                              style={{
                                marginLeft: 8,
                                color: "#22c55e",
                                fontWeight: 600,
                                fontSize: 13,
                                borderRadius: 8,
                                background: "#bbf7d0",
                                padding: "4px 12px",
                              }}
                            >
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty
                description={
                  <span style={{color: "#888"}}>
                    No health check rounds found.
                  </span>
                }
                style={{marginTop: 40, textAlign: "center"}}
              />
            )}
          </div>
        </div>
        {/* Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginTop: 24,
            marginBottom: 18,
            paddingLeft: 20,
          }}
        >
          <Pagination
            current={pageIndex}
            total={total}
            pageSize={pageSize}
            onChange={(page) => setPageIndex(page)}
            showSizeChanger={false}
            style={{
              borderRadius: 8,
              boxShadow: "0 2px 8px #e6f7ff",
              padding: "8px 16px",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HealthCheckList;
