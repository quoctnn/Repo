import { toast, ToastOptions } from "react-toastify";
import React = require("react");
import { InfoToast, ErrorToast } from "../components/general/Toast";
import { Link } from "react-router-dom";

export abstract class ToastManager
{
    static setup()
    {
    }
    static showInfoToast = (message:string, description?:string, link?:string, buttons?:JSX.Element[], opts?:ToastOptions) =>
    {
        if(message) {
            let infoBox = (<InfoToast message={message} description={description} buttons={buttons} />)
            // TODO: Style the link better
            if (link) infoBox = <Link className='no-link' to={link}>{infoBox}</Link>
            console.log(infoBox)
            toast.info(infoBox, opts || {hideProgressBar: true});
        }
    }
    static showErrorToast = (message:string, preferredMessage?:string, description?:string, buttons?:JSX.Element[], opts?:ToastOptions) =>
    {
        if(message)
            toast.error(<ErrorToast message={preferredMessage || message} description={description} buttons={buttons} />,opts || {hideProgressBar: true});
    }
}