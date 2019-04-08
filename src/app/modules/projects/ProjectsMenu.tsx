import * as React from "react";

export type ProjectsMenuData = {
}
type Props = 
{
    data:ProjectsMenuData
    onUpdate:(data:ProjectsMenuData) => void
}
type State = {
    data:ProjectsMenuData
}
export default class ProjectsMenu extends React.Component<Props, State> {
    
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
            <div className="projects-menu">
            </div>
        );
    }
}
