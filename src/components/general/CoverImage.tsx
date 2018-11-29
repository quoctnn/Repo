import * as React from 'react';
import { IntraSocialUtilities } from '../../utilities/IntraSocialUtilities';
require("./CoverImage.scss");
export interface Props {
    src:string,
}
export class CoverImage extends React.Component<Props, {}> {
    static defaultProps:Props = {
        src:null,
    }
    constructor(props) {
        super(props);
    }
    render()
    {
        let url = IntraSocialUtilities.appendAuthorizationTokenToUrl(this.props.src)
        return (<div className="cover-image">
                    <span style={{backgroundImage:"url(" + url + ")"}}></span>
                    {this.props.children}
                </div>)
    }
}

