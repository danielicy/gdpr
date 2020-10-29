
import React, {Component} from 'react';
import { connect } from 'react-redux';

import API from '../../_services/api.service';
import {keybinder} from   '../../_utils/keybinder';
import { ARTICLE_PAGE_LOADED, ARTICLE_PAGE_UNLOADED } from  '../../_constants/actionTypes';

import './../../assets/sass/main.scss';
/****************************************************** */


const mapStateToProps = state => ({
    ...state.article,
   // currentUser: state.common.currentUser
  });

  const mapDispatchToProps = dispatch => ({
    onLoad: payload =>
      dispatch({ type: ARTICLE_PAGE_LOADED, payload }),
    onUnload: () =>
      dispatch({ type: ARTICLE_PAGE_UNLOADED })
  });


class InputComponent extends Component {
    render() {
        return (
            <div className="large-12 columns">
                <label>
                    <input onChange={(e) => this._updateQuery(e)} value={this.props.query} defaultValue='' type="text" placeholder="Type to Search" />
                </label>
            </div>
        )
    }

    _updateQuery(e) {
        this.props.handleQuery(e.target.value);
    }
  }

  class ResultComponent extends Component {
    constructor(props) {
        super()


        this.handleScroll = this.handleScroll.bind(this);
        this.itemsDisplay = 10;
        this.keyEvent = false;
        this.state = {
            displayFilter: [0, 20],
            scrollTop: 0,
            activeIndex: 0
        }
        this.getResultItem=props.resultItem;

    }

    resultClicked(){
    this.props.resultClicked();
    }

    render() {
        return (
            <div   ref={(r) => this._resultBox = r} className={ this.props.showResults ? "results large-12 columns" : "hide" } >
               <div className='panel'>
                    <ul onClick={() =>this.resultClicked()}>
                        {this._getList()}
                    </ul>
               </div>
            </div>
        )
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.query !== nextProps.query) {
            this.setState({...this.state, displayFilter: [0, 20], activeIndex: 0});
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.displayFilter !== prevState.displayFilter && this.state.activeIndex !== 0) {
            if (prevState.displayFilter[0] < this.state.displayFilter[0]) {
                this._resultBox.scrollTop = 0;
                this.setState({...this.state, activeIndex: this.state.displayFilter[0]});
            } else {
                this._resultBox.scrollTop = 38 * 20;
                this.setState({...this.state, activeIndex: this.state.displayFilter[1] - 1});
            }
        }
    }




    _getList() {
        var list = this.props.data.map((item, index) => {
            return (
                this.getResultItem(item,index)
            )
        });


        var slicedList = list.slice(this.state.displayFilter[0], this.state.displayFilter[1]);

        if (list.length > this.state.displayFilter[1]) {
            slicedList.push(
                <li onClick={() => this.handleNext()} key='next-item' className='next-item'>
                    NEXT
                </li>
            );
        }

        if (slicedList.length === 0) {
            slicedList.push(
                <li onClick={() => this.handleNext()} key='no-results' className='no-results'>

                </li>
            );
        }

        if (this.state.displayFilter[0] !== 0) {
            slicedList.unshift(
                <li onClick={() => this.handlePrev()} key='prev-item' className='next-item'>
                    PREV
                </li>
            );
        }

        return slicedList;
    }

    componentDidMount() {
       /* keybinder.setContextWithBindings('result-box', [
            {keyCombo: 'down', fn: () => this.down()},
            {keyCombo: 'up', fn: () => this.up()}
        ]);
        keybinder.setContext('result-box');*/
        this._resultBox.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        this._resultBox.removeEventListener('scroll', this.handleScroll);
    }


    handleScroll(event) {
        if (this.keyEvent) return;
        this._resultBox.scrollTop = this._resultBox.scrollTop - (this._resultBox.scrollTop % 2);
        var newIndex = Math.ceil((this._resultBox.scrollTop - 20) / 38) + this.state.displayFilter[0];
        if (this.state.displayFilter[0] !== 0) {
            if (this._resultBox.scrollTop > 58) {
                newIndex = Math.ceil((this._resultBox.scrollTop - 58) / 38) + this.state.displayFilter[0];
            }
        }

        this.setState({...this.state, activeIndex: newIndex});
    }

    handleNext() {
        this.disableScrollEvent(() => {
            if (this.state.displayFilter[1] === this.props.data.length) return;
            var start = this.state.displayFilter[1];
            var end = this.state.displayFilter[1] + 20;
            this.setState({...this.state, displayFilter: [start, end]});
        });
    }

    handlePrev() {  this.disableScrollEvent(() => {
            if (this.state.displayFilter[0] === 0) return;
            var start = this.state.displayFilter[0] - 20;
            var end = this.state.displayFilter[0];
            this.setState({...this.state, displayFilter: [start, end]});
        });
    }

    getScrollDown(index) {
        var scrollByIndex = 38 * (index - this.state.displayFilter[0]) + 18;
        var maxScroll = ((38 * 10) + (this._resultBox.scrollTop)) - 20;

        if (this.state.displayFilter[0] !== 0) {
            maxScroll = maxScroll - 38;
        }

        if (index === this.state.displayFilter[1] - 1) {
            this._resultBox.scrollTop = 38 * 20;
        } else if (maxScroll < scrollByIndex) {
            this._resultBox.scrollTop = this._resultBox.scrollTop + scrollByIndex % maxScroll;
        }
    }

    getScrollUp(index) {
        var scrollByIndex = 38 * (index - this.state.displayFilter[0]) - 18;
        var maxScroll = this._resultBox.scrollTop - 20;

        if (this.state.displayFilter[0] !== 0) {
            maxScroll = maxScroll - 38;
        }

        if (index === this.state.displayFilter[0]) {
            this._resultBox.scrollTop = 0;
        } else if (maxScroll > scrollByIndex) {
            this._resultBox.scrollTop = this._resultBox.scrollTop - maxScroll % scrollByIndex;
        }
    }

    down() {
        this.disableScrollEvent(() => {
            var nextIndex = this.state.activeIndex + 1;
            if (nextIndex > this.state.displayFilter[1] - 1) {
                this.handleNext();
                return;
            };
            this.getScrollDown(nextIndex);
            this.setState({...this.state, activeIndex: nextIndex});
        });
    }

    up() {
        this.disableScrollEvent(() => {
            var nextIndex = this.state.activeIndex - 1;
            if (nextIndex < this.state.displayFilter[0]) {
                this.handlePrev();
                return;
            };
            this.getScrollUp(nextIndex);
            this.setState({...this.state, activeIndex: nextIndex});
        });
    }

    disableScrollEvent(cb) {
        this.keyEvent = true;
        cb();
        setTimeout(() => {
            this.keyEvent = false;
        }, 100);
    }
  }


  /****************************************************** */



