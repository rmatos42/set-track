import React from 'react';
import * as firebase from 'firebase';
import { StyleSheet, Text, View, Alert, TextInput, ScrollView, KeyboardAvoidingView, Image, TouchableOpacity } from 'react-native';
import { Container, Header, Content, Form, Item, Input, Button, List, ListItem} from 'native-base';
import { Router, Scene, Actions, Stack } from 'react-native-router-flux';
import Modal from 'react-native-modal';

const Dimensions = require('Dimensions');

class NewSet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      weight: 0,
      reps: 0,
    }
  }

  incReps() {
    var reps = this.state.reps + 1;
    this.setState({reps});
    this.props.incReps(this.props.id)
  }

  decReps() {
    var reps = this.state.reps - 1;
    this.setState({reps});
    this.props.decReps(this.props.id);
  }

  changeWeight() {
    this.setState()
  }

  render() {
    return (
        <View style={styles.new_set_info}>
          <Text style={styles.WhiteButtonText}>Set {this.props.id}: </Text>
          <TextInput placeholder="Weight"  onChangeText={(text) => this.props.changeWeight(text, this.props.id)}value={this.props.weight}/>
          <Button style={styles.NewItemButton} onPress={this.decReps.bind(this)}>
            <Text style={styles.WhiteButtonText}> - </Text>
          </Button>
          <Text style={styles.WhiteButtonText}> {this.props.reps} </Text>
          <Button style={styles.NewItemButton} onPress={this.incReps.bind(this)}>
            <Text style={styles.WhiteButtonText}> + </Text>
          </Button>
        </View>
    );
  }
}

class NewWorkoutSession extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sets: [
      ],

      currentSetId: 0,
      currentSet: {
        weight: '',
        reps: 0
      },
    }
  }

  incReps(i) {
    var currentSet = this.state.currentSet;
    currentSet.reps += 1;
    this.setState({currentSet});
  }

  decReps(i) {
    var currentSet = this.state.currentSet;
    sets[i].reps -= 1;
    this.setState({sets});
  }

  changeWeight(weight, i) {
    var currentSet = this.state.currentSet;
    currentSet.weight = weight;
    this.setState({currentSet});
  }

  addSet() {
    var sets = this.state.sets;
    var currentSet = this.state.currentSet;
    console.log(sets);
    console.log(currentSet);
    var currentSetId = this.state.currentSetId;
    sets.push({weight: currentSet.weight, reps: currentSet.reps});
    currentSet.weight = '';
    currentSet.reps = 0;
    currentSetId += 1;
    this.setState({sets});
    this.setState({currentSetId});
    this.setState({currentSet});
  }

  createPayload() {
    var sets = this.state.sets;
    console.log(this.props.workout_id);
    fetch('http://10.0.0.117:3000/sessions/' + this.props.user_id, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workout_id: this.props.workout_id,
        sets: sets
      })
    }).then((response) => response.json())
    .then((response) => console.log(response))
    .then(() => this.props.close())
    .then(() => this.props.update());
  }

  render() {
    return (
      <View style={styles.modal}>
        <View style={styles.WorkoutInfo}>
        <NewSet id={this.state.currentSetId}
          reps={this.state.currentSet.reps}
          incReps={this.incReps.bind(this)}
          decReps={this.decReps.bind(this)}
          changeWeight={this.changeWeight.bind(this)} 
          weight={this.state.currentSet.weight}/>
        <Button onPress={this.addSet.bind(this)} style={styles.NewItemButton}><Text style={styles.WhiteButtonText}>Add Set</Text></Button>
        <Button onPress={this.createPayload.bind(this)}>
          <Text>
            Submit Session
          </Text>
          </Button>
        </View>
        <ScrollView style={styles.ListView}>
          <List>
            {this.state.sets.map((set_obj, i) => 
              <ListItem style={styles.ListItem}><Text> Weight: {set_obj.weight} Reps: {set_obj.reps} </Text></ListItem>
            )}
          </List>
        </ScrollView>
      </View>
    );
  }
}

