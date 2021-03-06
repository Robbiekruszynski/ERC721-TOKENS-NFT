import React, { Component } from "react";
import Web3 from "web3";
import Loot from "../abis/Loot.json";
import "./App.css";
import { Switch, Route } from "react-router-dom";

class Mint extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert("non-eth browser dected. GET TO DA METAMASK!");
    }
  }
  async loadBlockchainData() {
    const web3 = window.web3;
    // Load account
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    const networkId = await web3.eth.net.getId();
    const networkData = Loot.networks[networkId];
    console.log("pre networkdata load");
    console.log(this.state.items);

    if (networkData) {
      const abi = Loot.abi;
      const address = networkData.address;
      const contract = new web3.eth.Contract(abi, address);
      this.setState({ contract });
      const totalSupply = await contract.methods.totalSupply().call();
      this.setState({ totalSupply });

      // // Loading the  Colors
      for (var i = 1; i <= totalSupply; i++) {
        const item = await contract.methods.items(i - 1).call();
        this.setState({
          items: [...this.state.items, item]
        });
      }
    } else {
      window.alert("Smart contract not deployed to detected network.");
      console.log(this.state.items);
    }
  }

  mint = item => {
    this.state.contract.methods
      .mint(item)
      .send({ from: this.state.account })
      .once("receipt", receipt => {
        this.setState({
          items: [...this.state.items, item]
        });
      });
  };

  constructor(props) {
    super(props);
    this.state = {
      account: " ",
      contract: null,
      totalSupply: 0,
      items: []
    };
  }

  render() {
    return (
      <div>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1> Create your token</h1>
                <form
                  onSubmit={event => {
                    event.preventDefault();
                    const item = this.item.value;
                    this.mint(item);
                  }}
                >
                  <input
                    type="text"
                    className="form-control mb-1"
                    placeholder="#hex value of a color"
                    ref={input => {
                      this.item = input;
                    }}
                  />
                  <input
                    type="submit"
                    className="btn btn-block btn-primary"
                    value="MINT"
                  />
                </form>
              </div>
            </main>
          </div>
          <hr />
          <div className="row text-center">
            {this.state.items.map((item, key) => {
              return (
                <div key={key} className="col-md-3 mb-3">
                  <div
                    className="token"
                    style={{ backgroundColor: item }}
                  ></div>
                  <div>{item}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default Mint;
