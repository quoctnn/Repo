import * as React from "react";
import {ModalBody, Modal, ModalHeader, ModalFooter, Button } from 'reactstrap';
import classnames = require("classnames");
import { translate } from "../../../localization/AutoIntlProvider";
import { CollapseState } from "../CollapseComponent";

type DefaultProps = {
    zIndex:number
    showCloseButton:boolean
    centered:boolean
    scrollable:boolean
    fade:boolean
    animationDuration:number
    removeContentOnHidden:boolean
}
type Props = {
    header?:React.ReactNode | JSX.Element
    children:React.ReactNode
    footer?:React.ReactNode
    visible:boolean
    didCancel:() => void
    className?:string
    onScroll?: (event: React.UIEvent<any>) => void
} & DefaultProps
type State =
{
    state:CollapseState
    contentVisible:boolean
}
export default class SimpleDialog extends React.Component<Props, State> {
    static defaultProps:DefaultProps = {
        zIndex:1070,
        showCloseButton:true,
        centered:true,
        scrollable:true,
        fade:true,
        animationDuration : 250,
        removeContentOnHidden:true
    }
    constructor(props:Props) {
        super(props);
        this.state = {
            state:props.visible ? CollapseState.open : CollapseState.removeContent,
            contentVisible:false,
        }
    }
    componentDidUpdate = (prevProps:Props, prevState:State) => {
        //open -> sh -> none
        //close -> sh -> 0
        if(this.props.visible != prevProps.visible)
        {
            if(this.props.visible)
            {
                requestAnimationFrame(this.setInsertContent)
                
            }
            else {
                requestAnimationFrame(this.setClosing)
            }
        }
    }
    requestClosing = () => {
        requestAnimationFrame(this.setClosed)
    }
    requestOpening = () => {
        requestAnimationFrame(this.setOpening)
    }
    setOpening = () => {
        this.setState({state:CollapseState.opening}, this.setOpenState)
    }
    setInsertContent = () => {
        this.setState({state:CollapseState.insertContent}, this.requestOpening)
    }
    setClosed = () => {
        this.setState({state:CollapseState.closed}, this.removeContent)
    }
    setClosing = () => {
        this.setState({state:CollapseState.closing}, this.requestClosing)
    }
    removeContent = () => {
        setTimeout(() => {
            this.setState((prevState) => {
                if(prevState.state == CollapseState.closed)
                    return {state: CollapseState.removeContent}
            })
        }, this.props.animationDuration + 100);
    }
    setOpenState = () => {
        setTimeout(() => {
            this.setState((prevState) => {
                if(prevState.state == CollapseState.opening)
                    return {state: CollapseState.open}
            })
        }, this.props.animationDuration + 100);
    }
    renderCloseButton = () => {
        if(!this.props.showCloseButton)
            return null
        return <Button color="light" className="modal-close" onClick={this.props.didCancel}>
                <span className="sr-only">{translate("common.close")}</span>
                <i aria-hidden="true" className="fas fa-times"></i>
            </Button>
    }
    showInfo = () => {
        if(!this.props.visible && this.state.state == CollapseState.removeContent)
            console.warn(`content of SimpleDialog is processed regardless of visibility`)       
        return null
    }
    render() 
    {
        const renderChildren = !this.props.removeContentOnHidden || this.state.state != CollapseState.removeContent 
        if(!renderChildren)
            return null
        const cn = classnames(this.props.className, {"modal-dialog-scrollable":this.props.scrollable})
        return(
            <div>
                <Modal unmountOnClose={this.props.removeContentOnHidden} fade={this.props.fade} centered={this.props.centered} toggle={this.props.didCancel} isOpen={this.props.visible} className={cn}>
                    {
                        this.props.header && 
                        <ModalHeader>
                            {this.props.header}
                            {this.renderCloseButton()}
                        </ModalHeader>
                    }
                    <ModalBody className="vertical-scroll" onScroll={this.props.onScroll}>
                        {this.props.children}
                    </ModalBody>
                    {
                        this.props.footer && 
                        <ModalFooter>
                            {this.props.footer}
                        </ModalFooter>
                    }
                    {this.showInfo()}
                </Modal>
            </div>
        );
    }
}