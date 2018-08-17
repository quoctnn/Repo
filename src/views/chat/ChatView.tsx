import * as React from "react";
import { translate } from '../../components/intl/AutoIntlProvider';
import ApiClient from '../../network/ApiClient';
import { Button } from 'reactstrap';
require("./ChatView.scss");

export interface Props {
}

export default class ChatView extends React.Component<Props, {}> {

    render() {
        return(
            <div id="chat-view">
            </div>
            
        );
    }
}