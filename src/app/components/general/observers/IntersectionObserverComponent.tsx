import * as React from 'react';

type Props = {
    onChange:(isVisible:boolean) => void
    className?:string
}
type State = {
    isVisible:boolean
}

export class IntersectionObserverComponent extends React.Component<Props,State> {
    observer = null
    container = null
    constructor(props:Props) {
      super(props);
      this.state = { isVisible: false }
      this.observer = null;
      this.container = null;
    }
    componentDidMount() {
        this.observer = new IntersectionObserver( ([entry]) => {
            if(this.state.isVisible != entry.isIntersecting)
                this.setState({ isVisible: entry.isIntersecting }, () => {this.props.onChange(this.state.isVisible)})
        }, {})
        this.observer.observe(this.container)
    }
    componentWillUnmount() {
        if (this.observer) {
            this.observer.disconnect()
        }
        this.observer = null
    }
    render() {
        var {onChange, children, ...rest} = this.props
      return (
        <div {...rest}
          ref={div => {
            this.container = div;
          }}
        >
          {children}
        </div>
      );
    }
}