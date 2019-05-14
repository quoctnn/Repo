import * as React from "react";
import { translate } from '../../localization/AutoIntlProvider';
import { FormGroup, Label, ButtonGroup, Button } from 'reactstrap';


export enum ProjectSorting {
    recentActivity = "recent_activity",
    recent = "recent",
    mostUsed = "most_used",
    AtoZ = "alphabetically",
}
export namespace ProjectSorting {
    export const all = [
        ProjectSorting.recentActivity,
        ProjectSorting.recent,
        ProjectSorting.mostUsed,
        ProjectSorting.AtoZ,
    ]
    export function translatedText(type: ProjectSorting) {
        switch(type){
            case ProjectSorting.recentActivity: return translate("common.sorting.recentActivity")
            case ProjectSorting.recent: return translate("common.sorting.recent")
            case ProjectSorting.mostUsed: return translate("common.sorting.mostUsed")
            case ProjectSorting.AtoZ: return translate("common.sorting.AtoZ")
            default: return "N/A"
        }
    }
}
export enum ProjectFilter {
    responsible = "responsible",
    assigned = "assigned"
}
export namespace ProjectFilter {
    export const all = [
        ProjectFilter.responsible,
        ProjectFilter.assigned
    ]
}
export type ProjectsMenuData = {
    sorting:ProjectSorting
    responsible:boolean
    assigned:boolean
}
type Props =
{
    data:ProjectsMenuData
    onUpdate:(data:ProjectsMenuData) => void
}
type State = {
    data:ProjectsMenuData
}
export default class ProjectsMenu extends React.Component<Props, State> {

    constructor(props:Props) {
        super(props);
        this.state = {
            data:{...this.props.data}
        }
    }
    sortingButtonChanged = (sorting:ProjectSorting) => (event) => {
        const data = { ... this.state.data }
        data.sorting = sorting
        this.setState({data}, this.sendUpdate)
    }
    filterButtonChanged = (filter:string, value:boolean) => (event) => {
        const data = { ... this.state.data }
        data[filter] = value
        this.setState({data}, this.sendUpdate)
    }
    sendUpdate = () => {
        const {data} = this.state
        this.props.onUpdate(data)
    }
    render() {
        return(
            <div className="projects-menu">
                <FormGroup>
                    <Label>{translate("projects.module.menu.sorting.title")}</Label>
                    <div>
                        <ButtonGroup>
                            {ProjectSorting.all.map(s =>
                                <Button active={this.state.data.sorting === s} key={s} onClick={this.sortingButtonChanged(s)} color="light">
                                    <span>{ProjectSorting.translatedText(s)}</span>
                                </Button>
                            )}
                        </ButtonGroup>
                    </div>
                </FormGroup>
                <FormGroup>
                    <Label>{translate("projects.module.menu.filter.title")}</Label>
                    <div>
                        <ButtonGroup>
                            {ProjectFilter.all.map(f =>
                                <Button active={this.state.data[f]} key={f} onClick={this.filterButtonChanged(f, !this.state.data[f])} color="light">
                                    <span>{translate("projects.module.menu.filter." + f)}</span>
                                </Button>
                            )}
                        </ButtonGroup>
                    </div>
                </FormGroup>
            </div>
        );
    }
}
