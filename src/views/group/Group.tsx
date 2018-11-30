import * as React from "react";
import { connect } from 'react-redux'
import { CoverImage } from '../../components/general/CoverImage';
import { RootState } from "../../reducers";
import { Group } from "../../types/intrasocial_types";
require("./Group.scss");
export interface Props {
    match:any,
    groupsData:Group[]
}

class GroupView extends React.Component<Props, {}> {
    getGroup(community:number, slug:string)
    {
        return this.props.groupsData.find((g) => g.community == community && g.slug == slug)
    }
    renderGroup(group:Group)
    {
        return (
        <div className="content">
            <CoverImage src={group.cover || group.cover_cropped}>
                <div className="down-shadow profile-name text-truncate">
                    <h2 className="text-truncate">{group.name}</h2>
                </div>
            </CoverImage> 
        </div>)
    }
    render() {
        let community = parseInt(this.props.match.params.communityid)
        let slug = this.props.match.params.groupname
        let group = this.getGroup(community,slug)
        return(
            <div id="group-view" className="col-sm">
                {group && this.renderGroup(group)}
                {!group && <div>NO GROUP</div>}
            </div>
        );
    }
}
const mapStateToProps = (state:RootState) => {
    return {
        groupsData: state.groupStore.groups,
    };
}
export default connect(mapStateToProps, null)(GroupView);