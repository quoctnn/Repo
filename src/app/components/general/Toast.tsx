import * as React from 'react';
require('./Toast.scss')

interface ErrorToastProps {
  message?: string;
}
export const ErrorToast = (props:ErrorToastProps) => {
    return <div className="toast-error">{props.message || 'Error'}</div>;
}
//////
interface InfoToastProps {
    message?: string;
}
export const InfoToast = (props:InfoToastProps) => {
    return <div className="toast-info">{props.message || 'Info'}</div>;
}
