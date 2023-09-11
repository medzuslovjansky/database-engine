import { createArrayMapperClass } from './createArrayMapperClass';

describe('createArrayMapperClass', () => {
  it('should create a class with the given name', () => {
    const DynamicClass = createArrayMapperClass('DynamicClass', []);
    expect(DynamicClass.name).toBe('DynamicClass');
  });

  it('should create a class with the given getters', () => {
    const DynamicClass = createArrayMapperClass('DynamicClass', ['a', 'b']);
    const instance = new DynamicClass([1, 2]);
    expect(instance.a).toBe(1);
    expect(instance.b).toBe(2);
  });

  it('should create a class with the given setters', () => {
    const DynamicClass = createArrayMapperClass('DynamicClass', ['a', 'b']);
    const array = [1, 2];
    const instance = new DynamicClass(array);
    instance.a = 3;
    instance.b = 4;
    expect(array).toEqual([3, 4]);
  });

  it('should support construction from an object', () => {
    const DynamicClass = createArrayMapperClass('DynamicClass', ['a', 'b']);
    const instance = new DynamicClass({ a: 4, b: 3, c: 5 });
    expect([...instance]).toEqual([4, 3]);
  });

  it('should support cloning', () => {
    const DynamicClass = createArrayMapperClass('DynamicClass', ['a', 'b']);
    const arr1 = [4, 3, 5];
    const instance1 = new DynamicClass(arr1, 1);
    const instance2 = instance1.getCopy();
    expect(instance2.getIndex()).toBe(1);
    instance2.a = 8;
    expect([...instance2]).toEqual([8, 3, 5]);
    expect([...instance1]).toEqual([4, 3, 5]);
  });

  it('should have getKeys() method', () => {
    const DynamicClass = createArrayMapperClass('DynamicClass', ['a', 'b']);
    const instance = new DynamicClass([4, 3, 5]);
    expect(instance.getKeys()).toEqual(['a', 'b']);
  });

  it('should support JSON serialization', () => {
    const DynamicClass = createArrayMapperClass('DynamicClass', ['a', 'b']);
    const instance = new DynamicClass([4, 3, 5]);
    expect(JSON.stringify(instance)).toBe('{"a":4,"b":3}');
  });

  it('should support indices', () => {
    const DynamicClass = createArrayMapperClass('DynamicClass', ['a', 'b']);
    const instance = new DynamicClass([4, 3], 2);
    expect(instance.getIndex()).toBe(2);
  });

  it('should support named slices', () => {
    const DynamicClass = createArrayMapperClass('DynamicClass', [
      'a',
      'b',
      'c',
    ]);
    const instance = new DynamicClass([4, 3, 5, 7]);
    expect(instance.getSlice('b')).toEqual([3, 5]);
    expect(instance.getSlice('a', 'c')).toEqual([4, 3]);
    expect(instance.getSlice()).toEqual([4, 3, 5]);
    expect(() => instance.getSlice('d' as any)).toThrowError(
      'Property d not found',
    );
    expect(() => instance.getSlice('x' as any, 'c')).toThrowError(
      'Property x not found',
    );
  });
});
