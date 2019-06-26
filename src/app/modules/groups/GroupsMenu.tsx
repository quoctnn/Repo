import * as React from "react";
import { ButtonGroup, Button, FormGroup, Label } from 'reactstrap';
import { translate } from '../../localization/AutoIntlProvider';
import { GroupSorting } from "../../types/intrasocial_types";


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
        return(
            <div className="groups-menu">
                <FormGroup>
                    <Label>{translate("groups.module.menu.sorting.title")}</Label>
                    <div>
                        <ButtonGroup>
                            {GroupSorting.all.map(s =>
                                    <Button active={this.state.data.sorting === s} key={s} onClick={this.sortingButtonChanged(s)} color="light">
                                        <span>{GroupSorting.translatedText(s)}</span>
                                    </Button>
                                )}
                        </ButtonGroup>
                    </div>
                </FormGroup>
            </div>
        );
    }
}
