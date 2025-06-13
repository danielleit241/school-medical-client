import {useEffect, useState} from "react";
import {useSelector, useDispatch} from "react-redux";
import axiosInstance from "../../../../api/axios";
import {useNavigate} from "react-router-dom";
import {setListStudentParentPersist} from "../../../../redux/feature/listStudentPersist";
import {
  User,
  Calendar,
  GraduationCap,
  Shield,
  Eye,
  CheckCircle,
} from "lucide-react";

const MyChildren = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const parentId = useSelector((state) => state.user?.userId);
  const [data, setData] = useState([]);
  const [declarationMap, setDeclarationMap] = useState({});

  useEffect(() => {
    const fetchApi = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/parents/${parentId}/students`
        );
        setData(response.data);
        localStorage.setItem("students", JSON.stringify(response.data));
        dispatch(setListStudentParentPersist(response.data));
        response.data.forEach(async (item) => {
          try {
            const res = await axiosInstance.get(
              `/api/students/${item.studentId}/health-declarations`
            );
            setDeclarationMap((prev) => ({
              ...prev,
              [item.studentId]:
                res.data.healthDeclaration?.isDeclaration || false,
            }));
          } catch {
            setDeclarationMap((prev) => ({
              ...prev,
              [item.studentId]: false,
            }));
          }
        });
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
          }}
        >
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
            Medication Registration
          </h1>
          <div
            style={{
              color: "#e0e7ff",
              fontSize: 20,
              fontWeight: 500,
            }}
          >
            Manage your children's health declarations
          </div>
        </div>

        {/* Content */}
        <div
          className="px-10 py-8"
          style={{
            maxHeight: "650px", // hoặc giá trị phù hợp với thiết kế của bạn
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 p-5">
              {data.map((item) => (
                <div
                  key={item.studentId}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 flex flex-col "
                  style={{minHeight: 320}}
                >
                  {/* Card Header */}
                  <div
                    className=""
                    style={{
                      padding: "20px",
                      background:
                        "linear-gradient(90deg, #3058A4 0%, #3058A4 100%)",
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {item.fullName}
                        </h3>
                        <p className="text-blue-100 text-sm">
                          Student ID: {item.studentCode}
                        </p>
                      </div>
                      {declarationMap[item.studentId] ? (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow">
                          <CheckCircle className="w-3 h-3" />
                          Declared
                        </span>
                      ) : (
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow">
                          <Shield className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex-1 flex flex-col justify-between p-5">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Date of Birth
                          </p>
                          <p className="text-sm font-medium text-gray-800">
                            {item.dayOfBirth}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <GraduationCap className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Class
                          </p>
                          <p className="text-sm font-medium text-gray-800">
                            {item.grade.trim()}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      {!declarationMap[item.studentId] && (
                        <button
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2 shadow"
                          style={{
                            background:
                              "linear-gradient(90deg, #2563eb 0%, #a21caf 100%)",
                            border: "none",
                          }}
                          onClick={() => {
                            localStorage.setItem(
                              "selectedStudent",
                              JSON.stringify({
                                studentId: item.studentId,
                                fullName: item.fullName,
                              })
                            );
                            navigate(
                              `/parent/health-declaration/declaration-form`,
                              {
                                state: {
                                  studentId: item.studentId,
                                  fullName: item.fullName,
                                },
                              }
                            );
                          }}
                        >
                          <Shield className="w-4 h-4" />
                          Declare
                        </button>
                      )}

                      <button
                        className={`${
                          declarationMap[item.studentId]
                            ? "flex-1"
                            : "flex-none"
                        } bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2`}
                        style={{
                          backgroundColor: "#f3f4f6",
                          color: "#374151",
                          border: "none",
                          borderRadius: "0.375rem",
                        }}
                        onClick={() => {
                          localStorage.setItem(
                            "selectedStudent",
                            JSON.stringify({
                              studentId: item.studentId,
                              fullName: item.fullName,
                            })
                          );
                          navigate(`/parent/health-declaration/detail`, {
                            state: {
                              studentId: item.studentId,
                              fullName: item.fullName,
                            },
                          });
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        Details
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

export default MyChildren;
