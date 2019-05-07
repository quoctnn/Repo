
import * as React from "react";
type State = 
{
    breakpoint:number
    //scrollbarSize:number
}
type OwnProps = 
{
    render:(state:State) => React.ReactNode
    setClassOnBody?:boolean
    breakpoints:number[]
    updateKey:string
}
type Props = OwnProps
export default class WindowResponsiveComponent extends React.Component<Props, State> 
{
    constructor(props:Props)
    {
        super(props)
        this.state = {
            breakpoint:this.props.breakpoints[this.props.breakpoints.length - 1],
        }
        if(this.props.setClassOnBody)
            this.updateBodyClass(null, this.state.breakpoint)
    }
    updateBodyClass = (oldBP:number, newBP:number) => {
        if(oldBP)
            document.body.classList.remove("rb-" + oldBP)
        if(newBP)
            document.body.classList.add("rb-" + newBP)
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
    findBreakpoint = (width: number) => {
        return this.props.breakpoints.find(e => width > e) || this.props.breakpoints[this.props.breakpoints.length - 1]
    }
    observeCallback = () => 
    {
        const width = window.innerWidth
        const bp = this.findBreakpoint(width)
        if(bp != this.state.breakpoint)
        {
            if(this.props.setClassOnBody)
                this.updateBodyClass(this.state.breakpoint, bp)
            this.setState({breakpoint:bp})
        }
    }
    shouldComponentUpdate(nextProps:Props, nextState:State)
    {
        return nextState.breakpoint != this.state.breakpoint || nextProps.updateKey != this.props.updateKey
    }
    render() {
        console.log("render", this.state.breakpoint)
        return(<div className="window-responsive-component">
                {this.props.render(this.state)}
                </div>
        );
    }
}