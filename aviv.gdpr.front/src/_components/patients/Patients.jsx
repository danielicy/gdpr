import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import SearchComponent from './../common/SearchComponent';
import { connect } from 'react-redux';
import { ARTICLE_PAGE_LOADED, ARTICLE_PAGE_UNLOADED } from './../../_constants/actionTypes';
import { any } from 'prop-types';
import { userActions } from  './../../_actions/user.actions';

import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import './../../assets/sass/main.scss';

import API from './../../_services/api.service';

const mapStateToProps = state => ({
  ...state.article,
  currentUser: state.common.currentUser
});

const mapDispatchToProps = dispatch => ({
  onLoad: payload =>
    dispatch({ type: ARTICLE_PAGE_LOADED, payload }),
  onUnload: () =>
    dispatch({ type: ARTICLE_PAGE_UNLOADED })
});


class ResultItem extends Component {
  constructor() {
      super()
      this.mounted = false;
  }

   handleClick() {
      this.callback();
    }


  render() {
     return (
          <li onClick={this.handleClick.bind(this.props)} className={this.props.index === this.props.activeIndex ? 'result-item active' : 'result-item'} >
              {this.props.index + ' | ' + this.props.patient}


          </li>
      )
  }

}

class PatientsView extends Component {

  constructor(props) {
    super();
    this.state = {value: ''};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.patient=any;

    this.state = {
        selectedPatient: ''
    }
}


 handleClickDelete(){

  API.delete(`gdpr/case_id/${this.state.selectedPatient.Id}`,{
          headers: {
             'x-auth-token':JSON.parse(localStorage.getItem('user'))['token'] //the token is a variable which holds the token
          }
         })
        .then(res => {
          console.log(res);
          console.log(res.data);
        });

}

handleChange(event) {
  console.log("change detected");
  this.setState({value: event.target.value});
 }



handleSubmit(event) {
  const options={
    title: 'Title',
    message: 'Message',
    buttons: [
      {
        label: 'Yes',
        onClick: () => alert('Click Yes')
      },
      {
        label: 'No',
        onClick: () => alert('Click No')
      }
    ],
    childrenElement: () => <div />,
    customUI: ({ onClose }) => <div className='custom-ui'>
    <h1>Are you sure</h1>
    <p>You want to delete {this.state.selectedPatient.FirstName + ' ' + this.state.selectedPatient.LastName}?</p>
    <button onClick={onClose}>No</button>
    <button
      onClick={() => {
        this.handleClickDelete();

        onClose();
      }}
    >
      Yes, Delete it!
    </button>
  </div>,
    closeOnEscape: true,
    closeOnClickOutside: true,
    willUnmount: () => {},
    afterClose: () => {},
    onClickOutside: () => {},
    onKeypressEscape: () => {}

  };
    //alert('A name was submitted: ' + this.state.selectedPatient.FirstName+' ' + this.state.selectedPatient.LastName);
    confirmAlert(options)
    event.preventDefault();
  }

  selectedPatientChanged(patient){
    console.log("selected patient: " + patient.FirstName +' ' +patient.LastName);

     this.setState({ selectedPatient: patient });
  }




  getResultItem(patient,index){
    return (<ResultItem activeIndex={this.state.activeIndex}
      key={index}
      index={index}
      query={this.props.query}
      patient={patient.FirstName + ' ' + patient.LastName}
      callback={ () =>
          this.selectedPatientChanged(patient)
      } />)
  }

    render() {
        return (
        <div className="form-container">
            <div className="selectedpatient">
         {this.state.selectedPatient &&(
               <form  onSubmit={this.handleSubmit}>

                    Selected Patient:<br/>
                    <label for="name" className="form-label"> Name:</label>
                    <input id="name" type="text" className="patientdetails" value={this.state.selectedPatient.FirstName +' ' +this.state.selectedPatient.LastName} onChange={this.handleChange} />
                    <br/>
                    <label className="form-label"> Address:</label>
                    <input id="address" type="text"  className="patientdetails" value={this.state.selectedPatient.Address } onChange={this.handleChange} />
                    <br/>
                    <input className="submit" type="submit" value="Apply GDPR" />
                </form>)}
          </div>
            <div className='patients-container'>                 
                <div className="search">
                <SearchComponent    patientSelectionChanged={ this.selectedPatientChanged.bind(this)}  resultItem= { (patient,index)=> this.getResultItem(patient,index)}/>
                </div>
                <ul className="userlinks">

                <li  className="lik">
                <Link className="link" to="/register"  >Register</Link>
                </li>
                <li  className="lik">
                    <Link className="link" to="/login">Logout</Link>
                  </li>


                </ul>

            </div>
          </div>
        );
    }
}



function mapState(state) {
  const { users, authentication } = state;
  const { user } = authentication;
  return { user, users };
}

const actionCreators = {
  getUsers: userActions.getAll,
  deleteUser: userActions.delete
}

const connectedHomePage = connect(mapState, actionCreators)(PatientsView);
export { connectedHomePage as PatientsView };
