"use client"

import { useState, useEffect, useRef } from "react"

const ContactModal = ({ type, onClose, contactInfo }) => {
  const [isClosing, setIsClosing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    reason: "",
    message: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const modalRef = useRef(null)

  useEffect(() => {
    // Close modal on escape key
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }

    // Close modal when clicking outside
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        handleClose()
      }
    }

    // Set today as the minimum date for appointment
    const today = new Date().toISOString().split("T")[0]
    if (document.getElementById("appointment-date")) {
      document.getElementById("appointment-date").min = today
    }

    document.addEventListener("keydown", handleEscape)
    document.addEventListener("mousedown", handleClickOutside)
    document.body.style.overflow = "hidden" // Prevent scrolling when modal is open

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset" // Re-enable scrolling when modal is closed
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = "Name is required"
    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid"
    }

    if (type === "appointment") {
      if (!formData.phone.trim()) errors.phone = "Phone number is required"
      if (!formData.date) errors.date = "Date is required"
      if (!formData.time) errors.time = "Time is required"
      if (!formData.reason.trim()) errors.reason = "Reason is required"
    } else {
      if (!formData.message.trim()) errors.message = "Message is required"
    }

    return errors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitSuccess(true)
      // Close modal after successful submission
      setTimeout(() => {
        handleClose()
      }, 2000)
    }, 1500)
  }

  const keyframes = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(50px) scale(0.9);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    @keyframes slideDown {
      from { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      to { 
        opacity: 0;
        transform: translateY(50px) scale(0.9);
      }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `

  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(5px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      animation: isClosing ? "fadeOut 0.3s ease-out" : "fadeIn 0.3s ease-out",
    },
    modal: {
      backgroundColor: "white",
      borderRadius: "16px",
      maxWidth: "500px",
      width: "100%",
      maxHeight: "90vh",
      overflow: "auto",
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.1)",
      animation: isClosing ? "slideDown 0.3s ease-out" : "slideUp 0.3s ease-out",
      position: "relative",
    },
    modalHeader: {
      padding: "1.5rem",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    modalTitle: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "#1e3a8a",
    },
    closeButton: {
      backgroundColor: "transparent",
      border: "none",
      fontSize: "1.5rem",
      cursor: "pointer",
      color: "#6b7280",
      transition: "all 0.3s ease",
    },
    modalBody: {
      padding: "1.5rem",
    },
    formGroup: {
      marginBottom: "1.25rem",
    },
    formLabel: {
      display: "block",
      marginBottom: "0.5rem",
      fontSize: "0.95rem",
      fontWeight: "500",
      color: "#4b5563",
    },
    formInput: {
      width: "100%",
      padding: "0.75rem 1rem",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      fontSize: "1rem",
      transition: "all 0.3s ease",
    },
    formInputFocus: {
      borderColor: "#2563eb",
      boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
      outline: "none",
    },
    formSelect: {
      width: "100%",
      padding: "0.75rem 1rem",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      appearance: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 1rem center",
      backgroundSize: "16px 12px",
    },
    formTextarea: {
      width: "100%",
      padding: "0.75rem 1rem",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      fontSize: "1rem",
      minHeight: "120px",
      resize: "vertical",
      transition: "all 0.3s ease",
    },
    formError: {
      color: "#ef4444",
      fontSize: "0.85rem",
      marginTop: "0.5rem",
    },
    formButton: {
      backgroundColor: "#355383",
      color: "white",
      border: "none",
      padding: "0.75rem 1.5rem",
      borderRadius: "8px",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      marginTop: "1rem",
    },
    formButtonHover: {
      backgroundColor: "#1d4ed8",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
    },
    formButtonDisabled: {
      backgroundColor: "#93c5fd",
      cursor: "not-allowed",
    },
    formSuccess: {
      backgroundColor: "#10b981",
      color: "white",
      padding: "1rem",
      borderRadius: "8px",
      textAlign: "center",
      marginTop: "1rem",
      animation: "pulse 2s infinite",
    },
    formRow: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "1rem",
    },
    modalFooter: {
      padding: "1rem 1.5rem",
      borderTop: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    contactInfo: {
      fontSize: "0.9rem",
      color: "#6b7280",
    },
    contactInfoHighlight: {
      color: "#2563eb",
      fontWeight: "600",
    },
  }

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.overlay}>
        <div style={styles.modal} ref={modalRef}>
          <div style={styles.modalHeader}>
            <h3 style={styles.modalTitle}>{type === "appointment" ? "Book an Appointment" : "Send a Message"}</h3>
            <button
              style={styles.closeButton}
              onClick={handleClose}
              onMouseEnter={(e) => {
                e.target.style.color = "#ef4444"
                e.target.style.transform = "rotate(90deg)"
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#6b7280"
                e.target.style.transform = "rotate(0)"
              }}
            >
              ×
            </button>
          </div>

          <div style={styles.modalBody}>
            {submitSuccess ? (
              <div style={styles.formSuccess}>
                {type === "appointment"
                  ? "Your appointment has been scheduled successfully!"
                  : "Your message has been sent successfully!"}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                  <label htmlFor="name" style={styles.formLabel}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={{
                      ...styles.formInput,
                      borderColor: formErrors.name ? "#ef4444" : "#e5e7eb",
                    }}
                    onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                    onBlur={(e) => {
                      e.target.style.borderColor = formErrors.name ? "#ef4444" : "#e5e7eb"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                  {formErrors.name && <div style={styles.formError}>{formErrors.name}</div>}
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="email" style={styles.formLabel}>
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{
                      ...styles.formInput,
                      borderColor: formErrors.email ? "#ef4444" : "#e5e7eb",
                    }}
                    onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                    onBlur={(e) => {
                      e.target.style.borderColor = formErrors.email ? "#ef4444" : "#e5e7eb"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                  {formErrors.email && <div style={styles.formError}>{formErrors.email}</div>}
                </div>

                {type === "appointment" ? (
                  <>
                    <div style={styles.formGroup}>
                      <label htmlFor="phone" style={styles.formLabel}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        style={{
                          ...styles.formInput,
                          borderColor: formErrors.phone ? "#ef4444" : "#e5e7eb",
                        }}
                        onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                        onBlur={(e) => {
                          e.target.style.borderColor = formErrors.phone ? "#ef4444" : "#e5e7eb"
                          e.target.style.boxShadow = "none"
                        }}
                      />
                      {formErrors.phone && <div style={styles.formError}>{formErrors.phone}</div>}
                    </div>

                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label htmlFor="date" style={styles.formLabel}>
                          Preferred Date
                        </label>
                        <input
                          type="date"
                          id="appointment-date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          style={{
                            ...styles.formInput,
                            borderColor: formErrors.date ? "#ef4444" : "#e5e7eb",
                          }}
                          onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                          onBlur={(e) => {
                            e.target.style.borderColor = formErrors.date ? "#ef4444" : "#e5e7eb"
                            e.target.style.boxShadow = "none"
                          }}
                        />
                        {formErrors.date && <div style={styles.formError}>{formErrors.date}</div>}
                      </div>

                      <div style={styles.formGroup}>
                        <label htmlFor="time" style={styles.formLabel}>
                          Preferred Time
                        </label>
                        <input
                          type="time"
                          id="time"
                          name="time"
                          value={formData.time}
                          onChange={handleInputChange}
                          style={{
                            ...styles.formInput,
                            borderColor: formErrors.time ? "#ef4444" : "#e5e7eb",
                          }}
                          onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                          onBlur={(e) => {
                            e.target.style.borderColor = formErrors.time ? "#ef4444" : "#e5e7eb"
                            e.target.style.boxShadow = "none"
                          }}
                        />
                        {formErrors.time && <div style={styles.formError}>{formErrors.time}</div>}
                      </div>
                    </div>

                    <div style={styles.formGroup}>
                      <label htmlFor="reason" style={styles.formLabel}>
                        Reason for Visit
                      </label>
                      <select
                        id="reason"
                        name="reason"
                        value={formData.reason}
                        onChange={handleInputChange}
                        style={{
                          ...styles.formSelect,
                          borderColor: formErrors.reason ? "#ef4444" : "#e5e7eb",
                        }}
                        onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                        onBlur={(e) => {
                          e.target.style.borderColor = formErrors.reason ? "#ef4444" : "#e5e7eb"
                          e.target.style.boxShadow = "none"
                        }}
                      >
                        <option value="">Select a reason</option>
                        <option value="General Checkup">General Checkup</option>
                        <option value="Vaccination">Vaccination</option>
                        <option value="Illness">Illness</option>
                        <option value="Injury">Injury</option>
                        <option value="Mental Health">Mental Health</option>
                        <option value="Other">Other</option>
                      </select>
                      {formErrors.reason && <div style={styles.formError}>{formErrors.reason}</div>}
                    </div>
                  </>
                ) : (
                  <div style={styles.formGroup}>
                    <label htmlFor="message" style={styles.formLabel}>
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      style={{
                        ...styles.formTextarea,
                        borderColor: formErrors.message ? "#ef4444" : "#e5e7eb",
                      }}
                      onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                      onBlur={(e) => {
                        e.target.style.borderColor = formErrors.message ? "#ef4444" : "#e5e7eb"
                        e.target.style.boxShadow = "none"
                      }}
                    ></textarea>
                    {formErrors.message && <div style={styles.formError}>{formErrors.message}</div>}
                  </div>
                )}

                <button
                  type="submit"
                  style={{
                    ...styles.formButton,
                    ...(isSubmitting ? styles.formButtonDisabled : {}),
                  }}
                  disabled={isSubmitting}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) Object.assign(e.target.style, styles.formButtonHover)
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = isSubmitting ? "#93c5fd" : "#2563eb"
                    e.target.style.transform = "translateY(0)"
                    e.target.style.boxShadow = "none"
                  }}
                >
                  {isSubmitting ? "Processing..." : type === "appointment" ? "Schedule Appointment" : "Send Message"}
                </button>
              </form>
            )}
          </div>

          <div style={styles.modalFooter}>
            <div style={styles.contactInfo}>
              {type === "appointment" ? (
                <>
                  For urgent matters, please call <span style={styles.contactInfoHighlight}>{contactInfo.hotline}</span>
                </>
              ) : (
                <>
                  You can also email us directly at <span style={styles.contactInfoHighlight}>{contactInfo.email}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ContactModal
