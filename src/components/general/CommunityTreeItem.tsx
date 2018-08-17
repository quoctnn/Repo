import * as React from "react";
import { Avatar } from '../general/Avatar';
import { translate } from '../intl/AutoIntlProvider';
import GroupList from './GroupList'; 
import { connect } from 'react-redux'
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


class CommunityTreeItem extends React.Component<Props, {}> {
    subListItems:SubListItem[]
    static defaultProps:Props = {
        communityData:null,
        collapsed:true,
        onClick:null,
        language:0
    }
    state:State
    constructor(props) {
        super(props);
        this.subListItems = [
            new SubListItem("group-list", "Groups", <GroupList community_id={this.props.communityData.id}/>),
            new SubListItem("project-list", "Projects", <GroupList community_id={this.props.communityData.id}/>),
            new SubListItem("event-list", "Events", <GroupList community_id={this.props.communityData.id}/>),
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
                        return (
                        <li key={index} id={item.id}>
                            <div className="name" onClick={this.onSubListClick.bind(this, index)}>{translate(item.name)}</div>
                            {this.state.listOpenState[index] && item.component}
                        </li>)
                    })}
                </ul>)
    }
    render() 
    {
        return(
            <div className="community-tree-item transition">
                <div className="flex align-center" onClick={this.props.onClick}>
                    <Avatar borderWidth={2} borderColor="red" image={this.props.communityData.avatar} />
                    <div className="community-name text-truncate">{this.props.communityData.name}</div>
                </div>
                {!this.props.collapsed && this.renderContent()}
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        language: state.settings.language,
    };
}
export default connect(mapStateToProps, null)(CommunityTreeItem);