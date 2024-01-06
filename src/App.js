import { useState } from 'react';
import { useDebounce, useDebouncedCallback } from 'use-debounce';

import RangeEntryHolder from './RangeEntry.js';
import HandSquare from './HandSquare.js';

function App () {
	const [range_texts, set_range_texts] = useState([{text: '', id: 0, color: undefined}]);
	const debounce_set_range_texts = useDebouncedCallback(set_range_texts, 500);
	
	return <div id="app">
		<RangeEntryHolder range_texts={range_texts} set_range_texts={debounce_set_range_texts}/>
		<HandSquare hand_clicked={hand_clicked} ranges={range_texts} />
	</div>;

	function hand_clicked (hand_text, should_remove) {
		const new_ranges = structuredClone(range_texts);
		
		const range_text = new_ranges[0].text;
		const fun = should_remove ? remove_hand_from_range : add_hand_to_range;
		const new_range_text = fun(range_text, hand_text);
		new_ranges[0].text = new_range_text;

		set_range_texts(new_ranges);
	}
}

function remove_hand_from_range (range_text, hand) {
	return range_text
		.split(',')
		.map(e => e.trim())
		.filter(e => e !== hand)
		.join(', ');
}

function add_hand_to_range (range_text, hand) {
	if (range_text.length === 0) {
		return hand;
	} else {
		return range_text + ', ' + hand
	}
}


export default App;