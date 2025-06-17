"use client";

import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {Button, Spin} from "antd";
import {FileTextOutlined} from "@ant-design/icons";
import axiosInstance from "../../../../api/axios";
import Swal from "sweetalert2";
import {useSelector} from "react-redux";

const DeclarationDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedStudent = JSON.parse(localStorage.getItem("selectedStudent"));
  const studentId = location.state?.studentId || selectedStudent?.studentId;
  const parentId = useSelector((state) => state.user?.userId);
  const [healthDeclaration, setHealthDeclaration] = useState(null);
  const [student, setStudent] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/parents/${parentId}/students/${studentId}`
        );
        setStudent(response.data);
      } catch (error) {
        console.error("Error fetching student data:", error);
        setStudent(null);
      }
    };
    fetchStudent();
  }, [studentId, parentId]);

  useEffect(() => {
    const fetchApi = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/students/${studentId}/health-declarations`
        );
        setHealthDeclaration(response.data.healthDeclaration);
        setVaccinations(response.data.vaccinations || []);
        // console.log("Health Declaration Data:", response.data);
      } catch (error) {
        console.error("Error fetching health declaration:", error);
        setHealthDeclaration(null);
        setVaccinations([]);
        Swal.fire({
          icon: "error",
          title: "Cannot find health declaration",
          text: "Please try again or select another student.",
          confirmButtonText: "Back",
        }).then(() => {
          navigate("/parent/health-declaration/my-children");
        });
      } finally {
        setLoading(false);
      }
    };
    if (studentId) fetchApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]); // <-- chỉ để studentId

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!healthDeclaration) {
    return <div>No health declaration found.</div>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px",
        display: "flex", // Thêm dòng này
        justifyContent: "center", // Thêm dòng này
        alignItems: "center", // Thêm dòng này
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
          display: "flex",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        {/* Left Side - Title Section */}
        <div
          style={{
            width: "30%",
            background: "linear-gradient(100deg, #2B5DC4 0%, #355383 100%)",
            padding: "40px 30px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: "linear-gradient(90deg, #86A6DF 0%, #86A6DF 100%)",
              borderRadius: "50%",
              width: "80px",
              height: "80px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <FileTextOutlined
              style={{fontSize: "40px", color: "white", margin: 0}}
            />
          </div>
          <h1
            style={{fontSize: "32px", fontWeight: "bold", margin: "0 0 16px 0"}}
          >
            Health Declaration
          </h1>
          <p style={{fontSize: "16px", opacity: "0.8", margin: 0}}>
            View your child's health information details
          </p>
        </div>

        {/* Right Side - Content Section */}
        <div
          style={{
            width: "70%",
            backgroundColor: "#fff",
            padding: "30px",
          }}
        >
          {/* Student Information */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <tbody>
              <tr style={{borderBottom: "1px solid #eee"}}>
                <td
                  style={{
                    padding: "20px 24px",
                    fontWeight: 600,
                    width: "200px",
                    backgroundColor: "#f9f9f9",
                    fontSize: "16px",
                  }}
                >
                  Student Code
                </td>
                <td
                  style={{
                    padding: "20px 24px",
                    fontSize: "16px",
                  }}
                >
                  {student?.studentCode || ""}
                </td>
              </tr>
              <tr style={{borderBottom: "1px solid #eee"}}>
                <td
                  style={{
                    padding: "20px 24px",
                    fontWeight: 600,
                    backgroundColor: "#f9f9f9",
                    fontSize: "16px",
                  }}
                >
                  Full Name
                </td>
                <td
                  style={{
                    padding: "20px 24px",
                    fontSize: "16px",
                  }}
                >
                  {student?.fullName || ""}
                </td>
              </tr>
              <tr style={{borderBottom: "1px solid #eee"}}>
                <td
                  style={{
                    padding: "20px 24px",
                    fontWeight: 600,
                    backgroundColor: "#f9f9f9",
                    fontSize: "16px",
                  }}
                >
                  Date of Birth
                </td>
                <td
                  style={{
                    padding: "20px 24px",
                    fontSize: "16px",
                  }}
                >
                  {student?.dayOfBirth || ""}
                </td>
              </tr>
              <tr style={{borderBottom: "1px solid #eee"}}>
                <td
                  style={{
                    padding: "20px 24px",
                    fontWeight: 600,
                    backgroundColor: "#f9f9f9",
                    fontSize: "16px",
                  }}
                >
                  Class
                </td>
                <td
                  style={{
                    padding: "20px 24px",
                    fontSize: "16px",
                  }}
                >
                  {student?.grade?.trim() || ""}
                </td>
              </tr>
              <tr style={{borderBottom: "1px solid #eee"}}>
                <td
                  style={{
                    padding: "20px 24px",
                    fontWeight: 600,
                    backgroundColor: "#f9f9f9",
                    fontSize: "16px",
                  }}
                >
                  Declaration Date
                </td>
                <td
                  style={{
                    padding: "20px 24px",
                    fontSize: "16px",
                  }}
                >
                  {healthDeclaration.declarationDate}
                </td>
              </tr>
              <tr style={{borderBottom: "1px solid #eee"}}>
                <td
                  style={{
                    padding: "20px 24px",
                    fontWeight: 600,
                    backgroundColor: "#f9f9f9",
                    fontSize: "16px",
                  }}
                >
                  Chronic Diseases
                </td>
                <td
                  style={{
                    padding: "20px 24px",
                    fontSize: "16px",
                  }}
                >
                  {healthDeclaration.chronicDiseases || "None"}
                </td>
              </tr>
              <tr style={{borderBottom: "1px solid #eee"}}>
                <td
                  style={{
                    padding: "20px 24px",
                    fontWeight: 600,
                    backgroundColor: "#f9f9f9",
                    fontSize: "16px",
                  }}
                >
                  Drug Allergies
                </td>
                <td
                  style={{
                    padding: "20px 24px",
                    fontSize: "16px",
                  }}
                >
                  {healthDeclaration.drugAllergies || "None"}
                </td>
              </tr>
              <tr style={{borderBottom: "1px solid #eee"}}>
                <td
                  style={{
                    padding: "20px 24px",
                    fontWeight: 600,
                    backgroundColor: "#f9f9f9",
                    fontSize: "16px",
                  }}
                >
                  Food Allergies
                </td>
                <td
                  style={{
                    padding: "20px 24px",
                    fontSize: "16px",
                  }}
                >
                  {healthDeclaration.foodAllergies || "None"}
                </td>
              </tr>
              <tr style={{borderBottom: "1px solid #eee"}}>
                <td
                  style={{
                    padding: "20px 24px",
                    fontWeight: 600,
                    backgroundColor: "#f9f9f9",
                    fontSize: "16px",
                  }}
                >
                  Notes
                </td>
                <td
                  style={{
                    padding: "20px 24px",
                    fontSize: "16px",
                  }}
                >
                  {healthDeclaration.notes || "-"}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Vaccinations Section */}
          <div style={{padding: "20px 0px"}}>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "16px",
              }}
            >
              The vaccine has been administered
            </h2>

            {vaccinations.length > 0 ? (
              // Hiển thị khi có dữ liệu
              vaccinations.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: "16px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                    marginBottom: "12px",
                  }}
                >
                  <div style={{display: "flex", flexWrap: "wrap", gap: "16px"}}>
                    <div style={{minWidth: "200px"}}>
                      <div style={{fontWeight: "600", fontSize: "14px"}}>
                        Vaccine Name
                      </div>
                      <div>{item.vaccineName || "-"}</div>
                    </div>
                    <div style={{minWidth: "120px"}}>
                      <div style={{fontWeight: "600", fontSize: "14px"}}>
                        Dose Number
                      </div>
                      <div>{item.doseNumber}</div>
                    </div>
                    <div style={{minWidth: "150px"}}>
                      <div style={{fontWeight: "600", fontSize: "14px"}}>
                        Vaccinated Date
                      </div>
                      <div>{item.vaccinatedDate}</div>
                    </div>
                    <div style={{flex: "1"}}>
                      <div style={{fontWeight: "600", fontSize: "14px"}}>
                        Notes
                      </div>
                      <div>{item.notes || "-"}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Hiển thị khi không có dữ liệu
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  textAlign: "center",
                  color: "#999",
                }}
              >
                This student has never been vaccinated.
              </div>
            )}
          </div>

          {/* Back Button */}
          <div style={{padding: "20px 24px"}}>
            <Button
              type="default"
              onClick={() => navigate("/parent/health-declaration/my-children")}
              style={{
                borderRadius: "8px",
                height: "40px",
                padding: "0 24px",
                fontWeight: "500",
                boxShadow: "none",
                border: "1px solid #d9d9d9",
              }}
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeclarationDetail;
