import React from "react";
import * as XLSX from "xlsx";
import { axiosFormData } from "../../../../api/axios";
import { Button, Upload, Alert } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import 'antd/dist/reset.css';

const AddInventory = () => {
  const [data, setData] = React.useState([]);
  const [fileList, setFileList] = React.useState([]);
  const [uploading, setUploading] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState(false);
  const [showErrorAlert, setShowErrorAlert] = React.useState(false);

  const handleBeforeUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const Str = e.target.result;
      const workbook = XLSX.read(Str, { type: "binary" });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setData(jsonData);
    }
    reader.readAsBinaryString(file);
    setFileList([file]);
    return false; 
  }

  const handleRemove = () => {  
    setFileList([]);
    setData([]);
  }

  const handleUpload = async () => {
    if (fileList.length === 0) {
      return;
    }
    const formData = new FormData();
    formData.append("file", fileList[0]);
    setUploading(true);
    try {
      const response = await axiosFormData.post("/medical-inventories/upload-excel", formData);
      console.log("Upload response:", response.data.items);
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
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

  // Hàm chuyển serial Excel date sang yyyy-MM-dd
  const excelDateToString = (serial) => {
    if (!serial || isNaN(serial)) return serial;
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400; 
    const date_info = new Date(utc_value * 1000);
    const yyyy = date_info.getUTCFullYear();
    const mm = String(date_info.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date_info.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div className="container">
      <h3 style={{ marginBottom: 16 }}>Import file Medical Inventory here</h3>
      <Upload
        beforeUpload={handleBeforeUpload}
        onRemove={handleRemove}
        fileList={fileList}
        maxCount={1}
      >
        <Button icon={<UploadOutlined />}>Choose file Excel</Button>
      </Upload>

      {data.length > 0 && (() => {
        // Xác định số cột lớn nhất
        const columnCount = data.reduce((max, row) => Math.max(max, row.length), 0);
        // Xác định các cột hợp lệ (ít nhất một dòng có giá trị khác rỗng)
        const validColIndexes = [];
        for (let col = 0; col < columnCount; col++) {
          if (data.some(row => row[col] !== undefined && row[col] !== null && String(row[col]).trim() !== "")) {
            validColIndexes.push(col);
          }
        }
        // Tìm chỉ số cột ExpiryDate (nếu có)
        const header = data[0] || [];
        const expiryDateCol = header.findIndex(
          h => String(h).toLowerCase().includes("expirydate")
        );

        // Lọc bỏ row mà tất cả các cột hợp lệ đều rỗng (giữ lại header)
        const filteredData = data.filter((row, rowIndex) =>
          rowIndex === 0 ||
          validColIndexes.some(colIdx =>
            row[colIdx] !== undefined && row[colIdx] !== null && String(row[colIdx]).trim() !== ""
          )
        );

        return (
          <table border="1" style={{ marginTop: 16, borderCollapse: "collapse" }}>
            <tbody>
              {filteredData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {validColIndexes.map(colIdx => (
                    <td key={colIdx} style={{ padding: 4, border: "1px solid #ccc" }}>
                      {(colIdx === expiryDateCol && rowIndex !== 0)
                        ? excelDateToString(row[colIdx])
                        : (row[colIdx] !== undefined ? row[colIdx] : "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      })()}

      {data.length > 0 && (
        <Button
          type="primary"
          onClick={handleUpload}
          disabled={fileList.length === 0}
          loading={uploading}
          style={{ marginTop: 16 }}
        >
          {uploading ? "uploading..." : "Uploaded"}
        </Button>
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

export default AddInventory;
