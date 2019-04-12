import * as React from "react";

export type EventsMenuData = {
}
type Props = 
{
    data:EventsMenuData
    onUpdate:(data:EventsMenuData) => void
}
type State = {
    data:EventsMenuData
}
export default class EventsMenu extends React.Component<Props, State> {
    
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
            <div className="events-menu">
            </div>
        );
    }
}
