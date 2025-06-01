import React, {useEffect, useState} from "react";
import axiosInstance from "../../../../api/axios";
import Swal from "sweetalert2";
import {useNavigate} from "react-router-dom";
import {Card, Button, Row, Col, Tag, Pagination, Spin} from "antd";

const MedicalReceived = () => {
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
          "/api/nurses/medical-registrations",
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
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Cannot get medical registrations!",
        }).then(() => {
          navigate(-1);
        });
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

  // Chia data thành 2 hàng, mỗi hàng 5 phần tử
  const rows = [data.slice(0, 5), data.slice(5, 10)];

  return (
    <div style={{padding: 24}}>
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
                    <b>Medication:</b> {item.medicalRegistration.medicationName}
                  </p>
                  <p>
                    <b>Dosage:</b> {item.medicalRegistration.dosage}
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
                      navigate(
                        `/nurse/medical-received/medical-received-detail`,
                        {
                          state: {
                            registrationId:
                              item.medicalRegistration.registrationId,
                            studentId: item.student.studentId,
                          },
                        }
                      );
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

export default MedicalReceived;
