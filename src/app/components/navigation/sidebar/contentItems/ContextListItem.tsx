import { connect } from 'react-redux';
import { CommunityManager } from '../../../../managers/CommunityManager';
import { ContextDataProps, withContextData } from '../../../../hoc/WithContextData';
import { Community, ContextObject, Group, ContextNaturalKey, Event, Project } from '../../../../types/intrasocial_types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../../../general/Avatar';
import { ReduxState } from '../../../../redux';
import classnames from 'classnames';
import './ContextListItem.scss';

type State = {
}

type OwnProps = {
    contextObject: ContextObject
    type: string
    setParent?: (object:ContextObject) => void
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
        const newCommunity = this.props.type === "community" && (this.props.contextData.community && nextProps.contextData.community && this.props.contextData.community.id != nextProps.contextData.community.id) || (nextProps.contextData.community && !this.props.contextData.community) || (this.props.contextData.community && !nextProps.contextData.community)
        const newGroup = this.props.type === "group" && (this.props.contextData.group && nextProps.contextData.group && this.props.contextData.group.id != nextProps.contextData.group.id) || (nextProps.contextData.group && !this.props.contextData.group) || (this.props.contextData.group && !nextProps.contextData.group)
        const changedActive = this.props.activeCommunity != nextProps.activeCommunity
        return changedActive || newCommunity || newGroup
    }

    renderCommunity = () => {
        const community = this.props.contextObject as Community
        const isMain = this.props.activeCommunity && this.props.activeCommunity.id == community.id
        const isActive = this.props.contextData.community && this.props.contextData.community.id == community.id
        const cn = classnames("d-flex list-item", {"active": isActive})
        return (
            <Link className={cn} to={community.uri} key={community.id}>
                <div className="icon">
                    {isMain &&
                        <i className="fa fa-home"/>
                        ||
                        <i className="fa fa-globe"/>
                    }
                </div>
                <div className="name text-truncate flex-grow-1">{community.name}</div>
                <div className="avatar">
                    <Avatar image={community.avatar_thumbnail} size={22} />
                </div>
            </Link>
        )
    }

    navigateDeeper = (e: React.MouseEvent) => {
        e.preventDefault();
        this.props.setParent(this.props.contextObject);
    }

    renderGroup = () => {
        const group = this.props.contextObject as Group
        if (!group){
            return <></>
        }
        const isActive = this.props.contextData.group && this.props.contextData.group.id == group.id
        // TODO: get childen info in endpoint
        const hasChildren = this.props.setParent
        const hasParent = group.parent
        const cn = classnames("d-flex list-item", {"active": isActive})
        return (
            <Link className={cn} to={group.uri} key={group.id}>
                <div className="icon">
                    {hasChildren &&
                        <i className="fa fa-chevron-right" onClick={this.navigateDeeper}/>
                        ||
                        <i className="fa fa-users"/>
                    }
                </div>
                <div className="name text-truncate flex-grow-1">{group.name}</div>
                <div className="avatar">
                    <Avatar image={group.avatar_thumbnail} size={22} />
                </div>
            </Link>
        )
    }

    renderEvent = () => {
        const event = this.props.contextObject as Event
        if (!event){
            return <></>
        }
        const isActive = this.props.contextData.event && this.props.contextData.event.id == event.id
        // TODO: get childen info in endpoint
        const hasChildren = this.props.setParent
        const hasParent = event.parent
        const cn = classnames("d-flex list-item", {"active": isActive})
        return (
            <Link className={cn} to={event.uri} key={event.id}>
                <div className="icon">
                    {hasChildren &&
                        <i className="fa fa-chevron-right" onClick={this.navigateDeeper}/>
                        ||
                        <i className="fa fa-calendar"/>
                    }
                </div>
                <div className="name text-truncate flex-grow-1">{event.name}</div>
                <div className="avatar">
                    <Avatar image={event.avatar_thumbnail} size={22} />
                </div>
            </Link>
        )
    }

    renderProject = () => {
        const project = this.props.contextObject as Project
        if (!project){
            return <></>
        }
        const isActive = this.props.contextData.project && this.props.contextData.project.id == project.id
        const cn = classnames("d-flex list-item", {"active": isActive})
        return (
            <Link className={cn} to={project.uri} key={project.id}>
                <div className="icon">
                    <i className="fa fa-home"/>
                </div>
                <div className="name text-truncate flex-grow-1">{project.name}</div>
                <div className="avatar">
                    <Avatar image={project.avatar_thumbnail} size={22} />
                </div>
            </Link>
        )
    }

    render() {
        switch(this.props.type){
            case ContextNaturalKey.COMMUNITY:
                return this.renderCommunity()
            case ContextNaturalKey.GROUP:
                return this.renderGroup()
            case ContextNaturalKey.EVENT:
                return this.renderEvent()
            case ContextNaturalKey.PROJECT:
                return this.renderProject()
            default:
                break;
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