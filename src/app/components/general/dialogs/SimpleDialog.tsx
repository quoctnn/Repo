import * as React from "react";
import {ModalBody, Modal, ModalHeader, ModalFooter } from 'reactstrap';
import classnames = require("classnames");
import { translate } from "../../../localization/AutoIntlProvider";

type DefaultProps = {
    zIndex:number
    showCloseButton:boolean
}
type Props = {
    header?:React.ReactNode
    children:React.ReactNode
    footer?:React.ReactNode
    visible:boolean
    didCancel:() => void
    className?:string
} & DefaultProps
type State =
{
}
export default class SimpleDialog extends React.Component<Props, State> {
    static defaultProps:DefaultProps = {
        zIndex:1070,
        showCloseButton:true
    }
    constructor(props:Props) {
        super(props);
        this.state = {
        }
    }
    renderCloseButton = () => {
        if(!this.props.showCloseButton)
            return null
        return <button type="button" className="close" onClick={this.props.didCancel}>
                <span aria-hidden="true">&times;</span>
                <span className="sr-only">{translate("common.close")}</span>
            </button>
    }
    render() 
    {
        const cn = classnames("full-height", this.props.className)
        const headerToggle = this.props.showCloseButton ? this.props.didCancel : undefined
        return(
            <div>
                <Modal toggle={this.props.didCancel} zIndex={this.props.zIndex} isOpen={this.props.visible} className={cn}>
                    {
                        this.props.header && 
                        <ModalHeader toggle={headerToggle}>
                            {this.props.header}
                        </ModalHeader>
                    }
                    <ModalBody className="vertical-scroll">
                        {this.props.children}
                    </ModalBody>
                    {
                        this.props.footer && 
                        <ModalFooter>
                            {this.props.footer}
                        </ModalFooter>
                    }
                </Modal>
            </div>
        );
    }
}