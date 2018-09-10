import * as React from "react";
import { EditorState } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import 'draft-js-mention-plugin/lib/plugin.css';
import createMentionPlugin, { defaultSuggestionsFilter } from 'draft-js-mention-plugin';
require('./MentionEditor.scss');
const Entry = (props) => {
    const {
      mention,
      searchValue, // eslint-disable-line no-unused-vars
      isFocused, // eslint-disable-line no-unused-vars
      ...parentProps
    } = props;
  
    return (
      <div {...parentProps}>
        <div className="mentionSuggestionsEntryContainer">
          <div className="mentionSuggestionsEntryContainerLeft">
            <img
              src={mention.avatar}
              className="mentionSuggestionsEntryAvatar"
              role="presentation"
            />
          </div>
  
          <div className="mentionSuggestionsEntryContainerRight">
            <div className="mentionSuggestionsEntryText">
              {mention.name}
            </div>
  
            <div className="mentionSuggestionsEntryTitle">
              {mention.title}
            </div>
          </div>
        </div>
      </div>
    );
  };
const mentions = [
    {
      name: 'Matthew Russell',
      link: 'https://twitter.com/mrussell247',
      avatar: 'https://pbs.twimg.com/profile_images/517863945/mattsailing_400x400.jpg',
    },
    {
      name: 'Julian Krispel-Samsel',
      link: 'https://twitter.com/juliandoesstuff',
      avatar: 'https://avatars2.githubusercontent.com/u/1188186?v=3&s=400',
    },
    {
      name: 'Jyoti Puri',
      link: 'https://twitter.com/jyopur',
      avatar: 'https://avatars0.githubusercontent.com/u/2182307?v=3&s=400',
    },
    {
      name: 'Max Stoiber',
      link: 'https://twitter.com/mxstbr',
      avatar: 'https://pbs.twimg.com/profile_images/763033229993574400/6frGyDyA_400x400.jpg',
    },
    {
      name: 'Nik Graf',
      link: 'https://twitter.com/nikgraf',
      avatar: 'https://avatars0.githubusercontent.com/u/223045?v=3&s=400',
    },
    {
      name: 'Pascal Brandt',
      link: 'https://twitter.com/psbrandt',
      avatar: 'https://pbs.twimg.com/profile_images/688487813025640448/E6O6I011_400x400.png',
    },
  ];
  const positionSuggestions = ({ state, props }) => {
    let transform;
    let transition;
  
    if (state.isActive && props.suggestions.length > 0) {
      transform = 'scaleY(1)';
      transition = 'all 0.25s cubic-bezier(.3,1.2,.2,1)';
    } else if (state.isActive) {
      transform = 'scaleY(0)';
      transition = 'all 0.25s cubic-bezier(.3,1,.2,1)';
    }
  
    return {
      transform,
      transition,
      position:"relative",
      padding:"0",
      boxShadow:"none",
    margin: "0.375rem -0.75rem",
    marginBottom: "-0.375rem",

    maxHeight: "150px",
    overflowY: "auto",
    };
  };
interface Props 
{
}
export default class MentionEditor extends React.Component<Props,{}> {

    mentionPlugin:any
    editor:any
  constructor(props) {
    super(props);

    this.mentionPlugin = createMentionPlugin({
        positionSuggestions
      });
  }

  state = {
    editorState: EditorState.createEmpty(),
    suggestions: mentions,
  };

  onChange = (editorState) => {
    this.setState({
      editorState,
    });
  };

  onSearchChange = ({ value }) => {
    this.setState({
      suggestions: defaultSuggestionsFilter(value, mentions),
    });
  };

  onAddMention = () => {
    // get the mention object selected
    console.log("add", this.state.editorState.getCurrentContent().entries())
  }

  focus = () => {
    this.editor.focus();
  };

  render() {
    const { MentionSuggestions } = this.mentionPlugin;
    const plugins = [this.mentionPlugin];

    return (
      <div className="mention-editor" onClick={this.focus}>
        <Editor
          editorState={this.state.editorState}
          onChange={this.onChange}
          plugins={plugins}
          ref={(element) => { this.editor = element; }}
        />
        <MentionSuggestions
          onSearchChange={this.onSearchChange}
          suggestions={this.state.suggestions}
          onAddMention={this.onAddMention}
          entryComponent={Entry}
        />
      </div>
    );
  }
}