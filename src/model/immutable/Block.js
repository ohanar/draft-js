/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Block
 * @typechecks
 * @flow
 */
'use strict';

const {
  List,
  OrderedMap,
  Record,
  Repeat,
  Stack,
} = require('immutable');
import type {Seq} from 'immutable';

const defaultRecord: {
  key: string;
  type: string;
  children: OrderedMap<string, mixed>; /* BlockMap */
  data: ?Record;
} = {
  key: '',
  type: '',
  children: new OrderedMap(),
  data: null,
};

const BlockRecord = Record(defaultRecord);

export default class Block extends BlockRecord {
  getKey(): string {
    return this.get('key');
  }

  getType(): string {
    return this.get('type');
  }

  getData(): mixed {
    return this.get('data');
  }

  getChildren(): OrderedMap<string, Block> {
    return this.get('children');
  }

  getNumChildren(): number {
    return this.getChildren().size;
  }

  getChild(key: string): Block {
    return this.getChildren().get(key);
  }

  getChildrenAsArray(): Array<Block> {
    return this.getChildren().toArray();
  }

  getFirstChild(): ?Block {
    return this.getChildren().first();
  }

  getLastChild(): ?Block {
    return this.getChildren().last();
  }

  getChildAfter(key: string): ?Block {
    return this
      .getChildren()
      .skipUntil((_, k) => k === key)
      .skip(1)
      .first();
  }

  getChildBefore(key: string): ?Block {
    return this
      .getChildren()
      .reverse()
      .skipUntil((_, k) => k === key)
      .skip(1)
      .first();
  }

  isLeaf(): boolean {
    return this.getNumChildren() === 0;
  }

  getPathToDescendant(key: string): ?List<Block> {
    const pathStart = Stack([this]);
    if (this.getKey() === key) {
      return List(pathStart);
    }

    /* we do a breadth first search because we can
     * exploit fast map lookups to short circuit blocks
     * with many children (which we frequently expect)
     */
    let queue = Repeat(pathStart, 1);

    while (!queue.isEmpty()) {
      const currentPath = queue.first();
      const current = currentPath.peek();

      const child = current.getChild(key);
      if (child) {
        return List(currentPath.push(child)).reverse();
      }

      queue = queue
        .rest()
        .concat(current
                  .getChildren()
                  .map(v => currentPath.push(v)));
    }
  }

  getDescendant(key: string): ?Block {
    const path = this.getPathToDescendant(key);
    if (path) {
      return path.last();
    }
  }

  getNumDescendants(): number {
    return this.getChildren().reduce((r, v) => r + v.getNumDescendants(), 1);
  }

  getDescendantAfter(key: string): ?Block {
    const path = this.getPathToDescendant(key);
    if (path) {
      let block = path.last();
      if (!block.isLeaf()) {
        return block.getFirstChild();
      }

      if (block !== this) {
        let i = -2;
        let parent = path.get(i);
        let last = parent.getLastChild();

        while (last === block && i > -path.size) {
          [parent, block] = [path.get(--i), parent];
          last = parent.getLastChild();
        }

        if (last !== block) {
          return parent.getChildAfter(block.getKey());
        }
      }
    }
  }

  getDescendantBefore(key: string): ?Block {
    const path = this.getPathToDescendant(key);
    if (path) {
      const block = path.last();
      if (block !== this) {
        const parent = path.get(-2);

        if (parent.getFirstChild() === block) {
          return parent;
        }

        return parent
          .getChildBefore(block.getKey())
          .traverseDescendants(true)
          .first();
      }
    }
  }

  traverseDescendants(reverse = false: bool): Seq<Block> {
    if (reverse) {
      return this
        .getChildren()
        .reverse()
        .valueSeq()
        .flatMap(v => v.traverseDescendants(reverse))
        .concat(Repeat(this, 1));
    } else {
      return Repeat(this, 1)
        .concat(this
                 .getChildren()
                 .valueSeq()
                 .flatMap(v => v.traverseDescendants(reverse)));
    }
  }

  traverseDescendantKeys(reverse = false: bool): Seq<string> {
    return this.traverseDescendants(reverse).map(v => v.getKey());
  }
}
