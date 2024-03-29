import { connect } from 'react-redux';
import { CommunityManager } from '../../../../managers/CommunityManager';
import { ContextDataProps, withContextData } from '../../../../hoc/WithContextData';
import { Community, ContextObject, Group, ContextNaturalKey, Event, Project, UserProfile, AvatarAndCover } from '../../../../types/intrasocial_types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../../../general/Avatar';
import { ReduxState } from '../../../../redux';
import classnames from 'classnames';
import './ContextListItem.scss';
import { communitiesById } from '../../../../redux/communityStore';

type State = {
}

type OwnProps = {
    contextObject: ContextObject
    type: string
    setParent?: (object:ContextObject) => void
    onClick?: (e: React.MouseEvent) => void
}

type ReduxStateProps = {
    activeCommunity:Community
}

type Props = OwnProps & ContextDataProps & ReduxStateProps

class ContextListItem extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
        }
    }

    shouldComponentUpdate = (nextProps: Props, nextState:State) => {
        const newCommunity = this.props.type === ContextNaturalKey.COMMUNITY && (this.props.contextData.community && nextProps.contextData.community && this.props.contextData.community.id != nextProps.contextData.community.id) || (nextProps.contextData.community && !this.props.contextData.community) || (this.props.contextData.community && !nextProps.contextData.community)
        const newGroup = this.props.type === ContextNaturalKey.GROUP && (this.props.contextData.group && nextProps.contextData.group && this.props.contextData.group.id != nextProps.contextData.group.id) || (nextProps.contextData.group && !this.props.contextData.group) || (this.props.contextData.group && !nextProps.contextData.group)
        const newEvent = this.props.type === ContextNaturalKey.EVENT && (this.props.contextData.event && nextProps.contextData.event && this.props.contextData.event.id != nextProps.contextData.event.id) || (nextProps.contextData.event && !this.props.contextData.event) || (this.props.contextData.event && !nextProps.contextData.event)
        const newProject = this.props.type === ContextNaturalKey.PROJECT && (this.props.contextData.project && nextProps.contextData.project && this.props.contextData.project.id != nextProps.contextData.project.id) || (nextProps.contextData.project && !this.props.contextData.project) || (this.props.contextData.project && !nextProps.contextData.project)
        const changedActive = this.props.activeCommunity != nextProps.activeCommunity
        return changedActive || newCommunity || newGroup || newEvent || newProject
    }

    renderCommunity = () => {
        const community = this.props.contextObject as Community
        const isMain = this.props.activeCommunity && this.props.activeCommunity.id == community.id
        const isActive = this.props.contextData.community && this.props.contextData.community.id == community.id
        const cn = classnames("d-flex list-item", {"active": isActive})
        return (
            <Link className={cn} to={community.uri} key={community.id} onClick={this.props.onClick}>
                <div className="icon">
                    {isMain &&
                        <i className="fa fa-home"/>
                        ||
                        <i className="fa fa-globe"/>
                    }
                </div>
                <div className="name text-truncate flex-grow-1">{community.name}</div>
                <div className="avatar">
                    { community.avatar_thumbnail &&
                        <Avatar image={community.avatar_thumbnail} size={22} />
                    }
                </div>
            </Link>
        )
    }

    navigateDeeper = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        this.props.setParent(this.props.contextObject);
    }

    renderGroup = () => {
        const group = this.props.contextObject as Group
        if (!group){
            return null
        }
        const isActive = this.props.contextData.group && this.props.contextData.group.id == group.id
        const hasChildren = group.subgroups > 0
        const cn = classnames("d-flex list-item", {"active": isActive})
        return (
            <Link className={cn} to={group.uri} key={group.id} onClick={this.props.onClick}>
                <div className="icon">
                    {hasChildren &&
                        <i className="fa fa-chevron-right" onClick={this.navigateDeeper}/>
                        ||
                        <i className="fa fa-users"/>
                    }
                </div>
                <div className="name text-truncate flex-grow-1">{group.name}</div>
                <div className="avatar">
                    {group.avatar_thumbnail &&
                        <Avatar image={group.avatar_thumbnail} size={22} />
                    }
                </div>
            </Link>
        )
    }

    renderEvent = () => {
        const event = this.props.contextObject as Event
        if (!event){
            return null
        }
        const isActive = this.props.contextData.event && this.props.contextData.event.id == event.id
        const hasChildren = event.sessions > 0
        const cn = classnames("d-flex list-item", {"active": isActive})
        return (
            <Link className={cn} to={event.uri} key={event.id} onClick={this.props.onClick}>
                <div className="icon">
                    {hasChildren &&
                        <i className="fa fa-chevron-right" onClick={this.navigateDeeper}/>
                        ||
                        <i className="fa fa-calendar"/>
                    }
                </div>
                <div className="name text-truncate flex-grow-1">{event.name}</div>
                <div className="avatar">
                    {event.avatar_thumbnail &&
                        <Avatar image={event.avatar_thumbnail} size={22} />
                    }
                </div>
            </Link>
        )
    }

    renderProject = () => {
        const project = this.props.contextObject as Project
        if (!project){
            return null
        }
        const isActive = this.props.contextData.project && this.props.contextData.project.id == project.id
        const cn = classnames("d-flex list-item", {"active": isActive})
        return (
            <Link className={cn} to={project.uri} key={project.id} onClick={this.props.onClick}>
                <div className="icon">
                    <i className="fa fa-folder-open"/>
                </div>
                <div className="name text-truncate flex-grow-1">{project.name}</div>
                <div className="avatar">
                    { project.avatar_thumbnail &&
                        <Avatar image={project.avatar_thumbnail} size={22} />
                    }
                </div>
            </Link>
        )
    }

    renderUser = () => {
        const profile = this.props.contextObject as ContextObject & AvatarAndCover
        if (!profile){
            return null
        }
        const isActive = this.props.contextData.profile && this.props.contextData.profile.id == profile.id
        const cn = classnames("d-flex list-item", {"active": isActive})
        return (
            <Link className={cn} to={profile.uri} key={profile.id} onClick={this.props.onClick}>
                <div className="icon">
                    <i className="fa fa-user"/>
                </div>
                <div className="name text-truncate flex-grow-1">{profile.name}</div>
                <div className="avatar">
                    {profile.avatar_thumbnail &&
                        <Avatar image={profile.avatar_thumbnail} size={22} />
                    }
                </div>
            </Link>
        )
    }

    render() {
        switch(this.props.type){
            case ContextNaturalKey.COMMUNITY:
                return this.renderCommunity();
            case ContextNaturalKey.GROUP:
                return this.renderGroup();
            case ContextNaturalKey.EVENT:
                return this.renderEvent();
            case ContextNaturalKey.PROJECT:
                return this.renderProject();
            case ContextNaturalKey.USER:
                return this.renderUser();
            default:
                return null;
        }
    }
}

const mapStateToProps = (state: ReduxState, ownProps: OwnProps): ReduxStateProps => {

    const activeCommunity = CommunityManager.getActiveCommunity();
    return {
        activeCommunity
    }
}

export default withContextData(connect<ReduxStateProps, {}, OwnProps>(mapStateToProps, null)(ContextListItem))