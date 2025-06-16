import React, {useEffect, useState, useRef, useCallback} from "react";
import "./index.scss";
import VaccineModal from "./VaccineModal";
import blogImg1 from "../../assets/images/9.png";
import blogImg2 from "../../assets/images/10.png";
import blogImg3 from "../../assets/images/11.png";
import blogImg4 from "../../assets/images/12.png";
import blogImg5 from "../../assets/images/13.png";
import blogImg6 from "../../assets/images/14.png";
import blogImg7 from "../../assets/images/15.png";

const vaccineData = [
  {
    id: "mmr",
    name: "Measles - Mumps - Rubella (MMR)",
    image: blogImg1,
    details: [
      "Measles: causes pneumonia, encephalitis, and death.",
      "Mumps: can cause infertility in males.",
      "Rubella: causes birth defects if infected during pregnancy.",
    ],
    schedule: "Vaccinate at 12-15 months and booster at 4-6 years.",
    additionalInfo:
      "The MMR vaccine is highly effective and provides long-lasting protection against three serious diseases. Side effects are generally mild and may include fever and rash.",
  },
  {
    id: "dtp",
    name: "Diphtheria - Pertussis - Tetanus",
    image: blogImg2,
    details: [
      "Diphtheria: damages heart and nervous system.",
      "Pertussis (Whooping cough): prolonged cough, respiratory failure.",
      "Tetanus: muscle stiffness, high mortality.",
    ],
    schedule: "Multiple doses starting at 2 months old.",
    additionalInfo:
      "The DTP vaccine protects against three bacterial infections. It's given as a series of shots during infancy and childhood, with boosters recommended throughout life.",
  },
  {
    id: "hepatitis-b",
    name: "Hepatitis B",
    image: blogImg3,
    details: [
      "Causes liver cirrhosis and liver cancer.",
      "Vaccinate within 24 hours after birth.",
    ],
    schedule:
      "First dose at birth, with follow-up doses at 1-2 months and 6-18 months.",
    additionalInfo:
      "Hepatitis B vaccine provides long-term protection against a serious liver infection. It's recommended for all infants and is very safe and effective.",
  },
  {
    id: "hib",
    name: "Haemophilus influenzae type b (Hib)",
    image: blogImg4,
    details: [
      "Causes purulent meningitis in young children.",
      "Usually included in 5-in-1 or 6-in-1 vaccines.",
    ],
    schedule: "Doses at 2, 4, 6 months with booster at 12-15 months.",
    additionalInfo:
      "Hib vaccine has dramatically reduced serious Hib disease in children. It's often given as part of combination vaccines to reduce the number of shots needed.",
  },
  {
    id: "chickenpox",
    name: "Chickenpox",
    image: blogImg5,
    details: [
      "Complications: pneumonia, encephalitis, skin infections.",
      "Vaccination helps reduce spread and complications.",
    ],
    schedule: "First dose at 12-15 months and second dose at 4-6 years.",
    additionalInfo:
      "Chickenpox vaccine is very effective at preventing severe disease. Even if vaccinated children get chickenpox, it's usually much milder.",
  },
  {
    id: "flu",
    name: "Seasonal Flu",
    image: blogImg6,
    details: [
      "Dangerous for elderly, young children, and people with underlying conditions.",
      "Annual vaccination to keep up with virus mutations.",
    ],
    schedule: "Annual vaccination before flu season begins.",
    additionalInfo:
      "Annual flu vaccination is recommended for everyone 6 months and older. The vaccine is updated each year to protect against the viruses expected to circulate.",
  },
  {
    id: "covid-19",
    name: "COVID-19",
    image: blogImg7,
    details: [
      "Spreads rapidly, causes severe illness in people with underlying conditions.",
      "Vaccination reduces death and controls outbreaks.",
    ],
    schedule: "Initial series plus boosters as recommended.",
    additionalInfo:
      "COVID-19 vaccines are safe and effective at preventing severe illness, hospitalization, and death. Boosters help maintain protection as immunity wanes over time.",
  },
];

