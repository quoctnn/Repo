import * as React from "react";
import "./BreadcrumbNavigation.scss"
import { Link, withRouter, RouteComponentProps } from "react-router-dom";
import { communityName, userFullName, truncate } from '../../utilities/Utilities';
import { ConversationUtilities } from '../../utilities/ConversationUtilities';
import { withContextData, ContextDataProps } from "../../hoc/WithContextData";
import { ContextData } from '../../hoc/WithContextData';

export type LinkObject = {
    uri:string
    title:string
}

type OwnProps = {
}
type Props = OwnProps & ContextDataProps & RouteComponentProps<any>

type State = {
    links:LinkObject[]
}
class BreadcrumbNavigation extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props)
        this.state = {
            links:[],
        }
    }
    static getDerivedStateFromProps = (props: Props, state: State): Partial<State> => {
        return { links: BreadcrumbNavigation.getLinks(props.contextData)}
    }
    static getLinks = (contextObjects:ContextData) => {
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
            <div className="breadcrumb-navigation d-flex flex-column justify-content-center ">
                {this.renderContent()}
            </div>
        );
    }
}
export default withContextData(withRouter(BreadcrumbNavigation))