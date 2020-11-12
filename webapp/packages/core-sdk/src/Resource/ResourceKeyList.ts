/*
 * cloudbeaver - Cloud Database Manager
 * Copyright (C) 2020 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

export type ResourceKey<TKey> = TKey | ResourceKeyList<TKey>;
export type SingleResourceKey<T> = Exclude<T, Exclude<T, ResourceKeyList<any>>> extends ResourceKeyList<infer TKey>
  ? TKey
  : T;

export class ResourceKeyList<TKey> {
  readonly list: TKey[];

  constructor(list: TKey[] | TKey) {
    this.list = Array.isArray(list) ? list : [list];
  }

  includes(key: ResourceKeyList<TKey> | TKey): boolean {
    if (isResourceKeyList(key)) {
      return key.list.some(key => this.list.includes(key));
    }
    return this.list.includes(key);
  }
}

interface ForeachFnc {
  <TKey>(key: ResourceKey<TKey>, action: (key: TKey, index: number) => any): any;
  <TKey>(key: ResourceKey<TKey>, action: (key: TKey, index: number) => Promise<any>): Promise<any>;
}

interface MapFnc {
  <TKey, TValue>(key: ResourceKeyList<TKey>, selector: (key: TKey, index: number) => TValue): TValue[];
  <TKey, TValue>(
    key: ResourceKey<TKey>,
    selector: (key: TKey, index: number) => TValue
  ): TKey extends ResourceKeyList<any> ? TValue[] : TValue;
}

export interface ResourceKeyUtils {
  forEach: ForeachFnc;
  some: <TKey>(key: ResourceKey<TKey>, predicate: (key: TKey, index: number) => boolean) => boolean;
  every: <TKey>(key: ResourceKey<TKey>, predicate: (key: TKey, index: number) => boolean) => boolean;
  map: MapFnc;
  includes: <TKey>(first: ResourceKey<TKey>, second: ResourceKey<TKey>) => boolean;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ResourceKeyUtils: ResourceKeyUtils = {
  async forEach<TKey>(
    key: ResourceKey<TKey>,
    action: (key: TKey, index: number) => any | Promise<any>
  ): Promise<void> {
    if (isResourceKeyList(key)) {
      for (let i = 0; i < key.list.length; i++) {
        await action(key.list[i], i);
      }
    } else {
      await action(key, -1);
    }
  },

  some<TKey>(key: ResourceKey<TKey>, predicate: (key: TKey, index: number) => boolean): boolean {
    if (isResourceKeyList(key)) {
      return key.list.some(predicate);
    } else {
      return predicate(key, -1);
    }
  },

  every<TKey>(key: ResourceKey<TKey>, predicate: (key: TKey, index: number) => boolean): boolean {
    if (isResourceKeyList(key)) {
      return key.list.every(predicate);
    } else {
      return predicate(key, -1);
    }
  },

  map<TKey, TValue>(key: ResourceKey<TKey>, selector: (key: TKey, index: number) => TValue): TValue | TValue[] {
    if (isResourceKeyList(key)) {
      return key.list.map(selector);
    } else {
      return selector(key, -1);
    }
  },

  includes<TKey>(param: ResourceKey<TKey>, key: ResourceKey<TKey>): boolean {
    if (isResourceKeyList(param)) {
      return param.includes(key);
    }

    if (isResourceKeyList(key)) {
      return key.includes(param);
    }

    return param === key;
  },
};

export function isResourceKeyList<T>(data: any): data is ResourceKeyList<T> {
  return data instanceof ResourceKeyList;
}

export function resourceKeyList<T>(list: T[]): ResourceKeyList<T> {
  return new ResourceKeyList(list);
}
