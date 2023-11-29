import { Layout } from "antd";
import React from "react";
import "./footer.css";

const CustomerFooter = () => {
  const { Footer } = Layout;

  return (
    <div>
      <Footer className="custom-footer">
        <div className="footer-head">
          <span className="footer-span-1">
            SWIFT<span className="footer-span-2">CART</span>
          </span>
        </div>
        <div className="footer-content">
          <div className="footer-links">
            <a href="#">Home</a>
            <a href="#">Products</a>
            <a href="#">Contact Us</a>
            <a href="#">About Us</a>
          </div>
          <div className="social-icons">
            <a href="#">
              <i className="fa fa-facebook"></i>
            </a>
            <a href="#">
              <i className="fa fa-twitter"></i>
            </a>
            <a href="#">
              <i className="fa fa-instagram"></i>
            </a>
          </div>
        </div>
        <div className="footer-copyright">
          &copy; 2023 Your Company. All rights reserved.
        </div>
      </Footer>
    </div>
  );
};

export default CustomerFooter;
