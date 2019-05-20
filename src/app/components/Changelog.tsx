import * as React from "react";
import { AjaxRequest } from '../network/AjaxRequest';
import { ToastManager } from '../managers/ToastManager';
import * as rst2html from 'rst2html'
import "./Changelog.scss"

const url = require('url');
const path = require("path")
const resolveFileUrl = (file:string) => {
    return url.format({
        pathname: path.join(window.appRoot, file),
        protocol: location.protocol,
        host:location.host,
        slashes: true,
    })
}
type Props = 
{
}
type State = 
{
    data:any
}
export class Changelog extends React.Component<Props, State> 
{
    constructor(props:Props){
        super(props)
        this.state = {
            data:null
        }
    }
    componentDidMount = () => {
        this.loadContent()
    }
    loadContent = () => {
        const url = resolveFileUrl("assets/docs/CHANGELOG.rst")
        console.log("u", url)
        AjaxRequest.ajaxCallAny("text" , "GET", url, undefined, (data, status, request) => {
            const content = data 
            if(content) 
            {
                const html = rst2html(content)
                this.setState(() => {
                    return {data:html}
                })
            }            
        }, (request, status, error) => {
            ToastManager.showErrorToast(error, status)
        })
    }
    render() {
        return(
            <div className="changelog">
                {this.state.data && <div dangerouslySetInnerHTML={{__html: this.state.data}} ></div>}
            </div>
        );
    }
}