class WorkoutList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      workouts: [{}],
      modal: 0,
      new_workout: '',
    }
  }

  update() {
    fetch('http://10.0.0.117:3000/workouts/' + this.props.user_id)
      .then((response) => response.json())
      .then((response) => this.setState({workouts: response}));
  }

  componentDidMount() {
    this.update();
  }

  viewSessions(i, name) {
    Actions.sessionList({user_id: this.props.user_id, 
      workout_id: this.state.workouts[i]._id, 
      names: name, 
      workouts: this.state.workouts});
  }

  createPayload() {
    fetch('http://10.0.0.117:3000/workouts/' + this.props.user_id, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: this.state.new_workout
      })
    }).then((response) => response.json()).then(() => this.setState({modal: 0})).then(() => this.update())
  }

  render_modal = () => (
    <View style={styles.modal}>
      <TextInput placeholder="Enter Workout Name" onChangeText={(new_workout) => this.setState({new_workout})} value={this.state.new_workout}/>
      <Button onPress={this.createPayload.bind(this)}>
        <Text>Create Workout</Text>
      </Button>
    </View>
  )

  render() {
    return (
      <View style={styles.SetList}>
        <Modal isVisible={this.state.modal === 1}>
          {this.render_modal()}
        </Modal>
        <View style={styles.WorkoutInfo}>
            <Text style={styles.BigTextCenter}>{this.props.username}'s Workouts</Text>
            <Button style={styles.NewItemButton} onPress={() => this.setState({modal: 1})}>
              <Text style={styles.WhiteButtonText}>New Workout</Text>
            </Button>
        </View>
        <ScrollView style={styles.ListView}>
        <List>
          {this.state.workouts.map((workout, i) =>
            <ListItem style={styles.List}>
              <Button onPress={() => this.viewSessions(i, workout.name)} transparent>
                <Text>{workout.name}</Text>
              </Button>
            </ListItem>)}
        </List>
        </ScrollView>
      </View>
    )
  }
}

class SessionList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: 0,
      sessions: [{}],
    }
  }

  update() {
    fetch('http://10.0.0.117:3000/sessions/' + this.props.user_id + '/' + this.props.workout_id).then((response) => response.json()).then((response) => this.setState({sessions: response}));
  }

  componentWillMount() {
    this.update();
  }

  viewSets(i) {
    Actions.setList({user_id: this.props.user_id, session_id: this.state.sessions[i]._id});
  }

  newSession() {
    // Actions.newWorkoutSession({user_id: this.props.user_id, workout_id: this.props.workout_id, workouts: this.props.workouts});
    this.setState({modal: 1});
  }

  render_modal = () => (
    <NewWorkoutSession update={this.update.bind(this)} user_id={this.props.user_id} workout_id= {this.props.workout_id} workouts={this.props.workouts} close={this.close_modal.bind(this)}/>
  )

  close_modal() {
    this.setState({modal: 0});
  }

  render() {
    return (
      <View style={styles.SetList}>
      <Modal isVisible={this.state.modal === 1}>
        {this.render_modal()}
      </Modal>
        <View style={styles.WorkoutInfo}> 
          <Text style={styles.BigTextCenter}>{this.props.names}</Text>
          <Button onPress={() => this.newSession()} style={styles.NewItemButton}>
            <Text style={styles.WhiteButtonText}>New Session</Text>
          </Button>
        </View>
        
        <ScrollView style={styles.ListView}>
          <List>
            {this.state.sessions.map((session, i) =>
              <ListItem style={styles.List}>
                <Button onPress={() => this.viewSets(i)} transparent>
                <Text>{session.Created_date}</Text>
                </Button>
              </ListItem>)}
          </List>
        </ScrollView>
      </View>
    )
  }
}

class SetList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sets: [{}],
      name: ''
    }
  }

  componentDidMount() {
    fetch('http://10.0.0.117:3000/sets/' + this.props.user_id + '/' + this.props.session_id).then((response) => response.json()).then((response) => this.setState({sets: response}, () => {
      fetch('http://10.0.0.117:3000/workouts/' + this.props.user_id + '/' + this.state.sets[0].workout_id).then((response) => response.json()).then((response) => this.setState({name: response.name}))
    }));
  }

  render() {
    return (
      <View style={styles.SetList}>
        <View style={styles.WorkoutInfo}> 
          <Text style={styles.BigTextCenter}>{this.state.name}</Text>
          <Text style={styles.SmallTextCenter}>{this.state.sets[0].Created_date}</Text>
        </View>
        <View style={styles.ListView}>
        <ScrollView>
        <List style={styles.List}>
          {this.state.sets.map((sets, i) =>
            <ListItem style={styles.List}>
              <Button style={styles.SetListTextView} transparent>
                  <Text >Weight: {sets.weight}</Text>
                  <Text >Reps: {sets.reps}</Text>
                </Button>
            </ListItem>)}
        </List>
        </ScrollView>
        </View>
      </View>
    )
  }
}

