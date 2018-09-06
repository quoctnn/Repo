import * as React from 'react';
require('./Toast.scss');
interface ErrorToastProps {
  message?: string;
}
export const ErrorToast: React.SFC<ErrorToastProps> = props => {
  return <div className="toast-error">{props.message}</div>;
};
ErrorToast.defaultProps = {
  message: 'Error'
};

interface InfoToastProps {
  message?: string;
}
export const InfoToast: React.SFC<InfoToastProps> = props => {
  return <div className="toast-info">{props.message}</div>;
};
InfoToast.defaultProps = {
  message: 'Info'
};
