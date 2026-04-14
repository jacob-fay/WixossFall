import React, { Component } from 'react';
import './CardBrowser.css';
import { CardDatabase } from './models/CardDatabase';
import { SearchEngine } from './models/SearchEngine';

const PAGE_SIZE = 16;

class CardItem extends Component {
    constructor(props) {
        super(props);
        this.state = { triedFallback: false };
    }

    handleError = (e) => {
        if (!this.state.triedFallback) {
            const fallback = CardDatabase.resolveExternalImageUrl(this.props.imageName);
            this.setState({ triedFallback: true });
            e.target.src = fallback;
        }
    }

    render() {
        const { imageName, name } = this.props;
        const src = CardDatabase.resolveLocalImageUrl(imageName);
        return (
            <div className="card-item">
                <img
                    src={src}
                    alt={name}
                    onError={this.handleError}
                />
                <div className="card-item-name">{name}</div>
            </div>
        );
    }
}

class MainPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cards: [],
            allCards: [],
            searchQuery: '',
            field: '',
            offset: 0,
            totalResults: 0,
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
        const results = query ? SearchEngine.search(query, allCards) : allCards;
        const page = results.slice(offset, offset + PAGE_SIZE);
        this.setState({ cards: page, offset, totalResults: results.length });
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
        const { cards, offset, totalResults, loading, error, field } = this.state;
        const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
        const totalPages = Math.ceil(totalResults / PAGE_SIZE);

        if (loading) {
            return (
                <div className="page">
                    <header className="header">
                        <div>
                            <h1 className="header-title">WIXOSS <span>Fall</span></h1>
                            <p className="header-subtitle">CARD DATABASE</p>
                        </div>
                    </header>
                    <div className="status-message">
                        <span className="status-icon">⟳</span>
                        Loading card database…
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="page">
                    <header className="header">
                        <div>
                            <h1 className="header-title">WIXOSS <span>Fall</span></h1>
                            <p className="header-subtitle">CARD DATABASE</p>
                        </div>
                    </header>
                    <div className="status-message">
                        <span className="status-icon">✕</span>
                        Error loading cards: {error}
                    </div>
                </div>
            );
        }

        return (
            <div className="page">
                <header className="header">
                    <div>
                        <h1 className="header-title">WIXOSS <span>Fall</span></h1>
                        <p className="header-subtitle">CARD DATABASE</p>
                    </div>
                    <div style={{ color: '#6060a0', fontSize: '0.8rem' }}>
                        {totalResults.toLocaleString()} card{totalResults !== 1 ? 's' : ''}
                    </div>
                </header>

                <div className="search-bar">
                    <input
                        className="search-input"
                        onChange={this.handleInputChange}
                        onKeyDown={this._handleKeyDown}
                        value={field}
                        type="text"
                        placeholder="Search cards… (press Enter)"
                    />
                    <button className="btn btn-secondary" onClick={this.reset}>Reset</button>
                </div>
                <p className="search-hint">
                    Filters: type: · class: · level: · text: · color: · power&gt; · power&lt; · power= · level&gt; · level&lt; · has:lifeburst · is:dissona &nbsp;|&nbsp; Operators: <code>and</code> · <code>or</code> · <code>-</code> (not) · <code>( )</code> grouping
                </p>

                {cards.length > 0 ? (
                    <div className="card-grid">
                        {cards.map((card, i) => (
                            <CardItem
                                key={card.image + i}
                                imageName={card.image}
                                name={card.name}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="status-message">
                        <span className="status-icon">🔍</span>
                        No cards match your search.
                    </div>
                )}

                <div className="pagination">
                    <button
                        className="btn btn-secondary"
                        onClick={this.before}
                        disabled={offset <= 0}
                    >
                        ← Previous
                    </button>
                    {totalPages > 0 && (
                        <span className="pagination-info">
                            Page {currentPage} of {totalPages}
                        </span>
                    )}
                    <button
                        className="btn btn-primary"
                        onClick={this.next}
                        disabled={cards.length < PAGE_SIZE}
                    >
                        Next →
                    </button>
                </div>
            </div>
        );
    }
}

export default MainPage;

