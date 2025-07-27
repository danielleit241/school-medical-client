import React from "react";
import "../index.scss"; // Import the styles for QuickMenus component

const QuickMenus = ({onMenuSelect, chatHistory}) => {
  const quickMenus = [
    {
      id: "health-profile",
      title: "Hồ sơ sức khỏe",
      icon: "👤",
      questions: [
        "Làm thế nào để thêm hồ sơ sức khỏe cho con?",
        "Tôi có thể chỉnh sửa thông tin sức khỏe của con không?",
      ],
    },
    {
      id: "personal-info",
      title: "Thông tin cá nhân",
      icon: "✏️",
      questions: [
        "Làm sao để thay đổi số điện thoại và địa chỉ?",
        "Thông tin thay đổi có được cập nhật ngay không?",
      ],
    },
    {
      id: "notifications",
      title: "Thông báo y tế",
      icon: "🔔",
      questions: [
        "Khi nào tôi nhận được thông báo về hồ sơ sức khỏe?",
        "Tôi phải làm gì nếu không nhận được thông báo?",
      ],
    },
    {
      id: "appointment",
      title: "Đặt lịch khám",
      icon: "📅",
      questions: [
        "Làm thế nào để đặt lịch tư vấn với nhân viên y tế?",
        "Tôi có thể chọn nhân viên y tế cụ thể không?",
      ],
    },
    {
      id: "vaccination",
      title: "Lịch sử tiêm chủng",
      icon: "💉",
      questions: [
        "Làm sao để xem lịch sử tiêm chủng của con?",
        "Tôi cần báo cho ai nếu thiếu thông tin tiêm chủng?",
      ],
    },
    {
      id: "emergency",
      title: "Tình huống khẩn cấp",
      icon: "🚨",
      questions: [
        "Con tôi bị sốt tại trường",
        "Con tôi có phản ứng sau tiêm chủng",
      ],
    },
  ];

  // Chỉ hiển thị menu khi chưa có cuộc hội thoại (chỉ có tin nhắn chào)
  const shouldShowMenu = chatHistory.length <= 1;

  if (!shouldShowMenu) return null;

  return (
    <div className="quick-menus">
      <p className="quick-menus-title">Chọn chủ đề bạn quan tâm:</p>
      <div className="menu-grid">
        {quickMenus.map((menu) => (
          <div key={menu.id} className="menu-category">
            <div className="menu-header">
              <span className="menu-icon">{menu.icon}</span>
              <span className="menu-title">{menu.title}</span>
            </div>
            <div className="menu-questions">
              {menu.questions.map((question, index) => (
                <button
                  key={index}
                  className="quick-question-btn"
                  onClick={() => onMenuSelect(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickMenus;
