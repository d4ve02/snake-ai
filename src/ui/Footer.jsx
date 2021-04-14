import React from "react";
import "../css/Footer.css";

const Footer = () => {
    return (
        <div className="closingFooter">
            <div
                className="scrollToTop"
                onClick={() => {
                    window.scrollTo(0, 0);
                }}
            >
                <i className="fas fa-arrow-up" />
            </div>
        </div>
    );
};

export default Footer;
