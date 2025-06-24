import React, { useEffect, useState } from "react";
import { Button, Input, Pagination, Empty, Spin, Progress } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { CalendarOutlined, TeamOutlined } from "@ant-design/icons";
import axiosInstance from "../../../../api/axios";
import dayjs from "dayjs";

const CampaignList = () => {
  const staffNurseId = useSelector((state) => state.user?.userId);
  const [rounds, setRounds] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [completedByRound, setCompletedByRound] = useState({});
  const [totalByRound, setTotalByRound] = useState({});
  const [loadingComplete, setLoadingComplete] = useState({});
  const navigate = useNavigate();

  // Fetch rounds
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
          `/api/nurses/${staffNurseId}/vaccination-rounds`,
          { params }
        );
        const mappedRounds = (res.data.items || []).map(
          (item) => item.vaccinationRoundInformation
        );
        setRounds(mappedRounds);
        setTotal(res.data.totalCount || mappedRounds.length);
        console.log("Rounds from API:", mappedRounds);
      } catch (error) {
        console.error("Error fetching rounds:", error);
        setRounds([]);
        setTotal(0);
      }
      setLoading(false);
    };

    fetchRounds();
  }, [staffNurseId, pageIndex, pageSize, search]);

  
  // Fetch students and completed count for each round
  useEffect(() => {
    if (!staffNurseId || !rounds.length) return;

    const fetchAllRounds = async () => {
      const completedObj = {};
      const totalObj = {};

      await Promise.all(
        rounds.map(async (round) => {
          try {
            const res = await axiosInstance.get(
              `/api/v2/nurses/${staffNurseId}/vaccination-rounds/${round.roundId}/students`
            );
            const students = Array.isArray(res.data) ? res.data : [];
            totalObj[round.roundId] = students.length;

            let completed = 0;
            await Promise.all(
              students.map(async (student) => {
                const vaccinationResultId = student.studentsOfRoundResponse?.vaccinationResultId;
                if (!vaccinationResultId) return;

                let isCompleted = false;

                // Kiểm tra health-qualified
                try {
                  const qualifiedRes = await axiosInstance.get(
                    `/api/vaccination-results/${vaccinationResultId}/health-qualified`
                  );
                  const qualified =
                    typeof qualifiedRes.data === "boolean"
                      ? qualifiedRes.data
                      : qualifiedRes.data?.qualified;
                  if (qualified === false) {
                    isCompleted = true;
                  }
                } catch {
                  return;
                }

               
                if (!isCompleted) {
                  try {
                    const result = await axiosInstance.get(
                      `/api/vaccination-results/${vaccinationResultId}`
                    );
                    const resultRes = result.data;
                    if (
                      resultRes &&
                      resultRes.vaccinationObservation &&
                      resultRes.vaccinationObservation.reactionType != null
                    ) {
                      isCompleted = true;
                    }
                  } catch {
                    return;
                  }
                }

                if (isCompleted) completed += 1;
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

  const handleComplete = async (roundId) => {
    setLoadingComplete((prev) => ({ ...prev, [roundId]: true }));
    try {
      await axiosInstance.put(`/api/vaccination-rounds/${roundId}/finished`, true);
      // Sau khi hoàn thành, reload rounds
      setRounds((prev) =>
        prev.map((r) =>
          r.roundId === roundId ? { ...r, status: true } : r
        )
      );
    } catch {
      console.error("Error completing round:", roundId);
      // Có thể hiển thị thông báo lỗi cho người dùng ở đây
    }
    setLoadingComplete((prev) => ({ ...prev, [roundId]: false }));
  };

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
            Vaccination Campaign Rounds
          </h1>
          <div
            style={{
              color: "#e0e7ff",
              fontSize: 20,
              fontWeight: 500,
            }}
          >
            Manage and view all vaccination rounds for your school
          </div>
          <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
            <Input.Search
              placeholder="Search campaign rounds"
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
            {!loading && rounds && rounds.length > 0 ? (
              <div>
                {rounds.map((round, idx) => {
                  const completed = completedByRound[round.roundId] ?? 0;
                  const total = totalByRound[round.roundId] ?? 0;
                  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

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

                  return (
                    <div
                      key={round.roundId}
                      style={{
                        background: "",
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
                        flexWrap: "wrap",
                        width: "100%",
                        boxSizing: "border-box"
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
                        <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 8 }}>Vaccination Progress</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                          <Progress
                            percent={percent}
                            showInfo={false}
                            strokeColor={{
                              '0%': '#22c55e',    // xanh lá khi mới bắt đầu
                              '50%': '#f59e42',   // cam khi giữa tiến trình
                              '100%': '#3058A4'   // xanh dương khi hoàn thành
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
                      {/* Details Button */}
                      <div style={{
                        marginTop: 24,
                        display: "flex",
                        gap: 12,
                        justifyContent: "flex-end",
                        width: "100%",
                        boxSizing: "border-box"
                      }}>
                        <Button
                          type="primary"
                          size="large"
                          onClick={() =>
                            navigate(`/nurse/campaign/round-campaign/`, {
                              state: { roundId: round.roundId, roundName: round.roundName, ...(percent === 100 ? { percent } : {}) }
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
            ) : loading ? (
              <div style={{ textAlign: "center", marginTop: 80 }}>
                <Spin size="large" />
              </div>
            ) : (
              <Empty
                description={
                  <span style={{ color: "#888" }}>No campaign rounds found.</span>
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

export default CampaignList;