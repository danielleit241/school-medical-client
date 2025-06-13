import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import axiosInstance from "../../../../api/axios";
import {Card, Button, Row, Col, Tag, Pagination, Select} from "antd";
import {useNavigate} from "react-router-dom";

const MedicalRegistrationList = () => {
  const navigate = useNavigate();
  const parentId = useSelector((state) => state.user?.userId);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;
  const [filterStatus, setFilterStatus] = useState("notyet"); // "notyet" | "done"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/parents/${parentId}/medical-registrations`,
          {
            params: {
              pageIndex,
              pageSize,
            },
          }
        );
        setData(response.data.items || []);
        setTotal(response.data.count || 0);
      } catch (error) {
        setData([]);
        setTotal(0);
        console.error("Error fetching medical registrations:", error);
      }
    };
    if (parentId) fetchData();
  }, [parentId, pageIndex, pageSize]);

  // Kiểm tra đơn đã hoàn thành hết chưa
  const isAllDoseCompleted = (item) =>
    item.medicalRegistrationDetails &&
    item.medicalRegistrationDetails.length > 0 &&
    item.medicalRegistrationDetails.every((dose) => dose.isCompleted);

  // Lọc data theo filter
  const filteredData = data.filter((item) => {
    if (filterStatus === "done") return isAllDoseCompleted(item);
    if (filterStatus === "notyet") return !isAllDoseCompleted(item);
    return true;
  });

  return (
    <div
      style={{
        padding: "20px 0",
        margin: "0 auto",
        width: "90%",
      }}
    >
      <div
        style={{
          background: "#fff",
          minHeight: "100vh",
          borderRadius: "20px 20px 0 0",
          padding: 0,
          position: "relative",
        }}
      >
        {/* Header gradient */}
        <div
          style={{
            width: "100%",
            background: "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
            padding: "36px 0 18px 0",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            textAlign: "center",
            marginBottom: 32,
            boxShadow: "0 4px 24px 0 rgba(53,83,131,0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.13)",
                boxShadow: "0 2px 8px #a259e633",
              }}
            >
              <span style={{fontSize: 28, color: "#fff"}}>💊</span>
            </span>
            <span
              style={{
                fontWeight: 800,
                fontSize: 36,
                color: "#fff",
                letterSpacing: 1,
                textShadow: "0 2px 8px #2222",
              }}
            >
              Medication Registration History
            </span>
          </div>
          <div
            style={{
              color: "#e0e7ff",
              fontSize: 20,
              fontWeight: 500,
              textShadow: "0 1px 4px #2222",
            }}
          >
            Track and manage your medication registration records easily
          </div>
        </div>

        {/* Filter */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "0 32px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <b>Filter: </b>
            <Select
              value={filterStatus}
              style={{width: 160}}
              onChange={setFilterStatus}
            >
              <Select.Option value="notyet">Not Yet</Select.Option>
              <Select.Option value="done">Done</Select.Option>
            </Select>
          </div>

          {/* List */}
          <div
            style={{
              borderRadius: 20,
              minHeight: 300,
              maxHeight: 520,
              overflowY: "auto",
              overflowX: "hidden",
              padding: "0 32px 0 32px",
            }}
          >
            {filteredData.length === 0 ? (
              <div
                style={{
                  borderRadius: 12,
                  padding: 32,
                  textAlign: "center",
                  fontSize: 20,
                  color: "#888",
                  marginTop: 40,
                  background: "#fff",
                }}
              >
                No medical registration found.
              </div>
            ) : (
              <Row gutter={[24, 24]}>
                {filteredData.map((item) => (
                  <Col
                    xs={24}
                    sm={12}
                    md={8}
                    lg={8}
                    key={item.medicalRegistration.registrationId}
                  >
                    <Card
                      style={{
                        borderRadius: 12,
                        minHeight: 240,
                        boxShadow: "0 2px 8px #f0f1f2",
                        padding: 0,
                      }}
                      bodyStyle={{padding: 20}}
                      title={
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <span
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              background:
                                "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: 20,
                            }}
                          >
                            {item.student.studentFullName?.[0] || "U"}
                          </span>
                          <span style={{fontWeight: 700, fontSize: 17}}>
                            {item.student.studentFullName}
                          </span>
                        </div>
                      }
                      extra={
                        isAllDoseCompleted(item) ? (
                          <Tag
                            color="blue"
                            style={{
                              fontWeight: 600,
                              borderRadius: 16,
                              fontSize: 14,
                              padding: "4px 16px",
                            }}
                          >
                            Done
                          </Tag>
                        ) : (
                          <Tag
                            color="orange"
                            style={{
                              fontWeight: 600,
                              borderRadius: 16,
                              fontSize: 14,
                              padding: "4px 16px",
                            }}
                          >
                            Not Yet
                          </Tag>
                        )
                      }
                    >
                      <div style={{marginBottom: 8}}>
                        <b>Medication:</b>{" "}
                        {item.medicalRegistration.medicationName}
                      </div>
                      <div style={{marginBottom: 8}}>
                        <b>Total Dosages:</b>{" "}
                        {item.medicalRegistration.totalDosages}
                      </div>
                      <div style={{marginBottom: 8}}>
                        <b>Date Submitted:</b>{" "}
                        {item.medicalRegistration.dateSubmitted}
                      </div>
                      <div style={{marginBottom: 8}}>
                        <b>Parent Notes:</b> {item.medicalRegistration.notes}
                      </div>
                      <div style={{display: "flex", gap: 8, marginTop: 16}}>
                        <Button
                          type="primary"
                          style={{
                            borderRadius: 8,
                            background:
                              "linear-gradient(90deg, #2563ad 0%, #355383 100%)",
                            border: "none",
                            fontWeight: 600,
                            minWidth: 90,
                          }}
                          onClick={() => {
                            navigate(`/parent/medical-registration/detail`, {
                              state: {
                                registrationId:
                                  item.medicalRegistration.registrationId,
                                studentId: item.student.studentId,
                              },
                            });
                          }}
                        >
                          Details
                        </Button>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
          {/* Kết thúc div màu trắng */}
        </div>
        {/* Pagination nằm ngoài div chính */}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          background: "#fff",
          padding: "12px 0",
          borderRadius: "0 0 20px 20px",
        }}
      >
        <Pagination
          current={pageIndex}
          pageSize={pageSize}
          total={total}
          onChange={(page) => {
            setPageIndex(page);
          }}
        />
      </div>
    </div>
  );
};

export default MedicalRegistrationList;
