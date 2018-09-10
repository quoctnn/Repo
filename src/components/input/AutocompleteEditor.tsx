import * as React from "react";
import { EditorState , Editor, CompositeDecorator, ContentState, ContentBlock} from 'draft-js';
import { connect } from 'react-redux'
import Suggestions from "./Suggestions";
import { AutocompleteState, Suggestion } from './Suggestions';
import addSuggestion from './addSuggestions';
import { RootReducer } from '../../reducers/index';
import { UserProfile } from '../../reducers/profileStore';
require('./AutocompleteEditor.scss');
interface Props
{
    profiles:UserProfile[]
}
interface State 
{
    editorState:EditorState
    autocompleteState:AutocompleteState
}
const getTriggerRange = (trigger) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    const text = range.startContainer.textContent.substring(0, range.startOffset);
    if (/\s+$/.test(text)) return null;
    const index = text.lastIndexOf(trigger);
    if (index === -1) return null;
  
    return {
      text: text.substring(index),
      start: index,
      end: range.startOffset,
    };
  };
  const Mentiontag = ({ children }) => {
    return (
      <span style={{ background: '#e6f3ff' }}>{children}</span>
    );
  };
  
  const findMentionEntities = (contentBlock:ContentBlock, callback, contentState:ContentState) => {
    contentBlock.findEntityRanges(
      (character) => {
        const entityKey = character.getEntity();
        return (
          entityKey !== null &&
          contentState.getEntity(entityKey).getType() === 'MENTION'
        );
      },
      callback,
    );
  };
  
class AutocompleteEditor extends React.Component<Props,{}> {
    state:State
    private editor = React.createRef<Editor>()
    constructor(props) {
        super(props);
        this.state = {
            editorState: EditorState.createEmpty(
                new CompositeDecorator([{
                  strategy: findMentionEntities,
                  component: Mentiontag,
                }]),
              ),
          autocompleteState: null
        };
        this.focus = this.focus.bind(this)
      }
      onChange(editorState) 
      {
          let f =  () => {
            const triggerRange = getTriggerRange('@');
    
            if (!triggerRange) {
                this.setState({ autocompleteState: null });
                return;
            }
    
            this.setState({
                autocompleteState: {
                    searchText: triggerRange.text.slice(1, triggerRange.text.length),
                },
            })
        }
        this.setState({ editorState}, f);
      }
      renderSuggestion(suggestion:Suggestion) {
        const { editorState, autocompleteState } = this.state; 
    
        this.onChange( addSuggestion(editorState, autocompleteState, suggestion.title) );
    
        this.setState({ autocompleteState: null });
      }
      onEscape()
      {

      }
      onUpArrow()
      {

      }
      onDownArrow()
      {

      }
      onTab()
      {

      }
      focus() {
        this.editor.current.focus();
      }
      render() {
        const { autocompleteState, editorState } = this.state;
        let allSuggestions = this.props.profiles.map(p => new Suggestion(p.first_name))
        return (
          <div className="autocomplete-editor" onClick={this.focus}>
            <Editor ref={this.editor} editorState={editorState}  onChange={this.onChange.bind(this)}
            onEscape = {this.onEscape}
            onUpArrow = {this.onUpArrow}
            onDownArrow = {this.onDownArrow}
            onTab = {this.onTab} />
            <Suggestions suggestions={allSuggestions} autocompleteState={autocompleteState} renderSuggestion={(suggestion) => this.renderSuggestion(suggestion)}/>
          </div>
        );
      }
  }
  
  const mapStateToProps = (state:RootReducer) => {
    const keys = Object.keys( state.profileStore.byId ).map(k => parseInt(k))
    const profiles = keys.map(k => state.profileStore.byId[k])
    return {
        profiles
    };
}
export default connect(mapStateToProps, null)(AutocompleteEditor);
