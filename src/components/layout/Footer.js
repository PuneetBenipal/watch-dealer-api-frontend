import React from 'react';

const Footer = () => (
  <>
    <footer className="footer-main">
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-4">
            <div className="footer-logo">
              <span className="footer-logo-icon">
                <i className="bi bi-mortarboard"></i>
              </span>
              Smart Agent
            </div>
            <div className="footer-description">
              Empowering businesses with intelligent automation and seamless customer engagement through AI-powered solutions.
            </div>
            <div className="footer-socials">
              <a href="#" className="footer-social-btn"><i className="bi bi-twitter"></i></a>
              <a href="#" className="footer-social-btn"><i className="bi bi-github"></i></a>
              <a href="#" className="footer-social-btn"><i className="bi bi-linkedin"></i></a>
              <a href="#" className="footer-social-btn"><i className="bi bi-envelope"></i></a>
            </div>
          </div>
          <div className="col-6 col-lg-2">
            <div className="footer-link-title">Solutions</div>
            <a href="#" className="footer-link">AI Agents</a>
            <a href="#" className="footer-link">WhatsApp Integration</a>
            <a href="#" className="footer-link">How It Works</a>
            <a href="#" className="footer-link">Pricing</a>
          </div>
          <div className="col-6 col-lg-2">
            <div className="footer-link-title">Company</div>
            <a href="#" className="footer-link">About Us</a>
            <a href="#" className="footer-link">Careers</a>
            <a href="#" className="footer-link">Affiliates</a>
            <a href="#" className="footer-link">Contact</a>
          </div>
          <div className="col-6 col-lg-2">
            <div className="footer-link-title">Resources</div>
            <a href="#" className="footer-link">Documentation</a>
            <a href="#" className="footer-link">Help Center</a>
            <a href="#" className="footer-link">Blog</a>
            <a href="#" className="footer-link">API Reference</a>
          </div>
          <div className="col-6 col-lg-2">
            <div className="footer-link-title">Legal</div>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Data Protection</a>
            <a href="#" className="footer-link">Cookie Policy</a>
          </div>
        </div>
        <div className="footer-bottom">
          <div>2025 Smart Agent. All rights reserved.</div>
          <div>Crafted with innovation to power business automation and customer engagement.</div>
        </div>
      </div>
    </footer>
  </>
);

export default Footer;
