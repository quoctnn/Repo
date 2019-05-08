import * as React from 'react';
import { Button,Form, FormGroup } from 'reactstrap';
import { withRouter} from 'react-router-dom'
import "./CreateConversation.scss"
import { UserProfile, Conversation } from '../../../types/intrasocial_types';
import { translate } from '../../../localization/AutoIntlProvider';
import ApiClient from '../../../network/ApiClient';
import { ToastManager } from '../../../managers/ToastManager';
import { Avatar } from '../../../components/general/Avatar';
import LoadingSpinner from '../../../components/LoadingSpinner';
import SelectUsersDialog from '../../../components/general/dialogs/SelectUsersDialog';
import { ProfileManager } from '../../../managers/ProfileManager';
import { ConversationUtilities } from '../../../utilities/ConversationUtilities';
import { AuthenticationManager } from '../../../managers/AuthenticationManager';
type OwnProps = {
    onComplete:() => void
}
type RouteProps = {
    history:any
    location: any
    match:any
}
type State = {
    dialogVisible:boolean,
    selectedUsers:UserProfile[]
    title:string,
    submitting:boolean
}
type Props = OwnProps & RouteProps
class CreateConversation extends React.Component<Props, State> {   
    constructor(props:Props) {
        super(props);
        this.state = {
            dialogVisible:false,
            selectedUsers:[],
            title:"",
            submitting:false
        }
    }
    getConversationPlaceholderTitle = () => {
        const me = AuthenticationManager.getAuthenticatedUser().id
        return this.state.selectedUsers.length == 0 ? translate("No title") : ConversationUtilities.getConversationTitleFromProfiles(this.state.selectedUsers, me)
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

    onSelectUsersDialogSubmit = () => {
        this.setState({dialogVisible:false})
    }
    onSelectUsersDialogCancel = () => {
        this.setState({dialogVisible:false})
    }
    onSelectUsersDialogValueChanged = (value: number[]) => {

        this.setState({selectedUsers:ProfileManager.getProfiles(value)})
    }
    createConversation = () => {
        this.setState({submitting:true}, () => {
            let title = this.state.title.length == 0 ? null : this.state.title
            ApiClient.createConversation(title, this.state.selectedUsers.map(u => u.id), (data, status, error) => {

                this.setState({submitting:false}, () => {
                    let conversation = data as Conversation
                    if(data)
                    {
                        this.props.onComplete()
                        ToastManager.showInfoToast(translate("conversation.created"))
                    }
                    if(error || status == "error")
                    {
                        ToastManager.showErrorToast(error || translate("Could not create conversation"))
                        return
                    }
                })
            } )
        })
        
    }
    canSubmit = () => {
        return this.state.selectedUsers.length > 0 && !this.state.submitting
    }
    render()
    {
        const contacts = ProfileManager.getProfiles(ProfileManager.getContactListIds(false))
        return (<div id="create-conversation">
                    <button type="button" className="close pull-right" onClick={this.props.onComplete}>
                        <span aria-hidden="true">&times;</span>
                        <span className="sr-only">{translate("common.close")}</span>
                    </button>
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
                    <SelectUsersDialog 
                        contacts={contacts}
                        title={translate("Add Members")} 
                        completeButtonTitle={translate("Add to conversation")} 
                        visible={this.state.dialogVisible}
                        didCancel={this.onSelectUsersDialogCancel}
                        didSubmit={this.onSelectUsersDialogSubmit}
                        valueChanged={this.onSelectUsersDialogValueChanged}
                        canSubmit={this.canSubmit()}
                        selected={this.state.selectedUsers.map(u => u.id)}
                        singleSelect={false}
                    />
                </div>)
    }
}
export default withRouter(CreateConversation);