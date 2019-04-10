import * as React from "react";
import { translate } from '../../components/intl/AutoIntlProvider';
import { Button } from 'reactstrap';

export interface Props {
}

export default class ProfileUpdate extends React.Component<Props, {}> {
    updateProfile(e)
    {
        debugger
    }
    render() {
        return(
            <div id="profile-update">
                
                <Button onClick={this.updateProfile}>{translate("Update")}</Button>
            </div>
        );
    }
}