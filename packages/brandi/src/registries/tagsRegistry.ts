import { Tag } from '../pointers';
import { UnknownCreator } from '../types';

// https://brandi.js.org/reference/conditional-bindings
// we can use when with tags and modules
export const tagsRegistry = new Map<UnknownCreator, Tag[]>();
