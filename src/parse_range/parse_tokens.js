const parser = require('./earley-parser.js');

function parse_tokens (tokens) {
	const chart = parser.parse(tokens, get_grammar(), 'Start');
	const root = chart.getFinishedRoot('Start');
	if (root === null) {
		// console.log(chart, tokens)
		throw new Error();
	}
	return root.traverse()[0];
}

function get_grammar () {
	const grammar = new parser.Grammar([
		'Start -> Hand',

		'Hand -> SimpleRange',
		'Hand -> PlusRange',
		'Hand -> MinusRange',
		'Hand -> DashRange',
		'Hand -> CaretRange',
		'Hand -> PoundRange',
		'Hand -> TwiddleRange',

		'SimpleRange -> SingleRange SingleRange',
		'SimpleRange -> SingleRange SingleRange Modifier',

		'PlusRange -> SingleRange Card pl',
		'PlusRange -> SingleRange xdot',
		'PlusRange -> SingleRange Card Modifier pl',
		'PlusRange -> SingleRange xdot Modifier',

		'MinusRange -> SingleRange Card mi',
		'MinusRange -> SingleRange Card Modifier mi',
		
		'DashRange -> Card Card da Card Card',
		'DashRange -> Card Card da Card Card Modifier',
		
		'CaretRange -> Card ca',
		'CaretRange -> Card ca Modifier',
		'CaretRange -> Card ca Card',
		'CaretRange -> Card ca Card Modifier',

		'PoundRange -> SingleRange Card pd',
		'PoundRange -> SingleRange Card Modifier pd',

		'TwiddleRange -> SingleRange Card tw',
		'TwiddleRange -> SingleRange Card Modifier tw',

		'SingleRange -> Card',
		'SingleRange -> os CardList cs',
		'CardList -> Card CardList',
		'CardList -> Card',

		'Card -> A | K | Q | J | T | 9 | 8 | 7 | 6 | 5 | 4 | 3 | 2',
		'Modifier -> s | o',

		'xdot -> x',
		'os -> [',
		'cs -> ]',
		'ca -> ^',
		'mi -> -',
		'pl -> +',
		'pd -> #',
		'tw -> ~'
	]);

	grammar.terminalSymbols = (token) => {
		const value = {

		}[token];

		return [value || 'word'];
	};

	return grammar;
}

module.exports = {
	parse_tokens
}
