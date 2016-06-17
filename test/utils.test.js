/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import utils from '../lib/core/utils.js';

describe('utils', () => {
  describe('#endsWith', () => {
    it('matches correctly -- test 1', () => {
      assert(utils.endsWith('manyTests', 'Tests'));
    });
    it('matches correctly -- test 2', () => {
      assert.notEqual(utils.endsWith('manyTests', 'wut'));
    });
  });

  describe('#signPamFromParams', () => {
    it('signs params in correct order', () => {
      let result = utils.signPamFromParams({ this: 'is', xerioz: 'ni()ce' });
      assert(result, 'this=is&xerioz=nice');
    });
  });
});
