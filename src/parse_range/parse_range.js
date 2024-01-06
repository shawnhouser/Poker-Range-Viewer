// Inspiration for notation started with
// https://betandbeat.com/poker/terminology/hand-range-notation/

const { parse_tokens } = require('./parse_tokens.js')

const CARD_RANKS = ['A', 'K', 'Q', 'J', 'T', 9, 8, 7, 6, 5, 4, 3, 2].map(e => e.toString())

function parse_range (text) {
	return text
		.split(',')
		.map(e => e.replace(/\s/g, '').split(''))
		.map(e => parse_single_range(e))
		.flat()
		.filter(e => e)
		.map(e => organize_hand(e))
		.filter(remove_duplicates)
		.sort(sort_poker_hands);
}

function parse_single_range (tokens) {
	const hand = tokens.join('');
	
	// Only do complex parsing if required
	if ((/^[AKQJT98765432][AKQJT98765432][so]?(\[\d+\.?\d*%\])?$/).test(hand)) {
		return hand;
	} else {
		return evaluate_tree(parse_tokens(tokens).subtrees[0].subtrees[0]);
	}
}

function evaluate_tree (graph) {
	const map = {
		'SimpleRange': evaluate_simple_range,
		'PlusRange': evaluate_plus_range,
		'MinusRange': evaluate_minus_range,
		'DashRange': evaluate_dash_range,
		'CaretRange': evaluate_caret_range,
		'PoundRange': evaluate_pound_range,
		'TwiddleRange': evaluate_twiddle_range,
	}[graph.root] || (() => []);

	return map(graph);
}

function evaluate_modifier (modifier) {
	if (modifier === undefined) {
		return '';
	} else if (modifier.root !== 'Modifier') {
		return ''
	} else {
		return modifier.subtrees[0].root;
	}
}

function apply_modifier (cards, modifier) {
	if (modifier === 's') {
		return apply_suited(cards);
	} else if (modifier === 'o') {
		return apply_off_suit(cards);
	} else {
		return []
			.concat(apply_suited(cards))
			.concat(apply_off_suit(cards));
	}

	function apply_suited (cards) {
		return cards.map(e => e + 's')
	}

	function apply_off_suit (cards) {
		return cards.map(e => e + 'o')
	}
}

function evaluate_simple_range (graph) {
	const set_1 = evaluate_card_list(graph.subtrees[0]);
	const set_2 = evaluate_card_list(graph.subtrees[1]);
	const modifier = evaluate_modifier(graph.subtrees[2]);
	const cards = cartesian(set_1, set_2).map(e => e.join(''));

	return apply_modifier(cards, modifier);
}

// TOOD if first card is x
function evaluate_plus_range (graph) {
	const raw_lower = graph.subtrees[1].subtrees[0].root;
	const lower = raw_lower === 'x' ? '2' : raw_lower;
	const uppers = evaluate_card_list(graph.subtrees[0]);
	const modifier = evaluate_modifier(graph.subtrees[2]);
	const cards = uppers
		.map(upper => {
			if (upper === lower) {
				return generate_pair_range('A', lower);
			} else {
				return get_card_range(upper, lower).slice(1).map(e => upper + e)
			}
		})
		.flat();

	return apply_modifier(cards, modifier);
}

function evaluate_minus_range (graph) {
	const lower = graph.subtrees[1].subtrees[0].root;
	const uppers = evaluate_card_list(graph.subtrees[0]);
	const modifier = evaluate_modifier(graph.subtrees[2]);
	const cards = uppers
		.map(upper => {
			if (upper === lower) {
				return generate_pair_range(upper, '2');
			} else {
				return get_card_range(lower, '2').map(e => upper + e)
			}
		})
		.flat();

	return apply_modifier(cards, modifier);
}

function evaluate_dash_range (graph) {
	// TODO
	return [];
}

function evaluate_caret_range (graph) {
	const upper_index = graph.subtrees[2]?.root === 'Card' ? 2 : -1;
	const modifier = evaluate_modifier(graph.subtrees[2]);

	const lower = graph.subtrees[0].subtrees[0].root;
	const upper = graph.subtrees[upper_index]?.subtrees?.[0]?.root ?? 'A';
	
	const included = get_card_range(upper, lower);
	const cards = cartesian(included, included)
		.filter(e => e[0] !== e[1])
		.map(e => e.join(''));

	return apply_modifier(cards, modifier);
}

