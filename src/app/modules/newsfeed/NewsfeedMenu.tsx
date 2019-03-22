import * as React from "react";
import { ContextFilter, ContextValue } from "../../components/general/input/ContextFilter";
import { translate } from "../../localization/AutoIntlProvider";
import { Label, Input, FormGroup, Button, ButtonGroup } from 'reactstrap';
import { ObjectAttributeType, ElasticSearchType } from "../../types/intrasocial_types";
import { SearchData, SearcQueryManager } from "../../components/general/input/contextsearch/extensions";
import { ContextSearch } from "../../components/general/input/contextsearch/ContextSearch";
import { AutocompleteSection } from "../../components/general/input/contextsearch/Autocomplete";
import ApiClient from "../../network/ApiClient";

type Props = 
{
    selectedContext:ContextValue
    includeSubContext:boolean
    filter:ObjectAttributeType
    onUpdate:(data:NewsfeedMenuData) => void
    availableFilters:ObjectAttributeType[]
}
type State = {
    selectedContext:ContextValue
    includeSubContext:boolean
    filter:ObjectAttributeType
    selectedSearchContext:SearchData
    sections:AutocompleteSection[]
}
export type NewsfeedMenuData = {
    selectedContext:ContextValue
    includeSubContext:boolean
    filter:ObjectAttributeType
}
export default class NewsfeedMenu extends React.Component<Props, State> {
    static searchTypes = [ElasticSearchType.TASK,ElasticSearchType.USER, ElasticSearchType.PROJECT, ElasticSearchType.GROUP, ElasticSearchType.EVENT, ElasticSearchType.COMMUNITY]
    constructor(props:Props) {
        super(props);
        this.state = {
            selectedContext: this.props.selectedContext,
            includeSubContext:this.props.includeSubContext,
            filter:this.props.filter,
            selectedSearchContext:SearcQueryManager.parse(""),
            sections:[]
        }
    }
    onContextChange = (context:ContextValue) => {
        this.setState({selectedContext:context}, this.sendUpdate)
    }
    includeSubContextChanged = (event:any) => {
        this.setState({includeSubContext:event.target.checked}, this.sendUpdate)
    }
    sendUpdate = () => {
        this.props.onUpdate({selectedContext:this.state.selectedContext, includeSubContext:this.state.includeSubContext, filter:this.state.filter})
    }
    filterButtonChanged = (filter:ObjectAttributeType) => (event) => {

        const currentFilter = this.state.filter
        const newFilter = filter == currentFilter ? null : filter
        this.setState({filter:newFilter}, this.sendUpdate)
    }
    onSearchDataChanged = (data:SearchData, focusOffset:number, activeSearchType:ElasticSearchType) => {
        console.log("data",data)
        const types = !!activeSearchType ? [activeSearchType] : NewsfeedMenu.searchTypes
        ApiClient.search(10, 0, data.query, types, false, true, false, true, data.filters, data.tags,(searchResult, status, error) => {
            console.log("got res", searchResult)
        })
    }
    render() {
        const filter = this.state.filter
        return(
            <div className="newsfeed-menu">
                <ButtonGroup>
                    {this.props.availableFilters.map(f => {
                        return (<Button key={f} active={filter == f} onClick={this.filterButtonChanged(f)} color="light">
                                    <i className={ObjectAttributeType.iconForType(f)}></i>
                                </Button>)
                    })}
                </ButtonGroup>
                <FormGroup>
                    <Label>{translate("FeedContext")}</Label>
                    <ContextSearch onSearchDataChanged={this.onSearchDataChanged} placeholder="Search..." sections={this.state.sections}/>
                </FormGroup>
                <FormGroup>
                    <Label>{translate("FeedContext")}</Label>
                    <ContextFilter onValueChange={this.onContextChange} value={this.state.selectedContext} />
                </FormGroup>
                <FormGroup check={true}>
                    <Label check={true}>
                        <Input type="checkbox" onChange={this.includeSubContextChanged} checked={this.state.includeSubContext} />{" " + translate("IncludeSubContext")}
                    </Label>
                </FormGroup>
            </div>
        );
    }
}
