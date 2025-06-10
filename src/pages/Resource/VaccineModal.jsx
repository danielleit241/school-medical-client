import React from 'react'
import { useEffect, useState } from "react"

const VaccineModal = ({ vaccine, onClose }) => {
 const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  if (!vaccine) return null

  return (
    <div className={`modal-overlay ${isVisible ? "visible" : ""}`} onClick={handleClose}>
      <div className={`modal-content ${isVisible ? "visible" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-background">
          <div className="modal-shape modal-shape-1"></div>
          <div className="modal-shape modal-shape-2"></div>
        </div>

        <div className="modal-header">
          <div className="modal-title-section">
            <div className="modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div className="modal-title-content">
              <h2 className="modal-title">{vaccine.name}</h2>
              <p className="modal-subtitle">Essential Vaccine Information</p>
            </div>
          </div>
          <button className="modal-close" onClick={handleClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-image">
            <div className="image-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <img src={vaccine.image || "/placeholder.svg?height=300&width=600"} alt={vaccine.name} />
          </div>

          <div className="modal-info">
            <div className="info-section">
              <div className="info-header">
                <div className="info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h4 className="info-title">Disease Information</h4>
              </div>
              <div className="info-list">
                {vaccine.details.map((detail, index) => (
                  <div key={index} className="info-item">
                    <div className="item-bullet"></div>
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-section">
              <div className="info-header">
                <div className="info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <h4 className="info-title">Vaccination Schedule</h4>
              </div>
              <div className="schedule-card">
                <p>{vaccine.schedule}</p>
              </div>
            </div>

            <div className="info-section">
              <div className="info-header">
                <div className="info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h4 className="info-title">Additional Information</h4>
              </div>
              <div className="additional-card">
                <p>{vaccine.additionalInfo}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={handleClose}>
            <span>Got it, thanks!</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default VaccineModal