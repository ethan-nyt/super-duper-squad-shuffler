import React, { Component } from 'react';
import { randomizer } from './randomizer';
import { names as defaultNames, modes } from './constants';
import { Dropdown, Button, List, Divider, Loader, Icon, Input } from 'semantic-ui-react';
import './App.css';

class App extends Component {
  state = {
    names: defaultNames,
    newName: '',
    squadLeads: [],
    squads: [],
    randomizing: false,
    mode: modes.confirm_participants,
  };

  mapNamesToOptions = names => names.map((name, i) => ({ text: name, value: name, key: `${name}_squad_member${i}` }));

  addSquadLead = (e, { value: squadLeads }) => {
    this.setState({ squadLeads, squads: [] });
  }

  setSquads = () => {
    const { squadLeads, names } = this.state;
    const squadFollowers = names.filter(name => squadLeads.indexOf(name) < 0);
    const squads = randomizer(squadFollowers, squadLeads.length);
    this.setState({ randomizing: true }, () => {
      setTimeout(() => {
        this.setState({ squads, randomizing: false });
      }, 500)
    });
  }

  startOver = () => this.setState({ 
    mode: modes.confirm_participants,
    squadLeads: [],
    squads: []
  });

  confirmParticipants = () => this.setState({ mode: modes.confirm_squad_leads });

  changeNewName = (e, { value: newName }) => this.setState({ newName });

  addNewName = () => this.setState({ names: [ this.state.newName, ...this.state.names], newName: '' });

  deleteName = idx => {
    const names = this.state.names.slice();
    names.splice(idx, 1);
    this.setState({ names });
  }

  editParticipants = () => {
    this.setState({
      mode: modes.edit_participants,
    });
  }

  renderPrompt = () => {
    const { mode } = this.state;
    const { confirm_squad_leads, confirm_participants } = modes;
    return mode === confirm_squad_leads ? <h2>Who are the squad leads?</h2> : mode === confirm_participants ? <h2>Please confirm the list of participants for this sprint.</h2> : <h2>Add or remove sprint participants</h2>
  }

  renderParticipantList = () => (
    <List>
      {this.state.names.map(name => <List.Item>{name}</List.Item>)}
    </List>
  );

  renderNameOption = (name, i) => <List.Item>{name}<Button size="mini" icon="delete" color="red" onClick={() => this.deleteName(i)} /></List.Item>

  renderListEditor = () => {
    // make a copy of list of names
    const names = this.state.names.slice();
    return (
      <div>
        <List>
          <List.Item>
            <Input value={this.state.newName} onChange={this.changeNewName} action={{ disabled: this.state.newName.length < 1, size: 'small', color: 'teal', content: 'Add name', labelPosition: 'right', icon: 'plus', onClick: this.addNewName }} />
          </List.Item>
          { names.map((name, i) => this.renderNameOption(name, i)) }
        </List>
        <Button color="green" onClick={this.confirmParticipants} content="Done"/>
      </div>
    )
    // render a list of names
    // each list item should have a "remove" button next to it
      // onClick --> splice that item out of the list
    // at the top of the list there should be an input and an "add" button
      // onClick, add the input name to the list.
  }

  renderControls = () => {
    const { mode, names } = this.state;
    return mode === modes.confirm_squad_leads ? (
      <div>
        <Dropdown
          search
          selection
          multiple
          closeOnChange
          onChange={this.addSquadLead}
          options={this.mapNamesToOptions(names)}
          />
      </div>
    ) : mode === modes.confirm_participants ? (
      <div>
        { this.renderParticipantList() }
        <br />
        <Button.Group>
          <Button color="green" onClick={this.confirmParticipants}>Confirm</Button>
          <Button.Or />
          <Button color="yellow" onClick={this.editParticipants}>Edit</Button>
        </Button.Group>
      </div>
    ) : this.renderListEditor();
  }

  renderRandomizeButton = () => <Button color="teal" onClick={this.setSquads}><Icon name="random"/>Shuffle {this.state.squads.length ? 'Again' : 'Squads'}</Button>
  
  renderButtonGroup = () => (
    <Button.Group>
      {this.renderRandomizeButton()}
      <Button.Or />
      <Button color="blue" onClick={this.startOver}><Icon name="refresh"/>Start Over</Button>
    </Button.Group>
  );

  render() {
    const { squadLeads, squads, randomizing } = this.state;
    return (
      <div className="App">
        <div className="App-header">
          <h2>Squad Shuffler</h2>
        </div>
        {this.renderPrompt()}
        <div className="squadLeadsControl">
          {this.renderControls()}
          <br/>
          {
            squadLeads.length > 1 ? 
            <div>
              {
                squads.length ? this.renderButtonGroup() : this.renderRandomizeButton()
              }
            </div>
            : null
          }
        </div>        
        <Divider />
        <div id="squadListContainer">
          {
            randomizing ? <Loader active>Randomizing...</Loader> : squadLeads.length && squads.length ? squadLeads.map((name, i) => (
              <div className="squad">
                <h2>{name}'s Squad</h2>
                <List>
                  { squads[i].map(squadMember => <List.Item key={`${squadMember}_${name}'s_Squad`}>{squadMember}</List.Item>) }
                </List>
                <Divider fitted />
              </div>
            )) : null
          }
        </div>
      </div>
    );
  }
}

export default App;
