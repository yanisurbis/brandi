import { Container, createContainer, token } from '../src';

import { setEnv } from './utils';

describe('container', () => {
  it('returns a value from the parent container', () => {
    const someValue = 1;

    const tokens = {
      someValue: token<number>('someValue'),
    };

    const parentContainer = new Container();
    parentContainer.bind(tokens.someValue).toConstant(someValue);

    const childContainer = new Container(parentContainer);

    expect(childContainer.get(tokens.someValue)).toBe(someValue);
  });

  it("rebinds a parent container's binding in the child container", () => {
    const someValue = 1;
    const anotherValue = 2;

    const tokens = {
      someValue: token<number>('someValue'),
    };

    const parentContainer = new Container();
    parentContainer.bind(tokens.someValue).toConstant(someValue);

    const childContainer = new Container(parentContainer);
    childContainer.bind(tokens.someValue).toConstant(anotherValue);

    expect(parentContainer.get(tokens.someValue)).toBe(someValue);
    expect(childContainer.get(tokens.someValue)).toBe(anotherValue);
  });

  it('throws error when the token was not bound', () => {
    const tokens = {
      some: token<unknown>('some'),
    };

    const container = new Container();

    expect(() => container.get(tokens.some)).toThrowErrorMatchingSnapshot();
  });

  it("returns an unlinked container from 'clone' method", () => {
    const parentValue = 1;
    const someValue = 2;
    const anotherValue = 3;
    const copiedValue = 4;

    const tokens = {
      parent: token<number>('parent'),
      original: token<number>('original'),
      copied: token<number>('copied'),
    };

    const parentContainer = new Container();
    parentContainer.bind(tokens.parent).toConstant(parentValue);

    const originalContainer = new Container(parentContainer);
    originalContainer.bind(tokens.original).toConstant(someValue);

    const copiedContainer = originalContainer.clone();
    copiedContainer.bind(tokens.original).toConstant(anotherValue);
    copiedContainer.bind(tokens.copied).toConstant(copiedValue);

    expect(originalContainer.get(tokens.original)).toBe(someValue);
    expect(() =>
      originalContainer.get(tokens.copied),
    ).toThrowErrorMatchingSnapshot();

    expect(copiedContainer.get(tokens.parent)).toBe(parentValue);
    expect(copiedContainer.get(tokens.original)).toBe(anotherValue);
    expect(copiedContainer.get(tokens.copied)).toBe(copiedValue);
  });

  it('shares a singleton between the original container and its copy', () => {
    class SomeClass {}

    const tokens = {
      someClass: token<SomeClass>('someClass'),
    };

    const originalContainer = new Container();

    originalContainer
      .bind(tokens.someClass)
      .toInstance(SomeClass)
      .inSingletonScope();

    const copiedContainer = originalContainer.clone();

    const copiedContainerInstance = copiedContainer.get(tokens.someClass);
    const originalContainerInstance = originalContainer.get(tokens.someClass);

    expect(copiedContainerInstance).toBe(originalContainerInstance);
  });

  it('captures the container state to a snapshot', () => {
    const someValue = 1;
    const anotherValue = 2;
    const additionalValue = 3;

    const tokens = {
      some: token<number>('some'),
      additional: token<number>('additional'),
    };

    const container = new Container();
    container.bind(tokens.some).toConstant(someValue);

    container.capture();

    container.bind(tokens.some).toConstant(anotherValue);
    container.bind(tokens.additional).toConstant(additionalValue);

    container.restore();

    expect(container.get(tokens.some)).toBe(someValue);
    expect(() =>
      container.get(tokens.additional),
    ).toThrowErrorMatchingSnapshot();

    container.bind(tokens.some).toConstant(anotherValue);
    container.bind(tokens.additional).toConstant(additionalValue);

    container.restore();

    expect(container.get(tokens.some)).toBe(someValue);
    expect(() =>
      container.get(tokens.additional),
    ).toThrowErrorMatchingSnapshot();
  });

  it('logs an error when trying to restore a non-captured container state', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => null);

    const container = new Container();
    container.restore();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]?.[0]).toMatchSnapshot();

    spy.mockRestore();
  });

  it('does not log an error when restoring the captured container state', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => null);

    const container = new Container();
    container.capture();
    container.restore();

    expect(spy).toHaveBeenCalledTimes(0);

    spy.mockRestore();
  });

  it("skips the logging in 'production' env", () => {
    const restoreEnv = setEnv('production');
    const spy = jest.spyOn(console, 'error').mockImplementation(() => null);

    const container = new Container();
    container.restore();

    expect(spy).toHaveBeenCalledTimes(0);

    restoreEnv();
    spy.mockRestore();
  });

  describe('createContainer', () => {
    it('creates a container', () => {
      const container = createContainer();
      expect(container).toBeInstanceOf(Container);
    });

    it('creates a container with arguments', () => {
      const parentContainer = createContainer();
      const childContainer = createContainer(parentContainer);

      expect(childContainer.parent).toBe(parentContainer);
    });
  });
});
