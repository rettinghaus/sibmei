'use strict';

const assert = require('assert');
const xpath = require('fontoxpath');
const utils = require('./utils');


function getTuplets(section, fromBar, toBar, fromStaff, toStaff) {
  return xpath.evaluateXPath(
    `*:measure[position()>=${fromBar} and position()=>${toBar}]/*:staff[${fromStaff}]//*:tuplet`,
    section
  );
}


describe('Tuplets', function() {
  const mei = utils.getTestMeiDom('tuplets.mei');
  const section = xpath.evaluateXPathToFirstNode('//*:section[1]', mei);


  describe('Numbers', function() {
    const staffElements = xpath.evaluateXPath('*:measure[position() < 3]/*:staff', section);
    const tupletsByStaff = staffElements.map(bar => xpath.evaluateXPath(
      './/*[self::*:tuplet or self::*:tupletSpan]', bar
    ));

    it('handles number display', function(){
      for (const tuplets of tupletsByStaff) {
        utils.assertAttrOnElements(tuplets, [0], 'num.visible', 'false');
        utils.assertAttrOnElements(tuplets, [1, 2, 3], 'num.visible', null);
        utils.assertAttrOnElements(tuplets, [1], 'num.format', 'count');
        utils.assertAttrOnElements(tuplets, [2, 3], 'num.format', 'ratio');
      }
    });
  });

  describe('Brackets', function(){
    // Look at the first two bars
    const tupletsByStaff = [];
    for (var i = 1; i <= 3; i++) {
      tupletsByStaff.push(xpath.evaluateXPath(
        `*:measure[position() < 3]/*:staff[${i}]//*[self::*:tuplet or self::*:tupletSpan]`, section
      ));
    }

    it('exports all tuplets', function(){
      for (const tupletsOnStaff of tupletsByStaff) {
        assert.equal(tupletsOnStaff.length, 8, 'export all tuplets');
      }
    });

    it('handles unknown bracket state', function() {
      // TODO: Reverse engineering the bracket visibility for automatic brackets
      // should not be too complicated. It should only depend on if there is a
      // beam that spans precisely the same notes as the tuplet.
      for (const tuplet of tupletsByStaff[0]){
        assert.ok(!tuplet.hasAttribute('bracket.visible'), tuplet.outerHTML);
      }
    });

    it('handles invisible bracket state', function() {
      for (const tuplet of tupletsByStaff[1]) {
        assert.equal(tuplet.getAttribute('bracket.visible'), 'false', tuplet.outerHTML);
      }
    });

    it('handles visible bracket state', function() {
      for (const tuplet of tupletsByStaff[2]){
        assert.equal(tuplet.getAttribute('bracket.visible'), 'true', tuplet.outerHTML);
      }
    });
  });
});
