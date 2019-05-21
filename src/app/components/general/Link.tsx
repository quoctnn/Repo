import * as React from 'react';
import { Link as ReactLink} from "react-router-dom";
import { ReduxState } from '../../redux';
import { connect, DispatchProp } from 'react-redux';
import { EndpointManager } from '../../managers/EndpointManager';
type ReduxStateProps = {
    currentEndpoint:URL
}
type Props = {
    to:string
} & React.AnchorHTMLAttributes<HTMLAnchorElement> & ReduxStateProps & DispatchProp
class Link extends React.Component<Props, {}> {
    parseTo = (to:string) =>  {
        return new URL(to, location.href)
    }
    isInternal(toLocation:URL) {
        return this.props.currentEndpoint.host == toLocation.host;
    }
    render() {
        const {to, children, currentEndpoint, dispatch, ...rest} = this.props;
        const toLocation = this.parseTo(to);
        const isInternal = this.isInternal(toLocation);
        if (isInternal) {
            return (<ReactLink to={toLocation.pathname} {...rest}>{children}</ReactLink>);
        } else {
            return (<a href={to} target="_blank" {...rest}>{children}</a>);
        }
    }
}
const mapStateToProps = (state:ReduxState):ReduxStateProps => {
    return {
        currentEndpoint:new URL(EndpointManager.currentEndpoint().endpoint)
    };
}
export default connect<ReduxStateProps,DispatchProp>(mapStateToProps, null)(Link);