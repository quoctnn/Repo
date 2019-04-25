import * as React from "react";
import "./PageMainMenu.scss"
import { ReduxState } from "../redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

interface OwnProps
{
    style?:React.CSSProperties
    className?:string
}
interface ReduxStateProps
{
}
interface ReduxDispatchProps
{
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps

class PageMainMenu extends React.Component<Props, {}> {
    render() {
        return(
            <div style={this.props.style} id="page-main-menu" className={this.props.className}>
                <Link to={"/"}>
                Home    
                </Link>
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {
  return {
  }
}
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
  return {
}
}
export default connect(mapStateToProps, mapDispatchToProps)(PageMainMenu)