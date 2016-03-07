/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule BlockMapBuilder
 * @flow
 */

'use strict';

const {OrderedMap} = require('immutable');

import type {BlockMap} from 'BlockMap';
import type Block from 'Block';


export function createFromArray(
  blocks: Array<Block>
): BlockMap {
  return OrderedMap(
    blocks.map(
      block => [block.getKey(), block]
    )
  );
}
