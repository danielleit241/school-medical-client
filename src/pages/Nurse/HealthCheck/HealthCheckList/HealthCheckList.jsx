import React, { useEffect, useState } from "react";
import { Button, Input, Pagination, Empty, Spin, Row, Col, Tag, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { CalendarOutlined, TeamOutlined, InfoCircleOutlined } from "@ant-design/icons";
import axiosInstance from "../../../../api/axios";
import dayjs from "dayjs";

const HealthCheckList = () => {
  const staffNurseId = useSelector((state) => state.user?.userId);
  const [rounds, setRounds] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

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


  return (
      <div className="min-h-screen flex  justify-center bg-gray-50 py-8">
        <div
          className="w-[90%] rounded-2xl shadow-xl bg-white overflow-hidden"
          style={{
            boxShadow: "0 8px 32px 0 rgba(53,83,131,0.10)",
          }}
        >
          {/* Header gradient */}
          <div
            style={{
              width: "100%",
              background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
              padding: "36px 0 18px 0",
              marginBottom: "40px",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
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
            className="px-10 py-8"
            style={{
              maxHeight: "650px",
              overflowY: "auto",
            }}
          >
            {loading ? (
              <div style={{ textAlign: "center", marginTop: 80 }}>
                <Spin size="large" />
              </div>
            ) : rounds && rounds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 p-5">
              {rounds.map((round) => {
                const now = dayjs();
                const startTime = round.startTime ? dayjs(round.startTime) : null;
                const endTime = round.endTime ? dayjs(round.endTime) : null;

                let statusLabel = "Unknown";
                let statusBg = "#ef4444"; // đỏ mặc định cho Not Active

                if (round.status === true) {
                  statusLabel = "Completed";
                  statusBg = "#22c55e"; // xanh lá
                } else if (round.status === false) {
                  if (
                    startTime && endTime &&
                    (now.isSame(startTime, "day") ||
                      now.isSame(endTime, "day") ||
                      (now.isAfter(startTime, "day") && now.isBefore(endTime, "day")))
                  ) {
                    statusLabel = "In Active";
                    statusBg = "#f59e42"; // cam
                  } else {
                    statusLabel = "Not Active";
                    statusBg = "#ef4444"; // đỏ
                  }
                } else {
                  statusLabel = "Unknown";
                  statusBg = "#ef4444";
                }

                return (
                  <div
                    key={round.roundId}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 flex flex-col"
                    style={{ minHeight: 340 }}
                  >
                    {/* Card Header */}
                    <div
                      style={{
                        padding: "20px",
                        background: "linear-gradient(90deg, #3058A4 0%, #3058A4 100%)",
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                          <CalendarOutlined style={{ color: "#fff", fontWeight: 700, fontSize: 32 }} />
                          <h3 className="text-xl font-semibold text-white" style={{ marginBottom: 4, color: "#fff", fontWeight: 700, fontSize: 25 }}>
                            {round.roundName || "No name"}
                          </h3>
                        </div>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow"
                          style={{
                            background: statusBg,
                            color: "#fff",
                            fontWeight: 600,
                            minWidth: 70,
                            textAlign: "center",
                            border: "none",
                            fontSize: 14,
                            boxShadow: "0 2px 8px #3058A433",
                            display: "inline-block"
                          }}
                        >
                          {statusLabel}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="flex-1 flex flex-col justify-between p-5">
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <InfoCircleOutlined className="text-blue-600" style={{ fontSize: 18 }} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Description
                            </p>
                            <p className="text-sm font-medium text-gray-800">
                              {round.description || <span style={{ color: "#aaa" }}>No description</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <CalendarOutlined className="text-blue-600" style={{ fontSize: 18 }} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Time
                            </p>
                            <p className="text-sm font-medium text-gray-800">
                              {round.startTime
                                ? `${new Date(round.startTime).toLocaleString()}`
                                : "N/A"}
                              {" - "}
                              {round.endTime
                                ? `${new Date(round.endTime).toLocaleString()}`
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <TeamOutlined className="text-purple-600" style={{ fontSize: 18 }} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Target Grade
                            </p>
                            <p className="text-sm font-medium text-gray-800">
                              {round.targetGrade || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Action Button */}
                      <div className="flex gap-2 pt-3 border-t border-gray-100">
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
                            width: "100%",
                            background: "linear-gradient(90deg, #3058A4 0%, #2563eb 100%)",
                            border: "none",
                            boxShadow: "0 2px 8px #3058A433",
                          }}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
