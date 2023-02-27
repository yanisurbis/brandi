import { UnknownCreator } from '../types';

// what modules we can call? not sure
export const callableRegistry = new WeakMap<UnknownCreator, boolean>();
