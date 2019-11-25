import * as React from "react";
import classnames from 'classnames';
import { MenuItem } from '../../../../types/menuItem';
import { translate } from '../../../../localization/AutoIntlProvider';
import "../SideBarItem.scss";
import SideBarEventContent from "./SideBarEventContent";
import { uniqueId } from '../../../../utilities/Utilities';
import { ContextDataProps, withContextData } from '../../../../hoc/WithContextData';
import EventCreateComponent from "../../../general/contextCreation/EventCreateComponent";
import { Event, ObjectHiddenReason } from "../../../../types/intrasocial_types";

type State = {
    menuItem: MenuItem
    createEventFormVisible: boolean
    createEventFormReloadKey: string
}

type OwnProps = {
    index:string
    active:string
    addMenuItem:(item:MenuItem) => void
    onClick:(e:React.MouseEvent) => void
}

type Props = OwnProps & ContextDataProps

class SideBarEventItem extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            menuItem: undefined,
            createEventFormVisible: false,
            createEventFormReloadKey: undefined
        }
    }

    componentDidMount = () => {
        if (this.props.index) {
            const menuItem:MenuItem = {
                index: this.props.index,
                title: translate("common.event.events"),
                subtitle: undefined,
                content: <SideBarEventContent onCreate={this.createNew}/>,
            }
            this.setState({menuItem: menuItem})
        }
    }

    componentDidUpdate = (prevProps: Props, prevState: State) => {
        this.props.addMenuItem(this.state.menuItem)
    }

    shouldComponentUpdate = (nextProps: Props, nextState:State) => {
        const changedFocus = (this.props.active == this.props.index || nextProps.active == this.props.index) && this.props.active != nextProps.active
        const createEventForm = this.state.createEventFormVisible != nextState.createEventFormVisible || this.state.createEventFormReloadKey != nextState.createEventFormReloadKey
        return changedFocus || createEventForm
    }

    createNew = (e?: React.MouseEvent) => {
        this.setState({createEventFormVisible:true, createEventFormReloadKey:uniqueId()})
    }

    renderAddEventForm = () => {
        const visible = this.state.createEventFormVisible
        const {community} = this.props.contextData
        if (community) {
            return <EventCreateComponent onCancel={this.hideEventCreateForm} community={community.id} key={this.state.createEventFormReloadKey} visible={visible} onComplete={this.handleEventCreateForm} />
        } else {
            return null
        }
    }

    hideEventCreateForm = () => {
        this.setState((prevState:State) => {
            return {createEventFormVisible:false}
        })
    }

    handleEventCreateForm = (event:Event) => {
        if(!!event)
        {
            if(event.hidden_reason && event.hidden_reason == ObjectHiddenReason.review)
            {
                this.hideEventCreateForm()
                alert("Event has been sent for review, and will be available when accepted")
            }
            else if(event.uri)
            {
                this.hideEventCreateForm()
                window.app.navigateToRoute(event.uri)
            }
        }
    }

    render = () => {
        const active = this.props.active == this.props.index
        const css = classnames("sidebar-item", {active: active})
        const iconCss = classnames("fa-circle", active ? "fa" : "far")
        return (
            <div id={this.props.index} className={css} onClick={this.props.onClick}>
                <i className={iconCss}></i>
                {this.state.menuItem &&
                    this.state.menuItem.title
                    ||
                    translate("common.event.events")
                }
            {this.renderAddEventForm()}
            </div>
        )
    }
}

export default withContextData(SideBarEventItem)