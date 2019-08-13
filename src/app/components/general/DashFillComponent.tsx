import * as React from "react";

type OwnProps = {
    useFillMode:boolean
}
type State = {
}
type Props = OwnProps
export default class DashFillComponent extends React.Component<Props, State> 
{
    static modeFillClass = "dash-fill"
    bodyClassAdded = false
    constructor(props:Props) {
        super(props);
        this.state = {
        }
        this.setBodyClass()
    }
    componentDidUpdate = (prevProps:Props) => {
        if(prevProps.useFillMode != this.props.useFillMode)
        {
            this.setBodyClass()
        }
    }
    setBodyClass = () => {
        if(this.props.useFillMode && !this.bodyClassAdded) 
        {
            this.addBodyClass()
        }
        else if(!this.props.useFillMode && this.bodyClassAdded)
        {
            this.removeBodyClass()
        }
    }
    addBodyClass = () => {
        this.bodyClassAdded = true
        document.body.classList.add(DashFillComponent.modeFillClass)
    }
    removeBodyClass = () => {
        if(this.bodyClassAdded)
            document.body.classList.remove(DashFillComponent.modeFillClass)
    }
    componentWillUnmount = () => {
        this.removeBodyClass()
    }
    render() {
        return null
    }
}