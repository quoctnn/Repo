import * as React from 'react';
import { SecureImage } from './SecureImage';
import classnames = require('classnames');
require("./CoverImage.scss");
interface Props {
    src:string
    className:string
}
export class CoverImage extends React.Component<Props, {}> {
    static defaultProps:Props = {
        src:null,
        className:undefined
    }
    constructor(props:Props) {
        super(props);
    }
    render()
    {
        const cn = classnames("cover-image", this.props.className)
        return (<div className={cn}>
                    <SecureImage className="img" setBearer={true} setAsBackground={true} url={this.props.src} />
                    {this.props.children}
                </div>)
    }
}

