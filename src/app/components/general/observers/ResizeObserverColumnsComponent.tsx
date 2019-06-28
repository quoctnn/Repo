import * as React from 'react';
import ResizeObserver from 'resize-observer-polyfill'
type OwnProps = 
{
    className?:string
    render:(state:State) => React.ReactNode
    targetColumnWidth:number
}
type Props = OwnProps
type State = {
    colums:number
}
export class ResizeObserverColumnsComponent extends React.Component<Props,State> {
    observer = null
    container = React.createRef<HTMLDivElement>()
    constructor(props:Props) {
      super(props);
      this.state = { colums: 0 }
      this.observer = null;
    }
    componentDidMount() {
        this.observer = new ResizeObserver((entries, observer) => {
            for (const entry of entries) {
                const {width} = entry.contentRect
                const currentCols = this.state.colums
                const newCols = Math.floor( Math.max(1, width / this.props.targetColumnWidth) )
                if(currentCols != newCols)
                {
                    this.setState(() => {
                        return {colums:newCols}
                    })
                }
            }
        });
        this.observer.observe(this.container.current);
    }
    componentWillUnmount() {
        if (this.observer) {
            this.observer.disconnect()
        }
    }
    render() {
        var {children, render, ...rest} = this.props
      return (
        <div {...rest} ref={this.container}  >
          {render(this.state)}
        </div>
      );
    }
}