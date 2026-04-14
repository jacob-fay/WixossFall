import React, { Component } from 'react';
import './mainPage.css';
import { CardDatabase } from './models/CardDatabase';
import { SearchEngine } from './models/SearchEngine';

const PAGE_SIZE = 16;

class MainPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cards: [],
            allCards: [],
            searchQuery: '',
            field: '',
            offset: 0,
            loading: true,
            error: null,
        };
    }

    async componentDidMount() {
        try {
            const db = await CardDatabase.load();
            this.setState({ allCards: db.allCards, loading: false }, () => {
                this._applySearch('', 0);
            });
        } catch (err) {
            this.setState({ loading: false, error: err.message });
        }
    }

    _applySearch(query, offset) {
        const { allCards } = this.state;
        const results = query
            ? SearchEngine.search(query, allCards)
            : allCards;
        const page = results.slice(offset, offset + PAGE_SIZE);
        this.setState({ cards: page, offset });
    }

    handleInputChange = (event) => {
        this.setState({ field: event.target.value, searchQuery: event.target.value });
    }

    _handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value;
            this.setState({ searchQuery: query, field: query }, () => {
                this._applySearch(query, 0);
            });
        }
    }

    next = () => {
        const offset = this.state.offset + PAGE_SIZE;
        this._applySearch(this.state.searchQuery, offset);
        window.scrollTo(0, 0);
    }

    before = () => {
        const offset = Math.max(0, this.state.offset - PAGE_SIZE);
        this._applySearch(this.state.searchQuery, offset);
        window.scrollTo(0, 0);
    }

    reset = () => {
        this.setState({ searchQuery: '', field: '' }, () => {
            this._applySearch('', 0);
        });
    }

    render() {
        const { cards, offset, loading, error, field } = this.state;

        if (loading) {
            return <div><h2>Loading card database...</h2></div>;
        }

        if (error) {
            return <div><h2>Error loading cards: {error}</h2></div>;
        }

        return (
            <div>
                <input
                    onChange={this.handleInputChange}
                    onKeyDown={this._handleKeyDown}
                    value={field}
                    type="text"
                    placeholder="Search.."
                />
                <button onClick={this.reset}>reset</button>
                <div className="card">
                    {cards.length > 0 ? (
                        cards.map((card, i) => (
                            <img
                                key={card.image + i}
                                alt={card.name}
                                src={CardDatabase.resolveImageUrl(card.image)}
                            />
                        ))
                    ) : (
                        <h2>Nothing matching these description</h2>
                    )}
                </div>

                <button onClick={this.before} disabled={offset <= 0}>Previous</button>
                <button onClick={this.next} disabled={cards.length < PAGE_SIZE}>Next</button>
            </div>
        );
    }
}

export default MainPage;
