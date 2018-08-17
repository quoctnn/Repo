import { appendTokenToUrl } from '../../utilities/Utilities';
import * as React from 'react';
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
        let url = appendTokenToUrl(this.props.src)
        return (<div className="cover-image">
                    <span style={{backgroundImage:"url(" + url + ")"}}></span>
                    {this.props.children}
                </div>)
    }
}

