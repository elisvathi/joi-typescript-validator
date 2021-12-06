export type Class<T, Arguments extends unknown[] = []> = { new (...arguments_: Arguments): T, prototype: T };