const Resources = () => {
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [visibleCards, setVisibleCards] = useState([]);
  const [visibleElements, setVisibleElements] = useState(new Set());
  const [counters, setCounters] = useState({
    vaccines: 0,
    protection: 0,
    students: 0,
  });
  const observerRef = useRef();

  // Intersection Observer để theo dõi khi elements xuất hiện
  const observeElement = useCallback((element, id) => {
    if (!element) return;

    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const elementId = entry.target.dataset.observeId;
              setVisibleElements((prev) => new Set([...prev, elementId]));
            }
          });
        },
        {threshold: 0.01, rootMargin: "5000px"}
      );
    }

    element.dataset.observeId = id;
    observerRef.current.observe(element);
  }, []);

  // Animation cho counter numbers
  const animateCounter = useCallback((target, key, duration = 2000) => {
    const start = 0;
    const startTime = Date.now();

    const updateCounter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function cho animation mượt hơn
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (target - start) * easeOutQuart);

      setCounters((prev) => ({...prev, [key]: current}));

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }, []);

  // Trigger counter animations khi stats section visible
  useEffect(() => {
    if (visibleElements.has("hero-stats")) {
      setTimeout(() => animateCounter(7, "vaccines"), 200);
      setTimeout(() => animateCounter(95, "protection"), 400);
      setTimeout(() => animateCounter(1200, "students"), 600);
    }
  }, [visibleElements, animateCounter]);

  // Animate vaccine cards khi visible
  useEffect(() => {
    if (
      visibleElements.has("vaccines-grid") &&
      visibleCards.length === 0 // chỉ animate khi chưa hiện card nào
    ) {
      vaccineData.forEach((_, index) => {
        setTimeout(() => {
          setVisibleCards((prev) => {
            if (!prev.includes(index)) return [...prev, index];
            return prev;
          });
        }, index * 10);
      });
    }
    // Không reset setVisibleCards([]) nữa!
  }, [visibleElements, visibleCards.length]);

  // Cleanup observer
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handleVaccineClick = (vaccine) => {
    setSelectedVaccine(vaccine);
  };

  const closeModal = () => {
    setSelectedVaccine(null);
  };

  // Vaccine Card Component
  const VaccineCard = ({vaccine, index, isVisible, onClick}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        className={`vaccine-card ${isVisible ? "visible" : ""} ${
          isHovered ? "hovered" : ""
        }`}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{"--delay": `${index * 0.1}s`}}
      >
        <div className="card-glow"></div>
        <div className="card-number">{String(index + 1).padStart(2, "0")}</div>

        <div className="card-image">
          <div className="image-overlay"></div>
          <div className="image-placeholder">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <img
            src={vaccine.image || "/placeholder.svg?height=200&width=300"}
            alt={vaccine.name}
          />
        </div>

        <div className="card-content">
          <h3 className="card-title">{vaccine.name}</h3>

          <div className="card-details">
            {vaccine.details.slice(0, 2).map((detail, idx) => (
              <div key={idx} className="detail-item">
                <div className="detail-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                </div>
                <span className="detail-text">{detail}</span>
              </div>
            ))}
          </div>

          <div className="card-schedule">
            <div className="schedule-header">
              <div className="schedule-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span className="schedule-label">Vaccination Schedule</span>
            </div>
            <p className="schedule-text">{vaccine.schedule}</p>
          </div>

          <div className="card-action">
            <button className="action-button">
              <span>Learn More</span>
              <div className="button-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7,7 17,7 17,17" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="vaccine-container">
      <section className="vaccine-section">
        <div className="hero-background">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
            <div className="shape shape-5"></div>
          </div>
          <div className="gradient-overlay"></div>
        </div>

        <div className="container">
          <div
            className={`hero-section ${
              visibleElements.has("hero-section") ? "animate-in" : ""
            }`}
            ref={(el) => observeElement(el, "hero-section")}
          >
            <div className="hero-badge">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <span>School Health Protection</span>
            </div>

            <h1 className="hero-title">
              <span className="title-line">Important Role</span>
              <span className="title-line highlight">of Vaccines</span>
            </h1>

            <p className="hero-subtitle">
              Vaccination is one of the most effective measures to prevent
              dangerous infectious diseases, helping protect both individual and
              community health in our school environment.
            </p>

            <div
              className={`hero-stats ${
                visibleElements.has("hero-stats") ? "animate-in" : ""
              }`}
              ref={(el) => observeElement(el, "hero-stats")}
            >
              <div className="stat-item">
                <div className="stat-number">{counters.vaccines}</div>
                <div className="stat-label">Essential Vaccines</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">{counters.protection}%</div>
                <div className="stat-label">Protection Rate</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">
                  {counters.students.toLocaleString()}+
                </div>
                <div className="stat-label">Students Protected / Year</div>
              </div>
            </div>
          </div>

          <div
            className={`section-intro ${
              visibleElements.has("section-intro") ? "animate-in" : ""
            }`}
            ref={(el) => observeElement(el, "section-intro")}
          >
            <h2 className="intro-title">
              Essential Vaccines for School Health
            </h2>
            <p className="intro-description">
              Click on any vaccine card below to learn more about its
              importance, schedule, and benefits for your child's health.
            </p>
          </div>

          <div
            className="vaccines-grid"
            ref={(el) => observeElement(el, "vaccines-grid")}
          >
            {vaccineData.map((vaccine, index) => (
              <VaccineCard
                key={vaccine.id}
                vaccine={vaccine}
                index={index}
                isVisible={visibleCards.includes(index)}
                onClick={() => handleVaccineClick(vaccine)}
              />
            ))}
          </div>

          <div
            className={`section-footer ${
              visibleElements.has("section-footer") ? "animate-in" : ""
            }`}
            ref={(el) => observeElement(el, "section-footer")}
          >
            <div className="footer-content">
              <div className="footer-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22,4 12,14.01 9,11.01" />
                </svg>
              </div>
              <div className="footer-text">
                <h3>Stay Protected & Healthy</h3>
                <p>
                  Please follow the vaccination schedule and get fully
                  vaccinated to protect your own health and the community.
                  Consult with healthcare professionals for personalized advice.
                </p>
              </div>
            </div>

            <div className="contact-info">
              <div className="contact-item">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>Emergency: (024) 841-512-456</span>
              </div>
              <div className="contact-item">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>health@school.edu.vn</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {selectedVaccine && (
        <VaccineModal vaccine={selectedVaccine} onClose={closeModal} />
      )}
    </div>
  );
};

export default Resources;
