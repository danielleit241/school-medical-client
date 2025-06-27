import React, {useState} from "react";
import * as XLSX from "xlsx";
import {axiosFormData} from "../../../../api/axios";
import {Button, Upload, Alert, Input} from "antd";
import {UploadOutlined} from "@ant-design/icons";
import "antd/dist/reset.css";

const AddStudent = () => {
  const [data, setData] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [editableData, setEditableData] = useState([]);

  const handleBeforeUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const Str = e.target.result;
      const workbook = XLSX.read(Str, {type: "binary"});
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
      setData(jsonData);

      if (jsonData.length > 1) {
        setEditableData(jsonData.slice(1).map((row) => [...row]));
      } else {
        setEditableData([]);
      }
    };
    reader.readAsBinaryString(file);
    setFileList([file]);
    return false;
  };

  const handleRemove = () => {
    setFileList([]);
    setData([]);
    setEditableData([]);
  };

  const handleInputChange = (rowIdx, colIdx, value) => {
    setEditableData((prev) => {
      const newData = [...prev];
      newData[rowIdx] = [...newData[rowIdx]];
      newData[rowIdx][colIdx] = value;
      return newData;
    });
  };

  //Chuyển số serial Excel sang định dạng ngày yyyy-MM-dd
  const excelDateToString = (serial) => {
    if (!serial || isNaN(serial)) return serial;
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    const yyyy = date_info.getUTCFullYear();
    const mm = String(date_info.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(date_info.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Định dạng ô trước khi upload để đảm bảo dữ liệu ngày tháng chuẩn
  const formatCellForUpload = (value, colName) => {
    const isDateCol = ["dayofbirth", "dateofbirth", "dob", "birthdate"].some(
      (keyword) => String(colName).toLowerCase().includes(keyword)
    );

    if (isDateCol) {
      if (!isNaN(value)) {
        // Trường hợp serial Excel
        const date = new Date(Math.round((value - 25569) * 86400 * 1000));
        if (!isNaN(date)) {
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          return `${yyyy}-${mm}-${dd}`;
        }
      } else {
        // Trường hợp chuỗi ngày hợp lệ
        const date = new Date(value);
        if (!isNaN(date)) {
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          return `${yyyy}-${mm}-${dd}`;
        }
      }
    }

    return value;
  };

  const handleUpload = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token || fileList.length === 0) return;

    const formData = new FormData();

    // Nếu có chỉnh sửa
    if (data.length > 0 && editableData.length > 0) {
      const headers = data[0];
      const formattedEditableData = editableData.map((row) =>
        row.map((cell, colIdx) => formatCellForUpload(cell, headers[colIdx]))
      );
      const newSheet = [headers, ...formattedEditableData];
      const ws = XLSX.utils.aoa_to_sheet(newSheet);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const wbout = XLSX.write(wb, {bookType: "xlsx", type: "array"});
      const newFile = new File([wbout], fileList[0].name, {
        type: fileList[0].type,
      });

      formData.append("file", newFile);
    } else {
      // Nếu không chỉnh sửa
      formData.append("file", fileList[0]);
    }

    setUploading(true);
    try {
      const response = await axiosFormData.post(
        "/students/upload-excel",
        formData
      );
      console.log("Upload response:", response);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      setFileList([]);
      setData([]);
      setEditableData([]);
    } catch (error) {
      console.error("Upload failed:", error);
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2 style={{marginBottom: 16}}>Import file Student here</h2>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 8,
        }}
      >
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
          style={{minWidth: 100}}
        >
          {uploading ? "Uploading..." : "Upload"}
        </Button>
        {fileList.length > 0 && (
          <span style={{color: "#555", fontSize: 14, wordBreak: "break-all"}}>
            <UploadOutlined style={{marginRight: 4, color: "#888"}} />
            {fileList[0].name}
          </span>
        )}
      </div>

      {/* Bảng chỉnh sửa dữ liệu */}
      {data.length > 0 && (
        <div style={{overflowX: "auto"}}>
          <table
            border="1"
            style={{marginTop: 16, borderCollapse: "collapse", minWidth: 600}}
          >
            <thead>
              <tr>
                {data[0].map((header, idx) => (
                  <th key={idx} style={{padding: 6, background: "#f5f5f5"}}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(editableData.length > 0 ? editableData : data.slice(1)).map(
                (row, rowIdx) => (
                  <tr key={rowIdx}>
                    {row.map((cell, colIdx) => {
                      const header = data[0][colIdx];
                      const isDateCol =
                        header &&
                        ["dayofbirth", "dateofbirth", "dob", "birthdate"].some(
                          (keyword) =>
                            String(header).toLowerCase().includes(keyword)
                        );
                      return (
                        <td key={colIdx} style={{padding: 4}}>
                          <Input
                            value={isDateCol ? excelDateToString(cell) : cell}
                            onChange={(e) =>
                              handleInputChange(rowIdx, colIdx, e.target.value)
                            }
                            size="small"
                          />
                        </td>
                      );
                    })}
                  </tr>
                )
              )}
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
