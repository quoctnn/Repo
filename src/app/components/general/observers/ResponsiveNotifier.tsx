
import * as React from "react";
import ResizeObserver from "resize-observer-polyfill";
import { ResponsiveBreakpoint } from "./ResponsiveComponent";
import { NotificationCenter } from "../../../utilities/NotificationCenter";
type State = 
{
    breakpoint:ResponsiveBreakpoint
}
type OwnProps = 
{
}
type Props = OwnProps
export const ResponsiveNotifierDidUpdateNotification = "ResponsiveNotifierDidUpdateNotification"
export default class ResponsiveNotifier extends React.Component<Props, State> 
{
    observer = null
    container = React.createRef<HTMLDivElement>()
    constructor(props:Props) {
      super(props);
      this.state = { breakpoint:null }
      this.observer = null;
    }
    componentDidMount() {
        this.observer = new ResizeObserver((entries, observer) => {
            for (const entry of entries) {
                const {width} = entry.contentRect
                this.updateState(width)
            }
        });
        this.observer.observe(this.container.current);
    }
    updateState = (width:number) => {
        const old = this.state.breakpoint
        const bp = ResponsiveBreakpoint.parse(width)
        if(bp != old)
        {
            this.setState({breakpoint:bp},() => {
                window.app.breakpoint = bp
                NotificationCenter.push(ResponsiveNotifierDidUpdateNotification,[{old, new:bp}])

            })
        }
    }
    componentWillUnmount() {
        if (this.observer) {
            this.observer.disconnect()
        }
    }
    render() {
      return <div ref={this.container} ></div>
    }
}