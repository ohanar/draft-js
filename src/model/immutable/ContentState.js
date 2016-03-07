/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ContentState
 * @typechecks
 * @flow
 */

'use strict';

const BlockMapBuilder = require('BlockMapBuilder');
const CharacterMetadata = require('CharacterMetadata');
const Block = require('Block');
const ContentBlock = require('ContentBlock');
const {List, Record, Repeat} = require('immutable');
const SelectionState = require('SelectionState');

const generateRandomKey = require('generateRandomKey');
const sanitizeDraftText = require('sanitizeDraftText');

import type {BlockMap} from 'BlockMap';

const defaultRecord: {
  rootBlock: Block;
  selectionBefore: ?SelectionState;
  selectionAfter: ?SelectionState;
} = {
  rootBlock: new Block(),
  selectionBefore: null,
  selectionAfter: null,
};

const ContentStateRecord = Record(defaultRecord);

export default class ContentState extends ContentStateRecord {
  getRootBlock(): Block {
    return this.get('rootBlock');
  }

  getBlockMap(): BlockMap {
    return this.getRootBlock().getChildren();
  }

  getSelectionBefore(): SelectionState {
    return this.get('selectionBefore');
  }

  getSelectionAfter(): SelectionState {
    return this.get('selectionAfter');
  }

  // TODO: decide what to do with the following 7
  // functions -- their functionality has been put into
  // the block class
  getBlockForKey(key: string): Block {
    return this.getRootBlock().getChild(key);
  }

  getKeyAfter(key: string): ?string {
    const block = this.getBlockAfter(key);
    if (block) {
      return block.getKey();
    }
  }

  getKeyBefore(key: string): ?string {
    const block = this.getBlockBefore(key);
    if (block) {
      return block.getKey();
    }
  }

  getBlockAfter(key: string): ?ContentBlock {
    return this.getRootBlock().getChildAfter(key);
  }

  getBlockBefore(key: string): ?ContentBlock {
    return this.getRootBlock().getChildBefore(key);
  }

  getBlocksAsArray(): Array<ContentBlock> {
    return this.getRootBlock().getChildrenAsArray();
  }

  getLastBlock(): ContentBlock {
    return this.getRootBlock().getLastChild();
  }

  // TODO: figure out some way to make this work
  // when not all block's are text
  getPlainText(delimiter?: string): string {
    return this.getBlockMap()
      .map(block => {
        return block ? block.getText() : '';
      })
      .join(delimiter || '\n');
  }

  // TODO: remove once there are no more dependences
  // on the old structure
  set(key: string, value: mixed): ContentState {
    switch (key) {
      case 'blockMap':
        return this.setIn(['rootBlock', 'children'], value);
      default:
        return super.set(key, value);
    }
  }

  // TODO: figure out some way to make this work
  // when not all block's are tex
  // (maybe have something like an isEmpty? method)
  hasText(): boolean {
    var blockMap = this.getBlockMap();
    return (
      blockMap.size > 1 ||
      blockMap.first().getLength() > 0
    );
  }

  static createFromBlockArray(
    blocks: Array<Block>
  ): ContentState {
    const blockMap = BlockMapBuilder.createFromArray(blocks);
    const selectionState = SelectionState.createEmpty(blockMap.first().getKey());
    const rootBlock = new Block({
      key: generateRandomKey(),
      type: 'plain-container',
      children: blockMap,
    });
    return new ContentState({
      rootBlock,
      selectionBefore: selectionState,
      selectionAfter: selectionState,
    });
  }

  static createFromText(
    text: string,
    delimiter: string | RegExp = /\r\n?|\n/g,
  ): ContentState {
    const strings = text.split(delimiter);
    const blocks = strings.map(
      block => {
        block = sanitizeDraftText(block);
        return new ContentBlock({
          key: generateRandomKey(),
          text: block,
          type: 'unstyled',
          characterList: List(Repeat(CharacterMetadata.EMPTY, block.length)),
        });
      }
    );
    return ContentState.createFromBlockArray(blocks);
  }
}
