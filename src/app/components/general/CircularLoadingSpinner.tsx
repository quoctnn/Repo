import * as React from "react";
require("./CircularLoadingSpinner.scss");

type Props = {
    borderWidth?:number
    spinnerColor?:string
    spinnerBackgroundColor?:string
    size?:number
}
const CircularLoadingSpinner = (props:Props) => (
    <div className="circular-spinner" style={{borderStyle:"solid", borderWidth:props.borderWidth || 2, borderColor:props.spinnerBackgroundColor || "#f3f3f3", borderTopColor:props.spinnerColor, width:props.size || 30, height: props.size || 30}}>
    </div>
);

export default  CircularLoadingSpinner