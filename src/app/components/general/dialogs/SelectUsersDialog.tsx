import * as React from "react";
import {  Button, ModalBody, Modal, ModalHeader, ModalFooter, FormGroup, Label, Input } from 'reactstrap';
import { UserProfile } from "../../../types/intrasocial_types";
import { Avatar } from "../Avatar";
import { translate } from "../../../localization/AutoIntlProvider";

require("./SelectUsersDialog.scss");

interface UserInfoProps
{
    user:UserProfile
    selected:boolean
    onClick:(event) => void
}
export const UserInfo = (props:UserInfoProps) => {
    return (
      <div onClick={props.onClick} className="user-info d-flex">
        <Avatar image={props.user.avatar} className="flex-shrink-0" />
        <div className="flex-truncate-container flex-shrink-1 flex-grow-1">
            <div className="user-info-name text-truncate">
                {props.user.first_name + " " + props.user.last_name}
            </div>
            <div className="user-info-username text-truncate">
                {props.user.username}
            </div>
        </div>
        <div className="flex-shrink-0 flex-grow-0">
            <Input type="checkbox" checked={props.selected} />
        </div>
      </div>
    );
  }
type Props = {
    visible:boolean
    canSubmit:boolean
    title?:string,
    completeButtonTitle?:string
    didCancel:() => void
    didSubmit:() => void
    valueChanged:(value:number[]) => void
    contacts:UserProfile[]
    selected:number[]
    singleSelect:boolean
}
type State =
{
}
export default class SelectUsersDialog extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {
        }
    }
    didToggleUser = (user:number) => {
        let arr =  [...this.props.selected]
        let index = arr.indexOf(user)
        if(index == -1)
        {
            if(this.props.singleSelect)
                arr = [user]
            else 
                arr.push(user)
        }
        else 
        {
            arr.splice(index, 1)
        }
        this.sendValueChanged(arr)
    }
    sendValueChanged = (arr:number[]) => {
        console.log(arr)
        if(this.props.valueChanged)
        {
            this.props.valueChanged(arr)
        }
    }
    didSubmit = () => {
        this.props.didSubmit()
    }
    render() 
    {
        const selected = this.props.selected
        return(
            <div >
                <Modal toggle={this.props.didCancel} id="select-users-dialog" zIndex={1070} isOpen={this.props.visible} className="full-height">
                    {
                        this.props.title && 
                        <ModalHeader>
                            {this.props.title}
                        </ModalHeader>
                    }
                    <ModalBody className="vertical-scroll">
                        {
                            this.props.contacts.map((u, index) => {
                                return <UserInfo onClick={() => {this.didToggleUser(u.id)}} key={u.id} user={u} selected={selected.indexOf(u.id) >= 0}/>
                            })
                        }
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.props.didCancel}>
                            {translate("Cancel")}
                        </Button>
                        <Button color="primary" onClick={this.didSubmit} disabled={!this.props.canSubmit}>
                            {this.props.completeButtonTitle || translate("Submit")}
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}