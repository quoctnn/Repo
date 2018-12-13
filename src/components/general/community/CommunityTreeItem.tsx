import * as React from "react";
import { Avatar } from '../Avatar';
import { translate } from '../../intl/AutoIntlProvider';
import GroupList from './GroupList';
import ProjectList from './ProjectList';
import EventList from './EventList';
import { connect } from 'react-redux'
import { RootState } from "../../../reducers";
import classNames = require("classnames");
require("./CommunityTreeItem.scss");
export interface Props {
    communityData:any,
    collapsed:boolean
    onClick:(event) => void,
    language:number
}
export interface State {
    listOpenState:boolean[]
}
class SubListItem
{
    id:string;
    name: string;
    component: JSX.Element;
    constructor(id:string, name: string, component:JSX.Element) {
        this.id = id;
        this.name = name;
        this.component = component;
    }
}


class CommunityTreeItem extends React.Component<Props, State> {
    subListItems:SubListItem[]
    static defaultProps:Props = {
        communityData:null,
        collapsed:true,
        onClick:null,
        language:0
    }
    constructor(props) {
        super(props);
        this.subListItems = [
            new SubListItem("group-list", "Groups", <GroupList community_id={this.props.communityData.id}/>),
            new SubListItem("project-list", "Projects", <ProjectList community_id={this.props.communityData.id}/>),
            new SubListItem("event-list", "Events", <EventList community_id={this.props.communityData.id}/>),
        ],
        this.state = {listOpenState:this.subListItems.map(() => false)}
    }
    onSubListClick(index, event)
    {
        let los = this.state.listOpenState
        los[index] = !los[index]
        this.setState({listOpenState:los})
    }
    renderContent()
    {
        return (<ul className="community-tree-item-list">
                    {this.subListItems.map((item, index) => {

                        const collapsed = !this.state.listOpenState[index]
                        const cn = classNames("fa fa-sm chevron", collapsed ? "fa-chevron-down": "fa-chevron-up")
                        return (
                        <li key={index} id={item.id}>
                            <div className="d-flex content" onClick={this.onSubListClick.bind(this, index)}>
                                <div className="name">
                                    {translate(item.name)}
                                </div>
                                <i className={cn}></i>
                            </div>
                            {this.state.listOpenState[index] && item.component}
                        </li>)
                    })}
                </ul>)
    }
    render()
    {
        const cn = classNames("fa fa-sm chevron",this.props.collapsed ? "fa-chevron-down": "fa-chevron-up")
        return(
            <div className="community-tree-item transition">
                <div className="d-flex align-items-center content" onClick={this.props.onClick}>
                    <Avatar image={this.props.communityData.avatar} size={24} />
                    <div className="community-name text-truncate">{this.props.communityData.name}</div>
                    <i className={cn}></i>
                </div>
                {!this.props.collapsed && this.renderContent()}
            </div>
        );
    }
}
const mapStateToProps = (state:RootState) => {
    return {
        language: state.settings.language,
    };
}
export default connect(mapStateToProps, null)(CommunityTreeItem);