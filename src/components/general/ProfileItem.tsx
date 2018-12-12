import * as React from "react";
import classNames from "classnames";
import { translate } from '../intl/AutoIntlProvider';
import { userFullName } from '../../utilities/Utilities';
import { Avatar } from './Avatar';
import { Link } from 'react-router-dom';
import Routes from '../../utilities/Routes';
import { StatusReactionUtilities, UserProfile } from '../../types/intrasocial_types';
export interface Props 
{
    itemClass:string
    showRelationship?:boolean
    profile:UserProfile
    reaction?:string
}
export default class ProfileItem extends React.Component<Props,{}> {
    renderFriends() {
        return (
            <span className="label label-info" style={{'marginRight':'5px'}}><i className="fa fa-users" aria-hidden="true" style={{'marginRight':'5px'}}></i>
            {translate("Contact")}</span>
        );
    }
    renderAdmin() {
        return (
            <span className="label label-info" style={{'marginRight':'5px'}}><i className="fa fa-users" aria-hidden="true" style={{'marginRight':'5px'}}></i>
            {translate("Admin")}</span>
        );
    }
    renderOwner() {
        return (
            <span className="label label-info" style={{'marginRight':'5px'}}><i className="fa fa-users" aria-hidden="true" style={{'marginRight':'5px'}}></i>
            {translate("Owner")}</span>
        );
    }
    renderModerator() {
        return (
            <span className="label label-info" style={{'marginRight':'5px'}}><i className="fa fa-users" aria-hidden="true" style={{'marginRight':'5px'}}></i>
            {translate("Moderator")}</span>
        );
    }

    renderRelationship() {
        if (this.props.showRelationship && this.props.profile.relationship) {

            let relationship = this.props.profile.relationship
            if (relationship.length > 0){
                return (
                    <span>
                        { relationship.contains('owner') &&
                            this.renderOwner()
                        }

                        { relationship.contains('admin') &&
                            this.renderAdmin()
                        }

                        { relationship.contains('moderator') &&
                            this.renderModerator()
                        }

                        { relationship.contains('friends') &&
                            this.renderFriends()
                        }
                    </span>
                )
            }
        }
    }

    render() {
        let user = this.props.profile;
        let itemClasses = classNames(this.props.itemClass, "profile-item")
        const reaction = StatusReactionUtilities.parseStatusReaction(this.props.reaction)
        return (
            <div className={itemClasses}>
                <Link to={Routes.profileUrl(user.slug_name)}>
                    <div className="wrapper">
                    <div className="col-xs-4">
                        <Avatar className="img-responsive" image={user.avatar || user.avatar_thumbnail} >
                            <StatusReactionUtilities.Component selected={true} large={false} reaction={reaction}></StatusReactionUtilities.Component>
                        </Avatar>
                    </div>
                    <div className="col-xs-8">
                        <h4 className="name">
                            {userFullName(user)}
                        </h4>
                        {this.renderRelationship()}
                    </div>
                    <div className="clearfix"></div>
                </div>
                </Link>
            </div>
        );
    }
}