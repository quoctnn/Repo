import * as React from "react";
require("./LoadingSpinner.scss");

const LoadingSpinner = () => (
    <div className="spinner">
        <div className="bounce1"></div>
        <div className="bounce2"></div>
        <div className="bounce3"></div>
    </div>
);

export default  LoadingSpinner