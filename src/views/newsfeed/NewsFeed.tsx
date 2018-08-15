import * as React from "react";
import {injectIntl, InjectedIntlProps} from "react-intl";
import { translate } from '../../components/intl/AutoIntlProvider';
import ApiClient from '../../network/ApiClient';
import { Button } from 'reactstrap';

export interface Props {
}

class NewsFeed extends React.Component<Props & InjectedIntlProps, {}> {
    requestCallback(data:any, status:string, error:string)
    {
        console.log(data, status, error)
    } 
    render() {
        return(
            <div id="news-feed">
                {translate("search.placeholder")}
                <Button onClick={() => {ApiClient.getMyProfile(this.requestCallback)}}>Request</Button>
            </div>
            
        );
    }
}
export default injectIntl(NewsFeed);