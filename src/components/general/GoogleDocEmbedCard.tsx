
import * as React from 'react';
import store from '../../main/App';
import Constants from "../../utilities/Constants";
export interface Props
{
    url:string
}
export default class GoogleDocEmbedCard extends React.Component<Props,{}>  {
    text() {
        if (this.props.url.startsWith("https://docs.google.com/spreadsheets")) {
            return "Google Spreadsheet"
        }
        if (this.props.url.startsWith("https://docs.google.com/presentation")) {
            return "Google Slides"
        } else {
            return "Google Docs"
        }
    }

    render() {
        let state = store.getState().debug
        let img = state.availableApiEndpoints[state.apiEndpoint].endpoint + Constants.staticUrl + Constants.defaultImg.docs
        return (
            <div className="col-xs-12" style={{"margin": "5px 0"}}>
                <a href={this.props.url} target="_blank">
                    <img src={img} style={{"verticalAlign": "middle", "maxWidth": "80px"}}/>
                    <span style={{"marginLeft": "10px", "fontSize": "1.4em"}}>{this.text()}</span>
                </a>
            </div>
        )
    }
}
