import * as React from "react";
import { Status, StatusActions, ObjectAttributeType, Permission } from '../../types/intrasocial_types';
import { Avatar } from "../general/Avatar";
import { userAvatar, userFullName, getTextContent } from '../../utilities/Utilities';
import Moment from "react-moment";
import * as moment from 'moment-timezone';
let timezone = moment.tz.guess();

import { translate } from "../../localization/AutoIntlProvider";
import { ProfileManager } from "../../managers/ProfileManager";
import ReactionStats from "./ReactionStats";
import { StatusUtilities } from "../../utilities/StatusUtilities";
import { AuthenticationManager } from "../../managers/AuthenticationManager";
import ContentGallery from '../general/ContentGallery';

import "./StatusComponent.scss"
import Text from "../general/Text";
import StatusOptionsComponent from "./StatusOptionsComponent";
import { ResponsiveBreakpoint } from '../general/observers/ResponsiveComponent';
import { Settings } from '../../utilities/Settings';
import classnames = require("classnames");
import { StatusBadgeList, ObjectAttributeTypeExtension } from "./StatusBadgeList";
import ReactButton from "./ReactButton";

interface OwnProps 
{
    onActionPress:(action:StatusActions, extra?:Object, completion?:(success:boolean) => void) => void
    bottomOptionsEnabled:boolean
    addLinkToContext:boolean
    canUpload:boolean
    authorizedUserId:number
    status:Status
    className?:string
    isComment:boolean
    breakpoint:ResponsiveBreakpoint
}
interface State 
{
    renderPlaceholder:boolean
    readMoreActive:boolean
    refresh:number
}
type Props = OwnProps

