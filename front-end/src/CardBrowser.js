import React, { Component, createRef } from 'react';
import './CardBrowser.css';
import { CardDatabase } from './models/CardDatabase';
import { SearchEngine } from './models/SearchEngine';

const PAGE_SIZE = 16;
const TOOLTIP_GAP_PX = 12;
const TOOLTIP_ESTIMATED_HEIGHT_PX = 232;

const Route = {
    home: 'home',
    help: 'help',
    card: 'card',
};

function normalizeName(name) {
    if (!name) return '';
    return name.replace(/\s\([^)]*\)$/, '');
}

function formatDetailValue(value) {
    if (value === null || value === undefined) return '';
    if (value instanceof Set) return Array.from(value).join(', ');
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object' && 'colorMap' in value && 'totalCost' in value && typeof value.toString === 'function') {
        return value.toString();
    }
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

function getCardRouteId(card) {
    const image = card.image || '';
    const set = card.set || '';
    const name = card.name || '';
    return `${image}|${set}|${name}`;
}

function clampOffset(offset, total) {
    const maxStart = Math.max(0, total - PAGE_SIZE);
    return Math.max(0, Math.min(offset, maxStart));
}

function buildHomeHash(query, offset) {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (offset > 0) params.set('o', String(offset));
    const qs = params.toString();
    return `#/${qs ? '?' + qs : ''}`;
}

class CardItem extends Component {
    constructor(props) {
        super(props);
        this.state = { triedFallback: false, tooltipAbove: false };
        this.cardRef = createRef();
    }

    handleError = (e) => {
        if (!this.state.triedFallback) {
            const fallback = CardDatabase.resolveExternalImageUrl(this.props.imageName);
            this.setState({ triedFallback: true });
            e.target.src = fallback;
        }
    }

    handleMouseEnter = () => {
        const cardEl = this.cardRef.current;
        if (!cardEl) return;

        const cardRect = cardEl.getBoundingClientRect();
        const tooltipSpaceNeeded = TOOLTIP_ESTIMATED_HEIGHT_PX + TOOLTIP_GAP_PX;
        const spaceBelow = window.innerHeight - cardRect.bottom;
        const showAbove = spaceBelow < tooltipSpaceNeeded && cardRect.top > spaceBelow;

        if (showAbove !== this.state.tooltipAbove) {
            this.setState({ tooltipAbove: showAbove });
        }
    }

    handleClick = () => {
        this.props.onOpenCard(this.props.card);
    }

    render() {
        const { imageName, name, cardText } = this.props;
        const { tooltipAbove } = this.state;
        const src = CardDatabase.resolveLocalImageUrl(imageName);

        return (
            <button
                type="button"
                className="card-item"
                onClick={this.handleClick}
                onMouseEnter={this.handleMouseEnter}
                ref={this.cardRef}
                aria-label={`Open details for ${name}`}
            >
                <img
                    src={src}
                    alt={name}
                    onError={this.handleError}
                />
                <div className="card-item-name">{name}</div>
                {cardText && (
                    <div
                        className={`card-item-tooltip ${tooltipAbove ? 'card-item-tooltip-above' : ''}`}
                    >
                        {cardText}
                    </div>
                )}
            </button>
        );
    }
}

class MainPage extends Component {
    constructor(props) {
        super(props);
        const initialQuery = props.initialQuery || '';
        this.state = {
            cards: [],
            searchQuery: initialQuery,
            field: initialQuery,
            offset: 0,
            totalResults: 0,
        };
    }