class SearchComponent extends React.Component {

    constructor(props) {
      super();

      this.resultItem=props.resultItem;
      this.patientSelected.bind(props.patientSelectionChanged);
      this.state = {
          patients: [],
          id:'',
          filteredFiles: [],
              query: '',
              showResults: false
      };


      this.getPatients();
    }


    patientSelected() {
        this._handleQuery('');
    }

    getPatients() {
      API.get(`/gdpr/patients/`)
        .then(res => {
          const patients = res.data;
          this.setState({ patients });
          //this.render();
        })
    }



    render() {
      return (
          <div className="row search-component">
              <InputComponent handleQuery={(query) =>
                this._handleQuery(query)}
                 query={this.state.query} />
              {<ResultComponent  resultClicked={() =>this.patientSelected()}
                            resultItem={(item,index) =>this.resultItem(item,index)}
                             showResults={this.state.showResults} data={this.state.filteredFiles} query={this.state.query} />
                        }</div>
      )
    }

    _handleQuery(query) {
      var filteredData = [];
      var show = false;
      if (query !== '') {
          filteredData = this.state.patients.filter((file, index) => {
              return file.FirstName.indexOf(query) !== -1;
          });
          show = true;
      }
      this.setState({...this.state, query: query, filteredFiles: filteredData, showResults: show});
    }
  }



export default connect(mapStateToProps, mapDispatchToProps)(SearchComponent);
