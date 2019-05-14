import * as React from "react";
import { translate } from '../../localization/AutoIntlProvider';
import { FormGroup, Label, ButtonGroup, Button } from 'reactstrap';

export enum EventSorting {
    date = "date",
    popular = "popularity",
}
export namespace EventSorting {
    export function translatedText(type: EventSorting) {
        switch(type){
            case EventSorting.date: return translate("common.sorting.date")
            case EventSorting.popular: return translate("common.sorting.popular")
            default: return "N/A"
        }
    }
}
export type EventsMenuData = {
    sorting:EventSorting
    upcoming:boolean
}
type Props =
{
    data:EventsMenuData
    onUpdate:(data:EventsMenuData) => void
}
type State = {
    data:EventsMenuData
}
export default class EventsMenu extends React.Component<Props, State> {

    constructor(props:Props) {
        super(props);
        this.state = {
            data:{...this.props.data}
        }
    }
    sortingButtonChanged = (sorting:EventSorting) => (event) => {
        const data = { ... this.state.data }
        data.sorting = sorting
        this.setState({data}, this.sendUpdate)
    }
    filterButtonChanged = (filter:boolean) => (event) => {
        const data = { ... this.state.data }
        data.upcoming = filter
        this.setState({data}, this.sendUpdate)
    }
    sendUpdate = () => {
        const {data} = this.state
        this.props.onUpdate(data)
    }
    render() {
        const sorting = this.state.data.sorting
        const upcoming = this.state.data.upcoming
        return(
            <div className="events-menu">
                <FormGroup>
                    <Label>{translate("events.module.menu.sorting.title")}</Label>
                    <div>
                        <ButtonGroup>
                            <Button active={sorting === EventSorting.date} onClick={this.sortingButtonChanged(EventSorting.date)} color="light">
                                <span>{EventSorting.translatedText(EventSorting.date)}</span>
                            </Button>
                            <Button active={sorting === EventSorting.popular} onClick={this.sortingButtonChanged(EventSorting.popular)} color="light">
                                <span>{EventSorting.translatedText(EventSorting.popular)}</span>
                            </Button>
                        </ButtonGroup>
                    </div>
                </FormGroup>
                <FormGroup>
                    <Label>{translate("events.module.menu.filter.title")}</Label>
                    <div>
                        <ButtonGroup>
                            <Button active={upcoming} onClick={this.filterButtonChanged(true)} color="light">
                                <span>{translate("events.module.menu.filter.upcoming")}</span>
                            </Button>
                            <Button active={!upcoming} onClick={this.filterButtonChanged(false)} color="light">
                                <span>{translate("events.module.menu.filter.past")}</span>
                            </Button>
                        </ButtonGroup>
                    </div>
                </FormGroup>
            </div>
        );
    }
}
