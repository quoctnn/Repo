import * as React from "react";

export type GroupsMenuData = {
}
type Props = 
{
    data:GroupsMenuData
    onUpdate:(data:GroupsMenuData) => void
}
type State = {
    data:GroupsMenuData
}
export default class GroupsMenu extends React.Component<Props, State> {
    
    constructor(props:Props) {
        super(props);
        this.state = {
            data:{...this.props.data}
        }
    }
    sendUpdate = () => {
        const {data} = this.state
        this.props.onUpdate(data)
    }
    render() {
        return(
            <div className="groups-menu">
            </div>
        );
    }
}
