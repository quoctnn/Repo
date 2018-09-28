import * as React from "react";
import { translate } from '../../components/intl/AutoIntlProvider';
import { connect } from 'react-redux'
import { UserProfile } from '../../reducers/profileStore';
import {  Button, ModalBody, Modal, ModalHeader, ModalFooter } from 'reactstrap';
import { RootState } from "../../reducers";
import { Avatar } from './Avatar';
require("./SelectUsersDialog.scss");
export interface OwnProps {
    title?:string,
    completeButtonTitle?:string
    preselectedContacts?:number[]
    didCancel?:() => void
    didComplete?:(users:UserProfile[]) => void
    visible:boolean
}
interface ReduxStateProps 
{
    contacts:UserProfile[]
}
type Props = ReduxStateProps & OwnProps
interface UserInfoProps
{
    user:UserProfile
    selected:boolean
    onClick:(event) => void
}
const UserInfo = (props:UserInfoProps) => {
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
        <div className="flex-shrink-0 flex-grow-0">{props.selected ? "true" : "false"}</div>
      </div>
    );
  }
interface State
{
    selected:number[]
}
class SelectUsersDialog extends React.Component<Props, State> {

    static defaultProps:OwnProps = {
        visible:false,
        preselectedContacts:[]
    }
    constructor(props) {
        super(props);
        this.state = {
            selected:[]
        }
        this.didToggleUser = this.didToggleUser.bind(this)
    }
    componentWillReceiveProps(nextProps:Props)
    {
        this.setState({selected:nextProps.preselectedContacts})
    }
    didToggleUser(user:number)
    {
        let arr = this.state.selected
        let index = arr.indexOf(user)
        if(index == -1)
        {
            arr.push(user)
        }
        else 
        {
            arr.splice(index, 1)
        }
        this.setState({selected:arr}, () => {
            console.log(this.state.selected)
        })
    }
    render() 
    {
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
                                return <UserInfo onClick={() => {this.didToggleUser(u.id)}} key={u.id} user={u} selected={this.props.preselectedContacts.indexOf(u.id) >= 0}/>
                            })
                        }
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.props.didCancel}>
                            {translate("Cancel")}
                        </Button>
                        <Button color="primary" onClick={() => {
                            this.props.didComplete(this.props.preselectedContacts.map(id => this.props.contacts.find(u => u.id == id)))
                        }}>
                            {this.props.completeButtonTitle || translate("Submit")}
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = (state:RootState, ownProps: OwnProps):ReduxStateProps => {

    let profiles = state.profileStore.byId
    return {
        contacts:state.contactListCache.contacts.map(c => profiles[c]),
    }
}
export default connect<ReduxStateProps,void,  OwnProps>(mapStateToProps, null)(SelectUsersDialog);