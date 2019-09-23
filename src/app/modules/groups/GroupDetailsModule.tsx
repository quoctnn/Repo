import * as React from 'react';
import { withRouter, RouteComponentProps, Link } from "react-router-dom";
import Module from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import ModuleFooter from '../ModuleFooter';
import ModuleMenuTrigger from '../ModuleMenuTrigger';
import "./GroupDetailsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import { Group, Community, ContextNaturalKey, Permission } from '../../types/intrasocial_types';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DetailsContent } from '../../components/details/DetailsContent';
import { DetailsMembers } from '../../components/details/DetailsMembers';
import { ContextManager } from '../../managers/ContextManager';
import GroupCreateComponent from '../../components/general/contextCreation/GroupCreateComponent';
import { uniqueId } from '../../utilities/Utilities';
import { OverflowMenuItemType, OverflowMenuItem } from '../../components/general/OverflowMenu';
import { DropDownMenu } from '../../components/general/DropDownMenu';
type OwnProps = {
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey: ContextNaturalKey
}
type State = {
    menuVisible:boolean
    isLoading:boolean
    editFormVisible:boolean
    editFormReloadKey:string
}
type ReduxStateProps = {
    community: Community
    group: Group
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class GroupDetailsModule extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
            menuVisible:false,
            editFormVisible:false,
            editFormReloadKey:uniqueId(),
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
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    renderLoading = () => {
        if (this.state.isLoading) {
            return (<CircularLoadingSpinner borderWidth={3} size={20} key="loading"/>)
        }
    }
    showGroupCreateForm = () => {
        this.setState((prevState:State) => {
            return {editFormVisible:true, editFormReloadKey:uniqueId()}
        })
    }
    hideGroupCreateForm = (onComplete?:() => void) => {

        this.setState((prevState:State) => {
            return {editFormVisible:false}
        },onComplete)
    }
    handleGroupCreateForm = (group:Group) => {
        if(group && group.uri && group.uri != this.props.group.uri)
        {
            window.app.navigateToRoute(group.uri)
        }
        this.hideGroupCreateForm()
    }
    renderEditForm = () => {
        const visible = this.state.editFormVisible
        const group = this.props.group
        return <GroupCreateComponent onCancel={this.hideGroupCreateForm} community={group.community} key={this.state.editFormReloadKey} group={group} visible={visible} onComplete={this.handleGroupCreateForm} />
    }
    getGroupOptions = () => {
        const options: OverflowMenuItem[] = []
        if(this.props.group.permission >= Permission.admin)
            options.push({id:"1", type:OverflowMenuItemType.option, title:translate("Edit"), onPress:this.showGroupCreateForm, iconClass:"fas fa-pen"})
        return options
    }
    render()
    {
        const {breakpoint, history, match, location, staticContext, group, community, contextNaturalKey, ...rest} = this.props
        const groupOptions = this.getGroupOptions()
        return (<Module {...rest}>
                    <ModuleHeader headerTitle={group && group.name || translate("detail.module.title")} loading={this.state.isLoading}>
                        {groupOptions.length > 0 && <DropDownMenu className="group-option-dropdown" triggerClass="fas fa-cog mx-1" items={groupOptions}></DropDownMenu>} 
                    </ModuleHeader>
                    {true && //breakpoint >= ResponsiveBreakpoint.standard && //do not render for small screens
                        <ModuleContent>
                            { group &&
                                <div>
                                    { group.permission >= Permission.read &&
                                        <DetailsContent community={community} description={group.description}/>
                                    }
                                </div>
                                ||
                                <LoadingSpinner key="loading"/>
                            }
                            {this.renderEditForm()}
                        </ModuleContent>
                    }
                    {group && group.permission >= Permission.read &&
                        <ModuleFooter className="mt-1">
                            <DetailsMembers members={group.members} />
                        </ModuleFooter>
                    }
                </Module>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {

    const group = ContextManager.getContextObject(ownProps.location.pathname, ownProps.contextNaturalKey) as Group
    const community = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.COMMUNITY) as Community
    return {
        community,
        group,
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(GroupDetailsModule))