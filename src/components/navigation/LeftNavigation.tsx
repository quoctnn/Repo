import * as React from "react";
import { connect } from 'react-redux'
import { RootState } from "../../reducers";
import { Community } from "../../types/intrasocial_types";
import NotificationsList from "../general/NotificationsList";
import ContactList from "../general/ContactList";
import classnames from 'classnames';
import CommunityList from "../general/CommunityList";
import Conversations from "../../views/chat/Conversations";
import { NavigationUtilities } from "../../utilities/NavigationUtilities";
import { withRouter } from "react-router-dom";
import { History } from "history";
import { Settings } from "../../utilities/Settings";
import { translate } from "../intl/AutoIntlProvider";
import { ApiEndpoint } from "../../reducers/debug";
require("./LeftNavigation.scss");

interface OwnProps {
    communities:Community[]
}
interface RouteProps
{
    history:any
    location: any
    match:any
}
interface ReduxStateProps {
    apiEndpoint?:number
    availableApiEndpoints?:Array<ApiEndpoint>
}
interface State {
    open:boolean
    selectedIndex:number 
    menuData:MenuItem[]
}
type MenuItem = {
    title?:string
    icon?:string
    component?:JSX.Element
    key:string
    className?:string
    onClick?:(history:History) => void
}
const getMenuData = () => {
    const menuData:MenuItem[] = []
    menuData.push({title:translate("Notifications"), key:"notificationlist", icon:"fas fa-bell", component:<NotificationsList />})
    menuData.push({title:"", key:"contactlist", icon:"fas fa-user", component:<ContactList />})
    menuData.push({title:"", key:"communitylist", icon:"community-icon", component:<CommunityList />})
    menuData.push({title:"", key:"conversationlist", icon:"fas fa-comment", component:<Conversations />})
    menuData.push({key:"spacer", className:"flex-grow-1 flex-shrink-1"})
    if(!Settings.isProduction)
    {
        menuData.push({title:"", key:"devtool", icon:"fas fa-cog", onClick:(history) => {
            NavigationUtilities.navigateToDevTool(history)
        }})
    }
    return menuData
}
type Props = RouteProps & OwnProps & ReduxStateProps
class LeftNavigation extends React.Component<Props, State> {
    static leftMenuOpen = "left-menu-open"
    static defaultProps:OwnProps = {
        communities:[],
	};
    constructor(props) {
        super(props);
        this.state = { open: false,selectedIndex:-1, menuData:getMenuData()  }
    }
    componentWillUnmount()
    {
        document.body.classList.remove(LeftNavigation.leftMenuOpen)
    }
    updateBody = () => 
    {
        let open = this.state.open
        if(open)
        {
            if(!document.body.classList.contains(LeftNavigation.leftMenuOpen))
                document.body.classList.add(LeftNavigation.leftMenuOpen)
        }
        else
        {
            if(document.body.classList.contains(LeftNavigation.leftMenuOpen))
                document.body.classList.remove(LeftNavigation.leftMenuOpen)
        }
    }
    toggleMenu = () => {
        this.setState(prevState => ({
            open: !prevState.open
          }), this.updateBody)
    }
    menuItemPressed = (index:number) => {

        const {open, selectedIndex} = this.state
        const item = this.state.menuData[index]
        if(item.onClick)
        {
            item.onClick(this.props.history)
            return
        }
        if(index == selectedIndex)
        {
            this.toggleMenu()
            return
        }
        this.setState({open: true, selectedIndex: index }, this.updateBody);
    }
    renderData = () =>
    {
        const title = this.getTitle()
        return (<>
            <ul className="left">{
                this.state.menuData.map( (menuItem, index) => {
                    const cn = classnames({selected : this.state.selectedIndex == index}, menuItem.className)
                    return (<li className={cn} key={index} onClick={() => {this.menuItemPressed(index)}}>
                                {menuItem.icon && <i className={menuItem.icon}></i>}
                            </li>)
                })
            }</ul>
            {<div className="right">

                <div className="menu-header text-truncate">{title}</div>
                {this.state.menuData.map( (menuItem, index) => {
                        return (<div className="menu-component" key={menuItem.key} style={{display: index == this.state.selectedIndex ? "block" : "none"}}>
                                    <div className="menu-content">{menuItem.component}</div>
                                </div>)
                    })
                }
            </div>}
        </>)
    }
    getTitle = () => {
        var endpoint = "";
        if (this.props.availableApiEndpoints && this.props.apiEndpoint != null) {
            endpoint = this.props.availableApiEndpoints[this.props.apiEndpoint].endpoint
            endpoint = endpoint.replace(/(^\w+:|)\/\//, '');
            endpoint = endpoint.replace(/(:\d+$)/, '');
        }
        return endpoint
    }
    render = () => 
    {
        return(
            <div id="left-navigation" className="flex transition">
                {this.renderData()}
            </div>
        );
    }
}
const mapStateToProps = (state:RootState) => {
    return {
        communities:state.communityStore.communities,
        apiEndpoint: state.debug.apiEndpoint,
        availableApiEndpoints: state.debug.availableApiEndpoints,
    };
}
export default withRouter(connect(mapStateToProps, null)(LeftNavigation));