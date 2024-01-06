const { parse_range } = require('./parse_range');

describe('parse range', () => {
	describe('parse range', () => {
		test('pairs notation', () => {
			expect(parse_range('QQ+')).toIncludeSameMembers(['AA', 'KK', 'QQ']);
			expect(parse_range('44+')).toIncludeSameMembers(['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44']);
			expect(parse_range('KK+')).toIncludeSameMembers(['AA', 'KK']);
			expect(parse_range('77')).toIncludeSameMembers(['77']);
		});

		test('plus notation', () => {
			expect(parse_range('Kxs')).toIncludeSameMembers(['KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s']);
			expect(parse_range('AT+')).toIncludeSameMembers(['AKo', 'AKs', 'AQo', 'AQs', 'AJo', 'AJs', 'ATo', 'ATs']);
			expect(parse_range('KQ+')).toIncludeSameMembers(['KQo', 'KQs']);
		// TODO fix
		//	expect(parse_range('[AK2]Q+')).toIncludeSameMembers(['KQo', 'KQs', 'AQo', 'AQs', 'KQo', 'KQs']);
			expect(parse_range('A2s+')).toIncludeSameMembers(['AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s']);
			expect(parse_range('QTs+')).toIncludeSameMembers(['QJs', 'QTs']);
			expect(parse_range('AJo+')).toIncludeSameMembers(['AKo', 'AQo', 'AJo']);
			expect(parse_range('T5+')).toIncludeSameMembers(['T5s', 'T5o', 'T6s', 'T6o', 'T7s', 'T7o', 'T8s', 'T8o', 'T9s', 'T9o']);
		// TODO fix
		//	expect(parse_range('[JT]5+')).toIncludeSameMembers(['T5s', 'T5o', 'T6s', 'T6o', 'T7s', 'T7o', 'T8s', 'T8o', 'T9s', 'T9o', 'J5s', 'J5o', 'J6s', 'J6o', 'J7s', 'J7o', 'J8s', 'J8o', 'J9s', 'J9o']);
		});

		test('single notation', () => {
			expect(parse_range('AKo')).toIncludeSameMembers(['AKo']);
			expect(parse_range('AQs')).toIncludeSameMembers(['AQs']);
			expect(parse_range('AJ')).toIncludeSameMembers(['AJo', 'AJs']);
		});

		test('group notation', () => {
			expect(parse_range('A[J852]')).toIncludeSameMembers(['AJs', 'AJo', 'A8s', 'A8o', 'A5s', 'A5o', 'A2s', 'A2o']);
			expect(parse_range('[AKQ][234]')).toIncludeSameMembers(['A2s', 'A2o', 'A3s', 'A3o', 'A4s', 'A4o', 'K2s', 'K2o', 'K3s', 'K3o', 'K4s', 'K4o', 'Q2s', 'Q2o', 'Q3s', 'Q3o', 'Q4s', 'Q4o']);
			expect(parse_range('[A]K')).toIncludeSameMembers(['AKs', 'AKo']);
		});

		test('caret notation', () => {
			expect(parse_range('T^')).toIncludeSameMembers(['AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'AJo', 'ATs', 'ATo', 'KQs', 'KQo', 'KJs', 'KJo', 'KTs', 'KTo', 'QJs', 'QJo', 'QTs', 'QTo', 'JTs', 'JTo']);
			expect(parse_range('5^8')).toIncludeSameMembers(['87s', '87o', '86s', '86o', '85s', '85o', '76s', '76o', '75s', '75o', '65s', '65o']);
		});

		test('minus notation', () => {
			expect(parse_range('AT-')).toIncludeSameMembers(['ATo', 'ATs', 'A9s', 'A9o', 'A8s', 'A8o', 'A7s', 'A7o', 'A6s', 'A6o', 'A5s', 'A5o', 'A4s', 'A4o', 'A3s', 'A3o', 'A2s', 'A2o']);
			expect(parse_range('54-')).toIncludeSameMembers(['54s', '54o', '53s', '53o', '52s', '52o']);
			expect(parse_range('A2s-')).toIncludeSameMembers(['A2s']);
			expect(parse_range('AJo-')).toIncludeSameMembers(['AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o']);
			expect(parse_range('T5-')).toIncludeSameMembers(['T5s', 'T5o', 'T4s', 'T4o', 'T3s', 'T3o', 'T2s', 'T2o']);
		});

		test('pound notation', () => {
			expect(parse_range('QJ#')).toIncludeSameMembers(['QJs', 'QJo', 'KQs', 'KQo', 'AKs', 'AKo']);
			expect(parse_range('J2s#')).toIncludeSameMembers(['A5s', 'K4s', 'Q3s', 'J2s']);
			expect(parse_range('98#')).toIncludeSameMembers(['98s', '98o', 'T9s', 'T9o', 'JTs', 'JTo', 'QJs', 'QJo', 'KQs', 'KQo', 'AKs', 'AKo']);
			expect(parse_range('Q4o#')).toIncludeSameMembers(['Q4o', 'K5o', 'A6o']);
			expect(parse_range('T5#')).toIncludeSameMembers(['T5s', 'T5o', 'J6s', 'J6o', 'Q7s', 'Q7o', 'K8s', 'K8o', 'A9s', 'A9o']);
		});

	 	test('twiddle notation', () => {
	 		expect(parse_range('54~')).toIncludeSameMembers(['54s', '54o', '43s', '43o', '32s', '32o']);
	 		expect(parse_range('A5s~')).toIncludeSameMembers(['A5s', 'K4s', 'Q3s', 'J2s']);
	 		expect(parse_range('98~')).toIncludeSameMembers(['98s', '98o', '87s', '87o', '76s', '76o', '65s', '65o', '54s', '54o', '43s', '43o', '32s', '32o']);
	 		expect(parse_range('T5o~')).toIncludeSameMembers(['T5o', '94o', '83o', '72o']);
	 	});
	});
});
