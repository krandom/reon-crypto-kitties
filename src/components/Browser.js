import React, { Component } from 'react';
import * as moment from 'moment';
import * as $ from 'jquery';

import { object } from 'prop-types';
import { CONTRACT_NAME, CONTRACT_ADDRESS } from '../config';

import Web3 from 'web3';
import KittyCoreABI from '../contracts/KittyCoreABI.json';

import './Browser.css';
import './Search.css';

import { FaSearch } from 'react-icons/fa';
import { FaDice } from 'react-icons/fa';

class Browser extends Component {

  constructor(props) {
    super(props);

    this.state = {
        kittenId: '',
        currentKitten: null,
        image: null,
        contract: null,
    };

    this.getKitten = this.getKitten.bind(this);
    this.randomKitten = this.randomKitten.bind(this);
    this.setMsg = this.setMsg.bind(this);
  }

  async componentDidMount() {
    const web3 = new Web3(window.web3.currentProvider);

    const kittyContract = new web3.eth.Contract(
      KittyCoreABI, // import the contracts's ABI and use it here
      CONTRACT_ADDRESS,
    );

    this.context.drizzle.addContract({
      contractName: CONTRACT_NAME,
      web3Contract: kittyContract,
    });

    this.setState({ contract : kittyContract })
  }

  async getKitten(id) {

    if (!this.state.random && this.state.kittenId.toString().length < 1) {
      this.setMsg('KittenId Missing');
      return;
    }

    try {
      let res = await this.state.contract.methods.getKitty(this.state.random || this.state.kittenId).call();

      res.kittenId = this.state.random || this.state.kittenId;

      this.setState({
        currentKitten : res,
        image : null,
        random : false,
        kittenId : this.state.random || this.state.kittenId
      });
    }
    catch(e) {
      if (this.state.random)
        this.randomKitten();
      else
        this.setMsg('Kitten '+this.state.kittenId+' seems to be missing!!');
    }
  }

  randomKitten() {
    var self = this;

    this.setState({ random : (Math.floor(Math.random() * 1000000) + 1) }, () => {
      self.getKitten();
    });
  }

  setMsg(msg) {
    $('.msg').html(msg);

    setTimeout(() => {
      $('.msg').html('');
    }, 1500)
  }

  render() {
    var currentKitten = this.state.currentKitten;

    return (
      <div className='app'>

        <div className='msg' />

        <div className='browser'>

          <div className='header'>
            Kitty Browser
          </div>

          { currentKitten ? [
            <div className='results'>
              <div className='title'>Genes</div>
              <div className='subtitle'>{currentKitten.genes}</div>

              <div className='title'>Generation</div>
              <div className='subtitle'>{currentKitten.generation}</div>

              <div className='title'>Birth Time</div>
              <div className='subtitle'>{moment.unix(currentKitten.birthTime).format('MMMM Do, YYYY')}</div>

              <img
                src={'https://storage.googleapis.com/ck-kitty-image/0x06012c8cf97bead5deae237070f9587f8e7a266d/'+currentKitten.kittenId+'.svg'}
                className='kittenImg'
                alt='' />
            </div>
          ] :
            <div className='noKitten'>No kitten selected</div>
          }

          <div className='search'>
            <input
              type='text'
              value={this.state.kittenId}
              placeholder='Kitten Id'
              onChange={e => { this.setState({ kittenId : parseInt(e.target.value) || '' }) }} />

            <div
              className='searchButton'
              onClick={this.getKitten}
              title='Search the Kitten'>

              <FaSearch />
            </div>

            <div
              className='searchRandom'
              onClick={this.randomKitten}
              title='Random Kitten'>

              <FaDice />
            </div>
          </div>

        </div>
      </div>
    );
  }
}

Browser.contextTypes = {
  drizzle: object,
};

export default Browser;
