import * as React from "react";
import { Avatar } from '../general/Avatar';
require("./CommunityTreeItem.scss");

export interface Props {
    communityData:any,
    collapsed:boolean
    onClick:(event) => void
}
export interface State {
}

export class CommunityTreeItem extends React.Component<Props, {}> {
    static defaultProps:Props = {
        communityData:null,
        collapsed:true,
        onClick:null
    }
    state:State
    constructor(props) {
        super(props);
        this.state = {open:false}
    }
    render() 
    {
        return(
            <div className="community-tree-item" onClick={this.props.onClick}>
                <Avatar borderWidth={2} borderColor="red" image={this.props.communityData.avatar} />
                {!this.props.collapsed && <div>OPEN</div>}
            </div>
        );
    }
}