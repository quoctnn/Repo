import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import classnames from "classnames"
import "./ConversationContainerModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { Conversation, UserProfile} from '../../types/intrasocial_types';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import SimpleModule from '../SimpleModule';
import { EventSubscription } from 'fbemitter';
import ConversationsModule from '../conversations/ConversationsModule';
import { CommonModuleProps } from '../Module';
import ConversationDetailsModule from './ConversationDetailsModule';
import ConversationModule from './ConversationModule';
import { NotificationCenter } from '../../utilities/NotificationCenter';
import { ResponsiveNotifierDidUpdateNotification } from '../../components/general/observers/ResponsiveNotifier';
import { ContextDataProps, withContextData } from '../../hoc/WithContextData';

type OwnProps = {
    className?:string
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps
type State = {
    singleMode:boolean
}
type ReduxStateProps = {
    conversationId:string
    conversation:Conversation
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps & ContextDataProps
class ConversationContainerModule extends React.Component<Props, State> {

    private observers:EventSubscription[] = []
    constructor(props:Props) {
        super(props);
        this.state = {
            singleMode:this.isSingleMode()
        }
        this.observers.push(NotificationCenter.addObserver(ResponsiveNotifierDidUpdateNotification, this.processResponsiveNotifierDidUpdateNotification))
    }
    isSingleMode = () => {
        return window.app.breakpoint < ResponsiveBreakpoint.big
    }
    processResponsiveNotifierDidUpdateNotification = (...args:any[]) => {
        const mode = this.isSingleMode()
        if(mode != this.state.singleMode)
        {
            this.setState(() => {
                return {singleMode:mode}
            })
        }
    }
    componentDidMount = () => {
    }
    componentWillUnmount = () =>
    {
        this.observers.forEach(o => o.remove())
        this.observers = null;
    }
    renderContent = () => {
        const showConversationsOnly = this.state.singleMode &&  !this.props.conversationId
        const showConversationOnly = this.state.singleMode &&  !!this.props.conversationId
        const showDetails = !this.state.singleMode
        const csm = classnames("h-100 flex-column", {"col-3 d-flex":!this.state.singleMode, "col-12 d-flex":showConversationsOnly, "d-none":this.state.singleMode && !showConversationsOnly})
        const cm = classnames("h-100 flex-column", {"col-6 d-flex":!this.state.singleMode, "col-12 d-flex":showConversationOnly, "d-none":this.state.singleMode && !showConversationOnly})
        const cd = classnames("col-3 flex-column", {"d-none": !showDetails, "d-flex":showDetails})
        return <div className="fill">
            <ConversationsModule breakpoint={this.props.breakpoint} className={csm} />
            <ConversationModule singleMode={showConversationOnly} breakpoint={this.props.breakpoint} className={cm} />
            <ConversationDetailsModule breakpoint={this.props.breakpoint} className={cd} />
        </div>
    }
    render()
    {
        const {history, match, location, staticContext, contextNaturalKey, conversation, conversationId,  ...rest} = this.props
        const {breakpoint, className} = this.props
        const cn = classnames("conversation-container-module", className, {temporary:conversation && conversation.temporary, "single-mode":this.state.singleMode})
        return (<SimpleModule {...rest}
                    className={cn}
                    breakpoint={breakpoint}
                    showHeader={false}
                    isLoading={false}>
                {this.renderContent()}
                </SimpleModule>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any> & ContextDataProps):ReduxStateProps => {

    const conversation = ownProps.contextData.conversation
    const conversationId:string = ownProps.match.params.conversationId
    return {
        conversation,
        conversationId
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withContextData(withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(ConversationContainerModule)))