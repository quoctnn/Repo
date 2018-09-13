import * as React from "react";
import { connect } from 'react-redux'
import { UserProfile } from '../../reducers/profileStore';
import { appendTokenToUrl } from '../../utilities/Utilities';
import { Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button } from 'reactstrap';
import { Link } from "react-router-dom";
import { Routes } from "../../utilities/Routes";
import { RootState } from "../../reducers";
require("./SimpleUserProfile.scss");

export interface Props {
    profile:UserProfile,
    language:number,
}
class SimpleUserProfile extends React.Component<Props, {}> {

    render() 
    {
        var imgUrl = appendTokenToUrl(this.props.profile.avatar )
        return(
            <div className="simple-user-profile">
                <div className="card">
                    <div className="row no-gutters">
                        <div className="col-auto">
                            <img src={imgUrl} className="img-fluid" alt="User Image" />
                        </div>
                        <div className="col">
                            <div className="card-block px-2">
                            <Link to={Routes.PROFILES + this.props.profile.slug_name}>
                                <h4 className="card-title text-truncate">{this.props.profile.first_name + " " + this.props.profile.last_name}</h4>
                            </Link>
                                <p className="card-text">{this.props.profile.user_status}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state:RootState) => {
    return {
        language: state.settings.language,
    };
}
export default connect(mapStateToProps, null)(SimpleUserProfile); 