export class StatusComponent extends React.Component<Props, State> {
    element = React.createRef<HTMLDivElement>()
    observer:IntersectionObserver = null
    constructor(props:Props)
    {
        super(props)
        const renderPlaceholder = false// !!props.status.temporary ? false : true
        this.state = {
            renderPlaceholder:renderPlaceholder,
            readMoreActive:false,
            refresh:0
        }
    }
    componentDidMount = () => {
        if(this.element.current){
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                  const { isIntersecting } = entry;
                  if (isIntersecting) 
                  {
                    this.setState({renderPlaceholder:false})
                    this.observer.disconnect();
                  }
                });
            },
            {
              rootMargin: "0px 0px 200px 0px"
            });
            this.observer.observe(this.element.current);
        }
    }
    breakpointChanged = (nextBreakpoint:ResponsiveBreakpoint) => {
        return (nextBreakpoint >= ResponsiveBreakpoint.standard && this.props.breakpoint < ResponsiveBreakpoint.standard) ||
        (nextBreakpoint < ResponsiveBreakpoint.standard && this.props.breakpoint >= ResponsiveBreakpoint.standard)
    }
    shouldComponentUpdate(nextProps:Props, nextState:State) 
    {
        const nextStatus = nextProps.status
        const status = this.props.status
        let ret:boolean = this.breakpointChanged(nextProps.breakpoint) ||
        nextStatus.id != status.id || 
        nextStatus.comments != status.comments ||
        nextStatus.updated_at != status.updated_at || 
        nextStatus.serialization_date != status.serialization_date ||
        nextStatus.reaction_count != status.reaction_count ||
        nextState.renderPlaceholder != this.state.renderPlaceholder ||
        nextState.readMoreActive != this.state.readMoreActive ||
        nextProps.className != this.props.className || 
        nextState.refresh != this.state.refresh
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
    onReadMore = (event:any) => {
        this.setState({readMoreActive:true})
    }
    renderReactButton = () => {
        if (this.props.status.created_at != null) {
            const reaction = StatusUtilities.getStatusReaction(this.props.status, AuthenticationManager.getAuthenticatedUser())
            const action = this.props.status.permission > Permission.read ? this.props.onActionPress : undefined
            return (
                <ReactButton reaction={reaction}
                onActionPress={action}/>
            )
        }
    }
    renderTextContent = (textContent: JSX.Element[], hasMore:boolean) => {
        return  (<>
                    {textContent}
                    {hasMore && <span>...&nbsp;<Text onPress={this.onReadMore}>{translate("read more")}</Text></span>}
                </>)
    }
    getAttributeBadgeSettings = (status:Status) => {
        const attrs = status.attributes || []
        const attributes:{[id:string]:boolean} = {}
        if(status.read)
            attributes[ObjectAttributeTypeExtension.read] = true
        attrs.forEach(a => {
            if(a.attribute != ObjectAttributeType.link)
                attributes[a.attribute] = true
        })
        return Object.keys(attributes) as (ObjectAttributeType | ObjectAttributeTypeExtension)[]
    }
    renderStatusBadges = (status:Status) => {

        const badgeSettings = this.getAttributeBadgeSettings(status)
        return <StatusBadgeList setting={badgeSettings} />
    }
    refresh = () => {
        this.setState((prevState) => {
            return {refresh: prevState.refresh + 1}
        })
    }
    getMentions = () => {
        const mentions = this.props.status.mentions
        if(this.state.refresh > 0)
            return ProfileManager.getProfiles(mentions)
        return ProfileManager.getProfilesFetchRest(mentions, this.refresh)
    }
    render() {
        const {status, isComment, className, onActionPress, canUpload, authorizedUserId, breakpoint} = this.props
        if(this.state.renderPlaceholder)
        {
            let itemClass = classnames("status-component status-component-placeholder", this.props.className, { comment: isComment, temp: status.pending})
            return <div ref={this.element} className={itemClass}></div>
        }
        const contextObject =  isComment ? null : status.context_object
        const contextObjectAction =  isComment ? null : () => onActionPress(StatusActions.context)
        const mentions = this.getMentions()
        const truncateLength = this.state.readMoreActive ? 0 : Settings.statusTruncationLength
        const content = getTextContent(status.id.toString(), status.text, mentions, true, onActionPress, truncateLength, Settings.statusLinebreakLimit)
        const {textContent, linkCards, hasMore} = content
        const cn = classnames("status-component", className, "sid-" + status.id, {comment:isComment})
        const avatarSize = isComment ? 40 : 50
        const files = status.files || []
        const ownerAction = () => onActionPress(StatusActions.user, {profile:status.owner})
        let communityId = status.community && status.community.id ? status.community.id : null
        const footerStyles:React.CSSProperties = {justifyContent: isComment ? "space-between" : "space-around"} 
        console.log("Render Status ", status.id)
        return(<div className={cn}>
                <div className="d-flex">
                    <div className="flex-shrink-0 header-left">
                        <Text onPress={ownerAction}>
                            <Avatar size={avatarSize} image={userAvatar(status.owner)}/>
                        </Text>
                    </div>
                    <div className="d-flex header-center flex-grow-1">
                        <div className="d-flex header-center-content text-truncate">
                            <div className="text-truncate flex-grow-1 d-flex flex-wrap header-center-left">
                                <div className="text-truncate">
                                    <Text onPress={ownerAction}>
                                        <div className="title text-truncate">{userFullName(this.props.status.owner)}</div>
                                    </Text>
                                </div>
                                <div className="text-truncate">
                                    <div className="date text-truncate secondary-text">
                                    {this.getTimestamp(this.props.status.created_at)} 
                                    </div>
                                </div>
                                {!isComment && this.renderStatusBadges(status)}
                            </div>
                            <div className="text-truncate  flex-grow-0 flex-shrink-0 header-center-right">
                                {contextObject && 
                                    <div className="text-truncate">
                                        <div className="context text-truncate"><Text onPress={contextObjectAction}>{contextObject.name}</Text></div>
                                    </div>
                                }
                            </div>
                        </div>
                        <div className="d-flex">
                            {(isComment || breakpoint >= ResponsiveBreakpoint.standard) && 
                                <div className="flex-grow-1 text-content">
                                    {breakpoint >= ResponsiveBreakpoint.standard &&
                                        <StatusOptionsComponent 
                                            status={status} 
                                            canMention={true} 
                                            canUpload={canUpload} 
                                            onActionPress={onActionPress}
                                            isOwner={status.owner.id == authorizedUserId}
                                            communityId={communityId}
                                            maxVisible={0}
                                            isComment={this.props.isComment}
                                        />
                                    }
                                    {this.renderTextContent(textContent, hasMore)}
                                </div>
                            }
                            {breakpoint >= ResponsiveBreakpoint.standard && 
                                <div className="flex-shrink-0 d-flex align-content-start info-container">
                                <div className="reaction-wrapper">
                                    {this.renderReactButton()}
                                    <ReactionStats reactions={this.props.status.reactions}
                                        reactionsCount={this.props.status.reaction_count}/>
                                </div>
                                {!isComment && 
                                    <div className="comments-count-wrapper">
                                        <i className="far fa-comment"></i><span className="comment-count">{this.props.status.comments}</span>
                                    </div>
                                }
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <div className="status-content">
                    {!isComment && breakpoint < ResponsiveBreakpoint.standard && 
                        this.renderTextContent(textContent, hasMore)
                    }
                    {files.length > 0 && <ContentGallery files={files}/>}
                    {linkCards.length > 0 && linkCards}
                    {breakpoint < ResponsiveBreakpoint.standard && 
                        <div className="status-footer d-flex" style={footerStyles}>
                            <div className="reaction-wrapper">
                                {this.renderReactButton()}
                                <ReactionStats reactions={this.props.status.reactions}
                                    reactionsCount={this.props.status.reaction_count}/>
                            </div>
                            {!isComment && 
                                    <div className="comments-count-wrapper">
                                        <i className="far fa-comment"></i><span className="comment-count">{this.props.status.comments}</span>
                                    </div>
                            }
                            <StatusOptionsComponent 
                                        status={status} 
                                        canMention={true} 
                                        canUpload={canUpload} 
                                        onActionPress={onActionPress}
                                        isOwner={status.owner.id == authorizedUserId}
                                        communityId={communityId}
                                        maxVisible={0}
                                        isComment={this.props.isComment}
                                        overflowButtonClass="fas fa-ellipsis-h fa-2x"
                                />
                        </div>
                    }
                </div>
            </div>
        );
    }
}
