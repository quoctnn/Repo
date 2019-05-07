import * as React from "react";
import "./PageTopMenu.scss"
import { ReduxState } from "../redux";
import { connect } from "react-redux";
import { Button, Popover, PopoverBody, ModalHeader, Modal, ModalBody, ModalFooter, DropdownItem } from "reactstrap";
import { Link, withRouter, RouteComponentProps } from "react-router-dom";
import Routes from "../utilities/Routes";
import { UserProfile } from "../types/intrasocial_types";
import { isAdmin } from "../utilities/Utilities";
import { translate } from "../localization/AutoIntlProvider";
import DevTool from "./dev/DevTool";
import { OverflowMenuItem, OverflowMenuItemType, createDropdownItem } from "./general/OverflowMenu";

interface OwnProps
{
}
interface ReduxStateProps
{
    profile:UserProfile
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
    developerToolVisible:boolean
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
    showNotificationPanel = (e:React.SyntheticEvent<any>) => {
        this.showPanel(this.renderNotificationPanel, e.currentTarget, "notification")
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
    renderMainPanel = () => {
        return <div className="menu-panel">
                    <div>Content needed</div>
                    {this.renderAdminLinks()}
                </div>
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
                <Button onClick={this.showNotificationPanel} color="link"><i className="fas fa-bell"></i></Button>
                <Button onClick={this.showFilesPanel} color="link"><i className="fas fa-cloud"></i></Button>
                <Button onClick={this.showMainPanel} color="link"><i className="fas fa-cog"></i></Button>
                {this.renderPopover()}
                {this.renderDeveloperTool()}
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {
  return {
    profile:state.authentication.profile
  }
}
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
  return {
}
}
export default withRouter( connect(mapStateToProps, mapDispatchToProps)(PageTopMenu) )