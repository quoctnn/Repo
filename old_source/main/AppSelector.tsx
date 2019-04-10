import * as React from "react";
import 'bootstrap/dist/css/bootstrap.css'
import '@fortawesome/fontawesome-free/css/fontawesome.min.css'
import '@fortawesome/fontawesome-free/css/solid.min.css'
import '@fortawesome/fontawesome-free/css/regular.min.css'
import { App } from "../app/App";
import { Button } from "reactstrap";

export type Props = 
{
}
export type State = 
{
    app:string
}
export const appMap = {
    "Design": App,
}
export default class AppSelector extends React.Component<Props, State> {
    constructor(props:Props)
    {
        super(props)
        this.state = {
            app:"Design"
        }
    }
    renderButtons = () => {

        return Object.keys(appMap).map(k => {

            return (<Button onClick={() => this.setState({app:k})}>{k}</Button>)
        })
    }
    render() {
        const app = this.state.app
        return(
            <div id="main-root">
                {!app && this.renderButtons()}
                {app && React.createElement(appMap[app], {})}
            </div>
        );
    }
}
