import * as React from 'react';
import AsyncSelect from 'react-select/lib/Async'
import classnames from "classnames"
import { ContextItem, ElasticSearchType, ContextNaturalKey } from '../../../types/intrasocial_types';
import ApiClient from '../../../network/ApiClient';
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
export class ContextFilter extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>, State> {
    static searchTypes = [ElasticSearchType.COMMUNITY, ElasticSearchType.GROUP, ElasticSearchType.USER]
    constructor(props:Props)
    {
        super(props)
        this.state = { selectedValue:props.value}
    }
    convertResultItem = (item:any):ContextValue => {
        switch(item.object_type)
        {
            case ElasticSearchType.COMMUNITY:return {id:item.django_id, label:item.name, type:ContextNaturalKey.COMMUNITY, value:ContextNaturalKey.COMMUNITY + "_"+ item.django_id}
            case ElasticSearchType.GROUP:return {id:item.django_id, label:item.name, type:ContextNaturalKey.GROUP, value:ContextNaturalKey.GROUP + "_"+ item.django_id}
            case ElasticSearchType.USER:return {id:item.django_id, label:item.user_name, type:ContextNaturalKey.USER, value:ContextNaturalKey.USER + "_"+ item.django_id}
            default: return null
        }
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
            return ApiClient.search("*" + text + "*", ContextFilter.searchTypes,false , true, false, true, 10, 0, (data,status,error) => {
                const d = data && data.results || []
                resolve(this.groupResultItems( d.map(r => this.convertResultItem(r)).filter(r => r != null)) )
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