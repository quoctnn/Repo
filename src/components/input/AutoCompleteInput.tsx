import { Entity, Modifier, Editor, EditorState } from "draft-js";
import * as React from "react"
import AutoCompleteEditor from "./autocomplete"
import * as triggers from "./triggers"
import { normalizeIndex, filterArray } from '../../utilities/Utilities'
import SuggestionList from './SuggestionList';
import addSuggestion from './addSuggestions';

require('./AutoCompleteInput.scss')
export const persons = [
    'Bruce Wayne',
    'Helga Pataki',
    'Lady Gaga',
    'Lana Del Rey',
    'Marilyn Monroe',
  ];
  
  
  export const tags = [
    'android',
    'developer',
    'reactJs'
  ];

interface Props {
    onSuggestionClick:any
}
interface State {
  editorState: EditorState;
  autocompleteState: any;
}
var filteredArrayTemp;

export default class AutoCompleteInput extends React.Component<Props, any> {
  onChange: any;
  state: State;
  onAutocompleteChange: any;
  onInsert: any;
  onSuggestionItemClick: any;
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
      autocompleteState: null
    };
    this.onChange = editorState =>
      this.setState({
        editorState
      });
    this.onAutocompleteChange = autocompleteState =>
      this.setState({
        autocompleteState
      });

    this.onInsert = insertState => {
      if (!filteredArrayTemp) {
        return null;
      }
      const index = normalizeIndex(
        insertState.selectedIndex,
        filteredArrayTemp.length
      );
      insertState.text = insertState.trigger + filteredArrayTemp[index];
      //return addSuggestion(insertState);
    };
    this.onSuggestionItemClick = (e) => {
        if(this.props.onSuggestionClick)
            this.props.onSuggestionClick(e)
    }
  }

  renderAutocomplete() {
    const { autocompleteState } = this.state;
    if (!autocompleteState) {
      return null;
    }
    filteredArrayTemp = this.getFilteredArray(
      autocompleteState.type,
      autocompleteState.text
    );
    autocompleteState.array = filteredArrayTemp;
    autocompleteState.onSuggestionClick = this.onSuggestionItemClick;
    return <SuggestionList suggestionsState={autocompleteState} />;
  }

  getFilteredArray(type, text) {
    const dataArray = type == triggers.PERSON ? persons : tags;
    const filteredArray = filterArray(
      dataArray,
      text.replace(triggers.regExByType(type), "")
    );
    return filteredArray;
  }

  render() {
    return (
      <div className="autocomplete-root">
        {" "}
        {this.renderAutocomplete()}{" "}
        <div className="autocomplete-editor">
          <AutoCompleteEditor
            editorState={this.state.editorState}
            onChange={this.onChange}
            onAutocompleteChange={this.onAutocompleteChange}
            onInsert={this.onInsert}
          />{" "}
        </div>{" "}
      </div>
    );
  }
}
