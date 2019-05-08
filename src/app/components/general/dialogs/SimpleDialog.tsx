import * as React from "react";
import {ModalBody, Modal, ModalHeader, ModalFooter } from 'reactstrap';
import classnames = require("classnames");

type DefaultProps = {
    zIndex:number
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
        zIndex:1070
    }
    constructor(props:Props) {
        super(props);
        this.state = {
        }
    }
    render() 
    {
        const cn = classnames("full-height", this.props.className)
        return(
            <div >
                <Modal toggle={this.props.didCancel} zIndex={this.props.zIndex} isOpen={this.props.visible} className={cn}>
                    {
                        this.props.header && 
                        <ModalHeader>
                            {this.props.header}
                        </ModalHeader>
                    }
                    <ModalBody className="vertical-scroll">
                        {this.props.children}
                    </ModalBody>
                    {
                        this.props.header && 
                        <ModalFooter>
                            {this.props.header}
                        </ModalFooter>
                    }
                </Modal>
            </div>
        );
    }
}