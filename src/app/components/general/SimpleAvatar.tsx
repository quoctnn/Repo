import * as React from 'react';
import { SecureImage } from './SecureImage';
require("./Avatar.scss");

export interface Props {
    size?:number
    borderWidth?:number,
    borderColor?:string,
    image?:string,
    className?:string
    images?:string[],
}
export class SimpleAvatar extends React.PureComponent<Props & React.HTMLAttributes<HTMLElement>, {}> {
    static defaultProps:Props = {
        size:50,
        borderWidth:0,
        borderColor:"none",
        image:null,
    }
    imageStyles:{[key:string]:React.CSSProperties} = {}
    constructor(props:Props)
    {
        super(props)
    }
    render()
    {
        let images:string[] = []
        if(this.props.image)
            images.push(this.props.image)
        if(this.props.images)
            images = images.concat( this.props.images )
        var imgUrls = images.slice(0,4)
        return(

            <div onClick={this.props.onClick}  className={"avatar" + (this.props.className ? " " + this.props.className : "")} >
                <div className="image-container" style={{borderWidth:this.props.borderWidth + "px", borderColor:this.props.borderColor, width:this.props.size + "px", height:this.props.size + "px", borderStyle:"solid"}}>
                    {imgUrls.map((img, index) => {
                        const key = `image_${length}_${index}`
                        return <SecureImage setAsBackground={true} key={key} className={"image multi " + key} url={img}></SecureImage>
                    })}
                </div>
                {this.props.children}
            </div>
        );
    }
}