import * as React from "react";
import { ButtonGroup, Button, FormGroup, Label } from 'reactstrap';
import { translate } from '../../localization/AutoIntlProvider';
import { ActivitySorting } from "../../types/intrasocial_types";


export type ActivityMenuData = {
    sorting:ActivitySorting
}
type Props =
{
    data:ActivityMenuData
    onUpdate:(data:ActivityMenuData) => void
}
type State = {
    data:ActivityMenuData
}
export default class ActivityMenu extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {
            data:{...this.props.data}
        }
    }
    sortingButtonChanged = (sorting:ActivitySorting) => (event) => {
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
            <div className="activity-menu">
                <FormGroup>
                    <Label>{translate("activity.module.menu.sorting.title")}</Label>
                    <div>
                        <ButtonGroup>
                            {ActivitySorting.all.map(s =>
                                    <Button active={this.state.data.sorting === s} key={s} onClick={this.sortingButtonChanged(s)} color="light">
                                        <span>{ActivitySorting.translatedText(s)}</span>
                                    </Button>
                                )}
                        </ButtonGroup>
                    </div>
                </FormGroup>
            </div>
        );
    }
}
