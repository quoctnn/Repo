import * as React from "react";
import classnames from 'classnames';
import { MenuItem } from '../../../../types/menuItem';
import { translate } from '../../../../localization/AutoIntlProvider';
import "../SideBarItem.scss";
import SideBarGroupContent from "./SideBarGroupContent";
import { ContextDataProps, withContextData } from '../../../../hoc/WithContextData';
import { uniqueId } from "../../../../utilities/Utilities";
import GroupCreateComponent from "../../../general/contextCreation/GroupCreateComponent";
import { Group, ObjectHiddenReason } from "../../../../types/intrasocial_types";

type State = {
    menuItem: MenuItem
    createGroupFormVisible: boolean
    createGroupFormReloadKey: string
}

type OwnProps = {
    index:string
    active:string
    addMenuItem:(item:MenuItem) => void // This should be a menuItem
    onClick:(e:React.MouseEvent) => void
    onClose:(e:React.MouseEvent) => void
}

type Props = OwnProps & ContextDataProps

class SideBarGroupItem extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            menuItem: undefined,
            createGroupFormVisible: false,
            createGroupFormReloadKey: "",
        }
    }

    componentDidMount = () => {
        if (this.props.index) {
            const menuItem:MenuItem = {
                index: this.props.index,
                title: translate("common.group.groups"),
                subtitle: undefined,
                content: <SideBarGroupContent onClose={this.props.onClose} onCreate={this.createNew}/>,
            }
            this.setState({menuItem: menuItem})
        }
    }

    componentDidUpdate = (prevProps: Props, prevState: State) => {
        this.props.addMenuItem(this.state.menuItem)
    }

    shouldComponentUpdate = (nextProps: Props, nextState:State) => {
        const changedFocus = (this.props.active == this.props.index || nextProps.active == this.props.index) && this.props.active != nextProps.active
        const createGroupForm = this.state.createGroupFormVisible != nextState.createGroupFormVisible || this.state.createGroupFormReloadKey != nextState.createGroupFormReloadKey
        return changedFocus || createGroupForm
    }

    createNew = (e?: React.MouseEvent) => {
        this.setState({createGroupFormVisible:true, createGroupFormReloadKey:uniqueId()})
    }

    renderAddGroupForm = () => {
        const visible = this.state.createGroupFormVisible
        const {community} = this.props.contextData
        if (community) {
            return <GroupCreateComponent onCancel={this.hideGroupCreateForm} community={community.id} key={this.state.createGroupFormReloadKey} visible={visible} onComplete={this.handleGroupCreateForm} />
        } else {
            return null
        }
    }

    hideGroupCreateForm = () => {
        this.setState((prevState:State) => {
            return {createGroupFormVisible:false}
        })
    }

    handleGroupCreateForm = (group:Group) => {
        if(!!group)
        {
            if(group.hidden_reason && group.hidden_reason == ObjectHiddenReason.review)
            {
                this.hideGroupCreateForm();
                alert("Group has been sent for review, and will be available when accepted");
            }
            else if(group.uri)
            {
                this.hideGroupCreateForm();
                window.app.navigateToRoute(group.uri);
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
                    translate("common.group.groups")
                }
            {this.renderAddGroupForm()}
            </div>
        )
    }
}

export default withContextData(SideBarGroupItem)