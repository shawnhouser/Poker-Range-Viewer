import './HandSquare.css';
import { parse_range } from './parse_range/parse_range.js';

const CARD_RANKS = ['A', 'K', 'Q', 'J', 'T', 9, 8, 7, 6, 5, 4, 3, 2].map(e => e.toString())

function make_all_hands () {
	return CARD_RANKS
		.map(p => CARD_RANKS.map(q => [p, q]))
		.map((row, row_index) => row.map((item, item_index) => {
			if (item_index === row_index) {
				return `${item.join('')}`;
			} else if (item_index > row_index) {
				return `${item.join('')}s`
			} else {
				return `${item.reverse().join('')}o`
			}
		}))
		.flat();
}

function parse_all_ranges (ranges) {
	ranges = structuredClone(ranges);
	ranges.reverse();
	
	const hand_colors = {};
	for (const hand of make_all_hands()) {
		hand_colors[hand] = '';
	}

	for (const range of ranges) {
		const hands_in_range = (() => {
			try {
				return parse_range(range.text);
			} catch (e) {
				return [];
			}
		})();

		for (const hand of hands_in_range) {
			hand_colors[hand] = range.color;
		}
	}
	return hand_colors;
}

function HandPreview (props) {
	return <div className="hand" style={{backgroundColor: props.color}} onMouseDown={click_hand} onMouseOver={click_hand}>
		{props.text}
	</div>

	function click_hand (event) {
		if (event.buttons !== 1) {
			// Ignore this because it is not the primary button pressed
			// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
			return;
		}

		const should_delete = event.ctrlKey;
		props.hand_clicked(props.text, should_delete);
	}
}

function HandSquare (props) {
	const colors = parse_all_ranges(props.ranges);
	return <div id="hand_square">
		{make_all_hands().map((e, i) => <HandPreview hand_clicked={props.hand_clicked} text={e} color={colors[e]} key={i}/>)}
	</div>
}

export default HandSquare;
