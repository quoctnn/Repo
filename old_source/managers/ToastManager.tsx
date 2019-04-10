import { toast, ToastOptions } from "react-toastify";
import React = require("react");
import { InfoToast, ErrorToast } from "../components/general/Toast";

export abstract class ToastManager 
{
    static setup()
    {
    }
    static showInfoToast = (message:string, opts?:ToastOptions) => 
    {
        toast.info(<InfoToast message={message} />,opts || {hideProgressBar: true});
    }
    static showErrorToast = (message:string, opts?:ToastOptions) => 
    {
        toast.error(<ErrorToast message={message} />,opts || {hideProgressBar: true});
    }
}