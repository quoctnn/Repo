import * as React from "react";
import {  Button, ModalBody, Modal, ModalHeader, ModalFooter, FormGroup, Label, Input } from 'reactstrap';
import { UserProfile } from "../../../types/intrasocial_types";
import { Avatar } from "../Avatar";
import { translate } from "../../../localization/AutoIntlProvider";
import { userFullName } from "../../../utilities/Utilities";
import SimpleDialog from "./SimpleDialog";
import { ListItem, List } from '../List';
import classnames from 'classnames';

interface UserInfoProps
{
    user:UserProfile
    selected:boolean
    onClick:(event) => void
}
export const UserInfo = (props:UserInfoProps) => {
    const checkClass = classnames("mr-2 d-flex align-items-center justify-content-center border-1", {"primary-theme-bg":props.selected})
    return (
      <ListItem hasAction={true} onClick={props.onClick}>
        <Avatar image={props.user.avatar} className="flex-shrink-0 mr-2" />
        <div className="flex-shrink-1 flex-grow-1 mw0">
            <div className="text-truncate">
                {userFullName(props.user)}
            </div>
            <div className="text-truncate">
                {props.user.username}
            </div>
        </div>
        <div className="flex-shrink-0 flex-grow-0">
            <div className={checkClass} style={{width:24, height:24, borderRadius:"50%"}}>
                {props.selected && <i className="fas fa-check small-text"></i>}
            </div>
        </div>
      </ListItem>
    );
  }
type OwnProps = {
    visible:boolean
    canSubmit:boolean
    title?:string,
    completeButtonTitle?:string
    didCancel:() => void
    didSubmit:(added:number[], removed:number[]) => void
    didUpdate?:(added:number[], removed:number[]) => void
    contacts:UserProfile[]
}
type DefaultProps = {
    singleSelect:boolean
    canRemove:boolean
    selected:number[]
}
type Props = OwnProps & DefaultProps
type State =
{
    added:number[]
    removed:number[]
}
export default class SelectUsersDialog extends React.Component<Props, State> {
    static defaultProps:DefaultProps = {
        singleSelect:false,
        canRemove:true,
        selected:[]
    }
    constructor(props:Props) {
        super(props);
        this.state = {
            added:[],
            removed:[]
        }
    }
    didToggleUser = (user:number) => (e:React.SyntheticEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const selected =  this.props.selected
        this.setState((prevState:State) => {
            let added = [...prevState.added]
            const removed = [...prevState.removed]
            const index = selected.indexOf(user)
            if(index == -1)
            {
                if(this.props.singleSelect)
                    added = [user]
                else 
                    added.toggleElement(user)
            }
            else if(this.props.canRemove)
            {
                removed.toggleElement(user)
            }
            return {added, removed}
        }, this.sendValueChanged)
    }
    sendValueChanged = () => {
        if(this.props.didUpdate)
        {
            this.props.didUpdate(this.state.added, this.state.removed)
        }
    }
    didSubmit = () => {
        this.props.didSubmit(this.state.added, this.state.removed)
    }
    isSelected = (user:number, selected:number[], added:number[], removed:number[]) => {
        return !removed.contains(user) && (selected.contains(user) || added.contains(user))
    }
    renderFooter = () => {
        return <Button color="primary" onClick={this.didSubmit} disabled={!this.props.canSubmit}>
                {this.props.completeButtonTitle || translate("common.done")}
            </Button>
    }
    render() 
    {
        const selected = this.props.selected
        const {added, removed} = this.state
        return( <SimpleDialog footer={this.renderFooter()} header={this.props.title} didCancel={this.props.didCancel} visible={this.props.visible}>
                    <List enableAnimation={false}>
                    {
                        this.props.contacts.map((u, index) => {
                            return <UserInfo onClick={this.didToggleUser(u.id)} key={u.id} user={u} selected={this.isSelected(u.id, selected, added, removed)}/>
                        })
                    }
                    </List>
                </SimpleDialog>
            
        );
    }
}