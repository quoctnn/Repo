import * as React from "react";
import "./StatusGallery.scss"
import { UploadedFile } from "../types/intrasocial_types";

type Props = 
{
    files:UploadedFile[]
}

export class StatusGallery extends React.Component<Props, {}> {
    render() {
        const files = this.props.files.slice(0, 5)
        const count = this.props.files.length
        return(
            <div className="status-gallery d-flex">
                {files.map(f => {
                    <div className="file-preview"></div>
                })}
            </div>
        );
    }
}
