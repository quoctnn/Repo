import * as React from 'react';
import * as Redux from 'redux'
import { connect } from 'react-redux'
import { translate } from '../../components/intl/AutoIntlProvider';
import { RootState } from '../../reducers';
import { Button,Form, FormGroup } from 'reactstrap';
import SelectUsersDialog from '../../components/general/SelectUsersDialog';
import { Avatar } from '../../components/general/Avatar';
import ApiClient from '../../network/ApiClient';
import { withRouter} from 'react-router-dom'
import { Routes } from '../../utilities/Routes';
import { ConversationManager } from '../../managers/ConversationManager';
import LoadingSpinner from '../../components/general/LoadingSpinner';
import { toast } from 'react-toastify';
import { ErrorToast } from '../../components/general/Toast';
import { UserProfile, Conversation } from '../../types/intrasocial_types';

require("./CreateConversation.scss");
export interface OwnProps {
}
interface ReduxStateProps {
}
interface ReduxDispatchProps {
}
interface RouteProps 
{
    history:any
    location: any
    match:any
}
interface State {
    dialogVisible:boolean,
    selectedUsers:UserProfile[]
    title:string,
    submitting:boolean
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteProps
class CreateConversation extends React.Component<Props, State> {   
    constructor(props) {
        super(props);
        this.state = {
            dialogVisible:false,
            selectedUsers:[],
            title:"",
            submitting:false
        }
        this.didCompleteDialog = this.didCompleteDialog.bind(this)
        this.getConversationPlaceholderTitle = this.getConversationPlaceholderTitle.bind(this)
        this.canSubmit = this.canSubmit.bind(this)
        this.createConversation = this.createConversation.bind(this)
        
        
    }
    didCompleteDialog(users:UserProfile[])
    {
        this.setState({dialogVisible:false, selectedUsers:users})
    }
    getConversationPlaceholderTitle()
    {
        return this.state.selectedUsers.length == 0 ? translate("No title") : this.state.selectedUsers.map(u => u.first_name).join(", ")
    }
    removeUser(id:number)
    {
        let users = this.state.selectedUsers
        let index = users.findIndex(u => u.id == id)
        if(index != -1)
        {
            users.splice(index, 1)
            this.setState({selectedUsers:users})
        }
    }
    createConversation()
    {
        this.setState({submitting:true}, () => {
            let title = this.state.title.length == 0 ? null : this.state.title
            ApiClient.createConversation(title, this.state.selectedUsers.map(u => u.id), (data, status, error) => {

                this.setState({submitting:false}, () => {
                    let conversation = data as Conversation
                    if(data)
                    {
                        ConversationManager.setConversation(conversation, true)
                        this.props.history.push(Routes.CONVERSATION + conversation.id)
                    }
                    if(error || status == "error")
                    {
                        toast.error(<ErrorToast message={error || translate("Could not create conversation")} />, { hideProgressBar: true })
                        return
                    }
                })
            } )
        })
        
    }
    canSubmit()
    {
        return this.state.selectedUsers.length > 0 && !this.state.submitting
    }
    render()
    {
        return (<div id="create-conversation">
                    <div className="jumbotron">
                        <div className="container">
                            <h1 className="display-4">{translate("Create Conversation")}</h1>
                            <Form>
                                <FormGroup className="row">
                                    <label htmlFor="conversation-title" className="col-sm-4 col-form-label" >
                                        {translate("Title")}
                                    </label>
                                    <div className="col-sm-8">

                                        <input id="conversation-title" 
                                            onChange={e => { this.setState({ title: e.target.value }); }} 
                                            type="text" className="form-control" placeholder={this.getConversationPlaceholderTitle()} />
                                    </div>
                                </FormGroup>
                                <FormGroup className="row">
                                    <label htmlFor="conversation-members" className="col-sm-4 col-form-label" >
                                        {translate("Members")}
                                    </label>
                                    <div className="col-sm-8">
                                        <div className="">
                                          { this.state.selectedUsers.length == 0 && <div>{translate("Please select members")}</div>}
                                          { this.state.selectedUsers.length > 0 && 
                                                <div className="member-list">{this.state.selectedUsers.map((u) => 
                                                    {
                                                        return (<div key={u.id}>
                                                            <div className="member-avatar">
                                                            <Avatar image={u.avatar}>
                                                                <button onClick={this.removeUser.bind(this, u.id)} type="button" className="remove-button btn btn-danger btn-sm rounded-circle" aria-label="Close">
                                                                    <i className="fas fa-times"></i>
                                                                </button>
                                                            </Avatar></div>
                                                            <div className="member-name text-truncate">{u.first_name}</div>
                                                        </div>)
                                                    })}</div>
                                            }
                                            <div className="input-group-append">
                                                <button onClick={() => { this.setState({dialogVisible:true}) }} className="btn btn-outline-secondary" type="button">
                                                    {translate("Select members")}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </FormGroup>
                                <FormGroup className="row">
                                    <div className="col-sm-12">
                                        <Button disabled={!this.canSubmit()} className="submit-button margin-right-sm" onClick={this.createConversation}>
                                        {!this.state.submitting && translate("Create")}
                                        {this.state.submitting && <LoadingSpinner />}
                                        </Button>
                                    </div>
                                </FormGroup>
                            </Form>
                        </div>
                    </div>
                    <SelectUsersDialog completeButtonTitle={translate("Add to conversation")} title={translate("Add Members")} preselectedContacts={this.state.selectedUsers.map(u => u.id)} visible={this.state.dialogVisible} didCancel={() => {this.setState({dialogVisible:false})}} didComplete={this.didCompleteDialog} />
                </div>)
    }
}
const mapStateToProps = (state:RootState, ownProps: OwnProps):ReduxStateProps => {
    return {
    }
}
const mapDispatchToProps = (dispatch:Redux.Dispatch<any>, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter<RouteProps>(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(CreateConversation));