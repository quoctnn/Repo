import * as React from "react";

export type CalendarMenuData = {
}
type Props =
{
    data:CalendarMenuData
    onUpdate:(data:CalendarMenuData) => void
}
type State = {
    data:CalendarMenuData
}
export default class CalendarMenu extends React.Component<Props, State> {

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
            <div className="calendar-menu">
            </div>
        );
    }
}
