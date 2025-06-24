import React, { useEffect, useState } from "react";
import { Button, Input, Pagination, Empty, Spin, Row, Col, Tag, Typography, Progress } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { CalendarOutlined, TeamOutlined } from "@ant-design/icons";
import axiosInstance from "../../../../api/axios";
import dayjs from "dayjs";

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
          { params }
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
    setLoadingComplete((prev) => ({ ...prev, [roundId]: true }));
    try {
      await axiosInstance.put(`/api/health-check-rounds/${roundId}/finished`, true);
      
      setRounds((prev) =>
        prev.map((r) =>
          r.roundId === roundId ? { ...r, status: true } : r
        )
      );
    } catch {
      console.error("Error completing round:", roundId)    
    }
    setLoadingComplete((prev) => ({ ...prev, [roundId]: false }));
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
                const healthCheckResultId = student.studentsOfRoundResponse?.healthCheckResultId;
                if (!healthCheckResultId) return;

                try {
                  const resultRes = await axiosInstance.get(
                    `/api/health-check-results/${healthCheckResultId}`
                  );
                  const status = resultRes.data?.status;
                  if (status === true || status === "Completed") {
                    completed += 1;
                  }
                } catch {
                  return;
                }
              })
            );
            completedObj[round.roundId] = completed;
          } catch (err) {
            console.error("Error fetching students for round:", round.roundId, err);
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
            padding: "36px 0 18px 0",
            marginBottom: "40px",
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontWeight: 700,
              fontSize: 38,
              color: "#fff",
              letterSpacing: 1,
              marginBottom: 8,
              marginTop: 0,
            }}
          >
            Health Check Campaign Rounds
          </h1>
          <div
            style={{
              color: "#e0e7ff",
              fontSize: 20,
              fontWeight: 500,
            }}
          >
            Manage and view all health check rounds for your school
          </div>
          <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
            <Input.Search
              placeholder="Search health check rounds"
              allowClear
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageIndex(1);
              }}
              style={{
                width: 340,
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 2px 8px #e6f7ff",
                fontSize: 16,
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
            padding: "32px 0",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "100%",
              padding: "0 32px",
            }}
          >
            {loading ? (
              <div style={{ textAlign: "center", marginTop: 80 }}>
                <Spin size="large" />
              </div>
            ) : rounds && rounds.length > 0 ? (
              <div>
                {rounds.map((round, idx) => {
                  const now = dayjs();
                  const startTime = round.startTime ? dayjs(round.startTime) : null;
                  const endTime = round.endTime ? dayjs(round.endTime) : null;

                  let statusLabel = "Unknown";
                  let statusBg = "#ef4444";
                  if (round.status === true) {
                    statusLabel = "Completed";
                    statusBg = "#22c55e";
                  } else if (round.status === false) {
                    if (
                      startTime && endTime &&
                      (now.isSame(startTime, "day") ||
                        now.isSame(endTime, "day") ||
                        (now.isAfter(startTime, "day") && now.isBefore(endTime, "day")))
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
                  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                  return (
                    <div
                      key={round.roundId}
                      style={{
                        background: "#fff",
                        borderRadius: 16,
                        boxShadow: "0 8px 32px 0 rgba(53,83,131,0.15)",
                        padding: `0 48px 32px 48px`,
                        marginBottom: 32,
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
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 18,
                        marginTop: idx === 0 ? 0 : 0
                      }}>
                        <CalendarOutlined style={{ color: "#3058A4", fontSize: 32 }} />
                        <span style={{ fontWeight: 700, fontSize: 26, color: "#222" }}>
                          {round.roundName || "No name"}
                        </span>
                        <span
                          style={{
                            background: statusBg,
                            color: "#fff",
                            fontWeight: 600,
                            borderRadius: 999,
                            padding: "4px 18px",
                            fontSize: 15,
                            marginLeft: 8,
                            minWidth: 90,
                            textAlign: "center",
                            display: "inline-block"
                          }}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      {/* Description */}
                      <div style={{ color: "#666", fontSize: 16, margin: "8px 0 0 0" }}>
                        {round.description || <span style={{ color: "#aaa" }}>No description</span>}
                      </div>
                      {/* Info Row */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 36,
                        margin: "18px 0 0 0",
                        flexWrap: "wrap"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#555" }}>
                          <CalendarOutlined />
                          {round.startTime ? dayjs(round.startTime).format("DD/MM/YYYY") : "N/A"}
                          {" - "}
                          {round.endTime ? dayjs(round.endTime).format("DD/MM/YYYY") : "N/A"}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#555" }}>
                          <TeamOutlined />
                          {round.location || "School medical room"}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#555" }}>
                          <span style={{ fontWeight: 500 }}>Grade</span>
                          {round.targetGrade || "N/A"}
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div style={{
                        marginTop: 32,
                        marginBottom: 8,
                        width: "100%",
                        boxSizing: "border-box"
                      }}>
                        <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 8 }}>Health Check Progress</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                          <Progress
                            percent={percent}
                            showInfo={false}
                            strokeColor={{
                              '0%': '#22c55e',
                              '50%': '#f59e42',
                              '100%': '#3058A4'
                            }}
                            trailColor="#f3f4f6"
                            style={{ flex: 1, height: 18, minWidth: 200 }}
                          />
                          <span style={{ fontWeight: 500, color: "#222", minWidth: 120, textAlign: "right" }}>
                            {completed}/{total} students
                          </span>
                        </div>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 15,
                          color: "#666",
                          marginTop: 4
                        }}>
                          <span>Completed: {percent}%</span>
                          <span>Remaining: {total - completed} students</span>
                        </div>
                      </div>
                      {/* Nút Complete */}
                      <div style={{
                        marginTop: 24,
                        display: "flex",
                        gap: 12,
                        justifyContent: "flex-end",
                        width: "100%",
                        boxSizing: "border-box",
                        
                      }}>
                        <Button
                          type="primary"
                          size="large"
                          onClick={() =>
                            navigate(`/nurse/health-check/round-campaign`, {
                              state: { roundId: round.roundId, roundName: round.roundName }
                            })
                          }
                          style={{
                            borderRadius: 8,
                            fontWeight: 600,
                            fontSize: 16,
                            minWidth: 120,
                            background: "linear-gradient(90deg, #3058A4 0%, #2563eb 100%)",
                            border: "none",
                            boxShadow: "0 2px 8px #3058A433",
                          }}
                        >
                          Details
                        </Button>
                        {/* Nếu chưa completed và percent === 100 thì hiện nút Complete */}
                        {!round.status && percent === 100 && (
                          <Button
                            type="primary"
                            loading={loadingComplete[round.roundId]}
                            style={{
                              borderRadius: 8,
                              fontWeight: 600,
                              fontSize: 16,
                              minWidth: 120,
                              background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)",
                              border: "none",
                              boxShadow: "0 2px 8px #22c55e33",
                              
                            }}
                            onClick={() => handleComplete(round.roundId)}
                          >
                            Complete
                          </Button>
                        )}
                        {/* Nếu đã completed */}
                        {round.status && (
                          <span style={{
                            marginLeft: 12,
                            color: "#22c55e",
                            fontWeight: 600,
                            fontSize: 16,
                            borderRadius: 8,
                            background: "#bbf7d0",
                            padding: "6px 18px"
                          }}>
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty
                description={
                  <span style={{ color: "#888" }}>No health check rounds found.</span>
                }
                style={{ marginTop: 80, textAlign: "center" }}
              />
            )}
          </div>
        </div>
        {/* Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginTop: 40,
            marginBottom: 32,
            paddingLeft: 40,
          }}
        >
          <Pagination
            current={pageIndex}
            total={total}
            pageSize={pageSize}
            onChange={(page) => setPageIndex(page)}
            showSizeChanger={false}
            style={{
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 2px 8px #e6f7ff",
              padding: "12px 24px",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HealthCheckList;
