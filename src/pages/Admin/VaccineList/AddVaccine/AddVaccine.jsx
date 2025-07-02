import React, { useState} from "react";
import * as XLSX from "xlsx";
import {axiosFormData} from "../../../../api/axios";
import {Button, Upload, Alert} from "antd";
import {UploadOutlined} from "@ant-design/icons";
import "antd/dist/reset.css";
const AddVaccine = () => {
  const [data, setData] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);


  const handleBeforeUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const Str = e.target.result;
      const workbook = XLSX.read(Str, {type: "binary"});
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
      setData(jsonData);
    };
    reader.readAsBinaryString(file);
    setFileList([file]);
    return false;
  };

  const handleRemove = () => {
    setFileList([]);
    setData([]);
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      return;
    }
    const formData = new FormData();
    formData.append("file", fileList[0]);
    setUploading(true);
    try {
      const res = await axiosFormData.post("/vaccines/upload-excel", formData);
      console.log("Upload response:", res.data.items);
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      window.location.reload();
      setFileList([]);
      setData([]);
    } catch (error) {
      console.error("Upload error:", error);
      setShowErrorAlert(true);
      setTimeout(() => {
        setShowErrorAlert(false);
      }, 3000);
    } finally {
      setUploading(false);
    }
  };

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

  return (
    <div>
      <h2 style={{marginBottom: 16}}>Import file Vaccination Inventory here</h2>
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
          showUploadList={false} // Ẩn danh sách file mặc định
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
          {uploading ? "uploading..." : "Upload"}
        </Button>
        {fileList.length > 0 && (
          <span style={{color: "#555", fontSize: 14, wordBreak: "break-all"}}>
            <span style={{marginRight: 4, color: "#888"}}>
              <UploadOutlined />
            </span>
            {fileList[0].name}
          </span>
        )}
      </div>

      {data.length > 0 &&
        (() => {
          // Xác định số cột lớn nhất
          const columnCount = data.reduce(
            (max, row) => Math.max(max, row.length),
            0
          );
          // Xác định các cột hợp lệ (ít nhất một dòng có giá trị khác rỗng)
          const validColIndexes = [];
          for (let col = 0; col < columnCount; col++) {
            if (
              data.some(
                (row) =>
                  row[col] !== undefined &&
                  row[col] !== null &&
                  String(row[col]).trim() !== ""
              )
            ) {
              validColIndexes.push(col);
            }
          }
          // Tìm chỉ số cột ExpirationDate (nếu có)
          const header = data[0] || [];
          const expirationDateCol = header.findIndex((h) =>
            String(h).toLowerCase().includes("expirationdate")
          );

          // Lọc bỏ row mà tất cả các cột hợp lệ đều rỗng (giữ lại header)
          const filteredData = data.filter(
            (row, rowIndex) =>
              rowIndex === 0 ||
              validColIndexes.some(
                (colIdx) =>
                  row[colIdx] !== undefined &&
                  row[colIdx] !== null &&
                  String(row[colIdx]).trim() !== ""
              )
          );

          return (
            <table
              border="1"
              style={{marginTop: 16, borderCollapse: "collapse"}}
            >
              <tbody>
                {filteredData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {validColIndexes.map((colIdx) => (
                      <td
                        key={colIdx}
                        style={{padding: 4, border: "1px solid #ccc"}}
                      >
                        {colIdx === expirationDateCol && rowIndex !== 0
                          ? excelDateToString(row[colIdx])
                          : row[colIdx] !== undefined
                          ? row[colIdx]
                          : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          );
        })()}

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

export default AddVaccine;
