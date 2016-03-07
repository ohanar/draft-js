/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+ui_infra
 */

'use strict';

jest
  .autoMockOff()

const BlockMapBuilder = require('BlockMapBuilder');
const Block = require('Block');

const TREE = {
  key: 'root',
  children: [
    {key: 'a'},
    {key: 'b',
     children: [
       {key: 'c',
        children: [{key: 'd'}]},
       {key: 'e'},
     ]},
    {key: 'f',
     children: [
       {key: 'g'},
       {key: 'h'},
     ]},
  ]
};

describe('Block', () => {
  function getBlocks(blocks) {
    return blocks.map(blockConfig => getSample(blockConfig));
  }

  function getSample(blockConfig) {
    if (blockConfig.children) {
      const children = getBlocks(blockConfig.children);
      blockConfig = {
        key: blockConfig.key,
        children: BlockMapBuilder.createFromArray(children),
      };
    }
    return new Block(blockConfig);
  }

  describe('creation and retrieval', () => {
    it('must create a new instance', () => {
      const tree = getSample(TREE);
      expect(tree instanceof Block).toBe(true);
    });
  });

  describe('child fetching', () => {
    it('must succeed or fail properly', () => {
      const tree = getSample(TREE);
      const firstKey = TREE.children[0].key;
      const secondKey = TREE.children[1].key;
      const thirdKey = TREE.children[2].key;

      const firstChild = tree.getChild(firstKey);
      const secondChild = tree.getChild(secondKey);
      const thirdChild = tree.getChild(thirdKey);

      expect(firstChild instanceof Block).toBe(true);
      expect(secondChild instanceof Block).toBe(true);
      expect(thirdChild instanceof Block).toBe(true);

      expect(tree.getChildBefore(firstKey)).toBe(undefined);
      expect(tree.getChildBefore(secondKey)).toBe(firstChild);
      expect(tree.getChildBefore(thirdKey)).toBe(secondChild);

      expect(tree.getChildAfter(firstKey)).toBe(secondChild);
      expect(tree.getChildAfter(secondKey)).toBe(thirdChild);
      expect(tree.getChildAfter(thirdKey)).toBe(undefined);
    });
  });

  describe('descendant fetching', () => {
    it('must succeed or fail properly', () => {
      const tree = getSample(TREE);
      const firstKey = TREE.children[0].key;
      const secondKey = TREE.children[1].key;
      const thirdKey = TREE.children[2].key;
      const deepKey = TREE.children[1].children[1].key;

      const firstChild = tree.getDescendant(firstKey);
      const secondChild = tree.getDescendant(secondKey);
      const thirdChild = tree.getDescendant(thirdKey);
      const descendant = tree.getDescendant(deepKey);

      expect(firstChild instanceof Block).toBe(true);
      expect(secondChild instanceof Block).toBe(true);
      expect(thirdChild instanceof Block).toBe(true);
      expect(descendant instanceof Block).toBe(true);

      expect(tree.getDescendantBefore(tree.getKey())).toBe(undefined);
      expect(tree.getDescendantBefore(firstKey)).toBe(tree);
      expect(tree.getDescendantBefore(secondKey)).toBe(firstChild);
      expect(tree.getDescendantBefore(deepKey)).toBe(tree.getDescendant('d'));
      expect(tree.getDescendantBefore(thirdKey)).toBe(descendant);

      expect(tree.getDescendantAfter(tree.getKey())).toBe(firstChild);
      expect(tree.getDescendantAfter(firstKey)).toBe(secondChild);
      expect(tree.getDescendantAfter(secondKey)).toBe(tree.getDescendant('c'));
      expect(tree.getDescendantAfter(deepKey)).toBe(thirdChild);
      expect(tree.getDescendantAfter(thirdKey)).toBe(tree.getDescendant('g'));
    });
  });
});
