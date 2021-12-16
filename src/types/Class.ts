/**
 * Matches a [`class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes).
 */
export type Class<T, Arguments extends unknown[] = []> = { new (..._arguments: Arguments): T, prototype: T };
