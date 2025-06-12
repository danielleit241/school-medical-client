import React, {useEffect, useState} from "react";
import axiosInstance from "../../../../api/axios";
import Swal from "sweetalert2";
import {useNavigate} from "react-router-dom";
import {Card, Button, Row, Col, Tag, Pagination, Spin} from "antd";

const MedicalEventList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          "/api/nurses/students/medical-events",
          {
            params: {
              pageIndex,
              pageSize,
            },
          }
        );
        setData(response.data.items || []);
        setTotal(response.data.count || 0);
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setData([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, pageIndex, pageSize]);

  if (loading) {
    return <Spin style={{marginTop: 40}} />;
  }

  // Chia data thành nhiều dòng, mỗi dòng 5 phần tử
  const rows = [];
  for (let i = 0; i < data.length; i += 5) {
    rows.push(data.slice(i, i + 5));
  }

  return (
    <div style={{padding: 20}}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "left",
        }}
      >
        <h2 style={{margin: 0, fontWeight: 600}}>Medical Event</h2>
      </div>
      {rows.map((row, rowIndex) => (
        <Row
          gutter={[16, 16]}
          key={rowIndex}
          style={{
            marginBottom: 16,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "left",
            alignItems: "center",
            width: "100%",
            gap: 50,
          }}
        >
          {row.map((item) => (
            <Col span={4} key={item.medicalEvent.eventId}>
              <Card
                title={item.studentInfo.fullName}
                extra={
                  item.medicalEvent.severityLevel === "Low" ? (
                    <Tag color="green">
                      {"Severity: " + item.medicalEvent.severityLevel}
                    </Tag>
                  ) : item.medicalEvent.severityLevel === "Medium" ? (
                    <Tag color="orange">
                      {"Severity: " + item.medicalEvent.severityLevel}
                    </Tag>
                  ) : (
                    <Tag color="red">
                      {"Severity: " + item.medicalEvent.severityLevel}
                    </Tag>
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
                    <b>Student Name:</b> {item.studentInfo.fullName}
                  </p>
                  <p>
                    <b>Date:</b> {item.medicalEvent.eventDate}
                  </p>
                  <p>
                    <b>Location:</b> {item.medicalEvent.location}
                  </p>
                  <p>
                    <b>Event Type:</b> {item.medicalEvent.eventType}
                  </p>
                </div>
                <div style={{display: "flex", gap: 8, marginTop: 16}}>
                  <Button
                    type="primary"
                    style={{backgroundColor: "#355383"}}
                    onClick={() => {
                      navigate(`/nurse/medical-event/medical-event-detail/`, {
                        state: {
                          eventId: item.medicalEvent.eventId,
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
      ))}
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

export default MedicalEventList;
