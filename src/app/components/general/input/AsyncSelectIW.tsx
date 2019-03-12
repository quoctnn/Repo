
import AsyncSelect, { AsyncProps } from 'react-select/lib/Async'
import * as React from 'react';
import { Props as SelectProps } from 'react-select/lib/Select';
import { uniqueId } from '../../../utilities/Utilities';
type Props<T> = {

} & SelectProps<T> & AsyncProps<T>
export class AsyncSelectIW extends React.PureComponent<Props<any>, {}>{
    id = uniqueId()
    constructor(props)
    {
        super(props)
    }

    onMenuOpen = () => {
        document.body.classList.add("select-active-" + this.id)
    }
    onMenuClose = () => {
        document.body.classList.remove("select-active-"+ this.id)
    }
    render(){
        return <AsyncSelect {...this.props} 
        onMenuOpen={this.onMenuOpen}
        onMenuClose={this.onMenuClose}
        closeMenuOnScroll={true}
        menuShouldBlockScroll={true}
        menuShouldScrollIntoView={true}
        />
    }
}