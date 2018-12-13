import * as React from "react";
import { connect } from 'react-redux'
import { RootState } from "../../reducers";
import { Community } from "../../types/intrasocial_types";
import NotificationsList from "../general/NotificationsList";
import ContactList from "../general/ContactList";
import classnames from 'classnames';
import CommunityList from "../general/CommunityList";
require("./LeftNavigation.scss");

export interface Props {
    communities:Community[]
}
export interface State {
    open:boolean
    selectedIndex:number 
}
type MenuItem = {
    icon:string
    component:JSX.Element
    key:string
}
const menuData:MenuItem[] = []
menuData.push({key:"notificationlist", icon:"fas fa-bell", component:<NotificationsList />})
menuData.push({key:"contactlist", icon:"fas fa-user", component:<ContactList />})
menuData.push({key:"communitylist", icon:"community-icon", component:<CommunityList />})
class LeftNavigation extends React.Component<Props, State> {
    static leftMenuOpen = "left-menu-open"
    static defaultProps:Props = {
        communities:[],
	};
    constructor(props) {
        super(props);
        this.state = { open: false,selectedIndex:-1  }
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
        if(index == selectedIndex)
        {
            this.toggleMenu()
            return
        }
        this.setState({open: true, selectedIndex: index }, this.updateBody);
    }
    renderData = () =>
    {
        return (<>
            <ul className="left">{
                menuData.map( (menuItem, index) => {
                    const cn = classnames({selected : this.state.selectedIndex == index})
                    return (<li className={cn} key={index} onClick={() => {this.menuItemPressed(index)}}>
                                <i className={menuItem.icon}></i>
                            </li>)
                })
            }</ul>
            {<div className="right">{
                menuData.map( (menuItem, index) => {
                    return (<div className="menu-component" key={menuItem.key} style={{display: index == this.state.selectedIndex ? "block" : "none"}}>{menuItem.component}</div>)
                })
            }</div>}
        </>)
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
    };
}
export default connect(mapStateToProps, null)(LeftNavigation);