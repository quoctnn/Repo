import * as React from "react";
import "./StatusGallery.scss"
import { UploadedFile } from "../types/intrasocial_types";

type Props = 
{
    files:UploadedFile[]
}

export class StatusGallery extends React.Component<Props, {}> {
    render() {
        return(
            <div className="status-gallery">
                StatusGallery coming up next
            </div>
        );
    }
}
