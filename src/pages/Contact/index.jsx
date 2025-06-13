"use client"

import { useState, useEffect, useRef } from "react"
import ContactModal from "./ContactModal"
import {useNavigate} from "react-router-dom";
const Contact = () => {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState("message") // message or appointment
  const [activeCard, setActiveCard] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const mapRef = useRef(null)
  const headerRef = useRef(null)
  const cardsRef = useRef([])

  // Contact information
  const contactInfo = {
    name: "MEDICARE - School Medical Station of dtn2TT",
    description:
      "We are always ready to support the health of students, parents, and teachers. We listen to all feedback to improve the quality of school healthcare services.",
    hotline: "079-999-5828",
    email: "gcteam2023@gmail.com",
    address: "4/48 Medical St, Ho Chi Minh",
    hours: "Monday - Friday: 7:30 AM - 5:00 PM",
    socialMedia: [
      { name: "Facebook", icon: "📘", url: "#" },
      { name: "Twitter", icon: "📘", url: "#" },
      { name: "Instagram", icon: "📷", url: "#" },
    ],
  }


  useEffect(() => {

    // Parallax effect on scroll
    const handleScroll = () => {
      if (headerRef.current) {
        const scrollY = window.scrollY
        headerRef.current.style.transform = `translateY(${scrollY * 0.4}px)`
        headerRef.current.style.opacity = 1 - scrollY * 0.003
      }

      // Animate cards on scroll
      cardsRef.current.forEach((card) => {
        if (!card) return
        const rect = card.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight - 100
        if (isVisible) {
          card.style.opacity = "1"
          card.style.transform = "translateY(0)"
        }
      })
    }

    window.addEventListener("scroll", handleScroll)

    // Initialize map (simulated)
    if (mapRef.current) {
      // In a real application, you would initialize a map library here
      console.log("Map initialized")
    }

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

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
    if (!formData.message.trim()) errors.message = "Message is required"
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
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        })
        setSubmitSuccess(false)
      }, 3000)
    }, 2000)
  }

  const openModal = (type) => {
    setModalType(type)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const keyframes = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(50px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes shimmer {
      0% { background-position: -468px 0; }
      100% { background-position: 468px 0; }
    }
    
    @keyframes wave {
      0% { transform: translateX(-100%); }
      50% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
  `

  const styles = {
    container: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
    },
    backgroundPattern: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%232563eb' fillOpacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      opacity: 0.5,
      zIndex: -1,
    },
    header: {
      position: "relative",
      height: "400px",
      backgroundColor: "#355383",
      color: "white",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    },
    headerBackground: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: "#355383",
      zIndex: -1,
    },
    headerWave: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      height: "120px",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23f8fafc' fillOpacity='1' d='M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,181.3C960,181,1056,203,1152,202.7C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
    headerContent: {
      position: "relative",
      zIndex: 1,
      maxWidth: "800px",
      padding: "0 2rem",
      animation: "fadeIn 1s ease-out",
    },
    headerTitle: {
      fontSize: "3.5rem",
      fontWeight: "800",
      marginBottom: "1rem",
      textShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
    headerSubtitle: {
      fontSize: "1.25rem",
      fontWeight: "400",
      maxWidth: "600px",
      margin: "0 auto",
      lineHeight: "1.6",
    },
    headerIcons: {
      position: "absolute",
      width: "100%",
      height: "100%",
      top: 0,
      left: 0,
      zIndex: 0,
    },
    headerIcon: {
      position: "absolute",
      fontSize: "1.5rem",
      color: "rgba(255, 255, 255, 0.2)",
      animation: "float 6s ease-in-out infinite",
    },
    main: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "4rem 2rem",
      position: "relative",
      zIndex: 1,
    },
    sectionTitle: {
      fontSize: "2.5rem",
      fontWeight: "700",
      marginBottom: "2rem",
      textAlign: "center",
      color: "#1e3a8a",
      position: "relative",
      display: "inline-block",
    },
    sectionTitleLine: {
      position: "absolute",
      bottom: "-10px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "80px",
      height: "4px",
      backgroundColor: "#60a5fa",
      borderRadius: "2px",
    },
    cardsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "2rem",
      marginTop: "4rem",
    },
    card: {
      backgroundColor: "white",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
      transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      opacity: 0,
      transform: "translateY(30px)",
      animation: "slideUp 0.8s forwards",
      animationDelay: "0.2s",
      position: "relative",
      border: "1px solid rgba(37, 99, 235, 0.1)",
    },
    cardActive: {
      transform: "translateY(-10px) scale(1.02)",
      boxShadow: "0 20px 40px rgba(37, 99, 235, 0.2)",
    },
    cardHeader: {
      padding: "2rem",
      backgroundColor: "#355383",
      color: "white",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    },
    cardIcon: {
      fontSize: "3rem",
      marginBottom: "1rem",
    },
    cardTitle: {
      fontSize: "1.5rem",
      fontWeight: "700",
      marginBottom: "0.5rem",
    },
    cardSubtitle: {
      fontSize: "0.95rem",
      opacity: "0.9",
    },
    cardBody: {
      padding: "2rem",
      textAlign: "center",
    },
    cardInfo: {
      fontSize: "1.25rem",
      fontWeight: "600",
      color: "#1e3a8a",
      marginBottom: "1rem",
    },
    cardButton: {
      backgroundColor: "#355383",
      color: "white",
      border: "none",
      padding: "0.75rem 1.5rem",
      borderRadius: "30px",
      fontSize: "0.95rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      marginTop: "1rem",
      boxShadow: "0 4px 12px rgba(96, 165, 250, 0.2)",
    },
    formSection: {
      marginTop: "6rem",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "4rem",
      alignItems: "center",
    },
    formContainer: {
      backgroundColor: "white",
      borderRadius: "16px",
      padding: "2.5rem",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
      border: "1px solid rgba(37, 99, 235, 0.1)",
    },
    formTitle: {
      fontSize: "1.75rem",
      fontWeight: "700",
      marginBottom: "1.5rem",
      color: "#1e3a8a",
    },
    formGroup: {
      marginBottom: "1.5rem",
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
    formTextarea: {
      width: "100%",
      padding: "0.75rem 1rem",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      fontSize: "1rem",
      minHeight: "150px",
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
      backgroundColor: "#355383",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
    },
    formButtonDisabled: {
      backgroundColor: "#355383",
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
    mapContainer: {
      height: "400px",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
      border: "1px solid rgba(37, 99, 235, 0.1)",
      position: "relative",
    },
    map: {
      width: "100%",
      height: "100%",
      border: "none",
    },
    mapOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(37, 99, 235, 0.1)",
      pointerEvents: "none",
    },
   
  }

  // Generate random positions for header icons
  const headerIcons = [
    { icon: "📞", top: "20%", left: "10%", delay: "0s" },
    { icon: "✉️", top: "70%", left: "15%", delay: "1s" },
    { icon: "📍", top: "30%", left: "80%", delay: "2s" },
    { icon: "🏥", top: "60%", left: "85%", delay: "3s" },
    { icon: "👨‍⚕️", top: "15%", left: "40%", delay: "4s" },
    { icon: "👩‍⚕️", top: "80%", left: "60%", delay: "5s" },
  ]

 

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.container}>
        <div style={styles.backgroundPattern}></div>

        {/* Header */}
        <header style={styles.header} ref={headerRef}>
          <div style={styles.headerBackground}></div>
          <div style={styles.headerIcons}>
            {headerIcons.map((icon, index) => (
              <div
                key={index}
                style={{
                  ...styles.headerIcon,
                  top: icon.top,
                  left: icon.left,
                  animationDelay: icon.delay,
                }}
              >
                {icon.icon}
              </div>
            ))}
          </div>
          <div style={styles.headerContent}>
            <h1 style={styles.headerTitle}>Contact Us</h1>
            <p style={styles.headerSubtitle}>
              We are always ready to support the health of students, parents, and teachers. We listen to all feedback to
              improve the quality of school healthcare services.
            </p>
          </div>
          <div style={styles.headerWave}></div>
        </header>

        {/* Main Content */}
        <main style={styles.main}>
          {/* Contact Cards */}
          <div style={{ textAlign: "center" }}>
            <h2 style={styles.sectionTitle}>
              Get in Touch
              <div style={styles.sectionTitleLine}></div>
            </h2>
            <p style={{ maxWidth: "600px", margin: "0 auto", color: "#4b5563" }}>
              Don't hesitate to contact us through the channels below for consultation, appointment booking, or
              feedback!
            </p>
          </div>

          <div style={styles.cardsContainer}>
            {/* Hotline Card */}
            <div
              style={{
                ...styles.card,
                ...(activeCard === "hotline" ? styles.cardActive : {}),
                animationDelay: "0.2s",
              }}
              onMouseEnter={() => setActiveCard("hotline")}
              onMouseLeave={() => setActiveCard(null)}
              ref={(el) => (cardsRef.current[0] = el)}
            >
              <div style={styles.cardHeader}>
                <div style={styles.cardIcon}>📞</div>
                <h3 style={styles.cardTitle}>Hotline</h3>
                <p style={styles.cardSubtitle}>Emergency medical support</p>
              </div>
              <div style={styles.cardBody}>
                <p style={styles.cardInfo}>{contactInfo.hotline}</p>
                <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
                  Emergency medical support and health consultation during office hours.
                </p>
                <button
                  style={styles.cardButton}
                  onClick={() => navigate("/parent/appointments-list")}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#355383"
                    e.target.style.transform = "translateY(-2px)"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#355383"
                    e.target.style.transform = "translateY(0)"
                  }}
                >
                  Book Appointment
                </button>
              </div>
            </div>

            {/* Email Card */}
            <div
              style={{
                ...styles.card,
                ...(activeCard === "email" ? styles.cardActive : {}),
                animationDelay: "0.4s",
              }}
              onMouseEnter={() => setActiveCard("email")}
              onMouseLeave={() => setActiveCard(null)}
              ref={(el) => (cardsRef.current[1] = el)}
            >
              <div style={styles.cardHeader}>
                <div style={styles.cardIcon}>✉️</div>
                <h3 style={styles.cardTitle}>Email</h3>
                <p style={styles.cardSubtitle}>Send us a message</p>
              </div>
              <div style={styles.cardBody}>
                <p style={styles.cardInfo}>{contactInfo.email}</p>
                <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
                  Send questions, feedback, or administrative support requests. Response within 24 hours.
                </p>
                <button
                  style={styles.cardButton}
                  onClick={() => openModal("message")}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#355383"
                    e.target.style.transform = "translateY(-2px)"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#355383"
                    e.target.style.transform = "translateY(0)"
                  }}
                >
                  Send Message
                </button>
              </div>
            </div>

            {/* Address Card */}
            <div
              style={{
                ...styles.card,
                ...(activeCard === "address" ? styles.cardActive : {}),
                animationDelay: "0.6s",
              }}
              onMouseEnter={() => setActiveCard("address")}
              onMouseLeave={() => setActiveCard(null)}
              ref={(el) => (cardsRef.current[2] = el)}
            >
              <div style={styles.cardHeader}>
                <div style={styles.cardIcon}>📍</div>
                <h3 style={styles.cardTitle}>Address</h3>
                <p style={styles.cardSubtitle}>Visit our office</p>
              </div>
              <div style={styles.cardBody}>
                <p style={styles.cardInfo}>{contactInfo.address}</p>
                <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
                  School medical office, dedicated to providing student healthcare. {contactInfo.hours}
                </p>
                <button
                  style={styles.cardButton}
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.address)}`,
                      "_blank",
                    )
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#355383"
                    e.target.style.transform = "translateY(-2px)"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#355383"
                    e.target.style.transform = "translateY(0)"
                  }}
                >
                  Get Directions
                </button>
              </div>
            </div>
          </div>

          {/* Contact Form and Map */}
          <div style={styles.formSection}>
            <div style={styles.formContainer}>
              <h3 style={styles.formTitle}>Send us a Message</h3>
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
                    style={styles.formInput}
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
                    style={styles.formInput}
                    onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                    onBlur={(e) => {
                      e.target.style.borderColor = formErrors.email ? "#ef4444" : "#e5e7eb"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                  {formErrors.email && <div style={styles.formError}>{formErrors.email}</div>}
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="subject" style={styles.formLabel}>
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    style={styles.formInput}
                    onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="message" style={styles.formLabel}>
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    style={styles.formTextarea}
                    onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                    onBlur={(e) => {
                      e.target.style.borderColor = formErrors.message ? "#ef4444" : "#e5e7eb"
                      e.target.style.boxShadow = "none"
                    }}
                  ></textarea>
                  {formErrors.message && <div style={styles.formError}>{formErrors.message}</div>}
                </div>

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
                    e.target.style.backgroundColor = isSubmitting ? "#355383" : "#355383"
                    e.target.style.transform = "translateY(0)"
                    e.target.style.boxShadow = "none"
                  }}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>

                {submitSuccess && <div style={styles.formSuccess}>Message sent successfully!</div>}
              </form>
            </div>

            <div style={styles.mapContainer}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.5177580567147!2d106.69508007465815!3d10.771594089387598!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f40a3b49e59%3A0xa1bd14e483a602db!2s4%2F48%20Pasteur%2C%20B%E1%BA%BFn%20Ngh%C3%A9%2C%20Qu%E1%BA%ADn%201%2C%20Th%C3%A0nh%20ph%E1%BB%91%20H%E1%BB%93%20Ch%C3%AD%20Minh%2C%20Vietnam!5e0!3m2!1sen!2s!4v1686636012345!5m2!1sen!2s"
                style={styles.map}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location"
                ref={mapRef}
              ></iframe>
              <div style={styles.mapOverlay}></div>
            </div>
          </div>
        </main>

        {/* Modal */}
        {isModalOpen && <ContactModal type={modalType} onClose={closeModal} contactInfo={contactInfo} />}
      </div>
    </>
  )
}

export default Contact
