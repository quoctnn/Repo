import * as React from "react";
import { ButtonGroup, Button, FormGroup, Label } from 'reactstrap';
import { translate } from '../../localization/AutoIntlProvider';

export enum GroupSorting {
    recent = "recent",
    mostUsed = "most_used",
    AtoZ = "alphabetically",
}
export namespace GroupSorting {
    export function translatedText(type: GroupSorting) {
        switch(type){
            case GroupSorting.recent: return translate("common.sorting.recent")
            case GroupSorting.mostUsed: return translate("common.sorting.mostUsed")
            case GroupSorting.AtoZ: return translate("common.sorting.AtoZ")
            default: return "N/A"
        }
    }
}
export type GroupsMenuData = {
    sorting:GroupSorting
}
type Props =
{
    data:GroupsMenuData
    onUpdate:(data:GroupsMenuData) => void
}
type State = {
    data:GroupsMenuData
}
export default class GroupsMenu extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {
            data:{...this.props.data}
        }
    }
    sortingButtonChanged = (sorting:GroupSorting) => (event) => {
        const data = { ... this.state.data }
        data.sorting = sorting
        this.setState({data}, this.sendUpdate)
    }
    sendUpdate = () => {
        const {data} = this.state
        this.props.onUpdate(data)
    }
    render() {
        const sorting = this.state.data.sorting
        return(
            <div className="groups-menu">
                <FormGroup>
                    <Label>{translate("groups.module.menu.sorting.title")}</Label>
                    <div>
                        <ButtonGroup>
                            <Button active={sorting === GroupSorting.recent} onClick={this.sortingButtonChanged(GroupSorting.recent)} color="light">
                                <span>{GroupSorting.translatedText(GroupSorting.recent)}</span>
                            </Button>
                            <Button active={sorting === GroupSorting.mostUsed} onClick={this.sortingButtonChanged(GroupSorting.mostUsed)} color="light">
                                <span>{GroupSorting.translatedText(GroupSorting.mostUsed)}</span>
                            </Button>
                            <Button active={sorting === GroupSorting.AtoZ} onClick={this.sortingButtonChanged(GroupSorting.AtoZ)} color="light">
                                <span>{GroupSorting.translatedText(GroupSorting.AtoZ)}</span>
                            </Button>
                        </ButtonGroup>
                    </div>
                </FormGroup>
            </div>
        );
    }
}
