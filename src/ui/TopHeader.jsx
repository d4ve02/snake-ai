import React from "react";
import "../css/TopHeader.css";

const TopHeader = () => {
    return (
        <div className="topHeader">
            <a
                href="https://github.com/d4ve02/snake-ai"
                rel="noreferrer"
                target="_blank"
            >
                <i className="fab fa-github"></i>
                Check the source code!
            </a>
        </div>
    );
};

export default TopHeader;
