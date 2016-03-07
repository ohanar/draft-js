/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ContentBlock
 * @typechecks
 * @flow
 */

'use strict';
const RichTextBlock = require('RichTextBlock');

export default class ContentBlock extends RichTextBlock {
  constructor(obj) {
    const {type, text, depth, characterList} = {type: 'unstyled', ...obj};
    const data = {text, depth, characterList};
    if (!text) {
      delete data.text;
    }
    if (!depth) {
      delete data.depth;
    }
    if (!characterList) {
      delete data.characterList;
    }
    super({...obj, type, data});
  }

  set(key: string, value: mixed): ContentBlock {
    switch (key) {
      case 'text':
      case 'characterList':
      case 'depth':
        return this.setIn(['data', key], value);
      default:
        return super.set(key, value);
    }
  }

  getDepth(): number {
    return this.getData().get('depth');
  }
}
