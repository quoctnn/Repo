import * as React from 'react';
import classnames from "classnames"
import { AsyncSelectIW } from '../../components/general/input/AsyncSelectIW';
import { ContextValue } from '../../components/general/input/ContextFilter';
import { ElasticSearchType } from '../../types/intrasocial_types';

type Props = {
    type:ElasticSearchType
    value:ContextValue
    project:number
    onValueChange:(value:ContextValue) => void
}
type State = {
}
export class TagsFilter extends React.PureComponent<Props & React.HTMLAttributes<HTMLDivElement>, State> {
    constructor(props:Props)
    {
        super(props)
    }
    onChange = (value:ContextValue) => {
        this.props.onValueChange(value)
    }
    getTags = (text:string, completion:(options:ContextValue[]) => void) => {
        
    }
    searchOptions = (text:string) => {
        return new Promise((resolve) => {
            return this.getTags(text, (tags) => {
                resolve(tags)
            })
        })
    }
    render() 
    {
        const {className} = this.props
        const { value} = this.props;
        const cn = classnames("context-filter", className)
        return(<div className={cn}>
                <AsyncSelectIW key={"project_" + this.props.project}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    isClearable={true}
                    value={value}
                    menuPortalTarget={document.body} 
                    cacheOptions={false} 
                    defaultOptions={true} 
                    onChange={this.onChange}
                    loadOptions={this.searchOptions} />
                </div>
        );
    }
}