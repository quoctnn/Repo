import * as React from 'react';
import { AjaxRequest } from '../../network/AjaxRequest';
import { IntraSocialUtilities } from '../../utilities/IntraSocialUtilities';
require("./SecureImage.scss");

type Props = {
    url:string
    setAsBackground?:boolean
    label?:string
    setBearer?:boolean
}
type State = {
    data:string
    status:SecureImageStatus
}
enum SecureImageStatus {
    LOADING, LOADED, FAILED
}
export class SecureImage extends React.PureComponent<Props & React.HTMLAttributes<HTMLImageElement | HTMLDivElement>, State> {
    static defaultProps:Props = {
        url:null, setAsBackground:false, label:"secure image", setBearer:false
    }
    constructor(props:Props)
    {
        super(props)
        this.state = {
            data:null,
            status:SecureImageStatus.LOADING
        }
    }
    requestImage = () => {
        AjaxRequest.getNoProcess(this.props.url, true, (data: any, status:string, request:JQuery.jqXHR) => {
            if(data)
            {
                this.setState({data:data, status:SecureImageStatus.LOADED})
                return
            }
            this.setState({data:null, status:SecureImageStatus.FAILED})
        }, (request:JQuery.jqXHR, status:string, error:string) => {
            this.setState({data:null, status:SecureImageStatus.FAILED})
        })
    }
    render() 
    {
        const {data, status} = this.state
        const {setAsBackground,setBearer, label, url, ...rest} = this.props
        const imgUrl = setBearer && url ? IntraSocialUtilities.appendAuthorizationTokenToUrl(url) : url
        if(setAsBackground)
        {
            return <div {...rest} style={{backgroundImage:"url("+imgUrl+")"}} >{this.props.children}</div>
        }
        return(<img {...rest} src={imgUrl} alt={label} />)
    }
}