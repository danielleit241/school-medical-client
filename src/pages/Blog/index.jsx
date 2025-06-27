"use client";

import {useState, useEffect, useRef} from "react";
import BlogModal from "./BlogModal";

const Blog = () => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [likedArticles, setLikedArticles] = useState(new Set());
  const [bookmarkedArticles, setBookmarkedArticles] = useState(new Set());
  const [showToast, setShowToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({x: 0, y: 0});
  const headerRef = useRef(null);

  const categories = [
    {id: "all", name: "All Articles", icon: "🏥"},
    {id: "nutrition", name: "Nutrition", icon: "🥗"},
    {id: "mental-health", name: "Mental Health", icon: "🧠"},
    {id: "prevention", name: "Prevention", icon: "🛡️"},
    {id: "physical", name: "Physical Health", icon: "💪"},
    {id: "immunization", name: "Immunization", icon: "💉"},
  ];

  const blogPosts = [
    {
      id: 1,
      title:
        "PM chairs meeting to draft resolutions on breakthroughs in health care, education",
      date: "18/05/2025",
      category: "prevention",
      readTime: "6 min read",
      excerpt:
        "Prime Minister Pham Minh Chinh chaired a meeting to discuss draft Politburo resolutions on breakthroughs in public health care and education, focusing on innovation, digital transformation, and equitable access.",
      image:
        "https://mediaen.vietnamplus.vn/images/6c119d271863b7ac18459c552eb952eeb505ee81f1d9131bc24cf45eff268a80d2e222b4917b7d373f08e26a34eb636811ad7b6281d70fa38f94c694bb0bf7332c763c4f7dd50e2ab2d1d5ebcfb759266820b927f7a14b68775e30b83868b0952810898e370c30f34b1abbc94cf90253f1d86198934cb94b37e380f0e880bb12/thuong-truc-chinh-phu-thao-luan-ve-phat-trien-giao-duc-va-cham-soc-suc-khoe-nhan-dan-17-3.jpg.webp",
      content: `Hanoi (VNA) - Prime Minister Pham Minh Chinh chaired a meeting on May 17 between standing Cabinet members and ministries and central agencies to discuss the drafting of two Politburo resolutions aimed at breakthroughs in public health care and education.

The draft resolution on public health care outlines breakthrough solutions to meet national development demands in the new era.

It sets out goals and a roadmap for waiving hospital fees for the public, conducting regular health check-ups, ensuring access to vaccines and immunisation, improving the quality of healthcare services, securing medical supplies, and applying science and technology effectively.

Key proposals include shifting the mindset in leadership and implementation of healthcare services, enhancing the capacity of the health system, particularly preventive medicine, grassroots healthcare and traditional medicine, and training high-quality human resources with special incentives for medical staff.

The draft also emphasises healthcare finance reform, innovation and digital transformation, and the mobilisation of resources for private healthcare development.

Following discussion, PM Chinh urged swift finalisation of the draft, drawing on existing resolutions, strategies and conclusions. He asked for a more comprehensive and inclusive approach that removes institutional bottlenecks and identifies true breakthroughs to meet public expectations.

The PM underscored the need to design special mechanisms and policies, particularly for public-private partnerships, in order to advance healthcare, with decentralisation, simplified administrative procedures, and the elimination of “ask-give” mechanisms.

He stressed the principle that safeguarding public health is fundamental, strategic, and long-term, while medical treatment is frequent and reactive.

Special attention should be paid to implementing a two-tier local governance model for healthcare delivery, ensuring equitable access, especially in remote, border, and island areas, and among ethnic minorities, developing preventive and grassroots healthcare, tackling population ageing, and advancing the pharmaceutical and vaccine industries.

The PM also urged efforts to promote health tourism, build digital and smart hospitals, and progressively waive hospital fees, starting with free treatment for children.

Meanwhile, in regard to the draft resolution on education reform, PM Chinh acknowledged past achievements while also highlighting bottlenecks. He asked for the building of a resolution that modernises the education system, expands equitable access, and improves overall quality. The draft should promote vocational reform, boost workforce skills, modernise higher education, develop high-quality human resources and talent in technology, and foster research and innovation, he said.

Proposed breakthrough solutions include enhancing state management and unlocking potential and creativity; overhauling finance policies and promoting effective use of the state budget; investing in modern educational facilities; advancing comprehensive digital transformation; promoting foreign language education, especially English, and digital and AI literacy; and developing skilled and high-tech workers in line with innovation-driven growth.

He requested that the resolution clearly define its scope from general to vocational, higher and post-graduate education, while proposing measures to ensure equitable access, especially in remote areas. It should include a roadmap for foreign language education, and promote education in culture, arts, aesthetics and physical development to ensure well-rounded learners, he ordered.

The Government leader urged the development of strategies for vocational training, improving skills, and post-graduate education in emerging fields, along with elite talent programmes. He emphasised improving teacher quality, infrastructure, and optimising the national education network.

He also directed ministries to integrate stakeholder feedback and finalise key documents for timely submission to the Politburo.`,
      tags: ["PM", "education", "healthcare", "policy"],
      author: "VietnamPlus (VNA)",
      authorRole: "News Agency",
    },
    {
      id: 2,
      title: "Healthy School Nutrition",
      date: "20/05/2025",
      category: "nutrition",
      readTime: "4 min read",
      excerpt:
        "School meals must ensure adequate nutrition, food safety, and suit the physical needs of different age groups. Studies have shown that proper nutrition directly impacts academic performance.",
      image:
        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&h=400&fit=crop",
      content: `Proper nutrition is essential for children's physical and cognitive development. School nutrition programs play a vital role in ensuring students receive balanced, nutritious meals that support their growth and learning.

      Nutritional requirements vary by age group, and school meal programs must account for these differences. Elementary students need different portion sizes and nutritional profiles compared to high school students.

      Food safety is paramount in school nutrition programs. Proper food handling, storage, and preparation procedures must be followed to prevent foodborne illnesses that could affect large numbers of students.

      Research consistently shows that well-nourished students perform better academically, have better attendance rates, and exhibit fewer behavioral problems. Investing in school nutrition is investing in educational outcomes.`,
      tags: ["nutrition", "food", "development"],
      author: "Dr. Michael Chen",
      authorRole: "Nutritionist",
    },
    {
      id: 3,
      title: "Preventing Disease Outbreaks in Schools",
      date: "15/05/2025",
      category: "prevention",
      readTime: "6 min read",
      excerpt:
        "Crowded school environments can easily become hotspots for outbreaks if preventive measures are not in place. Basic practices such as proper handwashing and health screenings are essential.",
      image:
        "https://blog.wcei.net/wp-content/uploads/2024/04/infectioncontrol-scaled-e1713195717755.jpg",
      content: `Schools, with their high concentration of students in close proximity, can be vulnerable to disease outbreaks. However, with proper preventive measures, these risks can be significantly reduced.

      Hand hygiene is one of the most effective ways to prevent the spread of infectious diseases. Schools should provide adequate handwashing facilities and teach proper handwashing techniques to all students and staff.

      Vaccination programs are crucial for preventing outbreaks of vaccine-preventable diseases. Schools should maintain up-to-date vaccination records and work with health authorities to ensure compliance with immunization requirements.

      Health screenings help identify potentially contagious conditions early, allowing for prompt isolation and treatment. Regular temperature checks and symptom monitoring can help prevent the spread of illness throughout the school community.`,
      tags: ["prevention", "outbreak", "hygiene"],
      author: "Dr. Sarah Williams",
      authorRole: "Epidemiologist",
    },
    {
      id: 4,
      title: "Supporting Students' Mental Health",
      date: "10/05/2025",
      category: "mental-health",
      readTime: "7 min read",
      excerpt:
        "Stress, academic pressure, and social relationships can affect students' mental well-being. Schools should offer psychological counseling services and create supportive environments.",
      image:
        "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80",
      content: `Mental health is just as important as physical health for student success and wellbeing. Schools play a crucial role in supporting students' mental health through various programs and services.

      Academic pressure, social challenges, and developmental changes can all impact a student's mental health. Early identification and intervention are key to preventing more serious mental health issues.

      Counseling services provide students with a safe space to discuss their concerns and learn coping strategies. Trained counselors can help students navigate challenges and develop resilience.

      Creating a supportive school environment involves training all staff to recognize signs of mental health issues and respond appropriately. This whole-school approach ensures that students receive support from multiple sources.`,
      tags: ["mental health", "counseling", "support"],
      author: "Dr. Rebecca Martinez",
      authorRole: "Child Psychologist",
    },
    {
      id: 5,
      title: "Exercise and Physical Activity",
      date: "03/05/2025",
      category: "physical",
      readTime: "5 min read",
      excerpt:
        "Physical activity is essential for maintaining health, reducing stress, and improving academic performance. School physical education and sports programs promote active lifestyles.",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
      content: `Regular physical activity is fundamental to children's physical and mental development. Schools have a unique opportunity to promote active lifestyles through structured physical education programs and recreational activities.

      Physical education classes provide students with the knowledge and skills needed to maintain an active lifestyle throughout their lives. These programs should be inclusive and accommodate students of all fitness levels and abilities.

      Sports programs offer additional opportunities for physical activity while teaching valuable life skills such as teamwork, leadership, and perseverance. Both competitive and recreational sports programs have their place in a comprehensive school health program.

      Research shows that physically active students tend to have better academic performance, improved concentration, and better classroom behavior. Physical activity also helps reduce stress and anxiety, contributing to better mental health.`,
      tags: ["physical health", "sports", "wellness"],
      author: "Dr. James Thompson",
      authorRole: "Sports Medicine Specialist",
    },
    {
      id: 6,
      title: "School Immunization Programs",
      date: "25/04/2025",
      category: "immunization",
      readTime: "4 min read",
      excerpt:
        "Organizing vaccinations at school for diseases such as flu, hepatitis B, measles, mumps, rubella, etc., is an effective way to prevent illness and protect the school community.",
      image:
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop",
      content: `School-based immunization programs are one of the most effective public health interventions for preventing infectious diseases in educational settings. These programs help protect individual students while contributing to community immunity.

      Routine immunizations protect against serious diseases that can cause significant illness, disability, or death. School requirements for vaccinations help ensure high vaccination rates and protect vulnerable students who cannot be vaccinated due to medical conditions.

      Seasonal vaccination programs, such as annual flu shots, can significantly reduce illness-related absences and help maintain normal school operations during flu season.

      School nurses and healthcare providers play a crucial role in implementing immunization programs, maintaining vaccination records, and educating families about the importance of vaccines for their children's health and the health of the school community.`,
      tags: ["immunization", "vaccines", "prevention"],
      author: "Dr. Lisa Patel",
      authorRole: "Immunology Specialist",
    },
    {
      id: 8,
      title: "The Importance of School Healthcare",
      date: "27/05/2025",
      readTime: "5 min read",
      excerpt:
        "School healthcare plays a key role in protecting and improving student health. From early detection of illness, regular health monitoring, to health education programs.",
      image:
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
      content: `School healthcare is fundamental to ensuring the wellbeing of our children during their educational journey. Healthcare professionals in schools serve as the first line of defense against illness and injury, providing immediate care and support when students need it most.

      Early detection of health issues is crucial for preventing more serious complications. School nurses and healthcare staff are trained to identify symptoms and signs that might indicate underlying health problems, allowing for prompt intervention and treatment.

      Regular health monitoring includes routine check-ups, vision and hearing screenings, and tracking of chronic conditions. This systematic approach helps ensure that health issues don't interfere with a child's ability to learn and participate fully in school activities.

      Health education programs teach students about nutrition, hygiene, mental health, and disease prevention. These programs empower children to make informed decisions about their health and develop lifelong healthy habits.`,
      tags: ["healthcare", "school", "prevention"],
      author: "Dr. Emily Johnson",
      authorRole: "Pediatric Specialist",
    },
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1500);

    // Mouse move effect for background
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePosition({x, y});
    };

    // Parallax effect
    const handleScroll = () => {
      if (headerRef.current) {
        const scrolled = window.pageYOffset;
        headerRef.current.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleLike = (id) => {
    const newLiked = new Set(likedArticles);
    if (newLiked.has(id)) {
      newLiked.delete(id);
      showToastMessage("Article unliked", "info");
    } else {
      newLiked.add(id);
      showToastMessage("Article liked!", "success");
    }
    setLikedArticles(newLiked);
  };

  const toggleBookmark = (id) => {
    const newBookmarked = new Set(bookmarkedArticles);
    if (newBookmarked.has(id)) {
      newBookmarked.delete(id);
      showToastMessage("Bookmark removed", "info");
    } else {
      newBookmarked.add(id);
      showToastMessage("Article bookmarked!", "success");
    }
    setBookmarkedArticles(newBookmarked);
  };

  const showToastMessage = (message, type) => {
    setShowToast({message, type});
    setTimeout(() => setShowToast(null), 3000);
  };

  const openModal = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  // Get featured article (first one)
  const featuredArticle = filteredPosts.length > 0 ? filteredPosts[0] : null;
  // Get remaining articles
  const remainingArticles =
    filteredPosts.length > 0 ? filteredPosts.slice(1) : [];

  const styles = {
    container: {
      fontFamily: "'Georgia', serif",
      minHeight: "100vh",
      color: "#1a202c",
      position: "relative",
      overflow: "hidden",
    },
    backgroundImage: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundImage: `url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-06-13%20002057-ht5Z0DLCRy5LPHplLKpVoEkE60ooF6.png)`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      zIndex: -2,
    },
    backgroundOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: `radial-gradient(
        circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
        rgba(255, 255, 255, 0.1) 0%, 
        rgba(255, 255, 255, 0) 70%
      )`,
      zIndex: -1,
      transition: "background 0.3s ease",
    },
    header: {
      background: "transparent",
      color: "#1a202c",
      padding: "3rem 0",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid rgba(37, 99, 235, 0.1)",
    },
    headerContent: {
      position: "relative",
      zIndex: 2,
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 2rem",
    },
    headerTitle: {
      fontSize: "3.5rem",
      fontWeight: "700",
      margin: "0 0 0.5rem 0",
      letterSpacing: "-0.02em",
      color: "#355383",
      fontFamily: "'Georgia', serif",
    },
    headerSubtitle: {
      fontSize: "1.25rem",
      opacity: "0.95",
      fontWeight: "300",
      margin: "0",
      fontFamily: "'Helvetica', sans-serif",
      maxWidth: "700px",
      marginLeft: "auto",
      marginRight: "auto",
      color: "#4b5563",
    },
    controls: {
      maxWidth: "1500px",
      margin: "2rem auto",
      padding: "0 2rem",
      display: "flex",
      flexWrap: "wrap",
      gap: "1rem",
      alignItems: "center",
      justifyContent: "space-between",
    },
    searchContainer: {
      position: "relative",
      flex: "1",
      minWidth: "300px",
    },
    searchInput: {
      width: "100%",
      padding: "1rem 1rem 1rem 3rem",
      borderRadius: "30px",
      border: "none",
      borderBottom: "2px solid rgba(37, 99, 235, 0.3)",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      color: "#374151",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      fontFamily: "'Helvetica', sans-serif",
      boxShadow: "0 2px 10px rgba(37, 99, 235, 0.05)",
    },
    searchInputFocus: {
      borderColor: "#2563eb",
      backgroundColor: "rgba(255, 255, 255, 1)",
    },
    searchIcon: {
      position: "absolute",
      left: "0.5rem",
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: "1.2rem",
      color: "#2563eb",
    },
    categoryFilter: {
      display: "flex",
      gap: "0.5rem",
      flexWrap: "wrap",
    },
    categoryButton: {
      padding: "0.75rem 1.5rem",
      borderRadius: "30px",
      border: "none",
      cursor: "pointer",
      fontSize: "0.9rem",
      fontWeight: "600",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      fontFamily: "'Helvetica', sans-serif",
      boxShadow: "0 2px 8px rgba(37, 99, 235, 0.05)",
    },
    main: {
      maxWidth: "1500px",
      margin: "0 auto",
      padding: "2rem",
      position: "relative",
      zIndex: 1,
    },
    featuredArticle: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      marginBottom: "4rem",
      boxShadow: "0 4px 20px rgba(37, 99, 235, 0.08)",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      overflow: "hidden",
      borderRadius: "16px",
    },
    featuredContent: {
      padding: "3rem",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },
    featuredCategory: {
      color: "#2563eb",
      fontSize: "0.875rem",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginBottom: "1rem",
      fontFamily: "'Helvetica', sans-serif",
    },
    featuredTitle: {
      fontSize: "2.5rem",
      fontWeight: "700",
      lineHeight: "1.2",
      marginBottom: "1.5rem",
      color: "#1a202c",
      fontFamily: "'Georgia', serif",
    },
    featuredExcerpt: {
      fontSize: "1.125rem",
      lineHeight: "1.7",
      color: "#4b5563",
      marginBottom: "2rem",
      fontFamily: "'Helvetica', sans-serif",
    },
    featuredMeta: {
      display: "flex",
      alignItems: "center",
      gap: "1.5rem",
      marginBottom: "2rem",
      fontFamily: "'Helvetica', sans-serif",
    },
    featuredMetaItem: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      color: "#6b7280",
      fontSize: "0.875rem",
    },
    featuredImage: {
      height: "100%",
      width: "100%",
      objectFit: "cover",
    },
    featuredAuthor: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      marginBottom: "2rem",
    },
    featuredAuthorImage: {
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      backgroundColor: "#e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.25rem",
      color: "#2563eb",
    },
    featuredAuthorInfo: {
      fontFamily: "'Helvetica', sans-serif",
    },
    featuredAuthorName: {
      fontWeight: "600",
      color: "#1a202c",
    },
    featuredAuthorRole: {
      fontSize: "0.875rem",
      color: "#6b7280",
    },
    readMoreButton: {
      backgroundColor: "transparent",
      color: "#2563eb",
      border: "2px solid #355383",
      padding: "0.75rem 2rem",
      fontSize: "0.9rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      alignSelf: "flex-start",
      fontFamily: "'Helvetica', sans-serif",
      borderRadius: "30px",
    },
    articlesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
      gap: "2rem",
    },
    articleCard: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      overflow: "hidden",
      transition: "all 0.4s ease",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      borderRadius: "16px",
      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.05)",
    },
    articleImage: {
      width: "100%",
      height: "200px",
      objectFit: "cover",
      display: "block", // Thêm dòng này
      borderTopLeftRadius: "16px", // Bo góc trên nếu muốn đẹp hơn
      borderTopRightRadius: "16px",
    },
    articleContent: {
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      flexGrow: 1,
    },
    articleCategory: {
      color: "#2563eb",
      fontSize: "0.75rem",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginBottom: "0.5rem",
      fontFamily: "'Helvetica', sans-serif",
    },
    articleTitle: {
      fontSize: "1.5rem",
      fontWeight: "700",
      lineHeight: "1.3",
      marginBottom: "1rem",
      color: "#1a202c",
      fontFamily: "'Georgia', serif",
    },
    articleExcerpt: {
      fontSize: "0.95rem",
      lineHeight: "1.6",
      color: "#4b5563",
      marginBottom: "1.5rem",
      flexGrow: 1,
      fontFamily: "'Helvetica', sans-serif",
    },
    articleMeta: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderTop: "1px solid #e5e7eb",
      paddingTop: "1rem",
      fontFamily: "'Helvetica', sans-serif",
    },
    articleMetaLeft: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      color: "#6b7280",
      fontSize: "0.75rem",
    },
    articleMetaRight: {
      display: "flex",
      gap: "0.5rem",
    },
    actionButton: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      color: "#6b7280",
      boxShadow: "0 2px 8px rgba(37, 99, 235, 0.1)",
    },
    sectionTitle: {
      fontSize: "2rem",
      fontWeight: "700",
      marginBottom: "2rem",
      color: "#1a202c",
      fontFamily: "'Georgia', serif",
      position: "relative",
      paddingBottom: "0.5rem",
    },
    sectionTitleLine: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "60px",
      height: "3px",
      backgroundColor: "#2563eb",
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      flexDirection: "column",
      gap: "2rem",
      position: "relative",
      zIndex: 10,
    },
    loadingSpinner: {
      width: "60px",
      height: "60px",
      border: "4px solid rgba(255, 255, 255, 0.3)",
      borderTop: "4px solid #2563eb",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      boxShadow: "0 0 20px rgba(37, 99, 235, 0.2)",
    },
    toast: {
      position: "fixed",
      top: "2rem",
      right: "2rem",
      padding: "1rem 1.5rem",
      borderRadius: "0",
      color: "white",
      fontWeight: "600",
      zIndex: 1000,
      animation: "slideInRight 0.3s ease-out",
      backdropFilter: "blur(10px)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
      fontFamily: "'Helvetica', sans-serif",
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
  };

  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(100px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;

  if (isLoading) {
    return (
      <>
        <style>{keyframes}</style>
        <div style={styles.backgroundImage}></div>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <h2
            style={{
              color: "#2563eb",
              fontSize: "1.5rem",
              fontFamily: "'Georgia', serif",
            }}
          >
            Loading content...
          </h2>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.container}>
        {/* Background Image */}
        <div style={styles.backgroundImage}></div>

        {/* Interactive Background Overlay */}
        <div style={styles.backgroundOverlay}></div>

        <header style={styles.header} ref={headerRef}>
          <div style={styles.headerContent}>
            <h1 style={styles.headerTitle}>SCHOOL HEALTHCARE JOURNAL</h1>
            <p style={styles.headerSubtitle}>
              The latest research, insights, and best practices for modern
              student healthcare
            </p>
          </div>
        </header>

        <div style={styles.controls}>
          <div style={styles.searchContainer}>
            <div style={styles.searchIcon}>🔍</div>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              onFocus={(e) =>
                Object.assign(e.target.style, styles.searchInputFocus)
              }
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(37, 99, 235, 0.3)";
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
              }}
            />
          </div>

          <div style={styles.categoryFilter}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  ...styles.categoryButton,
                  borderBottomColor:
                    selectedCategory === category.id
                      ? "#2563eb"
                      : "transparent",
                  color:
                    selectedCategory === category.id ? "#2563eb" : "#6b7280",
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category.id) {
                    e.target.style.borderBottomColor = "rgba(37, 99, 235, 0.3)";
                    e.target.style.color = "#4b5563";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category.id) {
                    e.target.style.borderBottomColor = "transparent";
                    e.target.style.color = "#6b7280";
                  }
                }}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <main style={styles.main}>
          {/* Featured Article */}
          {featuredArticle && (
            <article style={styles.featuredArticle}>
              <div style={styles.featuredContent}>
                <div style={styles.featuredCategory}>
                  {categories.find((cat) => cat.id === featuredArticle.category)
                    ?.name || featuredArticle.category}
                </div>
                <h2 style={styles.featuredTitle}>{featuredArticle.title}</h2>
                <p style={styles.featuredExcerpt}>{featuredArticle.excerpt}</p>
                <div style={styles.featuredMeta}>
                  <div style={styles.featuredMetaItem}>
                    <span>📅</span>
                    <span>{featuredArticle.date}</span>
                  </div>
                  <div style={styles.featuredMetaItem}>
                    <span>⏱️</span>
                    <span>{featuredArticle.readTime}</span>
                  </div>
                </div>
                <div style={styles.featuredAuthor}>
                  <div style={styles.featuredAuthorImage}>
                    {featuredArticle.author
                      ? featuredArticle.author.charAt(0)
                      : "A"}
                  </div>
                  <div style={styles.featuredAuthorInfo}>
                    <div style={styles.featuredAuthorName}>
                      {featuredArticle.author}
                    </div>
                    <div style={styles.featuredAuthorRole}>
                      {featuredArticle.authorRole}
                    </div>
                  </div>
                </div>
                <button
                  style={styles.readMoreButton}
                  onClick={() => openModal(featuredArticle)}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#2563eb";
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "#2563eb";
                  }}
                >
                  Read Article
                </button>
              </div>
              <div>
                <img
                  src={featuredArticle.image || "/placeholder.svg"}
                  alt={featuredArticle.title}
                  style={styles.featuredImage}
                />
              </div>
            </article>
          )}

          {/* Articles Grid */}
          <div>
            <h2 style={styles.sectionTitle}>
              Latest Articles
              <div style={styles.sectionTitleLine}></div>
            </h2>
            <div style={styles.articlesGrid}>
              {remainingArticles.map((post) => (
                <article
                  key={post.id}
                  style={styles.articleCard}
                  onClick={() => openModal(post)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 15px 30px rgba(37, 99, 235, 0.15)";
                    e.currentTarget.style.transform = "translateY(-8px)";
                    const img = e.currentTarget.querySelector("img");
                    if (img) img.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(37, 99, 235, 0.05)";
                    e.currentTarget.style.transform = "translateY(0)";
                    const img = e.currentTarget.querySelector("img");
                    if (img) img.style.transform = "scale(1)";
                  }}
                >
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    style={styles.articleImage}
                  />
                  <div style={styles.articleContent}>
                    <div style={styles.articleCategory}>
                      {categories.find((cat) => cat.id === post.category)
                        ?.name || post.category}
                    </div>
                    <h3 style={styles.articleTitle}>{post.title}</h3>
                    <p style={styles.articleExcerpt}>{post.excerpt}</p>
                    <div style={styles.articleMeta}>
                      <div style={styles.articleMetaLeft}>
                        <span>📅 {post.date}</span>
                        <span>⏱️ {post.readTime}</span>
                      </div>
                      <div style={styles.articleMetaRight}>
                        <button
                          style={{
                            ...styles.actionButton,
                            color: likedArticles.has(post.id)
                              ? "#ef4444"
                              : "#6b7280",
                            backgroundColor: likedArticles.has(post.id)
                              ? "rgba(239, 68, 68, 0.12)"
                              : "rgba(255,255,255,0.9)", // Tô đỏ nhạt khi đã like
                            border: likedArticles.has(post.id)
                              ? "2px solid #ef4444"
                              : "none", // Viền đỏ khi đã like
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(post.id);
                          }}
                          title="Like"
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor =
                              "rgba(239, 68, 68, 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                          }}
                        >
                          ❤️
                        </button>
                        <button
                          style={{
                            ...styles.actionButton,
                            color: bookmarkedArticles.has(post.id)
                              ? "#2563eb"
                              : "#6b7280",
                            backgroundColor: bookmarkedArticles.has(post.id)
                              ? "rgba(239, 68, 68, 0.12)"
                              : "rgba(255,255,255,0.9)", // Tô đỏ nhạt khi đã like
                            border: bookmarkedArticles.has(post.id)
                              ? "2px solid #ef4444"
                              : "none", // Viền đỏ khi đã like
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(post.id);
                          }}
                          title="Bookmark"
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor =
                              "rgba(37, 99, 235, 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                          }}
                        >
                          🔖
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </main>

        {showToast && (
          <div
            style={{
              ...styles.toast,
              backgroundColor:
                showToast.type === "success"
                  ? "rgba(37, 99, 235, 0.9)"
                  : "rgba(59, 130, 246, 0.9)",
            }}
          >
            {showToast.message}
          </div>
        )}

        {isModalOpen && (
          <BlogModal article={selectedArticle} onClose={closeModal} />
        )}
      </div>
    </>
  );
};

export default Blog;