    componentDidMount() {
        this._applySearch(this.props.initialQuery || '', this.props.initialOffset || 0, this.props.allCards);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.allCards !== this.props.allCards) {
            this._applySearch(this.state.searchQuery, 0, this.props.allCards);
        }
    }

    _applySearch(query, offset, sourceCards = this.props.allCards) {
        const raw = query ? SearchEngine.search(query, sourceCards) : sourceCards;
        const seen = new Map();
        for (const card of raw) {
            const name = normalizeName(card.name);
            if (!seen.has(name)) {
                seen.set(name, card);
            }
        }

        const results = Array.from(seen.values());
        const clampedOffset = clampOffset(offset, results.length);
        const page = results.slice(clampedOffset, clampedOffset + PAGE_SIZE);

        // Keep home URL in sync so the browser back button restores the search.
        window.history.replaceState(null, '', buildHomeHash(query, clampedOffset));

        this.setState({ cards: page, offset: clampedOffset, totalResults: results.length });
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
        const { cards, offset, totalResults, field } = this.state;
        const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
        const totalPages = Math.ceil(totalResults / PAGE_SIZE);

        return (
            <div className="page">
                <header className="header">
                    <div>
                        <h1 className="header-title">WIXOSS <span>Fall</span></h1>
                        <p className="header-subtitle">CARD DATABASE</p>
                    </div>
                    <div className="header-actions">
                        <button type="button" className="btn btn-secondary" onClick={this.props.onOpenHelp}>Help</button>
                        <div className="result-count">
                            {totalResults.toLocaleString()} card{totalResults !== 1 ? 's' : ''}
                        </div>
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
          

                {cards.length > 0 ? (
                    <div className="card-grid">
                        {cards.map((card, i) => (
                            <CardItem
                                key={card.image + i}
                                card={card}
                                imageName={card.image}
                                name={card.name}
                                cardText={card.textBox}
                                onOpenCard={this.props.onOpenCard}
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
                        disabled={offset + PAGE_SIZE >= totalResults}
                    >
                        Next →
                    </button>
                </div>
            </div>
        );
    }
}

function HelpPage({ onBack }) {
    return (
        <div className="page">
            <header className="header">
                <div>
                    <h1 className="header-title">WIXOSS <span>Fall</span></h1>
                    <p className="header-subtitle">SEARCH HELP</p>
                </div>
                <button type="button" className="btn btn-secondary" onClick={onBack}>← Back to Cards</button>
            </header>

            <main className="help-page">
                <section className="help-section">
                    <h2>Filter fields</h2>
                    <ul>
                        <li><code>type:</code> signi, spell, lrig, assist, piece, art</li>
                        <li><code>class:</code> SIGNI class</li>
                        <li><code>text:</code> card text</li>
                        <li><code>color:</code> white, blue, black, red, green, colorless</li>
                        <li><code>level:</code>, <code>level&gt;</code>, <code>level&lt;</code></li>
                        <li><code>power=</code>, <code>power&gt;</code>, <code>power&lt;</code> (SIGNI)</li>
                        <li><code>has:lifeburst</code> for cards with Life Burst</li>
                        <li><code>is:dissona</code> for dissona cards</li>
                        <li><code>format:</code> as, key, diva</li>
                    </ul>
                </section>

                <section className="help-section">
                    <h2>Operators</h2>
                    <ul>
                        <li>Space between terms means AND</li>
                        <li><code>and</code> and <code>or</code> are supported</li>
                        <li>Use <code>-</code> before a term for NOT (example: <code>-type:spell</code>)</li>
                        <li>Use parentheses for grouping (example: <code>(type:signi or type:lrig) color:red</code>)</li>
                        <li>Use quotes for string literal (example:  <code>"Go to the top"</code>)</li>
                    </ul>
                </section>

                <section className="help-section">
                    <h2>Examples</h2>
                    <ul>
                        <li><code>type:signi color:blue level&gt;2</code></li>
                        <li><code>text:draw and -has:lifeburst</code></li>
                        <li><code>(type:spell or type:art) format:diva</code></li>
                    </ul>
                    <p>All searches are case-insensitive.</p>
                </section>
            </main>
        </div>
    );
}

function CardDetailPage({ card, onBack }) {
    if (!card) {
        return (
            <div className="page">
                <header className="header">
                    <div>
                        <h1 className="header-title">WIXOSS <span>Fall</span></h1>
                        <p className="header-subtitle">CARD DETAILS</p>
                    </div>
                    <button type="button" className="btn btn-secondary" onClick={onBack}>← Back to Cards</button>
                </header>
                <div className="status-message">
                    <span className="status-icon">✕</span>
                    Card not found.
                </div>
            </div>
        );
    }

    const detailRows = [
        ['Name', card.name],
        ['Set', card.set],
        ['Type', card.cardType],
        ['Color', formatDetailValue(card.color)],
        ['Class', card.clas],
        ['Subtype', card.subtype],
        ['Level', card.level],
        ['Power', card.power],
        ['Limit', card.limit],
        ['Timing', card.timing],
        ['Cost', card.cost],
        ['Formats', formatDetailValue(card.formats)],
        ['Life Burst', card.lifeburst],
        ['Artist', card.artist],
        ['Text', card.textBox],
    ].filter(([, value]) => value !== null && value !== undefined && value !== '');

    return (
        <div className="page">
            <header className="header">
                <div>
                    <h1 className="header-title">WIXOSS <span>Fall</span></h1>
                    <p className="header-subtitle">CARD DETAILS</p>
                </div>
                <button type="button" className="btn btn-secondary" onClick={onBack}>← Back to Cards</button>
            </header>

            <main className="card-detail-page">
                <div className="card-detail-image-wrap">
                    <img
                        className="card-detail-image"
                        src={CardDatabase.resolveLocalImageUrl(card.image)}
                        alt={card.name}
                        onError={(e) => {
                            e.currentTarget.src = CardDatabase.resolveExternalImageUrl(card.image);
                        }}
                    />
                </div>

                <div className="card-detail-info">
                    {detailRows.map(([label, value]) => (
                        <div className="detail-row" key={label}>
                            <div className="detail-label">{label}</div>
                            <div className="detail-value">{formatDetailValue(value)}</div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

class CardBrowser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allCards: [],
            loading: true,
            error: null,
            route: { type: Route.home, cardId: '' },
        };
    }

    componentDidMount() {
        this.loadCards();
        this.syncRouteFromHash();
        window.addEventListener('hashchange', this.syncRouteFromHash);
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.syncRouteFromHash);
    }

    loadCards = async () => {
        try {
            const db = await CardDatabase.load();
            this.setState({ allCards: db.allCards, loading: false, error: null });
        } catch (err) {
            this.setState({ loading: false, error: err.message });
        }
    }

    syncRouteFromHash = () => {
        const hash = window.location.hash || '#/';
        const path = hash.startsWith('#') ? hash.slice(1) : hash;

        if (path === '/help' || path === 'help') {
            this.setState({ route: { type: Route.help, cardId: '' } });
            return;
        }

        if (path.startsWith('/card/')) {
            const cardId = decodeURIComponent(path.slice('/card/'.length));
            this.setState({ route: { type: Route.card, cardId } });
            return;
        }

        // Home page: parse optional search/pagination params (?q=...&o=...)
        const qmarkIdx = path.indexOf('?');
        const params = new URLSearchParams(qmarkIdx >= 0 ? path.slice(qmarkIdx + 1) : '');
        const query = params.get('q') || '';
        const offset = parseInt(params.get('o'), 10) || 0;
        this.setState({ route: { type: Route.home, cardId: '', query, offset } });
    }

    openHelp = () => {
        window.location.hash = '/help';
    }

    openHome = () => {
        window.history.back();
    }

    openCard = (card) => {
        const cardId = getCardRouteId(card);
        window.location.hash = `/card/${encodeURIComponent(cardId)}`;
    }

    getSelectedCard() {
        const { cardId } = this.state.route;
        return this.state.allCards.find((card) => getCardRouteId(card) === cardId);
    }

    renderStatusPage(icon, message) {
        return (
            <div className="page">
                <header className="header">
                    <div>
                        <h1 className="header-title">WIXOSS <span>Fall</span></h1>
                        <p className="header-subtitle">CARD DATABASE</p>
                    </div>
                </header>
                <div className="status-message">
                    <span className="status-icon">{icon}</span>
                    {message}
                </div>
            </div>
        );
    }

    render() {
        const { loading, error, allCards, route } = this.state;

        if (loading) {
            return this.renderStatusPage('⟳', 'Loading card database…');
        }

        if (error) {
            return this.renderStatusPage('✕', `Error loading cards: ${error}`);
        }

        if (route.type === Route.help) {
            return <HelpPage onBack={this.openHome} />;
        }

        if (route.type === Route.card) {
            return <CardDetailPage card={this.getSelectedCard()} onBack={this.openHome} />;
        }

        return <MainPage allCards={allCards} onOpenHelp={this.openHelp} onOpenCard={this.openCard}
                    initialQuery={route.query || ''} initialOffset={route.offset || 0} />;
    }
}

export default CardBrowser;
