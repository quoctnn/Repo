import * as React from 'react';
import AsyncSelect from 'react-select/lib/Async'
import classnames from "classnames"
import ApiClient from '../../network/ApiClient';
import { ElasticSearchType, ContextNaturalKey } from '../../types/intrasocial_types';
import { ContextValue } from '../../components/general/input/ContextFilter';


type OptionType = {options:ContextValue[], label:string}
type Props = {
    value:ContextValue
    onValueChange:(value:ContextValue) => void
}
type State = {
    selectedValue:ContextValue
}
export class ProjectFilter extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>, State> {
    static searchTypes = [ElasticSearchType.PROJECT]
    constructor(props:Props)
    {
        super(props)
        this.state = { selectedValue:props.value}
    }
    convertResultItem = (item:any):ContextValue => {
        switch(item.object_type)
        {
            case ElasticSearchType.PROJECT:return {id:item.django_id, label:item.name, type:ContextNaturalKey.PROJECT, value:ContextNaturalKey.PROJECT + "_"+ item.django_id}
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
            return ApiClient.search("*" + text + "*", ProjectFilter.searchTypes,false , true, false, true, 10, 0, (data,status,error) => {
                const d = data && data.results || []
                resolve(this.groupResultItems( d.map(r => this.convertResultItem(r)).filter(r => r != null)) )
            })
        });
    }
    searchOptions2 = (text:string) => {
        return new Promise((resolve) => {
            return ApiClient.getProjects(null,20,0, (data, status, error) => {
                const options:ContextValue[] = data.results.map(p => {return {value:ContextNaturalKey.PROJECT + "_" + p.id, label:p.name, id:p.id, type:ContextNaturalKey.PROJECT}})
                resolve([{options:options, label:ContextNaturalKey.PROJECT}])
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
                    loadOptions={this.searchOptions2} />
                </div>
        );
    }
}