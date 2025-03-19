import React, { Component } from 'react';
import './tess.css'
class Test extends Component {
    constructor(props) {
        super(props);
        this.state = { cards: [] }
    }

    fetchData = async (name) => {
        try {
            const response = await fetch('http://localhost:5000/test/' + name + '/' + this.state.offset, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const data = await response.json();
            this.setState({ cards: data })
            console.log(data)
        } catch (error) {
            console.log(error);
        }
    }
    
    componentDidMount() {
        this.state.searchQuery = 'RANDOMPLSDONOTGUESSPLS'
        this.state.offset = 0
        this.fetchData();
    }
    handleInputChange = (event) => {
        this.setState({ searchQuery: event.target.value })
        console.log(this.state.searchQuery)
        this.onchange(event.target)

    }
    _handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            this.setState({ searchQuery: e.target.value })
            this.fetchData(this.state.searchQuery)
        }
    }
    next = () => {
        this.state.offset = this.state.offset + 17
        this.fetchData(this.state.searchQuery)
        window.scrollTo(0, 0)
    }
    before = () => {
        this.state.offset = this.state.offset - 17
        this.fetchData(this.state.searchQuery)
        window.scrollTo(0, 0)

    }
    reset = () => {
        this.state.searchQuery = 'RANDOMPLSDONOTGUESSPLS'
        this.fetchData('RANDOMPLSDONOTGUESSPLS')
        this.state.field = ''
        this.state.offset = 0
    }
    onchange(e){
        this.state.field = e.target
    }
    render() {
        return (
            <div>
                <input onChange={this.handleInputChange} onKeyDown={this._handleKeyDown} value={this.state.field} type="text" placeholder="Search.."></input>
                <button onClick={this.reset}>reset</button>
                <div class="card">
                    {this.state.cards.length > 0 ? (
                        this.state.cards.map(item => (
                            <img css="width=50px" src={'http://localhost:5000/cardart/' + item}></img>
                        ))
                    ) : (
                        <h2><a>Nothing matching these description</a></h2>

                    )}
                </div>

                {this.state.offset > 0 ? (
                    <button onClick={this.before} >Previous</button>
                ) : (
                    <button onClick={this.before} disabled >Previous</button>

                )}


                {this.state.cards.length < 16 ? (
                    <button onClick={this.next} disabled>Next</button>
                ) : (
                    <button onClick={this.next}  >Next</button>

                )}

            </div>
        );
    }
}
export default Test