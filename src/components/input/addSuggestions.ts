import { Modifier, EditorState } from 'draft-js';
import { AutocompleteState } from './Suggestions';

const getInsertRange = (autocompleteState:AutocompleteState, editorState:EditorState) => {
  const currentSelectionState = editorState.getSelection();
  const end = currentSelectionState.getAnchorOffset();
  const anchorKey = currentSelectionState.getAnchorKey();
  const currentContent = editorState.getCurrentContent();
  const currentBlock = currentContent.getBlockForKey(anchorKey);
  const blockText = currentBlock.getText();
  const start = blockText.substring(0, end).lastIndexOf('@');

  return {
    start,
    end,
  };
};
export const addSuggestion = (editorState:EditorState, autocompleteState:AutocompleteState, text:string) => {

  const { start, end } = getInsertRange(autocompleteState, editorState);
  const currentSelectionState = editorState.getSelection();
  const mentionTextSelection = currentSelectionState.merge({
    anchorOffset: start,
    focusOffset: end
  });

  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState.createEntity(
    'MENTION',
    'IMMUTABLE',
    {
      text,
    },
  );
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

  let newContentState = Modifier.replaceText(
    contentStateWithEntity,
    mentionTextSelection as any,
    text, 
    null,
    entityKey
  );

  const blockKey = (mentionTextSelection as any).getAnchorKey();
  const blockSize = editorState.getCurrentContent().getBlockForKey(blockKey).getLength();
  if (blockSize === end) {
    newContentState = Modifier.insertText(
      newContentState,
      newContentState.getSelectionAfter(),
      ' '
    );
  }
  const newEditorState = EditorState.push(
    editorState,
    newContentState,
    'insert-mention' as any//'insert-mention'
  );
  return EditorState.forceSelection(newEditorState, newContentState.getSelectionAfter());
};


export default addSuggestion;