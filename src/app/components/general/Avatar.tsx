import * as React from 'react';
import { SecureImage } from './SecureImage';
import "./Avatar.scss"
import classnames from 'classnames';

type OwnProps = {
    size?:number
    borderWidth?:number,
    borderColor?:string,
    image?:string,
    images?:string[],
    innerRef?: (element:HTMLElement) => void
    userStatus?:number
    containerClassName?:string
}
export default class Avatar extends React.PureComponent<OwnProps & React.HTMLAttributes<HTMLElement>, {}> {
    static defaultProps:OwnProps = {
        size:50,
        borderWidth:0,
        borderColor:"none",
        image:null,

    }
    imageStyles:{[key:string]:React.CSSProperties} = {}
    constructor(props:OwnProps)
    {
        super(props)
    }
    render()
    {
        const {image, images, borderColor, borderWidth, size, children, className, innerRef, containerClassName , ...rest} = this.props
        let imgs:string[] = []
        if(image)
            imgs.push(image)
        if(images)
            imgs = imgs.concat( images )
        var imgUrls = imgs/*.map(i => IntraSocialUtilities.appendAuthorizationTokenToUrl(i))*/.slice(0,4)
        const length = imgUrls.length
        const containerClass = classnames("image-container", containerClassName)
        return(
            <div {...rest} className={"avatar" + (className ? " " + className : "")} ref={this.props.innerRef} >
                <div className={containerClass} style={{borderWidth:borderWidth + "px", borderColor:borderColor, width:size + "px", height:size + "px", borderStyle:"solid"}}>
                    {imgUrls.map((img, index) => {
                        const key = `image_${length}_${index}`
                        return <SecureImage setAsBackground={true} key={key} className={"image multi " + key} url={img}></SecureImage>
                    })}
                </div>
                {children}
            </div>
        );
    }
}