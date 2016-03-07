/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RichTextBlock
 * @typechecks
 * @flow
 */
'use strict';

const Block = require('Block');
const {List, OrderedSet, Record} = require('immutable');
const findRangesImmutable = require('findRangesImmutable');

import type CharacterMetadata from 'CharacterMetadata';
import type {DraftInlineStyle} from 'DraftInlineStyle';

const EMPTY_SET = OrderedSet();

const defaultRecord: {
  text: string;
  characterList: List<CharacterMetadata>;
  depth: number; // to be removed
} = {
  text: '',
  characterList: List(),
  depth: 0,
};

const RichTextData = Record(defaultRecord);

export default class RichTextBlock extends Block {
  /* TODO: flow */
  constructor({data, ...rest}) {
    const {type} = {type: 'richtext', ...rest}; // to be removed
    super({...rest, type, data: new RichTextData(data)});
  }

  getText(): string {
    return this.getData().get('text');
  }

  getCharacterList(): List<CharacterMetadata> {
    return this.getData().get('characterList');
  }

  getLength(): number {
    return this.getText().length;
  }

  getInlineStyleAt(offset: number): DraftInlineStyle {
    const character = this.getCharacterList().get(offset);
    return character ? character.getStyle() : EMPTY_SET;
  }

  getEntityAt(offset: number): ?string {
    const character = this.getCharacterList().get(offset);
    return character ? character.getEntity() : null;
  }

  /**
   * Execute a callback for every contiguous range of styles within the block.
   */
  findStyleRanges(
    filterFn: (value: CharacterMetadata) => boolean,
    callback: (start: number, end: number) => void
  ): void {
    findRangesImmutable(
      this.getCharacterList(),
      haveEqualStyle,
      filterFn,
      callback
    );
  }

  /**
   * Execute a callback for every contiguous range of entities within the block.
   */
  findEntityRanges(
    filterFn: (value: CharacterMetadata) => boolean,
    callback: (start: number, end: number) => void
  ): void {
    findRangesImmutable(
      this.getCharacterList(),
      haveEqualEntity,
      filterFn,
      callback
    );
  }
}

function haveEqualStyle(
  charA: CharacterMetadata,
  charB: CharacterMetadata
): boolean {
  return charA.getStyle() === charB.getStyle();
}

function haveEqualEntity(
  charA: CharacterMetadata,
  charB: CharacterMetadata
): boolean {
  return charA.getEntity() === charB.getEntity();
}
