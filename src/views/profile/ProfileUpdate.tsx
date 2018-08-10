import * as React from "react";
import {injectIntl, InjectedIntlProps} from "react-intl";
import Intl from "../../utilities/Intl"
import ApiClient from '../../network/ApiClient';
import { Button } from 'reactstrap';

export interface Props {
}

class ProfileUpdate extends React.Component<Props & InjectedIntlProps, {}> {
    updateProfile(e)
    {
        debugger
    }
    render() {
        return(
            <div id="profile-update">
                
                <Button onClick={this.updateProfile}>{Intl.translate(this.props.intl, "Update")}</Button>
            </div>
        );
    }
}
export default injectIntl(ProfileUpdate);