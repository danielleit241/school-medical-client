import React, { useState } from "react";
import * as XLSX from "xlsx";
import { axiosFormData } from "../../../../api/axios";
import { Button, Upload, Alert, Input } from "antd"; 
import { UploadOutlined } from "@ant-design/icons";
import 'antd/dist/reset.css';

const AddStudent = () => {
  const [data, setData] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  // Thêm state để lưu dữ liệu có thể chỉnh sửa
  const [editableData, setEditableData] = useState([]);

  const handleBeforeUpload = (file) => {
    // Đọc file Excel để show dữ liệu
    const reader = new FileReader();
    reader.onload = (e) => {
      const Str = e.target.result;
      console.log("File content:", Str); // In nội dung file để kiểm tra
      const workbook = XLSX.read(Str, { type: "binary" });
      console.log("Workbook:", workbook); // In workbook để kiểm tra
      const worksheetName = workbook.SheetNames[0];
      console.log("Worksheet name:", worksheetName); // In tên worksheet để kiểm tra
      const worksheet = workbook.Sheets[worksheetName];
      console.log("Worksheet data:", worksheet); // In dữ liệu worksheet để kiểm tra
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setData(jsonData);
      console.log("Parsed data:", jsonData); // In dữ liệu đã parse để kiểm tra

      // Chuyển dữ liệu thành dạng editable (bỏ header)
      if (jsonData.length > 1) {
        setEditableData(jsonData.slice(1).map(row => [...row]));
      } else {
        setEditableData([]);
      }
    };
    reader.readAsBinaryString(file);

    // Cập nhật fileList theo dạng mảng 1 file (ghi đè file cũ)
    setFileList([file]);

    // Return false để không tự động upload của antd
    return false;
  };

  const handleRemove = () => {
    setFileList([]);
    setData([]);
    setEditableData([]);
  };

  // Xử lý thay đổi input
  const handleInputChange = (rowIdx, colIdx, value) => {
    setEditableData(prev => {
      const newData = [...prev];
      newData[rowIdx] = [...newData[rowIdx]];
      newData[rowIdx][colIdx] = value;
      return newData;
    });
  };

  const handleUpload = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return;
    }
    if (fileList.length === 0) {
      return;
    }

    // Tạo file Excel mới từ dữ liệu đã chỉnh sửa
    if (data.length > 0 && editableData.length > 0) {
      const newSheet = [data[0], ...editableData];
      const ws = XLSX.utils.aoa_to_sheet(newSheet);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const newFile = new File([wbout], fileList[0].name, { type: fileList[0].type });

      const formData = new FormData();
      formData.append("file", newFile);

      setUploading(true);
      try {
        const response = await axiosFormData.post("/students/upload-excel", formData);
        console.log("Upload response:", response.data.items);
        setShowAlert(true); // Hiện alert thành công
        setTimeout(() => setShowAlert(false), 3000); // Ẩn alert sau 3s
        setFileList([]);
        setData([]);
        setEditableData([]);
      } catch (error) {
        console.error("Upload failed:", error);
        setShowErrorAlert(true); // Hiện alert thất bại
        setTimeout(() => setShowErrorAlert(false), 3000); // Ẩn alert sau 3s
      } finally {
        setUploading(false);
      }
      return;
    }

    // Nếu không có chỉnh sửa, upload file gốc
    const formData = new FormData();
    formData.append("file", fileList[0]);
    setUploading(true);
    try {
      const response = await axiosFormData.post("/students/upload-excel", formData);
      console.log("Upload response:", response.data.items);
      setShowAlert(true); // Hiện alert thành công
      setTimeout(() => setShowAlert(false), 3000); // Ẩn alert sau 3s
      setFileList([]);
      setData([]);
      setEditableData([]);
    } catch (error) {
      console.error("Upload failed:", error);
      setShowErrorAlert(true); // Hiện alert thất bại
      setTimeout(() => setShowErrorAlert(false), 3000); // Ẩn alert sau 3s
    } finally {
      setUploading(false);
    }
  };
   return (
      <div className="container">
        <h3 style={{ marginBottom: 16 }}>Import file Student here</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <Upload
            beforeUpload={handleBeforeUpload}
            onRemove={handleRemove}
            fileList={fileList}
            maxCount={1}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Choose file Excel</Button>
          </Upload>
          <Button
            type="primary"
            onClick={handleUpload}
            disabled={fileList.length === 0}
            loading={uploading}
            style={{ minWidth: 100 }}
          >
            {uploading ? "uploading..." : "Upload"}
          </Button>
          {fileList.length > 0 && (
            <span style={{ color: "#555", fontSize: 14, wordBreak: "break-all" }}>
              <span style={{ marginRight: 4, color: "#888" }}>
                <UploadOutlined />
              </span>
              {fileList[0].name}
            </span>
          )}
        </div>

        {/* Hiển thị form editable */}
        {data.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table border="1" style={{ marginTop: 16, borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr>
                  {data[0].map((header, idx) => (
                    <th key={idx} style={{ padding: 6, background: "#f5f5f5" }}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {editableData.length > 0
                  ? editableData.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, colIdx) => (
                        <td key={colIdx} style={{ padding: 4 }}>
                          <Input
                            value={cell}
                            onChange={e => handleInputChange(rowIdx, colIdx, e.target.value)}
                            size="small"
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                  : data.slice(1).map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, colIdx) => (
                        <td key={colIdx} style={{ padding: 4 }}>
                          <Input
                            value={cell}
                            onChange={e => handleInputChange(rowIdx, colIdx, e.target.value)}
                            size="small"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {showAlert && (
          <Alert
            message="Upload successful!"
            type="success"
            closable
            style={{
              position: "fixed",
              top: 120,
              right: 0,
              width: 300,
              zIndex: 9999,
            }}
            onClose={() => setShowAlert(false)}
          />
        )}

        {showErrorAlert && (
          <Alert
            message="Upload failed!"
            type="error"
            closable
            style={{
              position: "fixed",
              top: 120,
              right: 0,
              width: 300,
              zIndex: 9999,
            }}
            onClose={() => setShowErrorAlert(false)}
          />
        )}
      </div>
    );
};

export default AddStudent;
