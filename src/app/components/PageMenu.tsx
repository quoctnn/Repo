import * as React from "react";
import "./PageMenu.scss"
import { ReduxState } from "../redux";
import { Community } from "../types/intrasocial_types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

interface OwnProps
{
}
interface ReduxStateProps
{
    activeCommunity:number
    community:Community
}
interface ReduxDispatchProps
{
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps

class PageMenu extends React.Component<Props, {}> {
    render() {
        return(
            <div id="page-menu">
                <Link to={"/"}>
                  <div className="p-2">Home</div>
                </Link>
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {
    const activeCommunity = state.activeCommunity.activeCommunity
    const community = state.communityStore.byId[activeCommunity]
  return {
    activeCommunity,
    community
  }
}
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
  return {
}
}
export default connect(mapStateToProps, mapDispatchToProps)(PageMenu)