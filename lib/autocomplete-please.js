'use babel';

import AutocompletePleaseView from './autocomplete-please-view';
import { CompositeDisposable } from 'atom';

export default {

  autocompletePleaseView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.autocompletePleaseView = new AutocompletePleaseView(state.autocompletePleaseViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.autocompletePleaseView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'autocomplete-please:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.autocompletePleaseView.destroy();
  },

  serialize() {
    return {
      autocompletePleaseViewState: this.autocompletePleaseView.serialize()
    };
  },

  toggle() {
    console.log('AutocompletePlease was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
