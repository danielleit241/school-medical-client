import "./Footer.scss";
import {FaPhoneAlt, FaEnvelope, FaLocationArrow} from "react-icons/fa";
import HeaderLogoBottom from "../../assets/images/Black Modern Medical Logo.svg";
const Footer = () => (
  <footer className="footer">
    <div className="hr"></div>
    <div className="footer__container">
      <div className="footer__section footer__logo">
        <a href="/">
          <img
            src={HeaderLogoBottom}
            alt="Medicare Logo"
            className="footer__logo-img"
          />
        </a>
      </div>
      <div className="footer__divider" />
      <div className="footer__section">
        <h3>Quick Links</h3>
        <ul>
          <li>
            <a style={{textDecoration: "none"}} href="/">
              Home
            </a>
          </li>
          <li>
            <a href="/parent/appointments-list">Appointment</a>
          </li>
          <li>
            <a href="/resources">Vaccine</a>
          </li>
          <li>
            <a href="/blog">Blog</a>
          </li>
          <li>
            <a href="/contact">Contact</a>
          </li>
        </ul>
      </div>
      <div className="footer__divider" />
      <div className="footer__section">
        <h3>Hours</h3>
        <ul>
          <li>
            Monday: <span>8:00 - 17:00</span>
          </li>
          <li>
            Tuesday: <span>8:00 - 17:00</span>
          </li>
          <li>
            Wednesday: <span>8:00 - 17:00</span>
          </li>
          <li>
            Thursday: <span>8:00 - 17:00</span>
          </li>
          <li>
            Friday: <span>8:00 - 17:00</span>
          </li>
        </ul>
      </div>
      <div className="footer__divider" />
      <div className="footer__section">
        <h3>Contact</h3>
        <ul className="footer__contact">
          <li>
            <FaPhoneAlt /> 079.999.5828
          </li>
          <li>
            <FaEnvelope /> globalcitizen1205@gmail.com
          </li>
          <li>
            <FaLocationArrow /> Thanh Pho Ho Chi Minh
          </li>
        </ul>
      </div>
    </div>
  </footer>
);

export default Footer;
