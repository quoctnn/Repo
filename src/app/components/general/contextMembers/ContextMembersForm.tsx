import * as React from 'react';
import { Community, ContextNaturalKey, IdentifiableObject, Permissible, Permission } from '../../../types/intrasocial_types';
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
    contextObject:IdentifiableObject & Permissible
    community:Community
}
type State = {
    
}
type Props = OwnProps
export default class ContextMembersForm extends React.Component<Props, State> {
    formController:FormController = null
    roleManager:RoleManager = null
    private hasAccess = false
    private minimumPermission = Permission.moderate
    constructor(props:Props) {
        super(props);
        this.state = {
        }
        this.hasAccess = Permission.hasAccess(props.contextObject, this.minimumPermission)
        this.roleManager = new RoleManager(props.community.id)

    }
    componentDidUpdate = (prevProps:Props) => {
        if(this.props.contextObject != prevProps.contextObject)
        {
            this.hasAccess = Permission.hasAccess(this.props.contextObject, this.minimumPermission)
        }
    }
    getContextMembers = () => {
        const {contextObject, contextNaturalKey} = this.props
        return ContextNaturalKey.getMembers(contextNaturalKey, contextObject)
    }
    renderMembersPage = () => {
        const {contextObject, contextNaturalKey, community} = this.props
        return <ContextMembersComponent members={this.getContextMembers()} availableMembers={community.members} roleManager={this.roleManager} contextNaturalKey={contextNaturalKey} contextObject={contextObject}/>
    }
    renderRolesPage = () => {
        const {contextObject, contextNaturalKey, community} = this.props
        if(contextObject.permission < Permission.admin || contextNaturalKey == ContextNaturalKey.EVENT)
            return null
        return <ContextRolesComponent roleManager={this.roleManager} community={community} contextNaturalKey={contextNaturalKey} contextObject={contextObject}/>
    }
    renderInvitationPage = () => {
        const {contextObject, contextNaturalKey, community} = this.props
        if(!this.hasAccess || contextNaturalKey == ContextNaturalKey.PROJECT)
            return null
        if(contextNaturalKey == ContextNaturalKey.COMMUNITY)
            return <CommunityInvitationsComponent community={community} />
        return <ContextInvitationComponent members={this.getContextMembers()} availableMembers={community.members} contextNaturalKey={contextNaturalKey} contextObject={contextObject} /> 
    }
    renderInvitationMenuItem = (form:FormController) => {
        const {contextObject, contextNaturalKey, community} = this.props
        if(!this.hasAccess || contextNaturalKey == ContextNaturalKey.PROJECT)
            return null
        return <FormMenuItem key="3"
            form={form} 
            pageId="3" 
            title={translate("members.page.title.invites")} 
            description={translate("members.page.description.invites")}  
            />
    }
    renderRolesMenuItem = (form:FormController) => {
        const {contextObject, contextNaturalKey, community} = this.props
        if(contextObject.permission < Permission.admin || contextNaturalKey == ContextNaturalKey.EVENT)
            return null
        return <FormMenuItem key="2"
        form={form} 
        pageId="2" 
        title={translate("members.page.title.roles")} 
        description={translate("members.page.description.roles")}  
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
                    title={translate(this.hasAccess ? "common.member.management" : "Members")} 
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
                                    this.renderRolesMenuItem(form)
                                    ,
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