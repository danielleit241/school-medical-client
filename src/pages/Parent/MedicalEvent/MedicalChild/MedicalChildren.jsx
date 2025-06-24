import React, {useEffect, useState} from "react";
import {useSelector, useDispatch} from "react-redux";
import axiosInstance from "../../../../api/axios";
import {setListStudentParent} from "../../../../redux/feature/listStudentParent";
import {useNavigate} from "react-router-dom";
import {User, Calendar, GraduationCap, Eye} from "lucide-react";

const MedicalChildren = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const parentId = useSelector((state) => state.user?.userId);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchApi = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/parents/${parentId}/students`
        );
        setData(response.data);
        dispatch(setListStudentParent(response.data));
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setData([]);
      }
    };
    fetchApi();
  }, [parentId, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <div
        className="w-[90%] h-[900px] rounded-2xl shadow-xl bg-white overflow-hidden"
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
            Medical Event
          </h1>
          <div
            style={{
              color: "#e0e7ff",
              fontSize: 20,
              fontWeight: 500,
            }}
          >
            View your children's medical event participation
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
          {data.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No Children Found
              </h3>
              <p className="text-gray-500">
                Your children information will appear here.
              </p>
            </div>
          ) : (
            <div
              className="animate__animated animate__fadeIn"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {data.map((item) => (
                <div
                  key={item.studentId}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                  style={{
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                    border: "1px solid #f0f0f0",
                    margin: "0 30px",
                    padding: "20px 24px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div className="flex items-center justify-between">
                    {/* Student Info Section - Left Side */}
                    <div
                      style={{
                        width: "25%",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #3058A4 0%, #2563eb 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 24,
                          color: "#fff",
                          marginRight: 16,
                          boxShadow: "0 2px 8px rgba(43, 93, 196, 0.2)",
                        }}
                      >
                        {item.fullName[0]}
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 16,
                            color: "#374151",
                            marginBottom: 4,
                          }}
                        >
                          {item.fullName}
                        </div>
                        <div style={{color: "#6B7280", fontSize: 13}}>
                          Student ID: {item.studentCode}
                        </div>
                      </div>
                    </div>
                    {/* Date & Class - Middle Section */}
                    <div
                      className="flex justify-center gap-40"
                      style={{width: "45%", paddingLeft: 20}}
                    >
                      {/* Date of Birth */}
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                          DATE OF BIRTH
                        </p>
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="text-blue-500 mr-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                            </span>
                          </div>
                          <div>
                            <p className="text-[16px] font-medium text-gray-800 m-0">
                              {item.dayOfBirth}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Class */}
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                          CLASS
                        </p>
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="text-purple-500 mr-2">
                              <GraduationCap className="w-4 h-4 text-purple-600" />
                            </span>
                          </div>
                          <div>
                            <p className="text-[16px] font-medium text-gray-800 m-0">
                              {item.grade.trim()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button - Right Section */}
                    <div
                      style={{
                        width: "30%",
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        className="flex items-center justify-center gap-1.5 transition-all duration-200"
                        style={{
                          background:
                            "linear-gradient(135deg, #3058A4 0%, #2563eb 100%)",
                          border: "none",
                          borderRadius: 8,
                          height: 42,
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#ffffff",
                          padding: "0 20px",
                          boxShadow: "0 2px 10px rgba(43, 93, 196, 0.25)",
                        }}
                        onClick={() => {
                          localStorage.setItem("studentId", item.studentId);
                          navigate(
                            "/parent/medical-event/children-event-list",
                            {
                              state: {student: item},
                            }
                          );
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        View Events
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalChildren;