class Login extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      email: '',
      pass: ''
    }
  }

  handleSignIn() {
    fetch('http://10.0.0.117:3000/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: this.state.email,
        password: this.state.pass
      }),
    }).then((response) => response.json()).then((responseJson) => {
      Actions.workoutList({user_id: responseJson._id, username: responseJson.username});
    });

  }

  render() {
    return(
      <View style={styles.login}>
      <View style={styles.login_img}>
      </View>
      <KeyboardAvoidingView behavior="padding" style={styles.login_view}>
        <Image style={styles.image} source={require('./weight.png')} />
        <TextInput style={ styles.login_input} onChangeText={(email) => this.setState({email})} value={this.state.email} placeholder="E-mail"/>
        <TextInput style={ styles.login_input} onChangeText={(pass) => this.setState({pass})} value={this.state.pass} placeholder="Password"/>
        <View style={styles.button_view}>
          <Button onPress={this.handleSignIn.bind(this)} style={styles.login_buttons}>
            <Text>Log in</Text>
          </Button>
          <Button onPress={() => {Actions.signup()}} style={styles.login_buttons}>
            <Text>Sign up</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
      </View>
    );
  }
}

class Signup extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      user: '',
      email: '',
      pass: '',
      passConf: '',
      text: ''
    }
  }

  handleSignUp() {
    fetch('http://10.0.0.117:3000/users', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: this.state.email,
        username: this.state.user,
        password: this.state.pass,
      }),
    });
    Actions.login()
    alert('You may now login!');
  }

  render() {
    return(
      <View style={styles.signup}>
        <View style={styles.login_img}>
        </View>
        <KeyboardAvoidingView behavior="padding">
        <TextInput style={ styles.login_input} onChangeText={(email) => this.setState({email})} value={this.state.email} placeholder="E-mail"/>
        <TextInput style={ styles.login_input} onChangeText={(user) => this.setState({user})} value={this.state.user} placeholder="Username"/>
        <TextInput style={ styles.login_input} onChangeText={(pass) => this.setState({pass})} value={this.state.pass} placeholder="Password"/>
        <TextInput style={ styles.login_input} onChangeText={(passConf) => this.setState({passConf})} value={this.state.passConf} placeholder="Confirm Password"/>
        <Button onPress={this.handleSignUp.bind(this)}>
          <Text>Signup</Text>
        </Button>
        </KeyboardAvoidingView>
      </View>
    );
  }
}

export default class App extends React.Component {
  render() {
    return (
      <Router>
        <Stack key="root">
          <Scene key="login" component={Login} title="Login"/>
          <Scene key="signup" component={Signup} title="Signup"/>
          <Scene key="workoutList" component={WorkoutList} title="Workouts"/>
          <Scene key="sessionList" component={SessionList} title="Sessions"/>
          <Scene key="setList" component={SetList} title="Sets"/>
          <Scene key="newWorkoutSession" component={NewWorkoutSession} title="New Workout Session"/>
        </Stack>
      </Router>
    );
  }
}

const styles = StyleSheet.create({
  login: {
    flexDirection: 'column',
    flex: 1,
    backgroundColor: '#3F51B5'
  },
  signup: {
    flexDirection: 'column',
    flex: 1,
  },
  login_img: {
    flex: 1
  },
  login_view: {
    margin: 5,
  },
  button_view: {
    flexDirection: 'row',
  },
  login_buttons: {
    flex: 1,
    margin: 5,
    padding: 5,
    backgroundColor: '#03A9F4',
  },
  login_input: {
    padding: 5,
    margin: 5,
    borderWidth: 2,
    borderColor: '#03A9F4',
    borderRadius: 5,
    backgroundColor: '#FFFFFF'
  },
  image: {
    width: 100,
    height: 100,
  },
  rep_inc: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  new_set_info: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ListView: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#03A9F4',
    backgroundColor: '#FFFFFF',
    flex: .75,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowRadius: 5,
    shadowOpacity: 1.0,
    padding: 10
  },
  List: {
    backgroundColor: 'rgba(255, 255, 255, .0)'
  },
  SetListTextView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  WorkoutInfo: {
    flex: .25
  },
  SetList: {
    flex: 1,
    padding: 10,
    backgroundColor: '#015C83'
  },
  BigTextCenter: {
    alignSelf: 'center',
    color: 'white',
    fontSize: 30,
    padding: 5
  },
  SmallTextCenter: {
    alignSelf: 'center',
    color: 'white',
    fontSize: 20,
    padding: 5
  }, 
  NewItemButton: {
    padding: 5,
    backgroundColor: '#03A9F4'
  },
  modal: {
    flex: 1,
    padding: 10,
    backgroundColor: '#015C83',
    borderRadius: 10,
    shadowColor: 'grey',
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowRadius: 5,
    shadowOpacity: 1.0,
  },
  WhiteButtonText: {
    color: 'white'
  }
})
