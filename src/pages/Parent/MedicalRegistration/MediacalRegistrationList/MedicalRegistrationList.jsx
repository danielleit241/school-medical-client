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

  // Chia data thành nhiều dòng, mỗi dòng 5 phần tử
  const rows = [];
  for (let i = 0; i < filteredData.length; i += 5) {
    rows.push(filteredData.slice(i, i + 5));
  }

  return (
    <div style={{padding: 24}}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "left",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            Filter:
          </p>
        </div>
        <Select
          value={filterStatus}
          style={{width: 160}}
          onChange={setFilterStatus}
        >
          <Select.Option value="notyet">Not Yet</Select.Option>
          <Select.Option value="done">Done</Select.Option>
        </Select>
      </div>
      {filteredData.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "#888",
            marginTop: 40,
            fontSize: 18,
          }}
        >
          No medical registration found.
        </div>
      ) : (
        rows.map((row, rowIndex) => (
          <Row
            gutter={[16, 16]}
            key={rowIndex}
            style={{
              marginBottom: 16,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "left",
              alignItems: "center",
              width: "97%",
              gap: 60,
            }}
          >
            {row.map((item) => (
              <Col span={4} key={item.medicalRegistration.registrationId}>
                <Card
                  title={item.student.studentFullName}
                  extra={
                    item.nurseApproved.dateApproved ? (
                      <Tag color="green">Nurse Approved</Tag>
                    ) : (
                      <Tag color="orange">Pending Nurse</Tag>
                    )
                  }
                  style={{
                    minWidth: 300,
                    borderRadius: 8,
                    boxShadow: "0 0px 5px rgba(0, 0, 0, 0.1)",
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <p>
                      <b>Medication:</b>{" "}
                      {item.medicalRegistration.medicationName}
                    </p>
                    <p>
                      <b>Total Dosages:</b>{" "}
                      {item.medicalRegistration.totalDosages}
                    </p>
                    <p>
                      <b>Date Submitted:</b>{" "}
                      {item.medicalRegistration.dateSubmitted}
                    </p>
                    <p>
                      <b>Parent Notes:</b> {item.medicalRegistration.notes}
                    </p>
                  </div>
                  <div style={{display: "flex", gap: 8, marginTop: 16}}>
                    <Button
                      type="primary"
                      style={{backgroundColor: "#355383"}}
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
        ))
      )}
      <div style={{textAlign: "center", marginTop: 24}}>
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
