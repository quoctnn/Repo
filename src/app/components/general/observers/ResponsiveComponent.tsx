
import { withContentRect, MeasuredComponentProps } from 'react-measure'
import * as React from "react";
export enum ResponsiveBreakpoint {
    micro = 60,
    mini = 200,
    standard = 400,
    big = 640,
}
export namespace ResponsiveBreakpoint {
    const all = [
        ResponsiveBreakpoint.big,
        ResponsiveBreakpoint.standard,
        ResponsiveBreakpoint.mini,
        ResponsiveBreakpoint.micro, 
    ]
    export function parse(width: number): ResponsiveBreakpoint {
        return all.find(e => width > e) || ResponsiveBreakpoint.micro
    }
}
type State = 
{
    breakpoint:ResponsiveBreakpoint
    //scrollbarSize:number
}
type OwnProps = 
{
    render:(state:State) => React.ReactNode
}
type Props = MeasuredComponentProps & OwnProps
class ResponsiveComponent extends React.Component<Props, State> 
{
    constructor(props:Props)
    {
        super(props)
        this.state = {
            breakpoint:ResponsiveBreakpoint.mini,
            //scrollbarSize:this.getScrollbarSize()
        }
    }
    getScrollbarSize = () => {
        var doc = document.documentElement;
        var dummyScroller = document.createElement('div');
        dummyScroller.setAttribute('style', 'width:99px;height:99px;' + 'position:absolute;top:-9999px;overflow:scroll;');
        doc.appendChild(dummyScroller);
        const scrollbarSize = dummyScroller.offsetWidth - dummyScroller.clientWidth;
        doc.removeChild(dummyScroller);
        return scrollbarSize;
    }
    componentWillReceiveProps(nextProps:Props)
    {
        const width = nextProps.contentRect.bounds.width
        const bp = ResponsiveBreakpoint.parse(width)
        if(bp != this.state.breakpoint)
        {
            this.setState({breakpoint:bp})
        }
    }
    shouldComponentUpdate(nextProps:Props, nextState:State)
    {
        return nextState.breakpoint != this.state.breakpoint
    }
    render() {
        return(<div ref={this.props.measureRef}>
                {this.props.render(this.state)}
                </div>
        );
    }
}

export default withContentRect('bounds')(ResponsiveComponent)