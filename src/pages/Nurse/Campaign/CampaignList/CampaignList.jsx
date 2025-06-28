import React, {useEffect, useState} from "react";
import {Button, Input, Pagination, Empty, Spin, Progress} from "antd";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import {CalendarOutlined, TeamOutlined} from "@ant-design/icons";
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
          {params}
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
            // Lấy tất cả vaccinationResultId
            const vaccinationResultIds = students
              .map((student) => student.studentsOfRoundResponse?.vaccinationResultId)
              .filter(Boolean);

            await Promise.all(
              vaccinationResultIds.map(async (vaccinationResultId) => {
                try {
                  const result = await axiosInstance.get(
                    `/api/vaccination-results/${vaccinationResultId}`
                  );
                  const resultRes = result.data;
                  if (
                    resultRes &&
                    resultRes.resultResponse &&
                    resultRes.resultResponse.status === "Failed"
                  ) {
                    completed += 1;
                    return;
                  }
                  if (
                    resultRes &&
                    resultRes.vaccinationObservation &&
                    resultRes.vaccinationObservation.reactionType != null
                  ) {
                    completed += 1;
                    return;
                  }
                  try {
                    const qualifiedRes = await axiosInstance.get(
                      `/api/vaccination-results/${vaccinationResultId}/health-qualified`
                    );
                    const qualified =
                      typeof qualifiedRes.data === "boolean"
                        ? qualifiedRes.data
                        : qualifiedRes.data?.qualified;
                    if (qualified === false) {
                      completed += 1;
                    }
                  } catch {
                    return;
                  }
                } catch {
                  return
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

  const handleComplete = async (roundId) => {
    setLoadingComplete((prev) => ({...prev, [roundId]: true}));
    try {
      await axiosInstance.put(
        `/api/vaccination-rounds/${roundId}/finished`,
        true
      );
      setRounds((prev) =>
        prev.map((r) => (r.roundId === roundId ? {...r, status: true} : r))
      );
    } catch {
      console.error("Error completing round:", roundId);
    }
    setLoadingComplete((prev) => ({...prev, [roundId]: false}));
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
            Vaccination Campaign Rounds
          </h1>
          <div
            style={{
              color: "#e0e7ff",
              fontSize: 15,
              fontWeight: 500,
              marginBottom: 0,
            }}
          >
            Manage and view all vaccination rounds for your school
          </div>
          <div
            style={{marginTop: 12, display: "flex", justifyContent: "center"}}
          >
            <Input.Search
              placeholder="Search campaign rounds"
              allowClear
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageIndex(1);
              }}
              style={{
                width: 260, // giảm width
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
              padding: "0 16px", // giảm padding ngang
            }}
          >
            {!loading && rounds && rounds.length > 0 ? (
              <div>
                {rounds.map((round) => {
                  const completed = completedByRound[round.roundId] ?? 0;
                  const total = totalByRound[round.roundId] ?? 0;
                  const percent =
                    total > 0 ? Math.round((completed / total) * 100) : 0;

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

                  return (
                    <div
                      key={round.roundId}
                      style={{
                        background: "",
                        borderRadius: 12,
                        boxShadow: "0 4px 16px 0 rgba(53,83,131,0.10)",
                        padding: `0 20px 18px 20px`,
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
                        <CalendarOutlined
                          style={{color: "#3058A4", fontSize: 22}}
                        />
                        <span
                          style={{fontWeight: 700, fontSize: 18, color: "#222"}}
                        >
                          {round.roundName || "No name"}
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
                      {/* Description */}
                      <div
                        style={{
                          color: "#666",
                          fontSize: 13,
                          margin: "4px 0 0 0",
                        }}
                      >
                        {round.description || (
                          <span style={{color: "#aaa"}}>No description</span>
                        )}
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
                            fontWeight: 600,
                            fontSize: 14,
                            marginBottom: 4,
                          }}
                        >
                          Vaccination Progress
                        </div>
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
                      {/* Details Button */}
                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          gap: 8,
                          justifyContent: "flex-end",
                          width: "100%",
                          boxSizing: "border-box",
                        }}
                      >
                        <Button
                          type="primary"
                          size="middle"
                          onClick={() =>
                            navigate(`/nurse/campaign/round-campaign/`, {
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
                  );
                })}
              </div>
            ) : loading ? (
              <div style={{textAlign: "center", marginTop: 40}}>
                <Spin size="large" />
              </div>
            ) : (
              <Empty
                description={
                  <span style={{color: "#888"}}>No campaign rounds found.</span>
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

export default CampaignList;
