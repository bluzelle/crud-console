const {expect} = require('chai');
const {parseLine} = require('./LineParser');

describe('LineParser', () => {
    it('should parse basic words', () => {
        expect(parseLine('alpha bravo charlie')).to.eql(['alpha','bravo','charlie']);
    });

    it('should keep quoted strings together', () => {
        expect(parseLine('alpha "here I am" bravo')).to.eql(['alpha', 'here I am', 'bravo']);
    });

    it('should work with single quotes', () => {
        expect(parseLine("alpha 'here I am' bravo")).to.eql(['alpha', 'here I am', 'bravo'])
    });

    it('should trim extra whitespace', () => {
        expect(parseLine('  a b c  ')).to.eql(['a', 'b', 'c']);
        }
    )

});