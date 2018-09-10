import * as React from "react";
import { EditorState } from 'draft-js';
interface Props
{
    suggestions:Suggestion[],
    autocompleteState: AutocompleteState,
    renderSuggestion:(suggestion:Suggestion) => void
}
export class Suggestion 
{
    title:string
    constructor(title:string)
    {
      this.title = title
    }
}
export interface AutocompleteState 
{
    searchText:string
}
export default class Suggestions extends React.Component<Props,{}> {
    render() {
      const { autocompleteState, renderSuggestion } = this.props;
      if (!autocompleteState) return null;
      const { searchText } = autocompleteState;
      return (
        <div>
          <ul>
            {
              this.props.suggestions
                .filter(item => item.title.substring(0, searchText.length) === searchText)
                .map((result,index) => <li key={index} onMouseDown={() => renderSuggestion(result)}>{result.title}</li>)
            }
          </ul>
        </div>
      )
    }
  }