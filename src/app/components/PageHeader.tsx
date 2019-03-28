import * as React from "react";
import "./PageHeader.scss"
import { ReduxState } from "../redux";
import { Community } from "../types/intrasocial_types";
import { connect } from "react-redux";
import { CoverImage } from "./general/CoverImage";

interface OwnProps
{
}
interface ReduxStateProps
{
    community:Community
}
interface ReduxDispatchProps
{
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps

class PageHeader extends React.Component<Props, {}> {
    render() {
        const coverImage = this.props.community.cover_cropped
        return(
            <div id="page-header">
                <CoverImage id="page-header-cover-image" src={coverImage}>
                    {this.props.children}
                </CoverImage>
                <div className="circle"></div>
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {
    const activeCommunity = state.activeCommunity.activeCommunity
    let community = state.communityStore.byId[activeCommunity]
    if(!community && state.communityStore.allIds.length > 0)
        community = state.communityStore.byId[state.communityStore.allIds[0]]
  return {
    community
  }
}
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
  return {
}
}
export default connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(PageHeader)