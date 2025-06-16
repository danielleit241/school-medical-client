import React, { useEffect, useState } from "react";
import { Card, Button, Input, Pagination, Empty, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../../../../api/axios";

const { Meta } = Card;

const CampaignList = () => {
  const staffNurseId = useSelector((state) => state.user?.userId);
  const scheduleId = localStorage.getItem("vaccinationScheduleId");
  console.log("CampaignList - scheduleId from localStorage:", scheduleId);
  console.log("CampaignList - staffNurseId:", staffNurseId);
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
          `/api/nurses/${staffNurseId}/vaccination-rounds`,
          { params }
        );
        console.log("Fetched campaign rounds:", res.data);
        // Nếu API trả về { items: [...], totalCount: ... }
        const mappedRounds = (res.data.items || []).map(
          (item) => item.vaccinationRoundInformation
        );
        setRounds(mappedRounds);
        setTotal(res.data.totalCount || mappedRounds.length);
      } catch (error) {
        console.error("Error fetching campaign rounds:", error);
        setRounds([]);
        setTotal(0);
      }
      setLoading(false);
    };

    fetchRounds();
  }, [staffNurseId, pageIndex, pageSize, search]);

  return (
    <div>
      <Input.Search
        placeholder="Search campaign rounds"
        allowClear
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPageIndex(1);
        }}
        style={{ width: 300, marginBottom: 24 }}
      />
      {loading ? (
        <div style={{ textAlign: "center", marginTop: 60 }}>
          <Spin size="large" />
        </div>
      ) : rounds && rounds.length > 0 ? (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {rounds.map((round) => (
              <Card
                key={round.roundId}
                style={{
                  width: 320,
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  marginBottom: 16,
                  border: "1px solid #f0f0f0",
                }}
                title={
                  <span style={{ fontWeight: 600, fontSize: 18 }}>
                    {round.roundName || "No name"}
                  </span>
                }
                extra={
                  <Button
                    type="primary"
                    onClick={() =>
                      navigate(`/nurse/campaign/round-campaign/`, {
                        state: { roundId: round.roundId, roundName: round.roundName }
                      })
                    }
                    style={{ borderRadius: 6 }}
                  >
                    Details
                  </Button>
                }
              >
                <div style={{ color: "#555", marginBottom: 8 }}>
                  <span style={{ fontWeight: 500 }}>Description: </span>
                  {round.description || "No description"}
                </div>
                <div style={{ color: "#555", marginBottom: 8 }}>
                  <span style={{ fontWeight: 500 }}>Time: </span>
                  {round.startTime
                    ? `${new Date(round.startTime).toLocaleString()}`
                    : "N/A"}
                  {" - "}
                  {round.endTime
                    ? `${new Date(round.endTime).toLocaleString()}`
                    : "N/A"}
                </div>
                <div style={{ color: "#555" }}>
                  <span style={{ fontWeight: 500 }}>Target Grade: </span>
                  {round.targetGrade || "N/A"}
                </div>
              </Card>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 32,
            }}
          >
            <Pagination
              current={pageIndex}
              total={total}
              pageSize={pageSize}
              onChange={(page) => setPageIndex(page)}
              showSizeChanger={false}
            />
          </div>
        </>
      ) : (
        <Empty
          description={
            <span style={{ color: "#888" }}>No campaign rounds found.</span>
          }
          style={{ marginTop: 60 }}
        />
      )}
    </div>
  );
};

export default CampaignList;