import { TokenValue } from '../pointers';
import { UnknownCreator } from '../types';

// what modules were injected? why do we need inject anything?
export const injectsRegistry = new Map<UnknownCreator, TokenValue[]>();
