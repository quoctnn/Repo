import * as React from "react";
import "./BreadcrumbNavigation.scss"
import { ReduxState } from "../../redux";
import { connect } from "react-redux";
import { Link, withRouter, RouteComponentProps } from "react-router-dom";
import { ContextManager, ResolvedContextObjects } from "../../managers/ContextManager";
import { communityName, userFullName, truncate } from '../../utilities/Utilities';
import { ConversationUtilities } from '../../utilities/ConversationUtilities';

type LinkObject = {
    uri:string
    title:string
}

type OwnProps = {
}
type Props = OwnProps & ReduxStateProps & RouteComponentProps<any>

type ReduxStateProps = {
    contextObjects:ResolvedContextObjects
}
type State = {
    links:LinkObject[]
    contextPath:string
}
class BreadcrumbNavigation extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props)
        this.state = {
            links:[],
            contextPath:null
        }
    }
    static getDerivedStateFromProps = (props: Props, state: State): Partial<State> => {
        if(!props.contextObjects || !props.contextObjects.success)
        {
            return {links:[]}
        }
        if (props.location.pathname != state.contextPath) {
            const path = props.location.pathname
            return { links: BreadcrumbNavigation.getLinks(ContextManager.getContextObjects(path)), contextPath:path }
        }
        return null
    }
    static getLinks = (contextObjects:ResolvedContextObjects) => {
        const links:LinkObject[] = []
        if(contextObjects.community)
        {
            links.push({uri:contextObjects.community.uri, title:communityName(contextObjects.community)})
        }
        if(contextObjects.conversation)
        {
            links.push({uri:contextObjects.conversation.uri, title:ConversationUtilities.getConversationTitle(contextObjects.conversation)})
        }
        if(contextObjects.profile)
        {
            links.push({uri:contextObjects.profile.uri, title:userFullName(contextObjects.profile)})
        }
        if(contextObjects.event)
        {
            links.push({uri:contextObjects.event.uri, title:contextObjects.event.name})
        }
        if(contextObjects.group)
        {
            links.push({uri:contextObjects.group.uri, title:contextObjects.group.name})
        }
        if(contextObjects.project)
        {
            links.push({uri:contextObjects.project.uri, title:contextObjects.project.name})
        }
        if(contextObjects.task)
        {
            links.push({uri:contextObjects.task.uri, title:contextObjects.task.title})
        }
        return links
    }
    getTitle = (title:string) => {
        return truncate(title, 20)
    }
    renderContent = () => {
        const links = this.state.links
        if(links.length == 0)
            return null
        const main = links[0]
        const subs = links.slice(1, links.length)
        const arr:JSX.Element[] = []
        subs.forEach((s,i) => {
            arr.push(<Link className="primary-theme-color medium-text" key={"link_" + i} to={s.uri}>{this.getTitle(s.title)}</Link>)
            if(i < subs.length - 1)
                arr.push(<i key={"sep_" + i} className="fas fa-caret-right mx-1"></i>)
        })
        return  <>
                    <Link className="root secondary-text" to={main.uri}>{this.getTitle(main.title)}</Link>
                    {subs.length > 0 && 
                        <div className="d-flex align-items-center">
                            {arr}
                        </div>
                    }
                </>
    }
    render() {
        return (
            <div id="breadcrumb-navigation d-flex flex-column justify-content-center ">
                {this.renderContent()}
            </div>
        );
    }
}
const mapStateToProps = (state: ReduxState, ownProps: OwnProps & RouteComponentProps<any>): ReduxStateProps => {

    return {
        contextObjects:ContextManager.getContextObjects(ownProps.location.pathname)
    }
}
export default withRouter(connect<ReduxStateProps, {}, OwnProps>(mapStateToProps, null)(BreadcrumbNavigation))