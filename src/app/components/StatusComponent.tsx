import * as React from "react";
import { Status, StatusActions } from '../types/intrasocial_types';
import { Avatar } from "./general/Avatar";
import { userAvatar, userFullName, getTextContent } from '../utilities/Utilities';
import classNames from 'classnames';
import Moment from "react-moment";
import * as moment from 'moment-timezone';
let timezone = moment.tz.guess();


import "./StatusComponent.scss"
import { translate } from "../localization/AutoIntlProvider";
import { ProfileManager } from "../managers/ProfileManager";
import ReactionStats from "./ReactionStats";
import ReactButton from "../components/ReactButton";
import { StatusUtilities } from "../utilities/StatusUtilities";
import { AuthenticationManager } from "../managers/AuthenticationManager";
import ContentGallery from './general/ContentGallery';
import HoverLongPressTrigger from "./HoverLongPressTrigger";

interface OwnProps 
{
    onActionPress:(action:StatusActions, extra?:Object) => void
    bottomOptionsEnabled:boolean
    addLinkToContext:boolean
    canMention:boolean
    canComment:boolean
    canReact:boolean
    canUpload:boolean
    authorizedUserId:number
    status:Status
    className?:string
    isComment:boolean
}
interface State 
{
    hover:boolean
    longPress:boolean
}
type Props = OwnProps
export class StatusComponent extends React.Component<Props, State> {
    
    constructor(props:Props)
    {
        super(props)
        this.state = {
            hover:false,
            longPress:false
        }
    }
    shouldComponentUpdate(nextProps:Props, nextState:State) 
    {
        const nextStatus = nextProps.status
        const status = this.props.status
        let ret:boolean = nextStatus.id != status.id || 
        nextStatus.comments_count != status.comments_count ||
        nextStatus.updated_at != status.updated_at || 
        nextStatus.serialization_date != status.serialization_date ||
        nextStatus.reaction_count != status.reaction_count || 

        nextState.hover != this.state.hover || 
        nextState.longPress != this.state.longPress


        //nextStatus.reactions != status.reactions
        //console.log("status id:" + status.id, ret,(status.children_ids || []).length, (nextStatus.children_ids|| []).length, )
        return ret
    }
    getTimestamp = (createdAt:string) => {
        if (!createdAt) {
            return translate("Publishing...")
        }
        // Add one minute to the current date to give some room for time inaccuracy
        let created = moment.utc(createdAt).tz(timezone).toDate();
        let now = moment.utc().tz(timezone).toDate()
        if (created <= now) {
            return <Moment interval={60000} fromNow={true} date={created} />
        } else {
            return <Moment interval={60000} fromNow={true} date={now} />
        }
    }
    renderLikeButton = () => {
        if (this.props.status.created_at != null) {
            const reaction = StatusUtilities.getStatusReaction(this.props.status, AuthenticationManager.getAuthenticatedUser())
            return (
                <ReactButton reaction={reaction}
                onActionPress={this.props.onActionPress}/>
            )
        }
    }
    onHover = () => {
        this.setState({hover:true})
    }
    onHoverOut = () => {
        this.setState({hover:false})
    }
    onLongPress = () => {
        this.setState({longPress:true})
    }
    render() {
        const isComment = !!this.props.status.parent
        const contextObject =  isComment ? null : this.props.status.context_object
        const mentions = ProfileManager.getProfiles(this.props.status.mentions)
        const content = getTextContent( this.props.status.text, mentions, false, this.props.onActionPress)
        const cn = classNames("status-component", this.props.className, "sid-" + this.props.status.id, {comment:this.props.isComment})
        const avatarSize = this.props.isComment ? 40 : 50
        const files = this.props.status.files || []
        const style = this.state.longPress ? {background:"green"} : (this.state.hover ? {background:"orange"} : undefined)
        console.log("render fix status hover:", this.state.hover)
        return(
            <HoverLongPressTrigger leaveTimeout={0} onHover={this.onHover} onHoverOut={this.onHoverOut} onLongPress={this.onLongPress} className={cn}>
                <div style={style} className="d-flex text-truncate">
                    <div className="flex-shrink-0 header-left">
                        <Avatar size={avatarSize} image={userAvatar(this.props.status.owner)}/>
                    </div>
                    <div className="d-flex header-center text-truncate flex-grow-1">
                        <div className="d-flex header-center-content text-truncate">
                            <div className="text-truncate flex-grow-1 d-flex flex-wrap">
                                <div className="text-truncate">
                                    <div className="title text-truncate">{userFullName(this.props.status.owner)}</div>
                                </div>
                                <div className="text-truncate">
                                    <div className="date text-truncate secondary-text">{this.getTimestamp(this.props.status.created_at)}</div>
                                </div>
                            </div>
                            <div className="text-truncate  flex-grow-0 flex-shrink-0">
                                {contextObject && <div className="text-truncate"><div className="context text-truncate">{contextObject.name}</div></div>}
                            </div>
                        </div>
                        <div className="d-flex">
                            <div className="flex-grow-1 text-content">{content}</div>
                            <div className="flex-shrink-0 d-flex align-content-start info-container">
                                {this.props.canReact && 
                                    <div className="reaction-wrapper">
                                        {this.renderLikeButton()}
                                        <ReactionStats reactions={this.props.status.reactions}
                                            reactionsCount={this.props.status.reaction_count}/>
                                    </div>
                                }
                                {!isComment && 
                                    <div className="comments-count-wrapper">
                                        <i className="far fa-comment"></i><span className="comment-count">{this.props.status.comments}</span>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                {files.length > 0 && <ContentGallery files={files}/>}
            </HoverLongPressTrigger>
        );
    }
}
