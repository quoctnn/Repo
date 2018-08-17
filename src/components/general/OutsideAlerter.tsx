import * as React from "react";

export interface Props {
    onOutsideClick:(event) => void
    id:string
}

export default class OutsideAlerter extends React.Component<Props, {}> {
   wrapperRef:any
  constructor(props) {
    super(props);

    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  /**
   * Set the wrapper ref
   */
  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  /**
   * Alert if clicked on outside of element
   */
  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
        this.props.onOutsideClick(event)
    }
  }

  render() {
    return <div id={this.props.id} ref={this.setWrapperRef}>{this.props.children}</div>;
  }
}
