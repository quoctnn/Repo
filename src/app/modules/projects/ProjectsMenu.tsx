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
    responsibleButtonChanged = (filter:boolean) => (event) => {
        const data = { ... this.state.data }
        data.responsible = filter
        this.setState({data}, this.sendUpdate)
    }
    assignedButtonChanged = (filter:boolean) => (event) => {
        const data = { ... this.state.data }
        data.assigned = filter
        this.setState({data}, this.sendUpdate)
    }
    sendUpdate = () => {
        const {data} = this.state
        this.props.onUpdate(data)
    }
    render() {
        const sorting = this.state.data.sorting
        const responsible = this.state.data.responsible
        const assigned = this.state.data.assigned
        return(
            <div className="projects-menu">
                <FormGroup>
                    <Label>{translate("projects.module.menu.sorting.title")}</Label>
                    <div>
                        <ButtonGroup>
                            <Button active={sorting === ProjectSorting.recentActivity} onClick={this.sortingButtonChanged(ProjectSorting.recentActivity)} color="light">
                                <span>{ProjectSorting.translatedText(ProjectSorting.recentActivity)}</span>
                            </Button>
                            <Button active={sorting === ProjectSorting.recent} onClick={this.sortingButtonChanged(ProjectSorting.recent)} color="light">
                                <span>{ProjectSorting.translatedText(ProjectSorting.recent)}</span>
                            </Button>
                            <Button active={sorting === ProjectSorting.mostUsed} onClick={this.sortingButtonChanged(ProjectSorting.mostUsed)} color="light">
                                <span>{ProjectSorting.translatedText(ProjectSorting.mostUsed)}</span>
                            </Button>
                            <Button active={sorting === ProjectSorting.AtoZ} onClick={this.sortingButtonChanged(ProjectSorting.AtoZ)} color="light">
                                <span>{ProjectSorting.translatedText(ProjectSorting.AtoZ)}</span>
                            </Button>
                        </ButtonGroup>
                    </div>
                </FormGroup>
                <FormGroup>
                    <Label>{translate("projects.module.menu.filter.title")}</Label>
                    <div>
                        <ButtonGroup>
                            <Button active={responsible} onClick={this.responsibleButtonChanged(!responsible)} color="light">
                                <span>{translate("projects.module.menu.filter.responsible")}</span>
                            </Button>
                            <Button active={assigned} onClick={this.assignedButtonChanged(!assigned)} color="light">
                                <span>{translate("projects.module.menu.filter.assigned")}</span>
                            </Button>
                        </ButtonGroup>
                    </div>
                </FormGroup>
            </div>
        );
    }
}
