import * as React from "react";
import { normalizeIndex } from '../../utilities/Utilities'
import { PositionProperty } from "csstype";
require('./SuggestionList.scss');
interface Props 
{
    suggestionsState:any
}
export default class SuggestionList extends React.Component<Props, any>{

  render()
  {
    const {
      suggestionsState
    } = this.props;
    const {
      left,
      top,
      array,
      selectedIndex
    } = suggestionsState;

    const style = {
        position: 'absolute' as PositionProperty,
        left,
        top
    }
    if (!array) {
      return null;
    }
    const normalizedIndex = normalizeIndex(
      selectedIndex, array.length
    );
    return ( <ul style={style} className="suggestions"> {
      array.map((person, index) => {
        return ( <li className={"person" + (index === normalizedIndex ? " selected": "")} key={person} > { person } </li> )
      }, this)
    } </ul>);
  }
}