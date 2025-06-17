import React, { useEffect, useState } from "react";
import { Card, Button, Input, Pagination, Empty, Spin, Row, Col, Tag, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { CalendarOutlined, TeamOutlined, InfoCircleOutlined } from "@ant-design/icons";
import axiosInstance from "../../../../api/axios";

const { Meta } = Card;

const CampaignList = () => {
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
          `/api/nurses/${staffNurseId}/vaccination-rounds`,
          { params }
        );
        const mappedRounds = (res.data.items || []).map(
          (item) => item.vaccinationRoundInformation
        );
        setRounds(mappedRounds);
        setTotal(res.data.totalCount || mappedRounds.length);
      } catch (error) {
        console.error("Error fetching rounds:", error);
        setRounds([]);
        setTotal(0);
      }
      setLoading(false);
    };

    fetchRounds();
  }, [staffNurseId, pageIndex, pageSize, search]);

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0",
        padding: "32px 0 0 0",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 32,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <h2 style={{ margin: 0, color: "#1890ff", fontWeight: 700, fontSize: 28, letterSpacing: 1 }}>
          Vaccination Campaign Rounds
        </h2>
        <Input.Search
          placeholder="Search campaign rounds"
          allowClear
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPageIndex(1);
          }}
          style={{
            width: 320,
            marginLeft: 24,
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 2px 8px #e6f7ff",
          }}
        />
      </div>
      {loading ? (
        <div style={{ textAlign: "left", marginTop: 80 }}>
          <Spin size="large" />
        </div>
      ) : rounds && rounds.length > 0 ? (
        <>
          <Row gutter={[24, 24]} style={{ justifyContent: "flex-start" }}>
            {rounds.map((round) => (
              <Col xs={24} sm={12} md={8} lg={8} key={round.roundId}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 16,
                    boxShadow: "0 4px 16px #e6f7ff",
                    border: "none",
                    minHeight: 260,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                  bodyStyle={{ padding: 24 }}
                  title={
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <CalendarOutlined style={{ color: "#1890ff", fontSize: 20 }} />
                      <span style={{ fontWeight: 600, fontSize: 18, color: "#222" }}>
                        {round.roundName || "No name"}
                      </span>
                    </div>
                  }
                  extra={
                    <Button
                      type="primary"
                      onClick={() =>
                        navigate(`/nurse/campaign/round-campaign/`, {
                          state: { roundId: round.roundId, roundName: round.roundName }
                        })
                      }
                      style={{ borderRadius: 6, fontWeight: 500 }}
                    >
                      Details
                    </Button>
                  }
                >
                  <div style={{ color: "#555", marginBottom: 10 }}>
                    <Tooltip title="Description">
                      <InfoCircleOutlined style={{ color: "#b7b7b7", marginRight: 6 }} />
                    </Tooltip>
                    <span style={{ fontWeight: 500 }}>Description: </span>
                    {round.description || <span style={{ color: "#aaa" }}>No description</span>}
                  </div>
                  <div style={{ color: "#555", marginBottom: 10 }}>
                    <CalendarOutlined style={{ color: "#b7b7b7", marginRight: 6 }} />
                    <span style={{ fontWeight: 500 }}>Time: </span>
                    {round.startTime
                      ? `${new Date(round.startTime).toLocaleString()}`
                      : "N/A"}
                    {" - "}
                    {round.endTime
                      ? `${new Date(round.endTime).toLocaleString()}`
                      : "N/A"}
                  </div>
                  <div style={{ color: "#555", marginBottom: 10 }}>
                    <TeamOutlined style={{ color: "#b7b7b7", marginRight: 6 }} />
                    <span style={{ fontWeight: 500 }}>Target Grade: </span>
                    <Tag color="blue" style={{ fontWeight: 500, borderRadius: 6 }}>
                      {round.targetGrade || "N/A"}
                    </Tag>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              marginTop: 40,
              marginBottom: 32,
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
        </>
      ) : (
        <Empty
          description={
            <span style={{ color: "#888" }}>No campaign rounds found.</span>
          }
          style={{ marginTop: 80, textAlign: "left" }}
        />
      )}
    </div>
  );
};

export default CampaignList;