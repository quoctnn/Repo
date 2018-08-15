import * as React from "react";
import { translate } from '../../components/intl/AutoIntlProvider';
import ApiClient from '../../network/ApiClient';
import { Button } from 'reactstrap';

export interface Props {
}

export default class NewsFeed extends React.Component<Props, {}> {
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