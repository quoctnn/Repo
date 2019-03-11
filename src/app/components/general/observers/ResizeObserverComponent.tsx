import * as React from 'react';
import ResizeObserver from 'resize-observer-polyfill'
import { ResponsiveBreakpoint } from './ResponsiveComponent';
type OwnProps = 
{
    className?:string
    render:(state:State) => React.ReactNode
}
type Props = OwnProps
type State = {
    breakpoint:ResponsiveBreakpoint
}
export class ResizeObserverComponent extends React.Component<Props,State> {
    observer = null
    container = null
    constructor(props:Props) {
      super(props);
      this.state = { breakpoint: ResponsiveBreakpoint.mini }
      this.observer = null;
      this.container = null;
    }
    componentDidMount() {
        this.observer = new ResizeObserver((entries, observer) => {
            for (const entry of entries) {
                const {left, top, width, height} = entry.contentRect;
                const bp = ResponsiveBreakpoint.parse(width)
                if(bp != this.state.breakpoint)
                {
                    this.setState({breakpoint:bp})
                }
            }
        });
        this.observer.observe(document.body);
    }
    componentWillUnmount() {
        if (this.observer) {
            this.observer.disconnect()
        }
    }
    render() {
        var {children, render, ...rest} = this.props
      return (
        <div {...rest} ref={div => { this.container = div; }}  >
          {render(this.state)}
        </div>
      );
    }
}