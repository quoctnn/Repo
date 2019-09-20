import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import Module, { CommonModuleProps } from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import ModuleFooter from '../ModuleFooter';
import "./CommunityDetailsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import { Community, ContextNaturalKey, Permission, CropRect, ContextPhotoType, CropInfo, RequestErrorData, ContextPrivacy, CommunityCategory, CommunityConfigurationData, CommunityCreatePermission, UserProfile } from '../../types/intrasocial_types';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DetailsContent } from '../../components/details/DetailsContent';
import { DetailsMembers } from '../../components/details/DetailsMembers';
import { ContextManager } from '../../managers/ContextManager';
import FormController from '../../components/form/FormController';
import {ApiClient} from '../../network/ApiClient';
import classnames from 'classnames';
import { uniqueId } from '../../utilities/Utilities';
import { DropDownMenu } from '../../components/general/DropDownMenu';
import { OverflowMenuItem, OverflowMenuItemType } from '../../components/general/OverflowMenu';
import CommunityCreateComponent from '../../components/general/contextCreation/CommunityCreateComponent';
type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps
type State = {
    menuVisible:boolean
    isLoading:boolean
    editFormVisible:boolean
    editFormReloadKey?:string
    communityConfiguration?:CommunityConfigurationData
}
type ReduxStateProps = {
    community: Community
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class CommunityDetailsModule extends React.Component<Props, State> {
    formController:FormController = null
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
            menuVisible:false,
            editFormVisible:false,
            editFormReloadKey:uniqueId(),
            communityConfiguration:null,
        }
    }
    componentDidUpdate = (prevProps:Props) => {
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({isLoading:false})
        }
    }
    menuItemClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const visible = !this.state.menuVisible
        const newState:any = {menuVisible:visible}
        if(!visible)
        {
            /* TODO: Close the modal dialog with the group settings */
        } else {
            /* TODO: Show a modal dialog with the group settings */
        }
        this.setState(newState)
    }
    renderLoading = () => {
        if (this.state.isLoading) {
            return (<CircularLoadingSpinner borderWidth={3} size={20} key="loading"/>)
        }
    }
    loadConfigurationDataAndShowForm = () => {
        const community = this.props.community
        ApiClient.getCommunityConfiguration(community.id, (data, status, errorData) => {
            this.setState(() => {
                return {isLoading:false, communityConfiguration:data, editFormVisible:true, editFormReloadKey:uniqueId()}
            })
        })
    }
    toggleEditForm = () => {
        const isFormVisible = this.state.editFormVisible
        if(isFormVisible) //close
        {
            this.setState(() => {
                return {editFormVisible:!isFormVisible, communityConfiguration:null}
            })
        }
        else {
            this.setState((prevState:State) => {
                return {isLoading:true}
            }, this.loadConfigurationDataAndShowForm )
        }
        
    }
    renderEditForm = () => {
        const visible = this.state.editFormVisible
        const community = this.props.community
        const communityConfiguration = this.state.communityConfiguration
        return <CommunityCreateComponent key={this.state.editFormReloadKey} communityConfiguration={communityConfiguration} community={community} visible={visible} onComplete={this.toggleEditForm} />
    }
    getCommunityOptions = () => {
        const options: OverflowMenuItem[] = []
        if(this.props.community.permission >= Permission.admin)
            options.push({id:"1", type:OverflowMenuItemType.option, title:translate("Edit"), onPress:this.toggleEditForm, iconClass:"fas fa-pen"})
        return options
    }
    render = () => {
        const {breakpoint, history, match, location, staticContext, community, contextNaturalKey, className, ...rest} = this.props
        const cn = classnames("community-details-module", className)
        const communityOptions = this.getCommunityOptions()
        return (<Module {...rest} className={cn}>
                    <ModuleHeader headerTitle={community && community.name || translate("detail.module.title")} loading={this.state.isLoading}>
                       {communityOptions.length > 0 && <DropDownMenu className="community-option-dropdown" triggerClass="fas fa-cog mx-1" items={communityOptions}></DropDownMenu>} 
                    </ModuleHeader>
                    {true && //breakpoint >= ResponsiveBreakpoint.standard && //do not render for small screens
                        <ModuleContent>
                            { community && community.permission >= Permission.read &&
                                <DetailsContent description={community.description}/>
                            ||
                            <LoadingSpinner key="loading"/>
                            }
                            {this.renderEditForm()}
                        </ModuleContent>
                    }
                    { community && community.permission >= Permission.read &&
                        <ModuleFooter className="mt-1">
                            <DetailsMembers members={community.members} />
                        </ModuleFooter>
                    }
                </Module>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {

    const community = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.COMMUNITY) as Community
    return {
        community,
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(CommunityDetailsModule))