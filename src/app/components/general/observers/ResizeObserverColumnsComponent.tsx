import * as React from 'react';
import ResizeObserver from 'resize-observer-polyfill'
type OwnProps = 
{
    className?:string
    render:(state:State) => React.ReactNode
    targetColumnWidth:number
    updateKey:string|number
}
type Props = OwnProps
type State = {
    colums:number
    height:number
}
export class ResizeObserverColumnsComponent extends React.Component<Props,State> {
    observer = null
    container = React.createRef<HTMLDivElement>()
    constructor(props:Props) {
      super(props);
      this.state = { colums: 0, height:0 }
      this.observer = null;
    }
    componentDidMount() {
        this.observer = new ResizeObserver((entries, observer) => {
            for (const entry of entries) {
                const {width, height} = entry.contentRect
                this.updateState(width, height)
            }
        });
        this.observer.observe(this.container.current);
    }
    updateState = (width:number, height:number) => {
        const currentCols = this.state.colums
        const newCols = Math.floor( Math.max(1, width / this.props.targetColumnWidth) )
        if(currentCols != newCols)
        {
            this.setState(() => {
                return {colums:newCols, height}
            })
        }
    }
    componentDidUpdate = (prevProps: Props, prevState: State) => {
        if(this.container && this.container.current && prevProps.updateKey != this.props.updateKey)
        {
            const {width, height} = this.container.current.getBoundingClientRect()
            this.updateState(width, height)
        }
        return null
    }
    componentWillUnmount() {
        if (this.observer) {
            this.observer.disconnect()
        }
    }
    render() {
        var {children, render,targetColumnWidth, updateKey, ...rest} = this.props
      return (
        <div {...rest} ref={this.container}  >
          {render(this.state)}
        </div>
      );
    }
}