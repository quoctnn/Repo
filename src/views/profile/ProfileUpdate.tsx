import * as React from "react";
import {injectIntl, InjectedIntlProps} from "react-intl";
import { translate } from '../../components/intl/AutoIntlProvider';
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
                
                <Button onClick={this.updateProfile}>{translate("Update")}</Button>
            </div>
        );
    }
}
export default injectIntl(ProfileUpdate);