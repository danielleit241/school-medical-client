import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import axiosInstance from "../../../../api/axios";
import {Card, Button, Tag, Pagination, Select, Spin} from "antd";
import {useNavigate} from "react-router-dom";

const MedicalRegistrationList = () => {
  const navigate = useNavigate();
  const parentId = useSelector((state) => state.user?.userId);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;
  const [filterStatus, setFilterStatus] = useState("all");
  const [showList, setShowList] = useState(false);
  const [dotIndex, setDotIndex] = useState(0);
  const [studentsData, setStudentsData] = useState({}); // Cache for student data
  const [loadingStudents, setLoadingStudents] = useState(false);

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
        const registrationsData = response.data.items || [];
        setData(registrationsData);
        setTotal(response.data.count || 0);

        // Extract unique student IDs
        const studentIds = [
          ...new Set(
            registrationsData
              .map((item) => item.student?.studentId)
              .filter(Boolean)
          ),
        ];

        // Fetch student details
        if (studentIds.length > 0) {
          await fetchStudentDetails(studentIds);
        }
      } catch (error) {
        setData([]);
        setTotal(0);
        console.error("Error fetching medical registrations:", error);
      }
    };

    if (parentId) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId, pageIndex, pageSize]);

  // Fetch student details for each student ID
  const fetchStudentDetails = async (studentIds) => {
    setLoadingStudents(true);
    try {
      // Create a map to store student data
      const studentsMap = {...studentsData};

      // Fetch only students that aren't in the cache
      const promises = studentIds
        .filter((id) => !studentsData[id])
        .map(async (studentId) => {
          try {
            const response = await axiosInstance.get(
              `/api/parents/${parentId}/students/${studentId}`
            );
            return {studentId, data: response.data};
          } catch (err) {
            console.error(
              `Error fetching details for student ${studentId}:`,
              err
            );
            return {studentId, data: null};
          }
        });

      const results = await Promise.all(promises);

      // Update the students map with new data
      results.forEach((result) => {
        if (result.data) {
          studentsMap[result.studentId] = result.data;
        }
      });

      setStudentsData(studentsMap);
    } catch (error) {
      console.error("Error fetching student details:", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Get student code from cache or fallback to original data
  const getStudentCode = (item) => {
    const studentId = item.student?.studentId;
    if (studentId && studentsData[studentId]) {
      return studentsData[studentId].studentCode || "N/A";
    }
    return item.student?.studentCode || "N/A";
  };

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

  // Get registration status - Thêm function mới
  const getRegistrationStatus = (item) => {
    const registration = item.medicalRegistration;

    // Nếu bị cancelled
    if (registration.status === false) {
      return {
        text: "Cancelled",
        color: "error",
        bgColor: "#fef2f2",
        textColor: "#dc2626",
        borderColor: "#fecaca",
      };
    }

    // Nếu chưa được approve
    if (registration.status === null || registration.status === undefined) {
      return {
        text: "Pending",
        color: "warning",
        bgColor: "#fffbeb",
        textColor: "#f59e0b",
        borderColor: "#fed7aa",
      };
    }

    // Nếu đã approve
    if (registration.status === true) {
      // Check xem đã complete hết dose chưa
      const allDoseCompleted = isAllDoseCompleted(item);
      if (allDoseCompleted) {
        return {
          text: "Completed",
          color: "success",
          bgColor: "#eff6ff",
          textColor: "#2563eb",
          borderColor: "#bfdbfe",
        };
      } else {
        return {
          text: "Approved",
          color: "processing",
          bgColor: "#ecfdf5",
          textColor: "#10b981",
          borderColor: "#a7f3d0",
        };
      }
    }

    // Default fallback
    return {
      text: "Unknown",
      color: "default",
      bgColor: "#f9fafb",
      textColor: "#6b7280",
      borderColor: "#d1d5db",
    };
  };

  const filteredData = data.filter((item) => {
    const registration = item.medicalRegistration;

    if (filterStatus === "pending") {
      return registration.status === null || registration.status === undefined;
    }
    if (filterStatus === "approved") {
      return registration.status === true && !isAllDoseCompleted(item);
    }
    if (filterStatus === "cancelled") {
      return registration.status === false;
    }
    if (filterStatus === "completed") {
      return registration.status === true && isAllDoseCompleted(item);
    }
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

        {/* Filter - Cập nhật options */}
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
            style={{width: 180}}
            onChange={setFilterStatus}
          >
            <Select.Option value="all">All</Select.Option>
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="approved">Approved</Select.Option>
            <Select.Option value="cancelled">Cancelled</Select.Option>
            <Select.Option value="completed">Completed</Select.Option>
          </Select>
        </div>

        {/* List */}
        <div style={{padding: "0 24px"}}>
          {!showList || loadingStudents ? (
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
              {loadingStudents && (
                <Spin size="large" style={{marginRight: 16}} />
              )}
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
                paddingRight: 8,
              }}
            >
              <div style={{display: "flex", flexDirection: "column", gap: 16}}>
                {filteredData.map((item) => {
                  const status = getRegistrationStatus(item);

                  return (
                    <Card
                      key={item.medicalRegistration.registrationId}
                      style={{
                        borderRadius: 12,
                        width: "100%",
                        boxShadow: "0 2px 8px #f0f1f2",
                        padding: 0,
                        border: `2px solid ${status.borderColor}`,
                      }}
                      bodyStyle={{padding: 20}}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        {/* Left section with avatar and student name */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 15,
                            width: "30%",
                          }}
                        >
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: "50%",
                              background:
                                "linear-gradient(180deg, #2B5DC4 0%, #2B5DC4 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: 22,
                              color: "#fff",
                            }}
                          >
                            {item.student?.studentFullName?.[0] || "U"}
                          </div>
                          <div>
                            <div style={{fontWeight: 700, fontSize: 18}}>
                              {item.student?.studentFullName}
                            </div>
                            <div style={{color: "#666", fontSize: 14}}>
                              Student ID: {getStudentCode(item)}
                            </div>
                          </div>
                        </div>

                        {/* Status and Details section (right aligned) */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 15,
                          }}
                        >
                          {/* Sử dụng custom status styling */}
                          <div
                            style={{
                              backgroundColor: status.bgColor,
                              color: status.textColor,
                              border: `2px solid ${status.textColor}`,
                              borderRadius: 18,
                              padding: "6px 16px",
                              fontSize: 13,
                              fontWeight: 700,
                              minWidth: 140,
                              textAlign: "center",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              height: 32,
                            }}
                          >
                            {status.text}
                          </div>

                          <Button
                            style={{
                              borderRadius: 8,
                              background: "#355383",
                              color: "#fff",
                              fontWeight: 600,
                              minWidth: 90,
                              height: 40,
                              border: "none",
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

                      {/* Medication and Dates section */}
                      <div
                        style={{
                          marginTop: 12,
                          display: "flex",
                          gap: 12,
                        }}
                      >
                        {/* Date badge */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "6px 14px",
                            backgroundColor: "#f0f7ff",
                            borderRadius: 8,
                          }}
                        >
                          <span style={{marginRight: 8, color: "#5b8cff"}}>
                            Date:
                          </span>
                          <span style={{color: "#355383", fontWeight: 500}}>
                            {item.medicalRegistration.dateSubmitted}
                          </span>
                        </div>

                        {/* Medication badge */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "6px 14px",
                            backgroundColor: "#fff9f6",
                            borderRadius: 8,
                          }}
                        >
                          <span style={{marginRight: 8, color: "#ff7d4d"}}>
                            Medication:
                          </span>
                          <span style={{color: "#ff7d4d", fontWeight: 500}}>
                            {item.medicalRegistration.medicationName ||
                              "No medication"}
                          </span>
                        </div>

                        {/* Dosages badge */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "6px 14px",
                            backgroundColor: "#f6f0ff",
                            borderRadius: 8,
                          }}
                        >
                          <span style={{marginRight: 8, color: "#a259e6"}}>
                            Dosages:
                          </span>
                          <span style={{color: "#a259e6", fontWeight: 500}}>
                            {item.medicalRegistration.totalDosages}
                          </span>
                        </div>
                      </div>

                      {/* Notes section - full width at bottom */}
                      <div
                        style={{
                          marginTop: 12,
                          paddingTop: 12,
                          borderTop: "1px solid #f0f0f0",
                          color: "#666",
                          fontSize: 14,
                        }}
                      >
                        <div style={{ marginBottom: 8, marginLeft: 4 }}>
                          <span style={{fontWeight: 600}}>Parent Notes: </span>
                          {item.medicalRegistration.notes || "No notes provided"}
                        </div>
                        {/* Thêm dòng Nurse Notes */}
                        <div style={{ 
                          backgroundColor: item.medicalRegistration.nurseNotes ? "#f0f9ff" : "#f9fafb",
                          padding: "8px 12px",
                          borderRadius: 6,
                          border: `1px solid ${item.medicalRegistration.nurseNotes ? "#bae6fd" : "#e5e7eb"}`,
                          marginTop: 8
                        }}>
                          <span style={{
                            fontWeight: 600, 
                            color: item.medicalRegistration.nurseNotes ? "#0c4a6e" : "#6b7280"
                          }}>
                            Nurse Notes: 
                          </span>
                          <span style={{ 
                            color: item.medicalRegistration.nurseNotes ? "#0c4a6e" : "#9ca3af", 
                            fontStyle: "italic" 
                          }}>
                            {item.medicalRegistration.nurseNotes || "No nurse notes"}
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
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
