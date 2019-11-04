import * as React from "react";
import { AjaxRequest } from '../network/AjaxRequest';
import { ToastManager } from '../managers/ToastManager';
import * as rst2html from 'rst2html'
import "./Changelog.scss"
import { WindowAppManager } from '../managers/WindowAppManager';
import { RequestErrorData } from "../types/intrasocial_types";

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
        const url = WindowAppManager.resolveLocalFileUrl("assets/docs/CHANGELOG.rst")
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
            ToastManager.showRequestErrorToast(new RequestErrorData(error, null))
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