import * as React from 'react';
import AsyncSelect from 'react-select/async'
import classnames from "classnames"
import { ContextItem, ElasticSearchType, ContextNaturalKey } from '../../../types/intrasocial_types';
import {ApiClient} from '../../../network/ApiClient';
import { SearchArguments } from '../../../network/ApiClient';
require("./ContextFilter.scss");

export type ContextValue = ContextItem & {value:string}
type OptionType = {options:ContextValue[], label:string}

type Props = {
    value:ContextValue
    onValueChange:(value:ContextValue) => void
}
type State = {
    selectedValue:ContextValue
}
export const convertElasticResultItem = (item:any):ContextValue => {
    switch(item.object_type)
    {
        case ElasticSearchType.COMMUNITY:return {id:item.django_id, label:item.name, type:ContextNaturalKey.COMMUNITY, value:ContextNaturalKey.COMMUNITY + "_"+ item.django_id}
        case ElasticSearchType.GROUP:return {id:item.django_id, label:item.name, type:ContextNaturalKey.GROUP, value:ContextNaturalKey.GROUP + "_"+ item.django_id}
        case ElasticSearchType.USER:return {id:item.django_id, label:item.user_name, type:ContextNaturalKey.USER, value:ContextNaturalKey.USER + "_"+ item.django_id}
        case ElasticSearchType.PROJECT:return {id:item.django_id, label:item.name, type:ContextNaturalKey.PROJECT, value:ContextNaturalKey.PROJECT + "_"+ item.django_id}
        case ElasticSearchType.TASK:return {id:item.django_id, label:item.title, type:ContextNaturalKey.TASK, value:ContextNaturalKey.TASK + "_"+ item.django_id}
        case ElasticSearchType.EVENT:return {id:item.django_id, label:item.name, type:ContextNaturalKey.EVENT, value:ContextNaturalKey.EVENT + "_"+ item.django_id}
            default: return null
    }
}
export class ContextFilter extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>, State> {
    static searchTypes = [ElasticSearchType.COMMUNITY, ElasticSearchType.GROUP, ElasticSearchType.USER, ElasticSearchType.PROJECT]
    constructor(props:Props)
    {
        super(props)
        this.state = { selectedValue:props.value}
    }

    groupResultItems = (items:ContextValue[]) => {
        const groups:{[key:string]:OptionType} = {}
        items.forEach(i => {
            let group = groups[i.type]
            if(!group)
            {
                group = {options:[], label:i.type}
                groups[i.type] = group
            }
            group.options.push(i)
        })
        return Object.keys(groups).map(k => groups[k])
    }
    searchOptions = (text:string) => {
        return new Promise((resolve) => {
            const args:SearchArguments = {
                term:"*" + text + "*",
                types:ContextFilter.searchTypes,
                include_results:true,
                slim_types:true,
                offset:0,
                limit:10
            }
            return ApiClient.search(args, (data,status,error) => {
                const d = data && data.results || []
                resolve(this.groupResultItems( d.map(r => convertElasticResultItem(r)).filter(r => r != null)) )
            })
        });
    }
    onChange = (value:ContextValue) => {
        this.setState({ selectedValue: value }, () => this.props.onValueChange(this.state.selectedValue));
    }
    render()
    {
        const {className} = this.props
        const { selectedValue} = this.state;
        const cn = classnames("context-filter", className)
        return(<div className={cn}>
                <AsyncSelect
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    isClearable={true}
                    value={selectedValue}
                    menuPortalTarget={document.body}
                    cacheOptions={true}
                    defaultOptions={true}
                    onChange={this.onChange}
                    loadOptions={this.searchOptions} />
                </div>
        );
    }
}