function evaluate_pound_range (graph) {
	const uppers = evaluate_card_list(graph.subtrees[0]);
	const lower = graph.subtrees[1].subtrees[0].root;
	const modifier = evaluate_modifier(graph.subtrees[2]);

	const cards = uppers
		.map(upper => generate_diagonal(upper, lower, true))
		.flat();

	return apply_modifier(cards, modifier);
}

function evaluate_twiddle_range (graph) {
	const uppers = evaluate_card_list(graph.subtrees[0]);
	const lower = graph.subtrees[1].subtrees[0].root;
	const modifier = evaluate_modifier(graph.subtrees[2]);
	const cards = uppers
		.map(upper => generate_diagonal(upper, lower, false))
		.flat();

	return apply_modifier(cards, modifier);
}

function evaluate_card_list (card_list) {
	const subtree = card_list.subtrees;
	if (subtree.length === 3) {
		// In the version with the braces. Strip and retry
		return evaluate_card_list(subtree[1]);
	} else if (subtree.length === 2) {
		// Card CardList. Extract and recurse
		const this_card = subtree[0].subtrees[0].root;
		const other_cards = evaluate_card_list(subtree[1]);
		return [this_card].concat(other_cards);
	} else if (subtree.length === 1) {
		// Only one card, extract and return
		const this_card = subtree[0].subtrees[0].root;
		return [this_card];
	}
}

function generate_diagonal (upper_start, lower_start, works_up_ranks) {
	let upper_index = CARD_RANKS.findIndex(e => e === upper_start);
	let lower_index = CARD_RANKS.findIndex(e => e === lower_start)

	const valid_pairs = [];
	while (0 <= upper_index && upper_index < CARD_RANKS.length && 0 <= lower_index && lower_index < CARD_RANKS.length) {
		valid_pairs.push(CARD_RANKS[upper_index] + CARD_RANKS[lower_index]);
		if (works_up_ranks) {
			upper_index -= 1;
			lower_index -= 1;
		} else {
			upper_index += 1;
			lower_index += 1;
		}
	}

	return valid_pairs;
}

function generate_pair_range (upper, lower) {
	return get_card_range(upper, lower).map(e => e + e);
}

function get_card_range (upper, lower) {
	const start = CARD_RANKS.findIndex(e => e === upper);
	const end = CARD_RANKS.findIndex(e => e === lower) + 1;
	const included = CARD_RANKS.slice(start, end);
	return included;
}

// https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
function cartesian (...a) {
	return a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
}

function organize_hand (hand) {
	const modifier = (() => {
		if (hand.charAt(0) === hand.charAt(1)) {
			return '';
		} else if (hand.includes('s')) {
			return 's';
		} else if (hand.includes('o')) {
			return 'o';
		} else {
			return '';
		}
	})();

	return hand
		.split('')
		.slice(0, 2)
		.sort(sort_single_cards)
		.join('') +
		modifier;
}

function sort_single_cards (a, b) {
	const a_index = CARD_RANKS.findIndex(e => e === a);
	const b_index = CARD_RANKS.findIndex(e => e === b);
	return a_index - b_index;
}

function sort_poker_hands (a, b) {
	const cards_in_a = a.split('');
	const cards_in_b = b.split('');

	const a1_index = CARD_RANKS.findIndex(e => e === cards_in_a[0]);
	const b1_index = CARD_RANKS.findIndex(e => e === cards_in_b[0]);
	const first_difference = a1_index - b1_index;
	if (first_difference !== 0) {
		return first_difference;
	}

	const a2_index = CARD_RANKS.findIndex(e => e === cards_in_a[1]);
	const b2_index = CARD_RANKS.findIndex(e => e === cards_in_b[1]);
	const second_difference = a2_index - b2_index;
	if (second_difference !== 0) {
		return second_difference;
	}

	if (cards_in_a[2] === 's' && cards_in_b[2] === 'o') {
		return -1;
	} else if (cards_in_a[2] === 'o' && cards_in_b[2] === 's') {
		return 1;
	} else {
		return 0;
	}
}

function remove_duplicates (e, i, a) {
	return a.findIndex(p => p === e) === i;
}

module.exports = {
	parse_range
};