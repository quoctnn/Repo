
import * as React from 'react';
import classnames from "classnames";
import "./ContextSearch.scss"
import { SearchBox } from './SearchBox';
import { SearcQueryManager, SearchData, searchEntities, searchOptions } from './extensions';
import Autocomplete, { AutocompleteSection } from './Autocomplete';
import { Popover, PopoverBody } from 'reactstrap';
import { uniqueId } from '../../../../utilities/Utilities';
import { ElasticSearchType } from '../../../../types/intrasocial_types';

type Props = {
    placeholder?:string
    term?:string
    className?:string
    onSearchDataChanged?:(data:SearchData, focusOffset:number, activeSearchType:ElasticSearchType) => void
    onSubmitSearch?:() => void
    sections:AutocompleteSection[]
} 
type State = {
    searchData:SearchData
    active:boolean
    activeSearchType:ElasticSearchType
}
export class ContextSearch extends React.Component<Props, State>{
    textInput = React.createRef<SearchBox>()
    autocomplete = React.createRef<Autocomplete>()
    componentId = "contextsearch_" + uniqueId()
    containerId = "contextsearch_container_" + uniqueId()
    preventClose = false
    constructor(props:Props)
    {
        super(props)
        this.state = {
            searchData:SearcQueryManager.parse(props.term || ""),
            active:false,
            activeSearchType:null,
        }
    }
    termChanged = (term:string, selectionOffset:number) => {
        const searchData = SearcQueryManager.parse(term)
        if(searchData.tokens.length > 0)
        {
            const activeSearchType = this.getActiveSearchType(searchData, selectionOffset)
            this.setState({ activeSearchType , searchData}, this.sendSearchDataChanged)
        }
        else 
        {
            this.resetSearch()
        }
    }
    resetSearch = () => {
        const searchData = SearcQueryManager.parse("")
        this.setState({activeSearchType:null, searchData:searchData}, this.sendSearchDataChanged)
    }
    sendSearchDataChanged = () => {
        this.props.onSearchDataChanged && this.props.onSearchDataChanged(this.state.searchData, this.getSearchFieldFocusOffset(), this.state.activeSearchType)
    }
    getSearchFieldFocusOffset = () => {
        return (this.textInput.current &&  this.textInput.current.getFocusOffset()) || 0
    }
    getActiveSearchType = (searchData:SearchData, selectionOffset):ElasticSearchType => {
        let activeSearchTypeIndex = searchData.tokens.findIndex(t => t.start <= selectionOffset && t.end >= selectionOffset)
        if(activeSearchTypeIndex == -1)
        {
            const closestTokenLeft = [...searchData.tokens].reverse().find(t => t.end <= selectionOffset)
            if(closestTokenLeft)
            {
                activeSearchTypeIndex = searchData.tokens.indexOf(closestTokenLeft)
            }
        }
        if(activeSearchTypeIndex > -1)
        {
            let token = searchData.tokens[activeSearchTypeIndex]
            if((!token.type && token.accepted) || token.type == searchEntities.ID_OBJECT.type)//connected token
            {
                if(activeSearchTypeIndex > 0)
                    token = searchData.tokens[activeSearchTypeIndex - 1] 
            }
            if(token.type == searchEntities.FILTER.type)
            {
                const filter = token.token.replace(":","")
                const so = searchOptions.find(so => so.name == filter)
                if(so)
                {
                    return so.value
                }
            }
        }
        return null
    }
    onSearchControlEnterKey = (e:React.SyntheticEvent<any>) => {
        e.preventDefault()
        if(this.autocomplete && this.autocomplete.current)
        {
            if (this.autocomplete.current.hasActiveSelection())
            {
                this.autocomplete.current.selectActiveSelection(e as any)
                return
            }
        }
        this.props.onSubmitSearch && this.props.onSubmitSearch()
    }
    onSearchFocus = (event:React.SyntheticEvent<any>) => {
        //this.changeActiveState(true)
    }
    onSearchBlur = (event:React.SyntheticEvent<any>) => {
        //this.changeActiveState(false)
    }
    changeActiveState = (active:boolean) => {
        if (active)
        {
            this.setState({ active:active }, () => {
                //this.addBackDrop()
                //this.textInput.current.getWrappedInstance().focus()
            })
        }
        else 
        {
            this.setState({ active:active }, () => {
                //this.removeBackDrop()
                this.textInput.current.blur()
            })
        }
    }
    onAutocompleteClose = () => {

    }
    closeAutocomplete = () => {
        this.changeActiveState(false)
    }
    toggleAutocomplete = () => {

        if(this.preventClose)
        {
            this.preventClose = false
            return
        }
        const {active} = this.state;
        this.changeActiveState(!active)
    }
    showAutocomplete = () => {
        if(this.state.active)
        {
            this.preventClose = true
            return
        }
        this.changeActiveState(true)
    }
    onComputeStyle = (data) => {
        data.styles.width = data.offsets.reference.width;
        data.styles.top = 0;
        //data.styles.left = data.offsets.popper.left;
        return data;
    }
    renderAutoComplete = () => {
        const sections = this.props.sections
        const modifiers = {
            computeStyle: {
              fn: this.onComputeStyle
            }
          }
        return (<Popover 
                    modifiers={modifiers} 
                    container={this.containerId} 
                    hideArrow={true} 
                    className="context-search-popover" 
                    trigger="legacy" 
                    placement="bottom" 
                    isOpen={this.state.active} 
                    toggle={this.toggleAutocomplete}
                    target={this.componentId} 
                    >
                    <PopoverBody>
                        <Autocomplete ref={this.autocomplete}
                                onClose={this.onAutocompleteClose}
                                sections={sections} 
                                emptyContent="Empty"
                                />
                    </PopoverBody>
                </Popover>)
    }
    renderSearchBox = () => {
        const cn = classnames("border-1",{"active":this.state.active})
        return (<SearchBox id={this.componentId} className={cn} 
            onEnter={this.onSearchControlEnterKey} 
            onFocus={this.onSearchFocus} 
            onBlur={this.onSearchBlur} 
            ref={this.textInput} 
            {...this.props} 
            termChanged={this.termChanged} 
            placeholder={this.props.placeholder} 
            onClick={this.showAutocomplete}
            term={this.state.searchData.originalText} />)
    }
    render() {
        const cn = classnames("context-search", this.props.className)
        return (
          <div className={cn} >
            {this.renderSearchBox()}
            <div id={this.containerId} className="popover-container"></div>
            {this.renderAutoComplete()}
          </div>
        )
    }
}