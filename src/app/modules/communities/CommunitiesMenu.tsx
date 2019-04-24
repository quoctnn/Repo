import * as React from "react";

export type CommunitiesMenuData = {
}
type Props =
{
    data:CommunitiesMenuData
    onUpdate:(data:CommunitiesMenuData) => void
}
type State = {
    data:CommunitiesMenuData
}
export default class CommunitiesMenu extends React.Component<Props, State> {

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
            <div className="communities-menu">
            </div>
        );
    }
}
