
import * as React from "react";
import { ResponsiveBreakpoint } from "./ResponsiveComponent";
type State = 
{
    breakpoint:ResponsiveBreakpoint
    //scrollbarSize:number
}
type OwnProps = 
{
    render:(state:State) => React.ReactNode
    setClassOnBody?:boolean
}
type Props = OwnProps
export default class WindowResponsiveComponent extends React.Component<Props, State> 
{
    constructor(props:Props)
    {
        super(props)
        this.state = {
            breakpoint:ResponsiveBreakpoint.mini,
        }
        if(this.props.setClassOnBody)
            this.updateBodyClass(null, this.state.breakpoint)
    }
    updateBodyClass = (oldBP:ResponsiveBreakpoint, newBP:ResponsiveBreakpoint) => {
        if(oldBP)
            document.body.classList.remove("rb-" + ResponsiveBreakpoint[oldBP])
        if(newBP)
            document.body.classList.add("rb-" + ResponsiveBreakpoint[newBP])
    }
    componentDidMount()
    {
        window.addEventListener("resize", this.observeCallback)
        this.observeCallback()
    }
    componentWillUnmount()
    {
        window.removeEventListener("resize", this.observeCallback)
    }
    observeCallback = () => 
    {
        const width = window.innerWidth
        const bp = ResponsiveBreakpoint.parse(width)
        if(bp != this.state.breakpoint)
        {
            if(this.props.setClassOnBody)
                this.updateBodyClass(this.state.breakpoint, bp)
            this.setState({breakpoint:bp})
        }
    }
    shouldComponentUpdate(nextProps:Props, nextState:State)
    {
        return nextState.breakpoint != this.state.breakpoint
    }
    render() {
        console.log("render", this.state.breakpoint)
        return(<div className="window-responsive-component">
                {this.props.render(this.state)}
                </div>
        );
    }
}