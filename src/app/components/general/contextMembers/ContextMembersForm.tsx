import * as React from 'react';
import { Community, ContextNaturalKey, IdentifiableObject, Event, Group, Project, CommunityRole } from '../../../types/intrasocial_types';
import FormController, { FormStatus } from '../../form/FormController';
import { FormMenuItem } from '../../form/FormMenuItem';
import { translate } from '../../../localization/AutoIntlProvider';
import { FormPage } from '../../form/FormPage';
import CommunityInvitationsComponent from './CommunityInvitationsComponent';
import ContextInvitationComponent from './ContextInvitationComponent';
import ContextRolesComponent from './ContextRolesComponent';
import ContextMembersComponent from './ContextMembersComponent';
import { RoleManager } from './ContextRolesComponent';
import "./ContextMembersForm.scss"
type OwnProps = {
    didCancel:() => void
    visible:boolean
    contextNaturalKey:ContextNaturalKey
    contextObject:IdentifiableObject
    community:Community
}
type State = {
}
type Props = OwnProps
export default class ContextMembersForm extends React.Component<Props, State> {
    formController:FormController = null
    roleManager:RoleManager = null
    constructor(props:Props) {
        super(props);
        this.state = {
        }
        this.roleManager = new RoleManager(props.community.id)
    }
    getContextMembers = () => {
        const {contextObject, contextNaturalKey} = this.props
        switch (contextNaturalKey) {
            case ContextNaturalKey.EVENT: return (contextObject as Event).attending
            case ContextNaturalKey.GROUP: return (contextObject as Group).members
            case ContextNaturalKey.PROJECT: return (contextObject as Project).members
            case ContextNaturalKey.COMMUNITY: return (contextObject as Project).members
            default:
                return []
        }
    }
    renderMembersPage = () => {
        const {contextObject, contextNaturalKey, community} = this.props
        return <ContextMembersComponent members={this.getContextMembers()} availableMembers={community.members} roleManager={this.roleManager} contextNaturalKey={contextNaturalKey} contextObject={contextObject}/>
    }
    renderRolesPage = () => {
        const {contextObject, contextNaturalKey, community} = this.props
        return <ContextRolesComponent roleManager={this.roleManager} community={community} contextNaturalKey={contextNaturalKey} contextObject={contextObject}/>
    }
    renderInvitationPage = () => {
        const {contextObject, contextNaturalKey, community} = this.props
        if(contextNaturalKey == ContextNaturalKey.PROJECT)
            return null
        if(contextNaturalKey == ContextNaturalKey.COMMUNITY)
            return <CommunityInvitationsComponent community={community} />
        return <ContextInvitationComponent members={this.getContextMembers()} availableMembers={community.members} contextNaturalKey={contextNaturalKey} contextObject={contextObject} /> 
    }
    renderInvitationMenuItem = (form:FormController) => {
        const {contextObject, contextNaturalKey, community} = this.props
        if(contextNaturalKey == ContextNaturalKey.PROJECT)
            return null
        return <FormMenuItem key="3"
            form={form} 
            pageId="3" 
            title={translate("members.page.title.invites")} 
            description={translate("members.page.description.invites")}  
            />
    }
    render = () => {
        const {visible, didCancel} = this.props
        return <FormController 
                    ref={(controller) => this.formController = controller }
                    visible={visible} 
                    formErrors={[]} 
                    didCancel={didCancel} 
                    status={FormStatus.normal} 
                    title={translate("common.member.management")} 
                    modalClassName="context-members-form-modal"
                    render={(form) => {
                        return {
                            menuItems:[
                                <FormMenuItem key="1"
                                    form={form} 
                                    pageId="1" 
                                    title={translate("members.page.title.members")} 
                                    description={translate("members.page.description.members")}  
                                    />,
                                    <FormMenuItem key="2"
                                    form={form} 
                                    pageId="2" 
                                    title={translate("members.page.title.roles")} 
                                    description={translate("members.page.description.roles")}  
                                    />,
                                    this.renderInvitationMenuItem(form)
                            ].filter(i => !!i),
                            pages:[
                                    <FormPage key="page1" form={this.formController} pageId="1" render={(pageId, form) => {
                                        return this.renderMembersPage()
                                        }} />,
                                    <FormPage key="page2" form={this.formController} pageId="2" render={(pageId, form) => {
                                        return this.renderRolesPage()
                                        }} />,
                                    <FormPage key="page3" form={this.formController} pageId="3" render={(pageId, form) => {
                                        return this.renderInvitationPage()
                                        }} />
                        ]
                        }
                    }}
                    >
                    </FormController>
    }
}