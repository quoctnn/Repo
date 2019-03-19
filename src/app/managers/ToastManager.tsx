import { toast, ToastOptions } from "react-toastify";
import React = require("react");
import { InfoToast, ErrorToast } from "../components/general/Toast";

export abstract class ToastManager 
{
    static setup()
    {
    }
    static showInfoToast = (message:string, description?:string, opts?:ToastOptions) => 
    {
        if(message)
            toast.info(<InfoToast message={message} description={description} />,opts || {hideProgressBar: true});
    }
    static showErrorToast = (message:string, preferredMessage?:string, opts?:ToastOptions) => 
    {
        if(message)
            toast.error(<ErrorToast message={preferredMessage || message} />,opts || {hideProgressBar: true});
    }
}