import React from "react";
import "../index.scss"; // Import the styles for QuickMenus component

const QuickMenus = ({onMenuSelect, chatHistory}) => {
  const quickMenus = [
    {
      id: "health-profile",
      title: "Health Profile",
      icon: "👤",
      questions: [
        "How to add a health profile for my child?",
        "Can I edit my child's health information?",
      ],
    },
    {
      id: "personal-info",
      title: "Personal Information",
      icon: "✏️",
      questions: [
        "How to change phone number and address?",
        "Will the information be updated immediately?",
      ],
    },
    {
      id: "notifications",
      title: "Medical Notifications",
      icon: "🔔",
      questions: [
        "When will I receive notifications about health records?",
        "What should I do if I don't receive notifications?",
      ],
    },
    {
      id: "appointment",
      title: "Appointment Booking",
      icon: "📅",
      questions: [
        "How to schedule a consultation with medical staff?",
        "Can I choose a specific medical staff member?",
      ],
    },
    {
      id: "vaccination",
      title: "Vaccination History",
      icon: "💉",
      questions: [
        "How to view my child's vaccination history?",
        "Who should I report to if vaccination information is missing?",
      ],
    },
    {
      id: "emergency",
      title: "Emergency Situations",
      icon: "🚨",
      questions: [
        "My child has a fever at school",
        "My child had a reaction after vaccination",
      ],
    },
  ];

  // Chỉ hiển thị menu khi chưa có cuộc hội thoại (chỉ có tin nhắn chào)
  const shouldShowMenu = chatHistory.length <= 1;

  if (!shouldShowMenu) return null;

  return (
    <div className="quick-menus">
      <p className="quick-menus-title">Choose a topic you're interested in:</p>
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
