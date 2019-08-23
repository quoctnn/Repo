import * as React from 'react';
import { Link } from 'react-router-dom';
require('./Toast.scss')

interface ToastProps {
  message?: string;
  description?:string
  buttons?:JSX.Element[]
  link?:string
}
export const ErrorToast = (props:ToastProps) => {
    return <div className="toast-error">
    {props.message || 'Error'}
    {props.description && <div className="toast-description">{props.description}</div>}
    {props.buttons && <div className="d-flex">{props.buttons}</div>}
    </div>;
}
export const InfoToast = (props:ToastProps) => {
    let content = <>
              {props.message || 'Info'}
              {props.description && <div className="toast-info-description">{props.description}</div>}
              {props.buttons && <div className="d-flex">{props.buttons}</div>}
        </>
    if (props.link) 
        content = <Link className='no-link' to={props.link}>{content}</Link>
    return <div className="toast-info">
                {content}
            </div>
}
