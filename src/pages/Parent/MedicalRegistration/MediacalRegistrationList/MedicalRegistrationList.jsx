import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import axiosInstance from "../../../../api/axios";
import {Card, Button, Tag, Pagination, Select} from "antd";
import {useNavigate} from "react-router-dom";

const MedicalRegistrationList = () => {
  const navigate = useNavigate();
  const parentId = useSelector((state) => state.user?.userId);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;
  const [filterStatus, setFilterStatus] = useState("notyet"); // "notyet" | "done"
  const [showList, setShowList] = useState(false);
  const [dotIndex, setDotIndex] = useState(0);

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

  // Hiệu ứng loading với 3 dấu chấm
  useEffect(() => {
    setShowList(false);
    setDotIndex(0);
    let interval = null;
    let timeout = null;

    interval = setInterval(() => {
      setDotIndex((prev) => (prev + 1) % 3);
    }, 200);

    timeout = setTimeout(() => {
      setShowList(true);
      clearInterval(interval);
    }, 300);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

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
        className="animate__animated animate__fadeIn"
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
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative background elements */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "120px",
              height: "120px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-30px",
              left: "-30px",
              width: "80px",
              height: "80px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: "25%",
              width: "60px",
              height: "60px",
              background: "rgba(255, 193, 7, 0.2)",
              borderRadius: "50%",
            }}
          />
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
            padding: "0 24px",
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
        <div style={{padding: "0 24px"}}>
          {!showList ? (
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 32,
                textAlign: "center",
                fontSize: 30,
                letterSpacing: 8,
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                color: "#222",
              }}
            >
              <span>
                <span style={{opacity: dotIndex === 0 ? 1 : 0.3}}>.</span>
                <span style={{opacity: dotIndex === 1 ? 1 : 0.3}}>.</span>
                <span style={{opacity: dotIndex === 2 ? 1 : 0.3}}>.</span>
              </span>
            </div>
          ) : filteredData.length === 0 ? (
            <div
              style={{
                borderRadius: 12,
                padding: 32,
                textAlign: "center",
                fontSize: 20,
                color: "#888",
                marginTop: 40,
              }}
            >
              No medical registration found.
            </div>
          ) : (
            <div
              className="animate__animated animate__fadeIn"
              style={{
                borderRadius: 20,
                overflowY: "auto",
                overflowX: "hidden",
                paddingRight: 8,
                maxHeight: 520,
              }}
            >
              <div style={{display: "flex", flexDirection: "column", gap: 16}}>
                {filteredData.map((item) => (
                  <Card
                    key={item.medicalRegistration.registrationId}
                    style={{
                      borderRadius: 12,
                      width: "100%",
                      boxShadow: "0 2px 8px #f0f1f2",
                      padding: 0,
                      border: "1px solid #f0f0f0",
                    }}
                    bodyStyle={{padding: 20}}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      {/* Student Info */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flex: 1.5,
                        }}
                      >
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            background:
                              "linear-gradient(180deg, #2B5DC4 0%, #355383 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 22,
                            color: "#fff",
                            marginRight: 14,
                          }}
                        >
                          {item.student.studentFullName?.[0] || "U"}
                        </div>
                        <div>
                          <div style={{fontWeight: 700, fontSize: 17}}>
                            {item.student.studentFullName}
                          </div>
                          <div style={{color: "#888", fontSize: 15}}>
                            {item.medicalRegistration.medicationName}
                          </div>
                        </div>
                      </div>

                      {/* Dosage Info */}
                      <div style={{flex: 1, padding: "0 20px"}}>
                        <div
                          style={{
                            color: "#355383",
                            fontSize: 15,
                            marginBottom: 4,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <span style={{marginRight: 6}}>📋</span>
                          <b>Total Dosages:</b>{" "}
                          {item.medicalRegistration.totalDosages}
                        </div>
                        <div
                          style={{
                            color: "#1bbf7a",
                            fontSize: 15,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <span style={{marginRight: 6}}>📅</span>
                          <b>Submitted:</b>{" "}
                          {item.medicalRegistration.dateSubmitted}
                        </div>
                      </div>

                      {/* Status */}
                      <div style={{flex: 1}}>
                        <div
                          style={{
                            color: "#a259e6",
                            fontSize: 15,
                            marginBottom: 8,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <span style={{marginRight: 6}}>📝</span>
                          <span style={{fontWeight: 600}}>Notes:</span>
                        </div>
                        <div style={{fontSize: 14, color: "#555"}}>
                          {item.medicalRegistration.notes ||
                            "No notes provided"}
                        </div>
                      </div>

                      {/* Status + Button */}
                      <div
                        style={{
                          flex: 1.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Tag
                          color={isAllDoseCompleted(item) ? "blue" : "orange"}
                          style={{
                            fontWeight: 600,
                            borderRadius: 16,
                            fontSize: 14,
                            padding: "4px 16px",
                            background: isAllDoseCompleted(item)
                              ? "#e6f7ff"
                              : "#fff7e6",
                            color: isAllDoseCompleted(item)
                              ? "#1890ff"
                              : "#fa8c16",
                            border: "none",
                          }}
                        >
                          {isAllDoseCompleted(item) ? "Done" : "Not Yet"}
                        </Tag>
                        <Button
                          style={{
                            borderRadius: 8,
                            background: "#fff",
                            color: "#355383",
                            border: "1px solid #355383",
                            fontWeight: 600,
                            minWidth: 90,
                            height: 42,
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
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
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
