import * as React from "react";
import { connect } from 'react-redux'
import { RootState } from "../../reducers";
import { Community } from "../../types/intrasocial_types";
import NotificationsList from "../general/NotificationsList";
import ContactList from "../general/ContactList";
import classnames from 'classnames';
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
}
const menuData:MenuItem[] = []
menuData.push({icon:"fas fa-bell", component:<NotificationsList />})
menuData.push({icon:"fas fa-user", component:<ContactList />})
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
        const component = this.state.selectedIndex >= 0 && this.state.selectedIndex - menuData.length ? menuData[this.state.selectedIndex].component : undefined
        return (<>
            <ul className="left">{
                menuData.map( (menuItem, index) => {
                    const cn = classnames({selected : this.state.selectedIndex == index})
                    return (<li className={cn} key={index} onClick={() => {this.menuItemPressed(index)}}>
                                <i className={menuItem.icon}></i>
                            </li>)
                })
            }</ul>
            {component && <div className="right">{component}</div>}
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