import * as React from 'react';
require('./Toast.scss')

interface ToastProps {
  message?: string;
  description?:string
  buttons?:JSX.Element[]
}
export const ErrorToast = (props:ToastProps) => {
    return <div className="toast-error">
    {props.message || 'Error'}
    {props.description && <div className="toast-description">{props.description}</div>}
    {props.buttons && <div className="d-flex">{props.buttons}</div>}
    </div>;
}
export const InfoToast = (props:ToastProps) => {
    return <div className="toast-info">
    {props.message || 'Info'}
    {props.description && <div className="toast-info-description">{props.description}</div>}
    {props.buttons && <div className="d-flex">{props.buttons}</div>}
    </div>;
}
