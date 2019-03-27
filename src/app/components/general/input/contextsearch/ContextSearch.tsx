
import * as React from 'react';
import classnames from "classnames";
import "./ContextSearch.scss"
import { SearchBox } from './SearchBox';
import { SearcQueryManager, SearchOption, ContextSearchData } from './extensions';
import Autocomplete, { AutocompleteSection } from './Autocomplete';
import { Popover, PopoverBody } from 'reactstrap';
import { uniqueId } from '../../../../utilities/Utilities';
import { ElasticSearchType } from '../../../../types/intrasocial_types';
import { EditorState } from 'draft-js';
import { translate } from '../../../../localization/AutoIntlProvider';
import { allowedSearchOptions } from '../../../../modules/newsfeed/NewsfeedMenu';

type Props = {
    placeholder?:string
    term?:string
    className?:string
    onSearchDataChanged?:(data:ContextSearchData, focusOffset:number, activeSearchType:ElasticSearchType) => void
    onSubmitSearch?:() => void
    sections:AutocompleteSection[]
    allowedSearchOptions:SearchOption[]
    searchData:ContextSearchData
    onAutocompleteToggle?:(visible:boolean) => void
} 
type State = {
    searchData:ContextSearchData
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
            searchData:props.searchData,
            active:false,
            activeSearchType:null,
        }
    }
    editorState = () => {
        return this.textInput.current.editorState()
    }
    applyState = (editorState:EditorState) => {
        this.textInput.current.applyState(editorState)
    }
    onChange = (editorState:EditorState) => {
        const searchData = SearcQueryManager.getContextSearchData(editorState, allowedSearchOptions)
        const activeSearchType = SearcQueryManager.getActiveSearchType(searchData, editorState.getSelection().getFocusOffset(), this.props.allowedSearchOptions)
        this.setState({ activeSearchType , searchData}, this.sendSearchDataChanged)
    }
    resetSearch = (editorState:EditorState) => {
        //const state = SearcQueryManager.clearState(editorState)
        //this.textInput.current.applyState(state)
        //this.setState({activeSearchType:null, searchData:searchData}, this.sendSearchDataChanged)
    }
    sendSearchDataChanged = () => {
        this.props.onSearchDataChanged && this.props.onSearchDataChanged(this.state.searchData, this.getSearchFieldFocusOffset(), this.state.activeSearchType)
    }
    getSearchFieldFocusOffset = () => {
        return (this.textInput.current &&  this.textInput.current.getFocusOffset()) || 0
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
                this.props.onAutocompleteToggle && this.props.onAutocompleteToggle(active)
                //this.addBackDrop()
                //this.textInput.current.getWrappedInstance().focus()
            })
        }
        else 
        {
            this.setState({ active:active }, () => {
                this.props.onAutocompleteToggle && this.props.onAutocompleteToggle(active)
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
                                emptyContent={translate("contextsearch.dropdown.empty.title")}
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
                    onChange={this.onChange} 
                    placeholder={this.props.placeholder} 
                    onClick={this.showAutocomplete}
                    data={this.state.searchData}
                    multiline={true}
             />)
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