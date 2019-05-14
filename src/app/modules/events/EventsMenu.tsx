import * as React from "react";
import { translate } from '../../localization/AutoIntlProvider';
import { FormGroup, Label, ButtonGroup, Button } from 'reactstrap';

export enum EventSorting {
    date = "date",
    popular = "popularity",
}
export namespace EventSorting {
    export const all = [
        EventSorting.date,
        EventSorting.popular
    ]
    export function translatedText(type: EventSorting) {
        switch(type){
            case EventSorting.date: return translate("common.sorting.date")
            case EventSorting.popular: return translate("common.sorting.popular")
            default: return "N/A"
        }
    }
    export function icon(type: EventSorting) {
        switch(type){
            case EventSorting.date: return <i className="fa fa-calendar"></i>
            case EventSorting.popular: return  <i className="fa fa-burn"></i>
            default: return <i className="fa fa-question"></i>
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
        const upcoming = this.state.data.upcoming
        return(
            <div className="events-menu">
                <FormGroup>
                    <Label>{translate("events.module.menu.sorting.title")}</Label>
                    <div>
                        <ButtonGroup>
                            {EventSorting.all.map(s =>
                                <Button active={this.state.data.sorting === s} key={s} onClick={this.sortingButtonChanged(s)} color="light">
                                    <span>{EventSorting.translatedText(s)}</span>
                                </Button>
                            )}
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
