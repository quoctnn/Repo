import * as React from "react";
import "./PageTopMenu.scss"
import { ReduxState } from "../redux";
import { connect } from "react-redux";
import { Button, Popover, PopoverBody, ModalHeader, Modal, ModalBody, ModalFooter, DropdownItem, Badge } from "reactstrap";
import { withRouter, RouteComponentProps } from "react-router-dom";
import Routes from "../utilities/Routes";
import { UserProfile } from "../types/intrasocial_types";
import { isAdmin } from "../utilities/Utilities";
import { translate } from "../localization/AutoIntlProvider";
import DevTool from "./dev/DevTool";
import { OverflowMenuItem, OverflowMenuItemType, createDropdownItem } from "./general/OverflowMenu";
import { Settings } from '../utilities/Settings';
import { WindowAppManager } from '../managers/WindowAppManager';
import SimpleDialog from "./general/dialogs/SimpleDialog";
import NotificationsComponent from "./notifications/NotificationsComponent";

interface OwnProps
{
}
interface ReduxStateProps
{
    profile:UserProfile
    unreadNotifications:number
}
interface ReduxDispatchProps
{
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteComponentProps<any>
type RenderFunc = () => JSX.Element | JSX.Element[]
type State = {
    popoverOpen:boolean
    renderFunc:RenderFunc
    target:HTMLElement
    key:string
    developerToolVisible:boolean,
    notificationsPanelVisible:boolean
}
class PageTopMenu extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props)
        this.state = {
            popoverOpen:false,
            renderFunc:() => [],
            target:null,
            key:null,
            developerToolVisible:false,
            notificationsPanelVisible:false,
        }
    }
    closePopoverPanel = () => {
        this.hidePopoverPanel()
    }
    hidePopoverPanel = (onComplete?:() => void) => {
        const completion = onComplete ? () => {
            setTimeout(onComplete, 300);
        } : undefined
        this.setState( (prevState) => {
            return {popoverOpen:false, renderFunc:() => [], target:null, key:null}
        },completion)
    }
    renderPopover = () =>
    {
        const open = this.state.popoverOpen
        if(!this.state.target)
            return null
        return <Popover className="top-menu-popover" delay={0} key={this.state.key} trigger="legacy" placement="top" hideArrow={false} isOpen={open} target={this.state.target} toggle={this.closePopoverPanel}>
                    <PopoverBody>
                        {this.state.renderFunc()}
                    </PopoverBody>
                </Popover>
    }
    showMainPanel = (e:React.SyntheticEvent<any>) => {
        this.showPanel(this.renderMainPanel, e.currentTarget, "main")
    }
    showFilesPanel = (e:React.SyntheticEvent<any>) => {
        this.showPanel(this.renderFilesPanel, e.currentTarget, "files")
    }
    showSearchPanel = (e:React.SyntheticEvent<any>) => {
        this.showPanel(this.renderSearchPanel, e.currentTarget, "search")
    }
    showPanel = (renderFunc:RenderFunc ,target:HTMLElement, key:string) => {

        if(this.state.popoverOpen)
        {
            if(renderFunc == this.state.renderFunc)
            {
                this.closePopoverPanel()
                return
            }
            this.hidePopoverPanel(() => {
                this.setState({popoverOpen:true, renderFunc, target, key})
            })
        }
        else {

            this.setState({popoverOpen:true, renderFunc, target, key})
        }
    }
    toggleNotificationPanel = (e?:React.SyntheticEvent<any>) => {
        this.setState((prevState:State) => {
            return {notificationsPanelVisible:!prevState.notificationsPanelVisible}
        })
    }
    toggleDeveloperTool = (e?:React.SyntheticEvent<any>) => {
        if(e)
        {
            e.preventDefault()
            e.stopPropagation()
        }
        this.setState((prevState) => {
                return {developerToolVisible: !prevState.developerToolVisible}
        })
    }
    navigateToChangelog = () => {
        WindowAppManager.navigateToRoute(Routes.CHANGELOG, true)
    }
    renderMainPanel = () => {
        return <div className="menu-panel">
                    {this.renderMainLinks()}
                    {this.renderAdminLinks()}
                </div>
    }
    renderMainLinks = () => {

        const items:OverflowMenuItem[] = []
        if(!Settings.isElectron)
            items.push({id:"changelog", type:OverflowMenuItemType.option, title:translate("Changelog"), onPress:this.navigateToChangelog, toggleMenu:false})
        return (<div className="main-links">
            {items.map(i => createDropdownItem(i))}
         </div>)
    }
    renderAdminLinks = () => {
        if(!isAdmin(this.props.profile))
            return null
        const items:OverflowMenuItem[] = []
        items.push({id:"admin0", type:OverflowMenuItemType.divider})
        items.push({id:"admin1", type:OverflowMenuItemType.header, title:translate("admin.admin")})
        items.push({id:"admin2", type:OverflowMenuItemType.option, title:Routes.DEVELOPER_TOOL.title(), onPress:this.toggleDeveloperTool, toggleMenu:false})
        items.push({id:"admin3", type:OverflowMenuItemType.option, title:Routes.ADMIN_DASHBOARD_BUILDER.title(), toggleMenu:false, onPress:() => {
            this.props.history.push(Routes.ADMIN_DASHBOARD_BUILDER.path)
        }})
        return (<div className="admin-links">
            {items.map(i => createDropdownItem(i))}
         </div>)
    }
    renderNotificationsPanel = () => {
        return <SimpleDialog className="notifications-modal" header={translate("Notifications")} visible={this.state.notificationsPanelVisible} didCancel={this.toggleNotificationPanel}>
                    <NotificationsComponent onClose={this.toggleNotificationPanel} />
                </SimpleDialog>
    }
    renderDeveloperTool = () => {
        if(this.state.developerToolVisible)
        {
            return (<Modal toggle={this.toggleDeveloperTool} id="status-permalink-dialog" zIndex={1070} isOpen={this.state.developerToolVisible} >
                    <ModalHeader>
                        {Routes.DEVELOPER_TOOL.title()}
                        <button type="button" className="close pull-right" onClick={this.toggleDeveloperTool}>
                            <span aria-hidden="true">&times;</span>
                            <span className="sr-only">{translate("common.close")}</span>
                        </button>
                    </ModalHeader>
                    <ModalBody className="vertical-scroll">
                        <DevTool showTitle={false} />
                    </ModalBody>
                    <ModalFooter>
                    </ModalFooter>
                </Modal>)
        }
        return null;
    }
    renderSearchPanel = () => {
        return <div>Search</div>
    }
    renderNotificationPanel = () => {
        return <div>Notifications</div>
    }
    renderFilesPanel = () => {
        return <div>Files</div>
    }
    render() {
        return(
            <div id="page-top-menu">
                <Button onClick={this.showSearchPanel} color="link"><i className="fas fa-search"></i></Button>
                {!this.props.profile.is_anonymous && 
                <>
                    <Button onClick={this.toggleNotificationPanel} color="link" className="badge-notification-container">
                        <i className="fas fa-bell"></i>
                        {this.props.unreadNotifications > 0 && <Badge pill={true} color="danger" className="badge-notification">{this.props.unreadNotifications}</Badge>}
                    </Button>
                    <Button onClick={this.showFilesPanel} color="link"><i className="fas fa-cloud"></i></Button>
                </>}
                <Button onClick={this.showMainPanel} color="link"><i className="fas fa-cog"></i></Button>
                {this.renderPopover()}
                {this.renderDeveloperTool()}
                {this.renderNotificationsPanel()}
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {
  return {
    profile:state.authentication.profile,
    unreadNotifications:state.unreadNotifications.notifications
  }
}
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
  return {
}
}
export default withRouter( connect(mapStateToProps, mapDispatchToProps)(PageTopMenu) )