"use client"

import { useEffect, useState, useRef } from "react"

const BlogModal = ({ article, onClose }) => {
  const [isClosing, setIsClosing] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const contentRef = useRef(null)
  const [relatedArticles] = useState([
    {
      title: "Childhood Vaccination Schedule Updates",
      excerpt: "New recommendations for school-age children's immunization schedules.",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&h=200&fit=crop",
    },
    {
      title: "Promoting Healthy Sleep Habits",
      excerpt: "How schools can help students develop better sleep routines.",
      image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=300&h=200&fit=crop",
    },
    {
      title: "Managing Food Allergies in Schools",
      excerpt: "Best practices for creating safe environments for students with allergies.",
      image: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=300&h=200&fit=crop",
    },
  ])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }

    const handleScroll = () => {
      if (contentRef.current) {
        const element = contentRef.current
        const totalHeight = element.scrollHeight - element.clientHeight
        const progress = (element.scrollTop / totalHeight) * 100
        setReadingProgress(progress)
      }
    }

    document.addEventListener("keydown", handleEscape)
    document.body.style.overflow = "hidden"

    if (contentRef.current) {
      contentRef.current.addEventListener("scroll", handleScroll)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
      if (contentRef.current) {
        //eslint-disable-next-line react-hooks/exhaustive-deps
        contentRef.current.removeEventListener("scroll", handleScroll)
      }
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 300)
  }



  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(255, 255, 255, 0.97)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "2rem",
      animation: isClosing ? "fadeOut 0.3s ease-out" : "fadeIn 0.3s ease-out",
    },
    modal: {
      backgroundColor: "white",
      maxWidth: "1000px",
      width: "100%",
      maxHeight: "95vh",
      overflow: "hidden",
      boxShadow: "0 25px 50px rgba(37, 99, 235, 0.1)",
      animation: isClosing ? "slideDown 0.3s ease-out" : "slideUp 0.3s ease-out",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      borderRadius: "20px",
    },
    progressBar: {
      position: "absolute",
      top: 0,
      left: 0,
      height: "3px",
      backgroundColor: "#2563eb",
      width: `${readingProgress}%`,
      transition: "width 0.3s ease",
      zIndex: 10,
    },
    header: {
      position: "relative",
      padding: "2rem",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    headerContent: {
      maxWidth: "80%",
    },
    category: {
      color: "#2563eb",
      fontSize: "0.875rem",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginBottom: "1rem",
      fontFamily: "'Helvetica', sans-serif",
    },
    title: {
      fontSize: "2.5rem",
      fontWeight: "700",
      lineHeight: "1.2",
      marginBottom: "1rem",
      color: "#1a202c",
      fontFamily: "'Georgia', serif",
    },
    meta: {
      display: "flex",
      gap: "1.5rem",
      fontSize: "0.875rem",
      color: "#6b7280",
      fontFamily: "'Helvetica', sans-serif",
    },
    headerActions: {
      display: "flex",
      gap: "1rem",
    },
    actionButton: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.25rem",
      transition: "all 0.3s ease",
      backgroundColor: "#f3f4f6",
      color: "#6b7280",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    },
    closeButton: {
      backgroundColor: "#f3f4f6",
      color: "#374151",
      fontSize: "1.5rem",
    },
    content: {
      padding: "0 4rem 2rem",
      maxHeight: "calc(95vh - 200px)",
      overflowY: "auto",
      fontFamily: "'Georgia', serif",
    },
    articleImage: {
      width: "100%",
      height: "400px",
      objectFit: "cover",
      marginBottom: "2rem",
      borderRadius: "12px",
    },
    articleContent: {
      fontSize: "1.125rem",
      lineHeight: "1.8",
      color: "#374151",
      maxWidth: "700px",
      margin: "0 auto",
    },
    paragraph: {
      marginBottom: "1.5rem",
    },
    authorSection: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      padding: "2rem 0",
      borderTop: "1px solid #e5e7eb",
      borderBottom: "1px solid #e5e7eb",
      margin: "3rem 0",
    },
    authorImage: {
      width: "70px",
      height: "70px",
      borderRadius: "50%",
      backgroundColor: "#e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.75rem",
      color: "#2563eb",
    },
    authorInfo: {
      fontFamily: "'Helvetica', sans-serif",
    },
    authorName: {
      fontWeight: "600",
      fontSize: "1.25rem",
      color: "#1a202c",
      marginBottom: "0.25rem",
    },
    authorRole: {
      fontSize: "0.95rem",
      color: "#6b7280",
    },
    relatedArticles: {
      marginTop: "3rem",
    },
    relatedTitle: {
      fontSize: "1.5rem",
      fontWeight: "700",
      marginBottom: "1.5rem",
      color: "#1a202c",
      fontFamily: "'Georgia', serif",
      position: "relative",
      paddingBottom: "0.5rem",
    },
    relatedTitleLine: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "40px",
      height: "2px",
      backgroundColor: "#2563eb",
    },
    relatedGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "1.5rem",
    },
    relatedCard: {
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    relatedImage: {
      width: "100%",
      height: "150px",
      objectFit: "cover",
      marginBottom: "1rem",
      borderRadius: "10px",
    },
    relatedCardTitle: {
      fontSize: "1rem",
      fontWeight: "600",
      marginBottom: "0.5rem",
      color: "#1a202c",
      fontFamily: "'Georgia', serif",
    },
    relatedCardExcerpt: {
      fontSize: "0.875rem",
      color: "#6b7280",
      fontFamily: "'Helvetica', sans-serif",
    },
    tags: {
      display: "flex",
      gap: "0.5rem",
      flexWrap: "wrap",
      marginTop: "2rem",
    },
    tag: {
      padding: "0.25rem 0.75rem",
      backgroundColor: "#f3f4f6",
      color: "#6b7280",
      fontSize: "0.75rem",
      fontWeight: "500",
      borderRadius: "20px",
      fontFamily: "'Helvetica', sans-serif",
    },
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
        transform: translateY(30px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slideDown {
      from { 
        opacity: 1;
        transform: translateY(0);
      }
      to { 
        opacity: 0;
        transform: translateY(30px);
      }
    }
  `

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.overlay} onClick={handleClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.progressBar}></div>
          <div style={styles.header}>
            <div style={styles.headerContent}>
              <div style={styles.category}>{article.category.charAt(0).toUpperCase() + article.category.slice(1)}</div>
              <h1 style={styles.title}>{article.title}</h1>
              <div style={styles.meta}>
                <span>📅 {article.date}</span>
                <span>⏱️ {article.readTime}</span>
                <span>👤 {article.author}</span>
              </div>
            </div>
            <div style={styles.headerActions}>
              <button
                style={{ ...styles.actionButton, ...styles.closeButton }}
                onClick={handleClose}
                title="Close"
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#e5e7eb"
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#f3f4f6"
                }}
              >
                ×
              </button>
            </div>
          </div>

          <div style={styles.content} ref={contentRef}>
            <img src={article.image || "/placeholder.svg"} alt={article.title} style={styles.articleImage} />
            <div style={styles.articleContent}>
              {article.content.split("\n\n").map((paragraph, index) => (
                <p key={index} style={styles.paragraph}>
                  {paragraph.trim()}
                </p>
              ))}

              <div style={styles.authorSection}>
                <div style={styles.authorImage}>{article.author ? article.author.charAt(0) : "A"}</div>
                <div style={styles.authorInfo}>
                  <div style={styles.authorName}>{article.author}</div>
                  <div style={styles.authorRole}>{article.authorRole}</div>
                </div>
              </div>

              <div style={styles.tags}>
                {article.tags.map((tag, index) => (
                  <span key={index} style={styles.tag}>
                    #{tag}
                  </span>
                ))}
              </div>

              <div style={styles.relatedArticles}>
                <h3 style={styles.relatedTitle}>
                  Related Articles
                  <div style={styles.relatedTitleLine}></div>
                </h3>
                <div style={styles.relatedGrid}>
                  {relatedArticles.map((related, index) => (
                    <div
                      key={index}
                      style={styles.relatedCard}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-5px)"
                        e.currentTarget.style.boxShadow = "0 10px 20px rgba(37, 99, 235, 0.1)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)"
                        e.currentTarget.style.boxShadow = "none"
                      }}
                    >
                      <img src={related.image || "/placeholder.svg"} alt={related.title} style={styles.relatedImage} />
                      <h4 style={styles.relatedCardTitle}>{related.title}</h4>
                      <p style={styles.relatedCardExcerpt}>{related.excerpt}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default BlogModal
