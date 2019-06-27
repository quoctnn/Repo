import * as React from "react";
import DevTool from "../dev/DevTool";
type OwnProps = {
}
type State = {
}
type Props = OwnProps
export default class DevToolPage extends React.Component<Props, State> 
{
    render() {
        return(
            <div id="devtool-page" className="page">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <DevTool />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}