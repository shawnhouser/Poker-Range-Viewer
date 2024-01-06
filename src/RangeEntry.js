import './RangeEntry.css'

function RangeEntry (props) {
	return <div className="range_entry">
		<input type="color" onChange={on_color_change} defaultValue={get_color_from_props()}/>
		<input type="text" onChange={on_text_change} defaultValue={props.text}/>
		<input type="button" value="X" onClick={props.deleteSelf}/>
	</div>

	function get_color_from_props () {
		const color_list = ['#F08080', '#90EE90', '#87CEFA', '#9370DB'];
		if (props.color !== undefined) {
			return props.color;
		} 
		
		const color = (() => {
			if (props.id !== undefined && props.id < color_list.length) {
				return color_list[props.id];
			} else {
				return '#' + Math.floor(Math.random() * Math.pow(16, 6))
					.toString(16)
					.padStart(6, '0')
					.toUpperCase();
			}
		})();

		setTimeout(() => props.updateSelf({color}), 1);
		return color;
	}

	function on_text_change (event) {
		event.persist()
		const carted_start = event.target.selectionStart;
		const caret_end = event.target.selectionEnd;

		event.target.value = event.target.value
			.toUpperCase()
			.replace(/S/g, 's')
			.replace(/O/g, 'o')
			.replace(/X/g, 'x');
		props.updateSelf({text: event.target.value});

		event.target.setSelectionRange(carted_start, caret_end);
	}

	function on_color_change (event) {
		props.updateSelf({color: event.target.value})
	}
}

function RangeEntryHolder (props) {
	return <div id="range_entry_holder">
		<div id="range_entry_controls">
			<button onClick={add_range_entry}>Add Range</button>
		</div>
		{props.range_texts.map(e => <RangeEntry
			{...e}
			key={e.id}
			deleteSelf={() => delete_element(e.id)}
			updateSelf={(attributes) => update_element(e.id, attributes)}
		/>)}
	</div>

	function delete_element (id) {
		// Do not remove the last element
		if (props.range_texts.length === 1) {
			return
		}
		
		props.set_range_texts(props.range_texts.filter(e => e.id !== id));
	}

	function update_element (id, attributes) {
		const new_range_texts = structuredClone(props.range_texts);
		for (const item of new_range_texts) {
			if (item.id !== id) {
				continue;
			}

			for (const attribute of Object.keys(attributes)) {
				item[attribute] = attributes[attribute];
			}
		}

		props.set_range_texts(new_range_texts);
	}

	function add_range_entry (event) {
		const max_id = props.range_texts.reduce((acc, e) => acc > e.id ? acc : e.id, 0) + 1;
		props.set_range_texts(props.range_texts.concat({text: '', id: max_id, color: undefined}));
	}

}

export default RangeEntryHolder;