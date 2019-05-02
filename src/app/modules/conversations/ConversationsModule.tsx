import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import classnames from "classnames"
import "./ConversationsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { ContextNaturalKey, Conversation } from '../../types/intrasocial_types';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import SimpleModule from '../SimpleModule';
import { translate } from '../../localization/AutoIntlProvider';
import ListComponent from '../../components/general/ListComponent';
import ApiClient, { PaginationResult } from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import ConversationListItem from './ConversationListItem';
type OwnProps = {
    className?:string
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey?:ContextNaturalKey
}
type State = {
    isLoading:boolean
}
type ReduxStateProps = {
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class ConversationsModule extends React.Component<Props, State> {  
    conversationsList = React.createRef<ListComponent<Conversation>>()
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
        }
    }
    componentDidUpdate = (prevProps:Props) => {
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({isLoading:false})
        }
    }
    headerClick = (e) => {
        //NavigationUtilities.navigateToNewsfeed(this.props.history, context && context.type, context && context.id, this.state.includeSubContext)
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    fetchConversations = (offset:number, completion:(items:PaginationResult<Conversation>) => void ) => {
        ApiClient.getConversations( 30, offset, (data, status, error) => {
            completion(data)
            ToastManager.showErrorToast(error)
        })
    }
    renderConversation = (conversation:Conversation) =>  {
        return <ConversationListItem key={conversation.id} conversation={conversation} />
    }
    renderEmpty = () => {
        return <div>{"Empty List"}</div>
    }
    renderContent = () => {

        const {} = this.props
        return <>
            <ListComponent<Conversation> 
                        ref={this.conversationsList} 
                        renderEmpty={this.renderEmpty}
                        onLoadingStateChanged={this.feedLoadingStateChanged} 
                        fetchData={this.fetchConversations} 
                        renderItem={this.renderConversation} className="conversations-module-list" />
            </>
    }
    render()
    {
        const {history, match, location, staticContext, contextNaturalKey, ...rest} = this.props
        const {breakpoint, className} = this.props
        const cn = classnames("conversations-module", className)
        return (<SimpleModule {...rest} 
                    className={cn} 
                    headerClick={this.headerClick} 
                    breakpoint={breakpoint} 
                    isLoading={this.state.isLoading} 
                    headerTitle={translate("conversations.module.title")}>
                {this.renderContent()}
                </SimpleModule>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {

    return {
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(ConversationsModule))